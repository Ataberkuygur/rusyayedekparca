import { supabase } from '@/lib/supabase'
import { CartItem, Product } from '@/types'

export interface CartItemWithProduct extends CartItem {
  product: Product
}

export const handleDatabaseError = (error: unknown) => {
  console.error('Database error:', error)
  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
  return {
    success: false,
    error: errorMessage,
  }
}

export const handleDatabaseSuccess = <T>(data: T) => {
  return {
    success: true,
    data,
  }
}

/**
 * Get all cart items for a user with product details
 */
export async function getCartItems(userId: string): Promise<CartItemWithProduct[]> {
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      product:products(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch cart items: ${error.message}`)
  }

  return data || []
}

/**
 * Add item to cart or update quantity if it already exists
 */
export async function addToCart(
  userId: string,
  productId: string,
  quantity: number
): Promise<CartItem> {
  // First check if item already exists in cart
  const { data: existingItem } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single()

  if (existingItem) {
    // Update existing item quantity
    const { data, error } = await supabase
      .from('cart_items')
      .update({ 
        quantity: existingItem.quantity + quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingItem.id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update cart item: ${error.message}`)
    }

    return data
  } else {
    // Create new cart item
    const { data, error } = await supabase
      .from('cart_items')
      .insert({
        user_id: userId,
        product_id: productId,
        quantity,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to add item to cart: ${error.message}`)
    }

    return data
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number
): Promise<CartItem> {
  if (quantity <= 0) {
    throw new Error('Quantity must be greater than 0')
  }

  const { data, error } = await supabase
    .from('cart_items')
    .update({ 
      quantity,
      updated_at: new Date().toISOString()
    })
    .eq('id', cartItemId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update cart item quantity: ${error.message}`)
  }

  return data
}

/**
 * Remove item from cart
 */
export async function removeFromCart(cartItemId: string): Promise<void> {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId)

  if (error) {
    throw new Error(`Failed to remove item from cart: ${error.message}`)
  }
}

/**
 * Clear all items from user's cart
 */
export async function clearCart(userId: string): Promise<void> {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to clear cart: ${error.message}`)
  }
}

/**
 * Get cart item count for a user
 */
export async function getCartItemCount(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('cart_items')
    .select('quantity')
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to get cart item count: ${error.message}`)
  }

  return data?.reduce((total, item) => total + item.quantity, 0) || 0
}

/**
 * Get cart total value for a user
 */
export async function getCartTotal(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      quantity,
      product:products(price)
    `)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to get cart total: ${error.message}`)
  }

  return data?.reduce((total, item) => {
    const product = item.product as unknown as { price: number }
    return total + (product.price * item.quantity)
  }, 0) || 0
}

/**
 * Validate cart item before adding/updating
 */
export async function validateCartItem(
  productId: string,
  quantity: number
): Promise<{ valid: boolean; message?: string }> {
  // Check if product exists and is active
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('is_active', true)
    .single()

  if (error || !product) {
    return { valid: false, message: 'Product not found or unavailable' }
  }

  // Check if sufficient quantity is available
  if (product.quantity < quantity) {
    return { 
      valid: false, 
      message: `Only ${product.quantity} items available in stock` 
    }
  }

  // Check for reasonable quantity limits
  if (quantity > 99) {
    return { 
      valid: false, 
      message: 'Maximum quantity per item is 99' 
    }
  }

  return { valid: true }
}

/**
 * Check if user owns a cart item
 */
export async function validateCartItemOwnership(
  cartItemId: string,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('cart_items')
    .select('user_id')
    .eq('id', cartItemId)
    .single()

  if (error || !data) {
    return false
  }

  return data.user_id === userId
}