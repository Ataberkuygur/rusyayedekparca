'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CartService, { CartSummary as CartSummaryType } from '@/services/cart'
import { CartItem as CartItemType, Product } from '@/types'

// Import components locally to avoid circular dependency
import { CartItem } from './CartItem'

// Inline CartSummary to fix import issue
interface CartSummaryProps {
  cart: CartSummaryType
  onCheckout: () => void
  loading?: boolean
}

function CartSummary({ cart, onCheckout, loading }: CartSummaryProps) {
  const tax = cart.subtotal * 0.08 // 8% tax rate
  const shipping = cart.subtotal >= 75 ? 0 : 9.99 // Free shipping over $75
  const total = cart.subtotal + tax + shipping

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
      
      <div className="space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal ({cart.itemCount} items)</span>
          <span className="text-gray-900">${cart.subtotal.toFixed(2)}</span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="text-gray-900">
            {shipping === 0 ? (
              <span className="text-green-600 font-medium">FREE</span>
            ) : (
              `$${shipping.toFixed(2)}`
            )}
          </span>
        </div>

        {/* Free shipping notice */}
        {shipping > 0 && (
          <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
            Add ${(75 - cart.subtotal).toFixed(2)} more for free shipping
          </div>
        )}

        {/* Tax */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Estimated Tax</span>
          <span className="text-gray-900">${tax.toFixed(2)}</span>
        </div>

        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between">
            <span className="text-base font-medium text-gray-900">Total</span>
            <span className="text-lg font-bold text-gray-900">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={onCheckout}
        disabled={loading || cart.items.length === 0}
        className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Processing...
          </div>
        ) : (
          'Proceed to Checkout'
        )}
      </button>

      {/* Security Notice */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        <div className="flex items-center justify-center">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Secure checkout powered by Stripe
        </div>
      </div>
    </div>
  )
}

interface ShoppingCartProps {
  className?: string
}

export function ShoppingCart({ className = '' }: ShoppingCartProps) {
  const router = useRouter()
  const [cart, setCart] = useState<CartSummaryType | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Load cart data
  const loadCart = async () => {
    try {
      setError(null)
      const cartData = await CartService.getCart()
      setCart(cartData)
    } catch (err) {
      console.error('Failed to load cart:', err)
      setError(err instanceof Error ? err.message : 'Failed to load cart')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCart()
  }, [])

  // Update item quantity
  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    try {
      setUpdating(itemId)
      setError(null)
      
      await CartService.updateCartItem(itemId, { quantity })
      
      // Reload cart to get updated totals
      await loadCart()
    } catch (err) {
      console.error('Failed to update quantity:', err)
      setError(err instanceof Error ? err.message : 'Failed to update quantity')
    } finally {
      setUpdating(null)
    }
  }

  // Remove item from cart
  const handleRemoveItem = async (itemId: string) => {
    try {
      setUpdating(itemId)
      setError(null)
      
      await CartService.removeFromCart(itemId)
      
      // Reload cart to get updated data
      await loadCart()
    } catch (err) {
      console.error('Failed to remove item:', err)
      setError(err instanceof Error ? err.message : 'Failed to remove item')
    } finally {
      setUpdating(null)
    }
  }

  // Clear entire cart
  const handleClearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      await CartService.clearCart()
      
      // Reload cart to show empty state
      await loadCart()
    } catch (err) {
      console.error('Failed to clear cart:', err)
      setError(err instanceof Error ? err.message : 'Failed to clear cart')
    }
  }

  // Navigate to checkout
  const handleCheckout = () => {
    router.push('/checkout')
  }

  // Navigate to continue shopping
  const handleContinueShopping = () => {
    router.push('/products')
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load cart</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadCart}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h7M9.5 18h7m-7 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm7 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-gray-600 mb-6">
            Start browsing our catalog to find the perfect car parts for your vehicle.
          </p>
          <button
            onClick={handleContinueShopping}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Browse Products
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Cart Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Shopping Cart ({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'})
          </h2>
          {cart.items.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear Cart
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto"
            >
              <svg className="w-4 h-4 text-red-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="lg:grid lg:grid-cols-3 lg:gap-8 p-6">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cart.items.map((item) => (
              <CartItem
                key={item.id}
                item={item as CartItemType & { product: Product }}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveItem}
                loading={updating === item.id}
              />
            ))}
          </div>

          {/* Continue Shopping Button */}
          <div className="mt-8">
            <button
              onClick={handleContinueShopping}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Continue Shopping
            </button>
          </div>
        </div>

        {/* Cart Summary */}
        <div className="mt-8 lg:mt-0">
          <CartSummary
            cart={cart}
            onCheckout={handleCheckout}
            loading={loading || updating !== null}
          />
        </div>
      </div>
    </div>
  )
}
