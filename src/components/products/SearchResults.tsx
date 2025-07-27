'use client'

import { useState, useEffect, useCallback } from 'react'
import { Product } from '@/types'
import { ProductGrid, ProductViewToggle, MobileFilterToggle } from '@/components/products'
import { ProductSearch } from './CompactProductSearch'
import { ProductFilter } from './ProductFilter'
import { ProductSort, SortOption } from './ProductSort'
import { Pagination, MobilePagination } from './Pagination'

interface SearchFilters {
  query: string
  make: string
  model: string
  year: string
  category: string
  minPrice: string
  maxPrice: string
  condition: string
  inStock: boolean
}

interface SearchResultsProps {
  products: Product[]
  loading?: boolean
  totalCount: number
  onSearch: (filters: SearchFilters, sortBy: string, page: number, itemsPerPage: number) => void
  className?: string
}

// Filter groups for ProductFilter with Turkish labels
const FILTER_GROUPS = [
  {
    id: 'categories',
    label: 'Kategoriler',
    type: 'checkbox' as const,
    options: [
      { id: 'brake-system', label: 'Fren Sistemi', count: 145 },
      { id: 'engine-parts', label: 'Motor Parçaları', count: 230 },
      { id: 'transmission', label: 'Şanzıman', count: 89 },
      { id: 'suspension', label: 'Süspansiyon', count: 167 },
      { id: 'electrical', label: 'Elektrik', count: 203 },
      { id: 'filters', label: 'Filtreler', count: 124 }
    ]
  },
  {
    id: 'brands',
    label: 'Markalar',
    type: 'checkbox' as const,
    options: [
      { id: 'oem', label: 'OEM', count: 456 },
      { id: 'bosch', label: 'Bosch', count: 234 },
      { id: 'denso', label: 'Denso', count: 189 },
      { id: 'gates', label: 'Gates', count: 156 },
      { id: 'mobil1', label: 'Mobil 1', count: 78 },
      { id: 'fram', label: 'FRAM', count: 145 }
    ]
  },
  {
    id: 'price-range',
    label: 'Fiyat Aralığı',
    type: 'range' as const,
    options: [],
    min: 0,
    max: 5000,
    step: 50
  },
  {
    id: 'features',
    label: 'Özellikler',
    type: 'checkbox' as const,
    options: [
      { id: 'free-shipping', label: 'Ücretsiz Kargo', count: 567 },
      { id: 'warranty', label: 'Garantili', count: 445 },
      { id: 'returnable', label: 'İade Edilebilir', count: 623 },
      { id: 'eco-friendly', label: 'Çevre Dostu', count: 89 }
    ]
  },
  {
    id: 'availability',
    label: 'Stok Durumu',
    type: 'toggle' as const,
    options: [
      { id: 'in-stock', label: 'Sadece Stoktakiler' }
    ]
  }
]

export function SearchResults({
  products,
  loading = false,
  totalCount,
  onSearch,
  className = ''
}: SearchResultsProps) {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    make: '',
    model: '',
    year: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    condition: '',
    inStock: false
  })
  
  const [quickFilters, setQuickFilters] = useState<Record<string, any>>({})
  const [sortBy, setSortBy] = useState('relevance')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(24)
  
  // Calculate pagination
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  // Trigger search when filters change
  useEffect(() => {
    // Merge quickFilters into searchFilters for the search
    const enhancedFilters = {
      ...searchFilters,
      // Map quick filters to search filters more comprehensively
      category: quickFilters.categories?.length > 0 ? quickFilters.categories.join(',') : searchFilters.category,
      // Add price range from quick filters
      minPrice: searchFilters.minPrice,
      maxPrice: quickFilters['price-range'] ? quickFilters['price-range'].toString() : searchFilters.maxPrice,
      // Add stock filter
      inStock: quickFilters.availability !== undefined ? quickFilters.availability : searchFilters.inStock,
      // Add brand filters
      make: quickFilters.brands?.length > 0 ? quickFilters.brands.join(',') : searchFilters.make
    }
    
    console.log('Search with filters:', enhancedFilters, 'Quick filters:', quickFilters)
    onSearch(enhancedFilters, sortBy, currentPage, itemsPerPage)
  }, [searchFilters, quickFilters, sortBy, currentPage, itemsPerPage, onSearch])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchFilters, quickFilters, sortBy, itemsPerPage])

  const handleFiltersChange = useCallback((filters: SearchFilters) => {
    setSearchFilters(filters)
  }, [])

  const handleQuickFilterChange = useCallback((filterId: string, value: any) => {
    setQuickFilters(prev => ({ ...prev, [filterId]: value }))
    
    // Also update searchFilters immediately for certain filter types
    if (filterId === 'categories') {
      setSearchFilters(prev => ({
        ...prev,
        category: Array.isArray(value) ? value.join(',') : value
      }))
    } else if (filterId === 'availability') {
      setSearchFilters(prev => ({
        ...prev,
        inStock: value
      }))
    } else if (filterId === 'price-range') {
      setSearchFilters(prev => ({
        ...prev,
        maxPrice: value ? value.toString() : ''
      }))
    }
  }, [])

  const handleClearAllFilters = useCallback(() => {
    setSearchFilters({
      query: '',
      make: '',
      model: '',
      year: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      condition: '',
      inStock: false
    })
    setQuickFilters({})
  }, [])

  const handleSortChange = useCallback((newSortBy: string) => {
    setSortBy(newSortBy)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
  }, [])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Component */}
      <ProductSearch
        onFiltersChange={handleFiltersChange}
        initialFilters={searchFilters}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Sidebar Filters - Hidden on mobile */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="lg:sticky lg:top-4">
            <ProductFilter
              filterGroups={FILTER_GROUPS}
              activeFilters={quickFilters}
              onFilterChange={handleQuickFilterChange}
              onClearAll={handleClearAllFilters}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4 lg:space-y-6">
          {/* Results Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-medium text-black">
                {loading ? 'Aranıyor...' : `${totalCount} Ürün Bulundu`}
              </h2>
            </div>
            
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:space-x-4 sm:gap-0">
              {/* Mobile Filter Toggle */}
              <MobileFilterToggle
                filterGroups={FILTER_GROUPS}
                activeFilters={quickFilters}
                onFilterChange={handleQuickFilterChange}
                onClearAll={handleClearAllFilters}
              />
              
              <ProductSort
                currentSort={sortBy}
                onSortChange={handleSortChange}
              />
              <ProductViewToggle
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>
          </div>

          {/* Results */}
          <ProductGrid
            products={products}
            loading={loading}
            viewMode={viewMode}
            totalCount={totalCount}
            hasMore={false}
          />

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <>
              {/* Desktop Pagination */}
              <div className="hidden sm:block">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalCount}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </div>
              
              {/* Mobile Pagination */}
              <div className="sm:hidden">
                <MobilePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}

          {/* No Results */}
          {!loading && products.length === 0 && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.674-2.64M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-black">Ürün bulunamadı</h3>
              <p className="mt-1 text-sm text-gray-500">
                Arama kriterlerinizi ayarlamayı veya bazı filtreleri temizlemeyi deneyin.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                >
                  Tüm filtreleri temizle
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
