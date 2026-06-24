-- Fix guest checkout RLS for orders table
-- Run in Supabase SQL Editor

DROP POLICY IF EXISTS "Users create own orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;

CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    user_id IS NULL
    OR (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  );

-- Secure RPC bypasses RLS for order creation (used by the app)
CREATE OR REPLACE FUNCTION public.create_order(
  p_user_id UUID,
  p_customer_email TEXT,
  p_customer_name TEXT,
  p_items JSONB,
  p_subtotal NUMERIC,
  p_discount_amount NUMERIC,
  p_promo_code TEXT,
  p_total NUMERIC,
  p_shipping_cost NUMERIC,
  p_shipping_distance_km NUMERIC,
  p_shipping_address JSONB,
  p_payment_method TEXT,
  p_order_number TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id UUID;
  new_number TEXT;
  safe_user_id UUID;
BEGIN
  safe_user_id := NULL;
  IF p_user_id IS NOT NULL AND auth.uid() IS NOT NULL AND p_user_id = auth.uid() THEN
    safe_user_id := p_user_id;
  END IF;

  new_number := COALESCE(NULLIF(TRIM(p_order_number), ''), 'YK-' || RIGHT(EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT, 8));

  INSERT INTO orders (
    user_id, customer_email, customer_name, items, subtotal, discount_amount,
    promo_code, total, shipping_cost, shipping_distance_km, shipping_address,
    payment_method, status, order_number
  ) VALUES (
    safe_user_id, LOWER(TRIM(p_customer_email)), TRIM(p_customer_name), p_items,
    p_subtotal, COALESCE(p_discount_amount, 0), p_promo_code, p_total,
    p_shipping_cost, p_shipping_distance_km, p_shipping_address,
    p_payment_method, 'pending', new_number
  )
  RETURNING id, order_number INTO new_id, new_number;

  RETURN jsonb_build_object('id', new_id, 'order_number', new_number);
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_order(
  UUID, TEXT, TEXT, JSONB, NUMERIC, NUMERIC, TEXT, NUMERIC, NUMERIC, NUMERIC, JSONB, TEXT, TEXT
) TO anon, authenticated;
