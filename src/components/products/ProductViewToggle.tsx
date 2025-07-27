'use client'

interface ProductViewToggleProps {
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  className?: string
}

export function ProductViewToggle({ viewMode, onViewModeChange, className = '' }: ProductViewToggleProps) {
  return (
    <div className={`flex items-center space-x-1 bg-gray-100 rounded-lg p-1 ${className}`}>
      <button
        onClick={() => onViewModeChange('grid')}
        className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
          viewMode === 'grid'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        aria-label="Grid view"
        title="Grid view"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      </button>
      
      <button
        onClick={() => onViewModeChange('list')}
        className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
          viewMode === 'list'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        aria-label="List view"
        title="List view"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 10h16M4 14h16M4 18h16"
          />
        </svg>
      </button>
    </div>
  )
}
