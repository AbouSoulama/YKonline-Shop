-- YKonline Shop — Supabase schema
-- Run this in Supabase → SQL Editor

-- Profiles (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  long_description TEXT,
  price NUMERIC NOT NULL,
  old_price NUMERIC,
  size TEXT,
  type TEXT CHECK (type IN ('Raw', 'Whipped', 'Set')),
  usage TEXT[] DEFAULT '{}',
  image TEXT,
  gallery JSONB DEFAULT '[]',
  rating NUMERIC DEFAULT 0,
  reviews_count INT DEFAULT 0,
  stock INT DEFAULT 0,
  badge TEXT,
  ingredients TEXT,
  storage TEXT,
  benefits JSONB DEFAULT '[]',
  how_to_use JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer TEXT NOT NULL,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  product TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders (for future use)
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  items JSONB NOT NULL DEFAULT '[]',
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'customer'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Admin helper for RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Products policies
CREATE POLICY "Anyone can read products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Admins manage products"
  ON products FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Reviews policies
CREATE POLICY "Anyone can read approved reviews"
  ON reviews FOR SELECT
  USING (approved = true OR public.is_admin());

CREATE POLICY "Authenticated users can submit reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins manage reviews"
  ON reviews FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins delete reviews"
  ON reviews FOR DELETE
  USING (public.is_admin());

-- Orders policies
CREATE POLICY "Users read own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Admins manage orders"
  ON orders FOR ALL
  USING (public.is_admin());

-- Seed products
INSERT INTO products (id, name, tagline, description, long_description, price, old_price, size, type, usage, image, gallery, rating, reviews_count, stock, badge, ingredients, storage, benefits, how_to_use)
VALUES
  ('raw-100g', 'Unrefined Organic Raw Shea Butter', 'The ideal size to discover the benefits of natural shea.', 'An organic raw shea butter, rich and versatile, perfect for nourishing dry areas, softening skin and caring for hair.', 'A pure, unrefined organic shea butter selected for its richness and authenticity.', 12.9, 14.9, '100g', 'Raw', ARRAY['Skin','Hair','Baby/Family','Massage'], '/images/raw-shea-jar.jpg', '["/images/raw-shea-jar.jpg"]'::jsonb, 4.9, 248, 120, 'Best Seller', 'Butyrospermum Parkii Butter. 100% pure, unrefined, organic.', 'Store in a dry place, away from heat and direct light.', '["Nourishes dry areas of the body","Contributes to skin comfort and softness"]'::jsonb, '[{"area":"Body","method":"Take a small amount, warm between hands, then apply to the body."}]'::jsonb),
  ('raw-250g', 'Unrefined Organic Raw Shea Butter', 'The essential natural care for the whole family.', 'Generous size for regular use.', 'Our 250g format is perfect for regular use.', 24.9, 28.9, '250g', 'Raw', ARRAY['Skin','Hair','Baby/Family','Massage'], '/images/raw-shea-jar.jpg', '["/images/raw-shea-jar.jpg"]'::jsonb, 4.95, 412, 80, 'Most Popular', 'Butyrospermum Parkii Butter. 100% pure, unrefined, organic.', 'Store in a dry place, away from heat and direct light.', '["Nourishes the skin durably"]'::jsonb, '[{"area":"Body","method":"Take a small amount, warm between hands, then apply to the body."}]'::jsonb),
  ('raw-500g', 'Unrefined Organic Raw Shea Butter', 'The large economical size for regular routines.', 'Ideal for families, frequent use or natural care enthusiasts.', 'Our 500g family size offers the best value for money.', 42.9, 49.9, '500g', 'Raw', ARRAY['Skin','Hair','Baby/Family','Massage'], '/images/raw-shea-jar.jpg', '["/images/raw-shea-jar.jpg"]'::jsonb, 4.9, 189, 45, 'Best Value', 'Butyrospermum Parkii Butter. 100% pure, unrefined, organic.', 'Store in a dry place, away from heat and direct light.', '["Excellent value for money"]'::jsonb, '[{"area":"Body","method":"Apply a small amount after showering on damp skin."}]'::jsonb),
  ('whipped-150ml', 'Organic Whipped Shea Butter', 'All the richness of shea in a light and airy texture.', 'Whipped texture that melts quickly on the skin.', 'A light, airy, whipped shea butter that penetrates quickly.', 19.9, 22.9, '150ml', 'Whipped', ARRAY['Skin','Hair','Baby/Family'], '/images/whipped-shea-jar.jpg', '["/images/whipped-shea-jar.jpg"]'::jsonb, 4.85, 310, 90, 'New', 'Butyrospermum Parkii Butter, whipped. 100% natural, organic.', 'Store in a cool, dry place away from direct sunlight.', '["Light, airy texture"]'::jsonb, '[{"area":"Body","method":"Apply generously after showering on clean, damp skin."}]'::jsonb),
  ('discovery-set', 'YKonline Shop Discovery Set', 'The ideal set to discover or gift natural shea care.', 'A selection of products to create a complete natural beauty routine.', 'Our Discovery Set brings together our most popular products.', 39.9, 49.9, 'Set', 'Set', ARRAY['Skin','Hair','Baby/Family'], '/images/shea-discovery-set.jpg', '["/images/shea-discovery-set.jpg"]'::jsonb, 5, 156, 30, 'Gift Idea', 'Butyrospermum Parkii Butter. Multiple formats included.', 'Store in a dry place, away from heat and direct light.', '["Complete natural beauty routine"]'::jsonb, '[{"area":"Morning","method":"A small amount of whipped butter to start the day."}]'::jsonb),
  ('family-pack', 'Family Shea Butter Pack', 'The generous pack for the whole family''s natural care.', 'A generous pack combining raw and whipped shea butter.', 'The Family Pack is our most complete offer.', 59.9, 72.9, 'Pack', 'Set', ARRAY['Skin','Hair','Baby/Family','Massage'], '/images/shea-discovery-set.jpg', '["/images/shea-discovery-set.jpg"]'::jsonb, 4.95, 98, 25, 'Family', 'Butyrospermum Parkii Butter. Raw and whipped formats.', 'Store in a dry place, away from heat and direct light.', '["Two textures for the whole family"]'::jsonb, '[{"area":"Adults","method":"Raw butter for rich, nourishing body care."}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Seed sample reviews
INSERT INTO reviews (customer, product_id, product, rating, text, approved)
VALUES
  ('Aminata', 'raw-250g', 'Unrefined Organic Raw Shea Butter - 250g', 5, 'I love the texture. The butter melts well in my hands and leaves my skin very soft.', true),
  ('Claire', 'raw-100g', 'Unrefined Organic Raw Shea Butter - 100g', 5, 'Very good product, natural and effective. I also use it for my hair.', true),
  ('Mariam', 'whipped-150ml', 'Organic Whipped Shea Butter - 150ml', 5, 'Fast delivery and well-packaged product. I recommend.', true),
  ('Sophie', 'discovery-set', 'YKonline Shop Discovery Set', 5, 'A real discovery. My dry skin is visibly more comfortable and softer.', true);

-- After creating your admin account via the app, run:
-- UPDATE profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@ykonlineshop.com');
