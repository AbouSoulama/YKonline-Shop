-- Allow guest checkout (orders without login)
DROP POLICY IF EXISTS "Users create own orders" ON orders;

CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);
