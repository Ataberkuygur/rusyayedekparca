'use client'

import { useState } from 'react'

interface FilterOption {
  id: string
  label: string
  count?: number
  color?: string
}

interface FilterGroup {
  id: string
  label: string
  type: 'checkbox' | 'radio' | 'range' | 'toggle'
  options: FilterOption[]
  min?: number
  max?: number
  step?: number
}

interface ProductFilterProps {
  filterGroups: FilterGroup[]
  activeFilters: Record<string, any>
  onFilterChange: (filterId: string, value: any) => void
  onClearAll: () => void
  className?: string
  collapsible?: boolean
}

export function ProductFilter({
  filterGroups,
  activeFilters,
  onFilterChange,
  onClearAll,
  className = '',
  collapsible = true
}: ProductFilterProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(filterGroups.map(group => group.id))
  )

  const toggleGroup = (groupId: string) => {
    if (!collapsible) return
    
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId)
    } else {
      newExpanded.add(groupId)
    }
    setExpandedGroups(newExpanded)
  }

  const isGroupExpanded = (groupId: string) => {
    return !collapsible || expandedGroups.has(groupId)
  }

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).filter(value => {
      if (Array.isArray(value)) return value.length > 0
      if (typeof value === 'boolean') return value
      return value !== null && value !== undefined && value !== ''
    }).length
  }

  const renderCheckboxGroup = (group: FilterGroup) => (
    <div className="space-y-3">
      {group.options.map(option => (
        <label key={option.id} className="flex items-center group cursor-pointer">
          <input
            type="checkbox"
            checked={activeFilters[group.id]?.includes?.(option.id) || false}
            onChange={(e) => {
              const currentValues = activeFilters[group.id] || []
              const newValues = e.target.checked
                ? [...currentValues, option.id]
                : currentValues.filter((id: string) => id !== option.id)
              onFilterChange(group.id, newValues)
            }}
            className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
          />
          <span className="ml-3 text-sm text-gray-700 group-hover:text-black flex-1">
            {option.label}
          </span>
          {option.count !== undefined && (
            <span className="text-sm text-gray-500">({option.count})</span>
          )}
        </label>
      ))}
    </div>
  )

  const renderRadioGroup = (group: FilterGroup) => (
    <div className="space-y-3">
      {group.options.map(option => (
        <label key={option.id} className="flex items-center group cursor-pointer">
          <input
            type="radio"
            name={group.id}
            checked={activeFilters[group.id] === option.id}
            onChange={() => onFilterChange(group.id, option.id)}
            className="h-4 w-4 text-black focus:ring-black border-gray-300"
          />
          <span className="ml-3 text-sm text-gray-700 group-hover:text-black flex-1">
            {option.label}
          </span>
          {option.count !== undefined && (
            <span className="text-sm text-gray-500">({option.count})</span>
          )}
        </label>
      ))}
    </div>
  )

  const renderRangeGroup = (group: FilterGroup) => (
    <div className="space-y-4">
      <input
        type="range"
        min={group.min || 0}
        max={group.max || 100}
        step={group.step || 1}
        value={activeFilters[group.id] || group.min || 0}
        onChange={(e) => onFilterChange(group.id, Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
      />
      <div className="flex justify-between text-sm text-gray-500">
        <span>${group.min || 0}</span>
        <span className="font-medium text-black">
          ₺{activeFilters[group.id] || group.min || 0}
        </span>
        <span>₺{group.max || 100}</span>
      </div>
    </div>
  )

  const renderToggleGroup = (group: FilterGroup) => (
    <div className="space-y-3">
      {group.options.map(option => (
        <div key={option.id} className="flex items-center justify-between">
          <span className="text-sm text-gray-700">{option.label}</span>
          <button
            type="button"
            onClick={() => onFilterChange(group.id, !activeFilters[group.id])}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
              activeFilters[group.id] ? 'bg-black' : 'bg-gray-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                activeFilters[group.id] ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  )

  const renderFilterGroup = (group: FilterGroup) => {
    switch (group.type) {
      case 'checkbox':
        return renderCheckboxGroup(group)
      case 'radio':
        return renderRadioGroup(group)
      case 'range':
        return renderRangeGroup(group)
      case 'toggle':
        return renderToggleGroup(group)
      default:
        return null
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-black">Filtreler</h3>
          {getActiveFilterCount() > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-sm text-black hover:text-gray-600 font-medium"
            >
              Tümünü temizle ({getActiveFilterCount()})
            </button>
          )}
        </div>
      </div>

      {/* Filter Groups */}
      <div className="divide-y divide-gray-200">
        {filterGroups.map(group => (
          <div key={group.id} className="p-4">
            <button
              type="button"
              onClick={() => toggleGroup(group.id)}
              className={`w-full flex items-center justify-between text-left ${
                collapsible ? 'cursor-pointer' : 'cursor-default'
              }`}
              disabled={!collapsible}
            >
              <h4 className="text-sm font-medium text-black">{group.label}</h4>
              {collapsible && (
                <svg
                  className={`h-5 w-5 text-gray-400 transform transition-transform ${
                    isGroupExpanded(group.id) ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
            
            {isGroupExpanded(group.id) && (
              <div className="mt-4">
                {renderFilterGroup(group)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Active Filters Summary */}
      {getActiveFilterCount() > 0 && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {Object.entries(activeFilters).map(([groupId, value]) => {
              const group = filterGroups.find(g => g.id === groupId)
              if (!group || !value) return null

              if (Array.isArray(value) && value.length > 0) {
                return value.map(optionId => {
                  const option = group.options.find(o => o.id === optionId)
                  if (!option) return null
                  
                  return (
                    <span
                      key={`${groupId}-${optionId}`}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-black text-white"
                    >
                      {option.label}
                      <button
                        type="button"
                        onClick={() => {
                          const newValues = value.filter((id: string) => id !== optionId)
                          onFilterChange(groupId, newValues)
                        }}
                        className="ml-1 text-gray-300 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  )
                })
              }

              if (typeof value === 'boolean' && value) {
                return (
                  <span
                    key={groupId}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-black text-white"
                  >
                    {group.label}
                    <button
                      type="button"
                      onClick={() => onFilterChange(groupId, false)}
                      className="ml-1 text-gray-300 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                )
              }

              if (typeof value === 'string' && value) {
                const option = group.options.find(o => o.id === value)
                return (
                  <span
                    key={groupId}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-black text-white"
                  >
                    {option?.label || value}
                    <button
                      type="button"
                      onClick={() => onFilterChange(groupId, '')}
                      className="ml-1 text-gray-300 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                )
              }

              return null
            })}
          </div>
        </div>
      )}
    </div>
  )
}
