'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'

interface MiniCartProps {
  isOpen: boolean
  onClose: () => void
}

export function MiniCart({ isOpen, onClose }: MiniCartProps) {
  const { cart, loading, removeItem } = useCart()

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black bg-opacity-25 lg:hidden"
        onClick={onClose}
      />
      
      {/* Mini Cart Panel */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-xl lg:absolute lg:right-0 lg:top-full lg:mt-2 lg:h-auto lg:max-h-96 lg:rounded-lg lg:border lg:border-gray-200">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <h3 className="text-lg font-medium text-gray-900">Shopping Cart</h3>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="flex-1 p-4">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h7M9.5 18h7m-7 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm7 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                </svg>
                <p className="text-gray-500 text-sm">Your cart is empty</p>
              </div>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {cart.items.slice(0, 3).map((item) => {
                    const primaryImage = item.product?.images?.find(img => img.is_primary) || item.product?.images?.[0]
                    
                    return (
                      <div key={item.id} className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                            {primaryImage ? (
                              <Image
                                src={primaryImage.url}
                                alt={primaryImage.alt_text || item.product?.name || ''}
                                width={48}
                                height={48}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                No Image
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                            {item.product?.name}
                          </h4>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                            <span className="text-sm font-medium text-gray-900">
                              ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => removeItem(item.id)}
                          className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )
                  })}
                  
                  {cart.items.length > 3 && (
                    <div className="text-center py-2">
                      <span className="text-sm text-gray-500">
                        +{cart.items.length - 3} more items
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-base font-medium text-gray-900">Subtotal</span>
                  <span className="text-lg font-bold text-gray-900">
                    ${cart.subtotal.toFixed(2)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <Link
                    href="/cart"
                    onClick={onClose}
                    className="block w-full bg-gray-100 text-gray-900 py-2 px-4 rounded-md text-center font-medium hover:bg-gray-200 transition-colors"
                  >
                    View Cart
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={onClose}
                    className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md text-center font-medium hover:bg-blue-700 transition-colors"
                  >
                    Checkout
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

// Cart Icon component for navigation
interface CartIconProps {
  onClick: () => void
  className?: string
}

export function CartIcon({ onClick, className = '' }: CartIconProps) {
  const { itemCount, loading } = useCart()

  return (
    <button
      onClick={onClick}
      className={`relative p-2 text-gray-600 hover:text-gray-900 transition-colors ${className}`}
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h7M9.5 18h7m-7 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm7 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
      
      {!loading && itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  )
}
