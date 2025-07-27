'use client'

import { useState, useEffect, useCallback } from 'react'
import { useDebounce } from '@/hooks/useDebounce'

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

interface ProductSearchProps {
  onFiltersChange: (filters: SearchFilters) => void
  initialFilters?: Partial<SearchFilters>
  className?: string
}

// Mock data for dropdowns - in a real app, these would come from your API
const MAKES = [
  'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes-Benz', 
  'Audi', 'Volkswagen', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Lexus'
]

const MODELS: Record<string, string[]> = {
  'Toyota': ['Camry', 'Corolla', 'Prius', 'RAV4', 'Highlander', 'Tacoma', 'Tundra', '4Runner'],
  'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot', 'Odyssey', 'Fit', 'HR-V', 'Ridgeline'],
  'Ford': ['F-150', 'Mustang', 'Explorer', 'Escape', 'Focus', 'Fusion', 'Edge', 'Expedition'],
  'Chevrolet': ['Silverado', 'Cruze', 'Malibu', 'Equinox', 'Tahoe', 'Suburban', 'Camaro', 'Corvette'],
  'Nissan': ['Altima', 'Sentra', 'Rogue', 'Pathfinder', 'Titan', 'Leaf', 'Murano', '370Z'],
  'BMW': ['3 Series', '5 Series', '7 Series', 'X3', 'X5', 'X7', 'Z4', 'i3'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'GLE', 'GLC', 'GLS', 'A-Class', 'CLA'],
  'Audi': ['A3', 'A4', 'A6', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'TT'],
  'Volkswagen': ['Jetta', 'Passat', 'Golf', 'Atlas', 'Tiguan', 'Arteon', 'ID.4', 'Beetle'],
  'Hyundai': ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Genesis', 'Veloster', 'Kona', 'Palisade'],
  'Kia': ['Forte', 'Optima', 'Sorento', 'Sportage', 'Soul', 'Stinger', 'Telluride', 'Rio'],
  'Mazda': ['Mazda3', 'Mazda6', 'CX-5', 'CX-9', 'MX-5 Miata', 'CX-30', 'CX-3', 'CX-50'],
  'Subaru': ['Impreza', 'Legacy', 'Outback', 'Forester', 'Ascent', 'WRX', 'BRZ', 'Crosstrek'],
  'Lexus': ['ES', 'IS', 'GS', 'LS', 'RX', 'GX', 'LX', 'NX', 'UX']
}

const YEARS = Array.from({ length: 30 }, (_, i) => (new Date().getFullYear() - i).toString())

const CATEGORIES = [
  'Fren Sistemi',
  'Motor Parçaları',
  'Şanzıman',
  'Süspansiyon',
  'Elektrik',
  'Filtreler',
  'Kayışlar & Hortumlar',
  'Aydınlatma',
  'Kaporta',
  'İç Aksam',
  'Egzoz Sistemi',
  'Yakıt Sistemi'
]

export function ProductSearch({ onFiltersChange, initialFilters, className = '' }: ProductSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
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
  })

  const [availableModels, setAvailableModels] = useState<string[]>([])
  
  // Debounce the search query to avoid too many API calls
  const debouncedQuery = useDebounce(filters.query, 300)

  // Update available models when make changes
  useEffect(() => {
    if (filters.make) {
      setAvailableModels(MODELS[filters.make] || [])
      // Clear model if it's not available for the selected make
      if (filters.model && !MODELS[filters.make]?.includes(filters.model)) {
        setFilters(prev => ({ ...prev, model: '' }))
      }
    } else {
      setAvailableModels([])
      setFilters(prev => ({ ...prev, model: '' }))
    }
  }, [filters.make, filters.model])

  // Call onFiltersChange when filters change
  useEffect(() => {
    onFiltersChange({ ...filters, query: debouncedQuery })
  }, [debouncedQuery, filters, onFiltersChange])

  const handleInputChange = useCallback((field: keyof SearchFilters, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
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
  }, [])

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'query') return debouncedQuery.length > 0
    if (key === 'inStock') return value === true
    return value !== ''
  })

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {/* Main Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={filters.query}
            onChange={(e) => handleInputChange('query', e.target.value)}
            placeholder="Parça adı, marka veya model ile arama yapın..."
            className="block w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Compact Filters Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div>
          <select
            value={filters.make}
            onChange={(e) => handleInputChange('make', e.target.value)}
            className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          >
            <option value="">Marka</option>
            {MAKES.map(make => (
              <option key={make} value={make}>{make}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filters.model}
            onChange={(e) => handleInputChange('model', e.target.value)}
            disabled={!filters.make}
            className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100"
          >
            <option value="">Model</option>
            {availableModels.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filters.year}
            onChange={(e) => handleInputChange('year', e.target.value)}
            className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          >
            <option value="">Yıl</option>
            {YEARS.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filters.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          >
            <option value="">Kategori</option>
            {CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Price Range and Stock Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => handleInputChange('minPrice', e.target.value)}
            placeholder="Min ₺"
            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
          <span className="text-gray-500">-</span>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => handleInputChange('maxPrice', e.target.value)}
            placeholder="Max ₺"
            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>

        <div className="flex items-center">
          <input
            id="inStock"
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => handleInputChange('inStock', e.target.checked)}
            className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
          />
          <label htmlFor="inStock" className="ml-2 text-sm text-gray-700">
            Sadece stokta olanlar
          </label>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-black transition-colors"
          >
            Filtreleri Temizle
          </button>
        )}
      </div>
    </div>
  )
}
