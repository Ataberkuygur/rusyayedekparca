-- Function to safely update product quantity
-- This function ensures atomic updates and prevents negative quantities

CREATE OR REPLACE FUNCTION update_product_quantity(
  product_id UUID,
  quantity_change INTEGER
)
RETURNS products
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_product products;
BEGIN
  -- Update the product quantity atomically
  UPDATE products 
  SET 
    quantity = GREATEST(0, quantity + quantity_change),
    updated_at = NOW()
  WHERE id = product_id
  RETURNING * INTO updated_product;
  
  -- Check if the product was found
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product with id % not found', product_id;
  END IF;
  
  -- Return the updated product
  RETURN updated_product;
END;
$$;