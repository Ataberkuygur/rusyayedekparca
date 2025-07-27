'use client'

import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'

interface AddToCartButtonProps {
  productId: string
  quantity?: number
  disabled?: boolean
  className?: string
  children?: React.ReactNode
}

export function AddToCartButton({ 
  productId, 
  quantity = 1, 
  disabled = false, 
  className = '',
  children 
}: AddToCartButtonProps) {
  const { addToCart, isInCart } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleAddToCart = async () => {
    try {
      setIsAdding(true)
      await addToCart(productId, quantity)
      
      // Show success state briefly
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setIsAdding(false)
    }
  }

  const inCart = isInCart(productId)

  return (
    <button
      onClick={handleAddToCart}
      disabled={disabled || isAdding}
      className={`
        relative overflow-hidden transition-all duration-200
        ${disabled || isAdding 
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
          : showSuccess
          ? 'bg-green-600 text-white'
          : inCart
          ? 'bg-blue-100 text-blue-700 border-2 border-blue-600 hover:bg-blue-200'
          : 'bg-blue-600 text-white hover:bg-blue-700'
        }
        ${className}
      `}
    >
      {isAdding ? (
        <div className="flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
          Adding...
        </div>
      ) : showSuccess ? (
        <div className="flex items-center justify-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Added!
        </div>
      ) : children ? (
        children
      ) : inCart ? (
        <div className="flex items-center justify-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          In Cart - Add More
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h7M9.5 18h7m-7 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm7 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          </svg>
          Add to Cart
        </div>
      )}
    </button>
  )
}
