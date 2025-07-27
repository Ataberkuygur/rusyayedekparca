import { useState, useEffect, useCallback } from 'react'
import { Product } from '@/types'
import { getMockProductImage } from '@/utils/mockImages'

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

interface SearchParams {
  filters: SearchFilters
  sortBy: string
  page: number
  itemsPerPage: number
}

interface SearchResult {
  products: Product[]
  totalCount: number
  totalPages: number
  hasMore: boolean
}

interface UseProductSearchOptions {
  initialFilters?: Partial<SearchFilters>
  initialSort?: string
  initialPage?: number
  initialItemsPerPage?: number
  debounceMs?: number
}

export function useProductSearch(options: UseProductSearchOptions = {}) {
  const {
    initialFilters = {},
    initialSort = 'relevance',
    initialPage = 1,
    initialItemsPerPage = 24,
    debounceMs = 300
  } = options

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchResult, setSearchResult] = useState<SearchResult>({
    products: [],
    totalCount: 0,
    totalPages: 0,
    hasMore: false
  })

  const [searchParams, setSearchParams] = useState<SearchParams>({
    filters: {
      query: '',
      make: '',
      model: '',
      year: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      condition: '',
      inStock: false,
      ...initialFilters
    },
    sortBy: initialSort,
    page: initialPage,
    itemsPerPage: initialItemsPerPage
  })

  // Mock search function - replace with actual API call
  const performSearch = useCallback(async (params: SearchParams): Promise<SearchResult> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Mock Turkish automotive parts data
    const mockProductNames = [
      'Fren Balata Takımı', 'Motor Yağı Filtresi', 'Amortisör Seti', 'Debriyaj Balata',
      'Radyatör Su Pompası', 'Hava Filtresi', 'Yakıt Pompası', 'Şanzıman Yağı',
      'Fren Diski', 'Timing Kayışı', 'Turbo Şarj Cihazı', 'Egzoz Susturucusu',
      'Klima Kompresörü', 'Alternatör', 'Marş Motoru', 'Ateşleme Bobini',
      'Ön Fener Takımı', 'Arka Stop Lambası', 'Cam Silecek Takımı', 'Ayna Takımı'
    ]
    
    const mockCarMakes = ['BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Ford', 'Opel', 'Renault', 'Peugeot']
    const mockCarModels = ['320i', 'C200', 'A4', 'Golf', 'Focus', 'Astra', 'Megane', '308']
    const mockCategories = ['brake-system', 'engine-parts', 'transmission', 'suspension', 'electrical', 'filters']
    const mockConditions = ['new', 'used', 'refurbished'] as const
    
    // Generate more products for filtering demonstration
    const allMockProducts: Product[] = Array.from({ length: 200 }, (_, i) => {
      const productId = `product-${i + 1}`
      const nameIndex = i
      const originalPrice = Math.random() > 0.7 ? (100 + (i * 50) + Math.random() * 200) : undefined
      const price = originalPrice ? originalPrice * 0.8 : (50 + (i * 30) + Math.random() * 150)
      const categoryIndex = i % mockCategories.length
      const makeIndex = i % mockCarMakes.length
      
      return {
        id: productId,
        sku: `PRÇ-${String(i + 1).padStart(4, '0')}`,
        name: mockProductNames[nameIndex % mockProductNames.length],
        description: 'Yüksek kaliteli otomotiv yedek parçası. Orijinal kalitede ve garantili.',
        category_id: mockCategories[categoryIndex],
        make: mockCarMakes[makeIndex],
        model: mockCarModels[i % mockCarModels.length],
        year: 2018 + (i % 7),
        condition: mockConditions[i % mockConditions.length],
        price: Math.round(price),
        original_price: originalPrice ? Math.round(originalPrice) : undefined,
        part_number: `PN${1000 + i}`,
        quantity: Math.floor(Math.random() * 20),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        images: [{
          id: `img-${productId}`,
          product_id: productId,
          url: getMockProductImage(productId),
          alt_text: mockProductNames[nameIndex % mockProductNames.length],
          is_primary: true,
          order_index: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }]
      }
    })

    // Apply filters
    let filteredProducts = allMockProducts.filter(product => {
      // Category filter
      if (params.filters.category) {
        const categories = params.filters.category.split(',').map(c => c.trim())
        if (categories.length > 0 && !categories.includes(product.category_id)) {
          return false
        }
      }
      
      // Make/Brand filter
      if (params.filters.make) {
        const makes = params.filters.make.split(',').map(m => m.trim().toLowerCase())
        if (makes.length > 0 && !makes.some(make => 
          product.make.toLowerCase().includes(make) || 
          make === 'oem' || 
          make === 'bosch' || 
          make === 'denso' || 
          make === 'gates' || 
          make === 'mobil1' || 
          make === 'fram'
        )) {
          return false
        }
      }
      
      // Price range filter
      if (params.filters.minPrice && product.price < parseFloat(params.filters.minPrice)) {
        return false
      }
      if (params.filters.maxPrice && product.price > parseFloat(params.filters.maxPrice)) {
        return false
      }
      
      // Stock filter
      if (params.filters.inStock && product.quantity === 0) {
        return false
      }
      
      // Search query filter
      if (params.filters.query) {
        const query = params.filters.query.toLowerCase()
        if (!product.name.toLowerCase().includes(query) && 
            !product.description.toLowerCase().includes(query) &&
            !product.sku.toLowerCase().includes(query)) {
          return false
        }
      }
      
      return true
    })
    
    // Sort results
    if (params.sortBy === 'price-low') {
      filteredProducts.sort((a, b) => a.price - b.price)
    } else if (params.sortBy === 'price-high') {
      filteredProducts.sort((a, b) => b.price - a.price)
    } else if (params.sortBy === 'name') {
      filteredProducts.sort((a, b) => a.name.localeCompare(b.name, 'tr'))
    }
    
    // Paginate results
    const startIndex = (params.page - 1) * params.itemsPerPage
    const endIndex = startIndex + params.itemsPerPage
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex)
    
    const totalCount = filteredProducts.length
    const totalPages = Math.ceil(totalCount / params.itemsPerPage)
    
    return {
      products: paginatedProducts,
      totalCount,
      totalPages,
      hasMore: params.page < totalPages
    }
  }, [])

  // Debounced search execution
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setLoading(true)
      setError(null)
      
      performSearch(searchParams)
        .then(result => {
          setSearchResult(result)
        })
        .catch(err => {
          setError(err.message || 'Search failed')
          setSearchResult({
            products: [],
            totalCount: 0,
            totalPages: 0,
            hasMore: false
          })
        })
        .finally(() => {
          setLoading(false)
        })
    }, debounceMs)

    return () => clearTimeout(timeoutId)
  }, [searchParams, debounceMs, performSearch])

  const updateFilters = useCallback((filters: Partial<SearchFilters>) => {
    setSearchParams(prev => ({
      ...prev,
      filters: { ...prev.filters, ...filters },
      page: 1 // Reset to first page when filters change
    }))
  }, [])

  const updateSort = useCallback((sortBy: string) => {
    setSearchParams(prev => ({
      ...prev,
      sortBy,
      page: 1 // Reset to first page when sort changes
    }))
  }, [])

  const updatePage = useCallback((page: number) => {
    setSearchParams(prev => ({ ...prev, page }))
  }, [])

  const updateItemsPerPage = useCallback((itemsPerPage: number) => {
    setSearchParams(prev => ({
      ...prev,
      itemsPerPage,
      page: 1 // Reset to first page when items per page changes
    }))
  }, [])

  const resetFilters = useCallback(() => {
    setSearchParams(prev => ({
      ...prev,
      filters: {
        query: '',
        make: '',
        model: '',
        year: '',
        category: '',
        minPrice: '',
        maxPrice: '',
        condition: '',
        inStock: false
      },
      page: 1
    }))
  }, [])

  const search = useCallback((
    filters: SearchFilters,
    sortBy: string,
    page: number,
    itemsPerPage: number
  ) => {
    setSearchParams({ filters, sortBy, page, itemsPerPage })
  }, [])

  return {
    // State
    loading,
    error,
    products: searchResult.products,
    totalCount: searchResult.totalCount,
    totalPages: searchResult.totalPages,
    hasMore: searchResult.hasMore,
    
    // Current search parameters
    filters: searchParams.filters,
    sortBy: searchParams.sortBy,
    currentPage: searchParams.page,
    itemsPerPage: searchParams.itemsPerPage,
    
    // Actions
    updateFilters,
    updateSort,
    updatePage,
    updateItemsPerPage,
    resetFilters,
    search
  }
}

export type { SearchFilters, SearchParams, SearchResult }
