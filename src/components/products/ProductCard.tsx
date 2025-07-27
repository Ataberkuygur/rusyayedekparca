'use client'

import { Product } from '@/types'
import Image from 'next/image'
import Link from 'next/link'
import { getMockProductImage } from '@/utils/mockImages'

interface ProductCardProps {
  product: Product
  className?: string
  viewMode?: 'grid' | 'list'
}

export function ProductCard({ product, className = '', viewMode = 'grid' }: ProductCardProps) {
  const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0]
  const imageUrl = primaryImage?.url || getMockProductImage(product.id)
  const hasDiscount = product.original_price && product.original_price > product.price
  const discountPercentage = hasDiscount 
    ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
    : 0

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price)
  }

  const getConditionBadgeColor = (condition: string) => {
    switch (condition) {
      case 'new':
        return 'bg-gray-900 text-white border-gray-900'
      case 'used':
        return 'bg-gray-600 text-white border-gray-600'
      case 'refurbished':
        return 'bg-gray-400 text-white border-gray-400'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (viewMode === 'list') {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300 group overflow-hidden ${className}`}>
        <Link href={`/products/${product.id}`}>
          <div className="flex">
            {/* Image */}
            <div className="relative w-56 h-40 flex-shrink-0 overflow-hidden bg-gray-50">
              <Image
                src={imageUrl}
                alt={primaryImage?.alt_text || product.name}
                fill={true}
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 50vw, 224px"
                loading="lazy"
              />
              
              {/* Discount badge */}
              {hasDiscount && (
                <div className="absolute top-3 left-3 bg-black text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg z-10">
                  -{discountPercentage}%
                </div>
              )}
              
              {/* Stock status overlay */}
              {product.quantity === 0 && (
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                  <span className="text-white font-semibold">Stokta Yok</span>
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 p-6">
              {/* Condition badge */}
              <div className="mb-3">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getConditionBadgeColor(product.condition)}`}>
                  {product.condition === 'new' ? 'Sıfır' : 
                   product.condition === 'used' ? 'İkinci El' : 
                   product.condition === 'refurbished' ? 'Yenilenmiş' : product.condition}
                </span>
              </div>
              
              {/* Product name */}
              <h3 className="font-bold text-black mb-3 line-clamp-2 group-hover:text-gray-600 transition-colors text-xl leading-tight">
                {product.name}
              </h3>
              
              {/* Vehicle compatibility */}
              <p className="text-sm text-gray-600 mb-3 font-medium bg-gray-50 px-3 py-1 rounded-lg inline-block">
                {product.year} {product.make} {product.model}
              </p>
              
              {/* Part number */}
              {product.part_number && (
                <p className="text-xs text-gray-500 mb-4 font-mono bg-gray-100 px-3 py-2 rounded-lg">
                  Parça No: {product.part_number}
                </p>
              )}
              
              {/* Price and stock */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl font-bold text-black">
                    {formatPrice(product.price)}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(product.original_price!)}
                    </span>
                  )}
                </div>
                
                {/* Stock quantity */}
                <div className="text-sm">
                  {product.quantity > 0 ? (
                    product.quantity <= 5 ? (
                      <span className="text-amber-700 font-semibold bg-amber-100 px-3 py-1 rounded-full">
                        Sadece {product.quantity} adet kaldı
                      </span>
                    ) : (
                      <span className="text-green-700 font-semibold bg-green-100 px-3 py-1 rounded-full">Stokta Var</span>
                    )
                  ) : (
                    <span className="text-red-700 font-semibold bg-red-100 px-3 py-1 rounded-full">Stokta Yok</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300 group overflow-hidden transform hover:-translate-y-2 active:scale-95 touch-manipulation ${className}`}>
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <Image
            src={imageUrl}
            alt={primaryImage?.alt_text || product.name}
            fill={true}
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 344px) 100vw, (max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw"
            loading="lazy"
            priority={false}
          />
          
          {/* Discount badge */}
          {hasDiscount && (
            <div className="absolute top-2 fold:top-1.5 sm:top-4 left-2 fold:left-1.5 sm:left-4 bg-black text-white px-1.5 fold:px-1 sm:px-3 py-0.5 fold:py-0.5 sm:py-1 rounded-full text-[10px] fold:text-[9px] sm:text-sm font-bold shadow-lg z-10">
              -{discountPercentage}%
            </div>
          )}
          
          {/* Stock status */}
          {product.quantity === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
              <span className="text-white font-bold text-xs fold:text-[10px] sm:text-lg">Stokta Yok</span>
            </div>
          )}
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
        </div>
        
        <div className="p-3 fold:p-2 sm:p-6">
          {/* Condition badge */}
          <div className="mb-2 fold:mb-1 sm:mb-3">
            <span className={`inline-block px-2 fold:px-1.5 sm:px-3 py-0.5 fold:py-0.5 sm:py-1 rounded-full text-[10px] fold:text-[9px] sm:text-xs font-semibold border ${getConditionBadgeColor(product.condition)}`}>
              {product.condition === 'new' ? 'Sıfır' : 
               product.condition === 'used' ? 'İkinci El' : 
               product.condition === 'refurbished' ? 'Yenilenmiş' : product.condition}
            </span>
          </div>
          
          {/* Product name */}
          <h3 className="font-bold text-black mb-2 fold:mb-1 sm:mb-3 line-clamp-2 group-hover:text-gray-600 transition-colors text-sm fold:text-xs sm:text-lg leading-tight">
            {product.name}
          </h3>
          
          {/* Vehicle compatibility */}
          <p className="text-[10px] fold:text-[9px] sm:text-sm text-gray-600 mb-2 fold:mb-1 sm:mb-3 font-medium bg-gray-50 px-2 fold:px-1.5 sm:px-3 py-0.5 fold:py-0.5 sm:py-1 rounded-lg inline-block">
            {product.year} {product.make} {product.model}
          </p>
          
          {/* Part number */}
          {product.part_number && (
            <p className="text-[9px] fold:text-[8px] sm:text-xs text-gray-500 mb-2 fold:mb-1 sm:mb-4 font-mono bg-gray-100 px-2 fold:px-1.5 sm:px-3 py-1 fold:py-0.5 sm:py-2 rounded-lg">
              Parça No: {product.part_number}
            </p>
          )}
          
          {/* Price and stock */}
          <div className="flex flex-col gap-1 fold:gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
            <div className="flex items-center space-x-1 fold:space-x-0.5 sm:space-x-2">
              <span className="text-base fold:text-sm sm:text-xl font-bold text-black">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-xs fold:text-[10px] sm:text-sm text-gray-500 line-through">
                  {formatPrice(product.original_price!)}
                </span>
              )}
            </div>
            
            {/* Stock quantity */}
            <div className="text-[10px] fold:text-[9px] sm:text-xs">
              {product.quantity > 0 ? (
                product.quantity <= 5 ? (
                  <span className="text-amber-700 font-semibold bg-amber-100 px-1.5 fold:px-1 sm:px-2 py-0.5 fold:py-0.5 sm:py-1 rounded-full">
                    {product.quantity} adet
                  </span>
                ) : (
                  <span className="text-green-700 font-semibold bg-green-100 px-1.5 fold:px-1 sm:px-2 py-0.5 fold:py-0.5 sm:py-1 rounded-full">Stokta</span>
                )
              ) : (
                <span className="text-red-700 font-semibold bg-red-100 px-1.5 fold:px-1 sm:px-2 py-0.5 fold:py-0.5 sm:py-1 rounded-full">Yok</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}