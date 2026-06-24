-- Run in Supabase SQL Editor (after schema.sql + extras.sql)

-- Blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL DEFAULT '',
  category TEXT DEFAULT 'Guide',
  read_time TEXT DEFAULT '5 min',
  color TEXT DEFAULT 'from-green to-green-dark',
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Published', 'Draft')),
  views INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published blog posts"
  ON blog_posts FOR SELECT
  USING (status = 'Published' OR public.is_admin());

CREATE POLICY "Admins manage blog posts"
  ON blog_posts FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Enhance orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost NUMERIC DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_distance_km NUMERIC;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE;

-- Seed blog posts
INSERT INTO blog_posts (slug, title, excerpt, content, category, read_time, color, status, views) VALUES
(
  'benefits-organic-shea-butter-skin',
  'The benefits of organic shea butter for the skin',
  'Discover why organic shea butter is a true beauty ally for nourishing, protecting and softening your skin naturally.',
  'Organic shea butter is one of nature''s most powerful moisturizers. Rich in vitamins A and E, it helps nourish dry skin, restore elasticity, and protect against environmental stress.

## Why choose unrefined shea butter?

Unrefined shea butter retains all its natural properties. Unlike refined versions, it has not been stripped of its vitamins and fatty acids.

## Daily use tips

- Apply a small amount after showering on damp skin
- Focus on dry areas: elbows, knees, feet
- Use as a night treatment for intense nourishment

## Results you can expect

With regular use, skin feels softer, more comfortable and visibly healthier within a few weeks.',
  'Benefits', '5 min', 'from-green to-green-dark', 'Published', 1240
),
(
  'raw-shea-vs-refined-shea',
  'Raw shea vs refined shea: what are the differences?',
  'Raw or refined? We explain the differences between these two forms of shea butter and help you choose according to your needs.',
  'Not all shea butters are equal. Understanding the difference between raw and refined shea helps you make the best choice for your skin and hair.

## Raw shea butter

Extracted using traditional methods without chemical processing. Keeps its natural color, scent and full nutrient profile.

## Refined shea butter

Processed to remove scent and color. Loses some vitamins but has a longer shelf life and neutral smell.

## Which to choose?

For maximum benefits, choose raw unrefined organic shea butter — like the products we offer at YKonline Shop.',
  'Guide', '4 min', 'from-orange to-orange-dark', 'Published', 890
),
(
  'shea-butter-hair-tips',
  'How to use shea butter on hair: our tips',
  'Dry, curly, frizzy or coily hair? Discover our tips for using shea butter to nourish, protect and sublimate your lengths.',
  'Shea butter is an excellent natural hair care product, especially for dry, curly or textured hair.

## As an oil treatment

Apply generously to lengths and ends before shampoo. Leave for 30 minutes to overnight, then wash as usual.

## Daily care

A small amount on ends helps reduce frizz and add shine without weighing hair down.

## For the scalp

Massage a tiny amount into the scalp to soothe dryness — use sparingly to avoid buildup.',
  'Hair care', '6 min', 'from-brown to-green-dark', 'Published', 756
),
(
  'guide-choosing-shea-butter',
  'The complete guide to choosing your shea butter',
  'Size, texture, use: how to choose the shea butter that really meets your needs.',
  'Choosing the right shea butter depends on how you plan to use it.

## By size

- **100g**: perfect for discovery and travel
- **250g**: ideal for regular personal use
- **500g**: best value for families

## By texture

- **Raw**: rich, dense, maximum nourishment
- **Whipped**: light, fast-absorbing, daily use

## By use case

Body care, hair treatment, baby care, or DIY cosmetics — we have the right format for every need.',
  'Guide', '7 min', 'from-green to-orange', 'Published', 612
),
(
  'shea-butter-dry-skin',
  'Shea butter and dry skin: a natural solution',
  'Suffering from dry skin? Discover how organic shea butter can help you find soft, nourished and comfortable skin.',
  'Dry skin needs rich, occlusive moisture — exactly what shea butter provides.

## Why it works

Shea butter creates a protective barrier that locks in moisture while delivering essential fatty acids deep into the skin.

## Best application method

Apply to slightly damp skin after bathing. The water helps the butter spread evenly and penetrate better.

## When to expect results

Most customers notice improved comfort within the first week and visibly softer skin within 2-3 weeks of daily use.',
  'Skin care', '5 min', 'from-orange-light to-orange', 'Published', 534
),
(
  'integrating-shea-beauty-routine',
  'Integrating shea butter into your beauty routine',
  'A few simple gestures are all it takes to make shea butter an essential part of your daily routine.',
  'Building a natural beauty routine around shea butter is simple and effective.

## Morning ritual

Light application on face and hands for all-day protection.

## Evening ritual

Richer application on body, focusing on dry areas. Perfect before bed.

## Weekly treatment

Hair oil mask once a week for deep nourishment.

## Family use

Safe and gentle enough for the whole family — one product, many uses.',
  'Routine', '4 min', 'from-green-light to-green', 'Published', 421
)
ON CONFLICT (slug) DO NOTHING;
