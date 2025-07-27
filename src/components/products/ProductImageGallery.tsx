'use client'

import { ProductImage } from '@/types'
import { useState } from 'react'
import Image from 'next/image'

interface ProductImageGalleryProps {
  images: ProductImage[]
  productName: string
  className?: string
}

export function ProductImageGallery({ images, productName, className = '' }: ProductImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  
  // Sort images by primary first, then by order_index
  const sortedImages = [...images].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1
    if (!a.is_primary && b.is_primary) return 1
    return a.order_index - b.order_index
  })

  const selectedImage = sortedImages[selectedImageIndex]

  if (sortedImages.length === 0) {
    return (
      <div className={`aspect-square bg-gray-200 rounded-lg flex items-center justify-center ${className}`}>
        <svg
          className="w-24 h-24 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Image */}
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
        <Image
          src={selectedImage.url}
          alt={selectedImage.alt_text || productName}
          fill={true}
          className={`object-cover transition-transform duration-300 ${
            isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
          }`}
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          onClick={() => setIsZoomed(!isZoomed)}
        />
        
        {/* Navigation arrows for multiple images */}
        {sortedImages.length > 1 && (
          <>
            <button
              onClick={() => setSelectedImageIndex(
                selectedImageIndex === 0 ? sortedImages.length - 1 : selectedImageIndex - 1
              )}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-75"
              aria-label="Previous image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={() => setSelectedImageIndex(
                selectedImageIndex === sortedImages.length - 1 ? 0 : selectedImageIndex + 1
              )}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-75"
              aria-label="Next image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
        
        {/* Image counter */}
        {sortedImages.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            {selectedImageIndex + 1} / {sortedImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail Grid */}
      {sortedImages.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {sortedImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedImageIndex(index)}
              className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all duration-200 ${
                index === selectedImageIndex
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Image
                src={image.url}
                alt={image.alt_text || `${productName} image ${index + 1}`}
                fill={true}
                className="object-cover"
                sizes="(max-width: 768px) 25vw, 16vw"
                loading="lazy"
              />
              {image.is_primary && (
                <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                  Main
                </div>
              )}
            </button>
          ))}
        </div>
      )}
      
      {/* Zoom hint */}
      <div className="text-center text-sm text-gray-500">
        Click image to {isZoomed ? 'zoom out' : 'zoom in'}
      </div>
    </div>
  )
}