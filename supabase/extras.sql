-- Run this in Supabase SQL Editor if you already ran schema.sql before

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  active BOOLEAN DEFAULT true
);

-- Contact form messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins read newsletter subscribers"
  ON newsletter_subscribers FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Anyone can send contact message"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins read contact messages"
  ON contact_messages FOR SELECT
  USING (public.is_admin());

-- Enable realtime for profile role updates
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
