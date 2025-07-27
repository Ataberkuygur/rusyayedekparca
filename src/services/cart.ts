import { supabase } from '@/lib/supabase'
import { CartItem } from '@/types'

export interface CartSummary {
  items: CartItem[]
  subtotal: number
  itemCount: number
  total: number
}

export interface AddToCartRequest {
  product_id: string
  quantity?: number
}

export interface UpdateCartItemRequest {
  quantity: number
}

export class CartService {
  /**
   * Get all cart items for the current user
   */
  static async getCart(): Promise<CartSummary> {
    const response = await fetch('/api/cart', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch cart')
    }

    return response.json()
  }

  /**
   * Add a product to the cart
   */
  static async addToCart(data: AddToCartRequest): Promise<{ message: string; item: CartItem }> {
    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to add item to cart')
    }

    return response.json()
  }

  /**
   * Update cart item quantity
   */
  static async updateCartItem(itemId: string, data: UpdateCartItemRequest): Promise<{ message: string; item: CartItem }> {
    const response = await fetch(`/api/cart/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update cart item')
    }

    return response.json()
  }

  /**
   * Remove an item from the cart
   */
  static async removeFromCart(itemId: string): Promise<{ message: string }> {
    const response = await fetch(`/api/cart/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to remove item from cart')
    }

    return response.json()
  }

  /**
   * Clear all items from the cart
   */
  static async clearCart(): Promise<{ message: string }> {
    const response = await fetch('/api/cart/clear', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to clear cart')
    }

    return response.json()
  }

  /**
   * Get cart item count (cached in localStorage for performance)
   */
  static async getCartCount(): Promise<number> {
    try {
      const cart = await this.getCart()
      return cart.itemCount
    } catch (error) {
      console.error('Failed to get cart count:', error)
      return 0
    }
  }

  /**
   * Check if a product is in the cart
   */
  static async isInCart(productId: string): Promise<boolean> {
    try {
      const cart = await this.getCart()
      return cart.items.some(item => item.product_id === productId)
    } catch (error) {
      console.error('Failed to check if product is in cart:', error)
      return false
    }
  }

  /**
   * Validate cart items against current inventory
   */
  static async validateCart(): Promise<{
    valid: boolean
    issues: Array<{
      itemId: string
      productName: string
      issue: string
      maxQuantity?: number
    }>
  }> {
    try {
      const cart = await this.getCart()
      const issues: Array<{
        itemId: string
        productName: string
        issue: string
        maxQuantity?: number
      }> = []

      for (const item of cart.items) {
        if (!item.product) continue

        // Check if product is still active
        if (!item.product.is_active) {
          issues.push({
            itemId: item.id,
            productName: item.product.name,
            issue: 'Product is no longer available'
          })
          continue
        }

        // Check inventory
        if (item.product.quantity < item.quantity) {
          issues.push({
            itemId: item.id,
            productName: item.product.name,
            issue: 'Insufficient inventory',
            maxQuantity: item.product.quantity
          })
        }
      }

      return {
        valid: issues.length === 0,
        issues
      }
    } catch (error) {
      console.error('Failed to validate cart:', error)
      return {
        valid: false,
        issues: []
      }
    }
  }
}

export default CartService
