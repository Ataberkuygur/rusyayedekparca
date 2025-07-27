'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import CartService, { CartSummary } from '@/services/cart'

interface CartContextType {
  cart: CartSummary | null
  loading: boolean
  error: string | null
  itemCount: number
  addToCart: (productId: string, quantity?: number) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
  isInCart: (productId: string) => boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [cart, setCart] = useState<CartSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load cart data
  const loadCart = async () => {
    try {
      setError(null)
      const cartData = await CartService.getCart()
      setCart(cartData)
    } catch (err) {
      console.error('Failed to load cart:', err)
      
      // Check if it's an authentication error (401)
      if (err instanceof Error && err.message.includes('401')) {
        console.log('Cart requires authentication - using empty cart for now')
        setError(null) // Don't show error for auth issues in development
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load cart')
      }
      
      // Set empty cart on error to prevent app crashes
      setCart({
        items: [],
        subtotal: 0,
        itemCount: 0,
        total: 0
      })
    } finally {
      setLoading(false)
    }
  }

  // Initialize cart on mount
  useEffect(() => {
    loadCart()
  }, [])

  // Add item to cart
  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      setError(null)
      await CartService.addToCart({ product_id: productId, quantity })
      await loadCart() // Refresh cart data
    } catch (err) {
      console.error('Failed to add to cart:', err)
      
      if (err instanceof Error && err.message.includes('401')) {
        console.log('Add to cart requires authentication')
        setError('Please sign in to add items to cart')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to add to cart')
      }
      // Don't re-throw in development mode to prevent crashes
    }
  }

  // Update item quantity
  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      setError(null)
      await CartService.updateCartItem(itemId, { quantity })
      await loadCart() // Refresh cart data
    } catch (err) {
      console.error('Failed to update quantity:', err)
      
      if (err instanceof Error && err.message.includes('401')) {
        console.log('Update cart requires authentication')
        setError('Please sign in to modify cart')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to update quantity')
      }
    }
  }

  // Remove item from cart
  const removeItem = async (itemId: string) => {
    try {
      setError(null)
      await CartService.removeFromCart(itemId)
      await loadCart() // Refresh cart data
    } catch (err) {
      console.error('Failed to remove item:', err)
      setError(err instanceof Error ? err.message : 'Failed to remove item')
      throw err
    }
  }

  // Clear entire cart
  const clearCart = async () => {
    try {
      setError(null)
      await CartService.clearCart()
      await loadCart() // Refresh cart data
    } catch (err) {
      console.error('Failed to clear cart:', err)
      setError(err instanceof Error ? err.message : 'Failed to clear cart')
      throw err
    }
  }

  // Refresh cart data
  const refreshCart = async () => {
    await loadCart()
  }

  // Check if product is in cart
  const isInCart = (productId: string): boolean => {
    return cart?.items.some(item => item.product_id === productId) ?? false
  }

  // Get item count for badge
  const itemCount = cart?.itemCount ?? 0

  const value: CartContextType = {
    cart,
    loading,
    error,
    itemCount,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart,
    isInCart
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}
