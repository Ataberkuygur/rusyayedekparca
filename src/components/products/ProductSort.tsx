'use client'

interface SortOption {
  id: string
  label: string
  field: string
  direction: 'asc' | 'desc'
}

interface ProductSortProps {
  options?: SortOption[]
  currentSort: string
  onSortChange: (sortId: string) => void
  className?: string
}

const DEFAULT_SORT_OPTIONS: SortOption[] = [
  {
    id: 'relevance',
    label: 'Best Match',
    field: 'relevance',
    direction: 'desc'
  },
  {
    id: 'price-low',
    label: 'Price: Low to High',
    field: 'price',
    direction: 'asc'
  },
  {
    id: 'price-high',
    label: 'Price: High to Low',
    field: 'price',
    direction: 'desc'
  },
  {
    id: 'name-asc',
    label: 'Name: A to Z',
    field: 'name',
    direction: 'asc'
  },
  {
    id: 'name-desc',
    label: 'Name: Z to A',
    field: 'name',
    direction: 'desc'
  },
  {
    id: 'newest',
    label: 'Newest First',
    field: 'created_at',
    direction: 'desc'
  },
  {
    id: 'oldest',
    label: 'Oldest First',
    field: 'created_at',
    direction: 'asc'
  },
  {
    id: 'rating',
    label: 'Highest Rated',
    field: 'rating',
    direction: 'desc'
  },
  {
    id: 'stock',
    label: 'Stock: High to Low',
    field: 'quantity',
    direction: 'desc'
  }
]

export function ProductSort({
  options = DEFAULT_SORT_OPTIONS,
  currentSort,
  onSortChange,
  className = ''
}: ProductSortProps) {
  const currentOption = options.find(option => option.id === currentSort)

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <label htmlFor="sort" className="text-sm font-medium text-gray-700 whitespace-nowrap">
        Sort by:
      </label>
      <select
        id="sort"
        name="sort"
        value={currentSort}
        onChange={(e) => onSortChange(e.target.value)}
        className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
      >
        {options.map(option => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      
      {/* Sort Direction Indicator */}
      {currentOption && (
        <div className="flex items-center text-gray-400">
          <svg
            className={`w-4 h-4 transform ${
              currentOption.direction === 'desc' ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 11l5-5m0 0l5 5m-5-5v12"
            />
          </svg>
        </div>
      )}
    </div>
  )
}

export type { SortOption }
export { DEFAULT_SORT_OPTIONS }
