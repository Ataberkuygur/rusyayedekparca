'use client'

import { Product } from '@/types'
import { useState } from 'react'
import Image from 'next/image'
import { ProductImageGallery } from './ProductImageGallery'

interface ProductDetailProps {
  product: Product
  className?: string
}

export function ProductDetail({ product, className = '' }: ProductDetailProps) {
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const hasDiscount = product.original_price && product.original_price > product.price
  const discountPercentage = hasDiscount 
    ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
    : 0

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const getConditionBadgeColor = (condition: string) => {
    switch (condition) {
      case 'new':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'used':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'refurbished':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const specifications = product.specifications 
    ? (typeof product.specifications === 'string' 
        ? JSON.parse(product.specifications) 
        : product.specifications)
    : {}

  const dimensions = product.dimensions 
    ? (typeof product.dimensions === 'string' 
        ? JSON.parse(product.dimensions) 
        : product.dimensions)
    : null

  return (
    <div className={`bg-white ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <ProductImageGallery 
            images={product.images || []} 
            productName={product.name}
          />
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getConditionBadgeColor(product.condition)}`}>
                {product.condition.charAt(0).toUpperCase() + product.condition.slice(1)}
              </span>
              {hasDiscount && (
                <span className="bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
                  -{discountPercentage}% OFF
                </span>
              )}
            </div>
            
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            
            <div className="text-lg text-gray-600 mb-2">
              {product.year} {product.make} {product.model}
            </div>
            
            {product.part_number && (
              <div className="text-sm text-gray-500 font-mono">
                Part Number: {product.part_number}
              </div>
            )}
            
            {product.sku && (
              <div className="text-sm text-gray-500 font-mono">
                SKU: {product.sku}
              </div>
            )}
          </div>

          {/* Price */}
          <div className="border-t border-b border-gray-200 py-4">
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-xl text-gray-500 line-through">
                  {formatPrice(product.original_price!)}
                </span>
              )}
            </div>
            
            <div className="mt-2">
              {product.quantity > 0 ? (
                product.quantity <= 5 ? (
                  <span className="text-orange-600 font-medium">
                    Only {product.quantity} left in stock
                  </span>
                ) : (
                  <span className="text-green-600 font-medium">In Stock</span>
                )
              ) : (
                <span className="text-red-600 font-medium">Out of Stock</span>
              )}
            </div>
          </div>

          {/* Add to Cart */}
          {product.quantity > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                  Quantity:
                </label>
                <select
                  id="quantity"
                  value={selectedQuantity}
                  onChange={(e) => setSelectedQuantity(Number(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Array.from({ length: Math.min(product.quantity, 10) }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
              
              <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Add to Cart
              </button>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
            <div className="text-gray-700 leading-relaxed">
              {product.description}
            </div>
          </div>

          {/* Vehicle Compatibility */}
          {product.compatibility && product.compatibility.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Vehicle Compatibility</h3>
              <div className="space-y-2">
                {product.compatibility.map((compat, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="font-medium text-gray-900">
                      {compat.make} {compat.model}
                    </div>
                    <div className="text-sm text-gray-600">
                      {compat.year_start === compat.year_end 
                        ? compat.year_start 
                        : `${compat.year_start} - ${compat.year_end}`}
                      {compat.engine && ` • ${compat.engine}`}
                      {compat.trim && ` • ${compat.trim}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Specifications */}
          {Object.keys(specifications).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(specifications).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-900 capitalize">
                      {key.replace(/_/g, ' ')}
                    </div>
                    <div className="text-sm text-gray-600">
                      {String(value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dimensions & Weight */}
          {(dimensions || product.weight) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Physical Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dimensions && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-900">Dimensions</div>
                    <div className="text-sm text-gray-600">
                      {dimensions.length}" × {dimensions.width}" × {dimensions.height}"
                    </div>
                  </div>
                )}
                {product.weight && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-900">Weight</div>
                    <div className="text-sm text-gray-600">
                      {product.weight} lbs
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}