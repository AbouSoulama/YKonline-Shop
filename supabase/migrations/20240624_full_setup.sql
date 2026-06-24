-- YKonline Shop — full production migration
-- Run in Supabase SQL Editor (safe to re-run: uses IF NOT EXISTS / OR REPLACE)

-- ── Profiles email + phone ──
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'customer'
  )
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

-- ── Orders: discount + promo ──
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS promo_code TEXT;

-- ── Promo codes ──
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount NUMERIC NOT NULL,
  type TEXT NOT NULL DEFAULT 'percent' CHECK (type IN ('percent', 'fixed')),
  uses INT DEFAULT 0,
  max_uses INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage promo codes" ON promo_codes;
CREATE POLICY "Admins manage promo codes"
  ON promo_codes FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── Addresses ──
CREATE TABLE IF NOT EXISTS addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL DEFAULT 'Home',
  address TEXT NOT NULL,
  city TEXT,
  country TEXT DEFAULT 'United States',
  phone TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own addresses" ON addresses;
CREATE POLICY "Users manage own addresses"
  ON addresses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins read addresses" ON addresses;
CREATE POLICY "Admins read addresses"
  ON addresses FOR SELECT
  USING (public.is_admin());

-- ── Wishlist ──
CREATE TABLE IF NOT EXISTS wishlist (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, product_id)
);

ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own wishlist" ON wishlist;
CREATE POLICY "Users manage own wishlist"
  ON wishlist FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Blog views (RPC) ──
CREATE OR REPLACE FUNCTION public.increment_blog_views(post_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE blog_posts SET views = COALESCE(views, 0) + 1 WHERE id = post_id;
$$;

GRANT EXECUTE ON FUNCTION public.increment_blog_views(UUID) TO anon, authenticated;

-- ── Promo validation (RPC) ──
CREATE OR REPLACE FUNCTION public.validate_promo_code(p_code TEXT, p_subtotal NUMERIC)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  promo RECORD;
  discount NUMERIC;
BEGIN
  SELECT * INTO promo FROM promo_codes
  WHERE UPPER(code) = UPPER(TRIM(p_code))
    AND active = true
    AND (expires_at IS NULL OR expires_at > NOW())
    AND (max_uses = 0 OR uses < max_uses);

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Invalid or expired promo code.');
  END IF;

  IF promo.type = 'percent' THEN
    discount := ROUND(p_subtotal * promo.discount / 100, 2);
  ELSE
    discount := LEAST(promo.discount, p_subtotal);
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'code', promo.code,
    'discount', discount,
    'type', promo.type
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.validate_promo_code(TEXT, NUMERIC) TO anon, authenticated;

-- ── Increment promo uses ──
CREATE OR REPLACE FUNCTION public.increment_promo_use(p_code TEXT)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE promo_codes SET uses = uses + 1 WHERE UPPER(code) = UPPER(TRIM(p_code));
$$;

-- ── Fulfill order: mark paid + decrement stock ──
CREATE OR REPLACE FUNCTION public.fulfill_order(
  p_order_id UUID,
  p_stripe_session_id TEXT DEFAULT NULL,
  p_payment_method TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  o RECORD;
  item JSONB;
  pid TEXT;
  qty INT;
BEGIN
  SELECT * INTO o FROM orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;
  IF o.status = 'paid' THEN RETURN true; END IF;

  FOR item IN SELECT * FROM jsonb_array_elements(o.items)
  LOOP
    pid := item->>'id';
    qty := COALESCE((item->>'quantity')::INT, 1);
    IF pid IS NOT NULL THEN
      UPDATE products SET stock = GREATEST(0, stock - qty) WHERE id = pid;
    END IF;
  END LOOP;

  UPDATE orders SET
    status = 'paid',
    stripe_session_id = COALESCE(p_stripe_session_id, stripe_session_id),
    payment_method = COALESCE(p_payment_method, payment_method)
  WHERE id = p_order_id;

  IF o.promo_code IS NOT NULL AND o.promo_code <> '' THEN
    PERFORM public.increment_promo_use(o.promo_code);
  END IF;

  RETURN true;
END;
$$;

-- ── Seed promo codes ──
INSERT INTO promo_codes (code, discount, type, uses, max_uses, active, expires_at) VALUES
  ('WELCOME10', 10, 'percent', 0, 0, true, '2026-12-31 23:59:59+00'),
  ('SUMMER15', 15, 'percent', 0, 200, true, '2026-08-31 23:59:59+00'),
  ('FREESHIP', 5, 'fixed', 0, 500, false, '2026-03-31 23:59:59+00')
ON CONFLICT (code) DO NOTHING;

-- ── Guest checkout policy (idempotent) ──
DROP POLICY IF EXISTS "Users create own orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- ── Realtime profiles ──
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
