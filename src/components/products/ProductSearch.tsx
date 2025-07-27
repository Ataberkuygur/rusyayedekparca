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
  'Brake System',
  'Engine Parts',
  'Transmission',
  'Suspension',
  'Electrical',
  'Filters',
  'Belts & Hoses',
  'Lighting',
  'Body Parts',
  'Interior',
  'Exhaust System',
  'Fuel System'
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
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Search Bar */}
      <div className="mb-6">
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
          Search Products
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            id="search"
            name="search"
            value={filters.query}
            onChange={(e) => handleInputChange('query', e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Search by part name, number, or description..."
          />
        </div>
      </div>

      {/* Vehicle Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-2">
            Make
          </label>
          <select
            id="make"
            name="make"
            value={filters.make}
            onChange={(e) => handleInputChange('make', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Makes</option>
            {MAKES.map(make => (
              <option key={make} value={make}>{make}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
            Model
          </label>
          <select
            id="model"
            name="model"
            value={filters.model}
            onChange={(e) => handleInputChange('model', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!filters.make}
          >
            <option value="">All Models</option>
            {availableModels.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
            Year
          </label>
          <select
            id="year"
            name="year"
            value={filters.year}
            onChange={(e) => handleInputChange('year', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Years</option>
            {YEARS.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Category and Condition Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={filters.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
            Condition
          </label>
          <select
            id="condition"
            name="condition"
            value={filters.condition}
            onChange={(e) => handleInputChange('condition', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Conditions</option>
            <option value="new">New</option>
            <option value="used">Used</option>
            <option value="refurbished">Refurbished</option>
          </select>
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price Range
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="minPrice" className="sr-only">Minimum Price</label>
            <input
              type="number"
              id="minPrice"
              name="minPrice"
              value={filters.minPrice}
              onChange={(e) => handleInputChange('minPrice', e.target.value)}
              placeholder="Min ($)"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="maxPrice" className="sr-only">Maximum Price</label>
            <input
              type="number"
              id="maxPrice"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={(e) => handleInputChange('maxPrice', e.target.value)}
              placeholder="Max ($)"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Additional Options */}
      <div className="mb-6">
        <div className="flex items-center">
          <input
            id="inStock"
            name="inStock"
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => handleInputChange('inStock', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="inStock" className="ml-2 text-sm text-gray-700">
            In stock only
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={clearFilters}
          disabled={!hasActiveFilters}
          className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear all filters
        </button>
        
        {hasActiveFilters && (
          <div className="text-sm text-blue-600 font-medium">
            {Object.entries(filters).filter(([key, value]) => {
              if (key === 'query') return debouncedQuery.length > 0
              if (key === 'inStock') return value === true
              return value !== ''
            }).length} filter{Object.entries(filters).filter(([key, value]) => {
              if (key === 'query') return debouncedQuery.length > 0
              if (key === 'inStock') return value === true
              return value !== ''
            }).length !== 1 ? 's' : ''} active
          </div>
        )}
      </div>
    </div>
  )
}
