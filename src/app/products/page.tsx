'use client'

import { SearchResults } from '@/components/products'
import { useProductSearch } from '@/hooks/useProductSearch'

export default function ProductsPage() {
  const {
    loading,
    products,
    totalCount,
    search
  } = useProductSearch({
    initialItemsPerPage: 24,
    debounceMs: 300
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Results */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-5 py-8">
        <SearchResults
          products={products}
          loading={loading}
          totalCount={totalCount}
          onSearch={search}
        />
      </div>
    </div>
  )
}