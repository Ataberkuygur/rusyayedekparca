'use client'

import { CartSummary as CartSummaryType } from '@/services/cart'

interface CartSummaryProps {
  cart: CartSummaryType
  onCheckout: () => void
  loading?: boolean
}

export function CartSummary({ cart, onCheckout, loading }: CartSummaryProps) {
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

      {/* Return Policy */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Our Promise</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li className="flex items-center">
            <svg className="w-3 h-3 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            30-day return policy
          </li>
          <li className="flex items-center">
            <svg className="w-3 h-3 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Quality guaranteed
          </li>
          <li className="flex items-center">
            <svg className="w-3 h-3 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Fast shipping
          </li>
        </ul>
      </div>

      {/* Payment Methods */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-xs font-medium text-gray-500 mb-2">We Accept</h4>
        <div className="flex space-x-2">
          {/* Credit Card Icons */}
          <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
            VISA
          </div>
          <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">
            MC
          </div>
          <div className="w-8 h-5 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">
            AMEX
          </div>
          <div className="w-8 h-5 bg-orange-500 rounded text-white text-xs flex items-center justify-center font-bold">
            DISC
          </div>
        </div>
      </div>
    </div>
  )
}
