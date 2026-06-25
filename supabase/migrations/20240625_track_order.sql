-- Guest order tracking: lookup by order number + email (bypasses RLS safely)
CREATE OR REPLACE FUNCTION public.track_order(
  p_order_number TEXT,
  p_email TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  order_row orders%ROWTYPE;
BEGIN
  IF NULLIF(TRIM(p_order_number), '') IS NULL OR NULLIF(TRIM(p_email), '') IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT * INTO order_row
  FROM orders
  WHERE order_number = TRIM(p_order_number)
    AND LOWER(TRIM(customer_email)) = LOWER(TRIM(p_email))
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'id', order_row.id,
    'order_number', order_row.order_number,
    'customer_name', order_row.customer_name,
    'customer_email', order_row.customer_email,
    'total', order_row.total,
    'shipping_cost', order_row.shipping_cost,
    'status', order_row.status,
    'payment_method', order_row.payment_method,
    'items', order_row.items,
    'created_at', order_row.created_at
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.track_order(TEXT, TEXT) TO anon, authenticated;
