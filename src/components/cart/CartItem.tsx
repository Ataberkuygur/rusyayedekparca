'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CartItem as CartItemType, Product } from '@/types'

interface CartItemProps {
  item: CartItemType & { product: Product }
  onUpdateQuantity: (itemId: string, quantity: number) => Promise<void>
  onRemove: (itemId: string) => Promise<void>
  loading?: boolean
}

export function CartItem({ item, onUpdateQuantity, onRemove, loading }: CartItemProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > 99) return
    
    setIsUpdating(true)
    try {
      await onUpdateQuantity(item.id, newQuantity)
    } catch (error) {
      console.error('Failed to update quantity:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemove = async () => {
    setIsRemoving(true)
    try {
      await onRemove(item.id)
    } catch (error) {
      console.error('Failed to remove item:', error)
      setIsRemoving(false)
    }
  }

  const primaryImage = item.product.images?.find(img => img.is_primary) || item.product.images?.[0]
  const itemTotal = item.product.price * item.quantity
  const isOnSale = item.product.original_price && item.product.original_price > item.product.price

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${
      (isUpdating || isRemoving || loading) ? 'opacity-50 pointer-events-none' : ''
    }`}>
      <div className="flex gap-4">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <Link href={`/products/${item.product.id}`} className="block">
            <div className="relative w-20 h-20 bg-gray-100 rounded-md overflow-hidden">
              {primaryImage ? (
                <Image
                  src={primaryImage.url}
                  alt={primaryImage.alt_text || item.product.name}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                  No Image
                </div>
              )}
            </div>
          </Link>
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <Link 
                href={`/products/${item.product.id}`}
                className="font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
              >
                {item.product.name}
              </Link>
              
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                <span>{item.product.make} {item.product.model}</span>
                <span>•</span>
                <span>{item.product.year}</span>
                {item.product.part_number && (
                  <>
                    <span>•</span>
                    <span>#{item.product.part_number}</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  item.product.condition === 'new' 
                    ? 'bg-green-100 text-green-800'
                    : item.product.condition === 'used'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {item.product.condition.charAt(0).toUpperCase() + item.product.condition.slice(1)}
                </span>
                
                {item.product.quantity <= 5 && (
                  <span className="text-orange-600 text-xs font-medium">
                    Only {item.product.quantity} left
                  </span>
                )}
              </div>
            </div>

            {/* Remove Button */}
            <button
              onClick={handleRemove}
              disabled={isRemoving || loading}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors ml-2"
              title="Remove item"
            >
              {isRemoving ? (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>

          {/* Quantity and Price */}
          <div className="flex items-center justify-between mt-3">
            {/* Quantity Controls */}
            <div className="flex items-center">
              <button
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={item.quantity <= 1 || isUpdating || loading}
                className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              
              <span className="mx-3 font-medium min-w-[2rem] text-center">
                {isUpdating ? '...' : item.quantity}
              </span>
              
              <button
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={item.quantity >= 99 || item.quantity >= item.product.quantity || isUpdating || loading}
                className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Price */}
            <div className="text-right">
              <div className="font-semibold text-gray-900">
                ${itemTotal.toFixed(2)}
              </div>
              {isOnSale && (
                <div className="text-sm text-gray-500 line-through">
                  ${(item.product.original_price! * item.quantity).toFixed(2)}
                </div>
              )}
              <div className="text-xs text-gray-500">
                ${item.product.price.toFixed(2)} each
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
