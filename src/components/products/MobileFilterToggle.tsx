'use client';

import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  X,
  Filter
} from 'lucide-react';
import { ProductFilter } from './ProductFilter';

interface MobileFilterToggleProps {
  filterGroups: any[];
  activeFilters: Record<string, string[]>;
  onFilterChange: (group: string, value: string) => void;
  onClearAll: () => void;
  className?: string;
}

export const MobileFilterToggle: React.FC<MobileFilterToggleProps> = ({
  filterGroups,
  activeFilters,
  onFilterChange,
  onClearAll,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Count active filters
  const activeFilterCount = Object.values(activeFilters).reduce(
    (count, filters) => count + filters.length,
    0
  );

  const toggleFilters = () => {
    setIsOpen(!isOpen);
  };

  const handleClearAll = () => {
    onClearAll();
    setIsOpen(false);
  };

  return (
    <>
      {/* Filter Toggle Button */}
      <button
        onClick={toggleFilters}
        className={`
          lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 
          bg-white border border-gray-200 rounded-lg shadow-sm
          hover:bg-gray-50 active:bg-gray-100 transition-colors
          ${className}
        `}
        aria-label="Filtreleri aç/kapat"
      >
        <Filter className="w-5 h-5 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          Filtreler
        </span>
        {activeFilterCount > 0 && (
          <span className="ml-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Mobile Filter Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-6 h-6 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Filtreler
                </h3>
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button
                onClick={toggleFilters}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Filtreleri kapat"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Filter Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <ProductFilter
                filterGroups={filterGroups}
                activeFilters={activeFilters}
                onFilterChange={onFilterChange}
                onClearAll={handleClearAll}
              />
            </div>

            {/* Footer Actions */}
            <div className="border-t border-gray-200 p-4 space-y-3">
              {activeFilterCount > 0 && (
                <button
                  onClick={handleClearAll}
                  className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Tüm Filtreleri Temizle
                </button>
              )}
              <button
                onClick={toggleFilters}
                className="w-full px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Ürünleri Görüntüle
                {activeFilterCount > 0 && ` (${activeFilterCount} filtre)`}
              </button>
            </div>
          </div>

          {/* Click outside to close */}
          <div 
            className="absolute inset-0 -z-10"
            onClick={toggleFilters}
          />
        </div>
      )}
    </>
  );
};
