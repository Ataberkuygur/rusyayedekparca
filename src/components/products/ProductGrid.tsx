'use client'

import { Product } from '@/types'
import { ProductCard } from './ProductCard'
import { useState } from 'react'

interface ProductGridProps {
  products: Product[]
  loading?: boolean
  className?: string
  hasMore?: boolean
  onLoadMore?: () => void
  loadingMore?: boolean
  totalCount?: number
  viewMode?: 'grid' | 'list'
}

export function ProductGrid({ 
  products, 
  loading = false, 
  className = '',
  hasMore = false,
  onLoadMore,
  loadingMore = false,
  totalCount,
  viewMode = 'grid'
}: ProductGridProps) {
  const [itemsPerPage] = useState(15) // Reduced to 15 for better 3-column layout

  if (loading) {
    return (
      <div className={`${getGridClasses(viewMode)} ${className}`}>
        {Array.from({ length: itemsPerPage }).map((_, index) => (
          <ProductCardSkeleton key={index} viewMode={viewMode} />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
        <div className="text-center max-w-md">
          <svg
            className="w-20 h-20 text-gray-400 mx-auto mb-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.674-2.64M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">No products found</h3>
          <p className="text-gray-500 leading-relaxed">
            We couldn't find any products matching your criteria. Try adjusting your filters or search terms.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Results summary */}
      {totalCount !== undefined && (
        <div className="mb-6 fold:mb-4 sm:mb-8 text-xs fold:text-[10px] sm:text-sm text-gray-600 font-medium">
          <span className="bg-gray-100 px-2 fold:px-1.5 sm:px-3 py-1 fold:py-0.5 sm:py-1 rounded-full">
            {products.length} / {totalCount} ürün gösteriliyor
          </span>
        </div>
      )}

      {/* Product grid */}
      <div className={getGridClasses(viewMode)}>
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product}
            className={viewMode === 'list' ? 'w-full' : ''}
          />
        ))}
      </div>

      {/* Load more button */}
      {hasMore && onLoadMore && (
        <div className="mt-6 fold:mt-4 sm:mt-8 text-center">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="inline-flex items-center px-4 fold:px-3 sm:px-6 py-2 fold:py-1.5 sm:py-3 border border-gray-300 rounded-lg text-xs fold:text-[10px] sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation active:scale-95"
          >
            {loadingMore ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 fold:mr-1 sm:mr-3 h-3 fold:h-2.5 sm:h-4 w-3 fold:w-2.5 sm:w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="hidden fold:inline">Yükleniyor...</span>
                <span className="fold:hidden">Loading more...</span>
              </>
            ) : (
              <>
                <span className="hidden fold:inline">Daha Fazla</span>
                <span className="fold:hidden">Load more products</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Loading more skeleton */}
      {loadingMore && hasMore && (
        <div className={`mt-6 fold:mt-4 sm:mt-8 ${getGridClasses(viewMode)}`}>
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductCardSkeleton key={`loading-${index}`} viewMode={viewMode} />
          ))}
        </div>
      )}
    </div>
  )
}

function getGridClasses(viewMode: 'grid' | 'list'): string {
  if (viewMode === 'list') {
    return 'space-y-3 fold:space-y-2 sm:space-y-6'
  }
  return 'grid grid-cols-2 fold:grid-cols-1 fold-open:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 fold:gap-2 sm:gap-6 lg:gap-8'
}

function ProductCardSkeleton({ viewMode = 'grid' }: { viewMode?: 'grid' | 'list' }) {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
        <div className="flex fold:flex-col">
          <div className="w-56 fold:w-full h-40 fold:h-32 bg-gray-200 flex-shrink-0" />
          <div className="flex-1 p-4 fold:p-3 sm:p-6">
            <div className="w-16 fold:w-12 h-4 fold:h-3 sm:h-5 bg-gray-200 rounded-full mb-2 fold:mb-1 sm:mb-3" />
            <div className="w-full h-5 fold:h-4 sm:h-6 bg-gray-200 rounded mb-2 fold:mb-1 sm:mb-3" />
            <div className="w-3/4 h-3 fold:h-2.5 sm:h-4 bg-gray-200 rounded mb-3 fold:mb-2 sm:mb-4" />
            <div className="flex items-center justify-between">
              <div className="w-20 fold:w-16 h-5 fold:h-4 sm:h-6 bg-gray-200 rounded" />
              <div className="w-16 fold:w-12 h-3 fold:h-2.5 sm:h-4 bg-gray-200 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-4 fold:p-3 sm:p-6">
        <div className="w-12 fold:w-10 sm:w-16 h-4 fold:h-3 sm:h-5 bg-gray-200 rounded-full mb-2 fold:mb-1 sm:mb-3" />
        <div className="w-full h-4 fold:h-3 sm:h-5 bg-gray-200 rounded mb-2 fold:mb-1 sm:mb-3" />
        <div className="w-3/4 h-3 fold:h-2.5 sm:h-4 bg-gray-200 rounded mb-3 fold:mb-2 sm:mb-4" />
        <div className="w-1/2 h-2.5 fold:h-2 sm:h-3 bg-gray-200 rounded mb-3 fold:mb-2 sm:mb-4" />
        <div className="flex items-center justify-between">
          <div className="w-16 fold:w-12 sm:w-20 h-5 fold:h-4 sm:h-6 bg-gray-200 rounded" />
          <div className="w-12 fold:w-10 sm:w-16 h-3 fold:h-2.5 sm:h-4 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  )
}