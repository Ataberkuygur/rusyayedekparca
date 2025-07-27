'use client'

import React, { useState } from 'react'
import { ProductFilter } from '@/components/products'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onFiltersChange: (filters: any) => void
  className?: string
  children?: React.ReactNode
  title?: string
  showProductFilters?: boolean
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onFiltersChange,
  className = '',
  children,
  title = 'Filtreler',
  showProductFilters = true
}) => {
  const [localFilters, setLocalFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    condition: '',
    brand: '',
    inStock: false
  })

  const handleFilterChange = (filters: any) => {
    setLocalFilters(filters)
    onFiltersChange(filters)
  }

  const clearFilters = () => {
    const emptyFilters = {
      category: '',
      minPrice: '',
      maxPrice: '',
      condition: '',
      brand: '',
      inStock: false
    }
    setLocalFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 
          transform transition-transform duration-300 ease-in-out lg:transform-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${className}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:border-b-0">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 lg:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {showProductFilters && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900">Ürün Filtreleri</h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Temizle
                  </button>
                </div>
                
                {/* Category Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori
                  </label>
                  <select
                    value={localFilters.category}
                    onChange={(e) => handleFilterChange({ ...localFilters, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tüm Kategoriler</option>
                    <option value="motor">Motor Parçaları</option>
                    <option value="fren">Fren Sistemleri</option>
                    <option value="amortisör">Amortisörler</option>
                    <option value="elektrik">Elektrik Sistemleri</option>
                    <option value="filtre">Filtreler</option>
                    <option value="yakıt">Yakıt Sistemleri</option>
                    <option value="egzoz">Egzoz Sistemleri</option>
                    <option value="soğutma">Soğutma Sistemleri</option>
                  </select>
                </div>

                {/* Brand Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marka
                  </label>
                  <select
                    value={localFilters.brand}
                    onChange={(e) => handleFilterChange({ ...localFilters, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tüm Markalar</option>
                    <option value="bosch">Bosch</option>
                    <option value="mann">Mann Filter</option>
                    <option value="mahle">Mahle</option>
                    <option value="sachs">Sachs</option>
                    <option value="continental">Continental</option>
                    <option value="valeo">Valeo</option>
                    <option value="ate">ATE</option>
                    <option value="febi">Febi Bilstein</option>
                  </select>
                </div>

                {/* Price Range */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fiyat Aralığı (₺)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={localFilters.minPrice}
                      onChange={(e) => handleFilterChange({ ...localFilters, minPrice: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={localFilters.maxPrice}
                      onChange={(e) => handleFilterChange({ ...localFilters, maxPrice: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Condition Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durum
                  </label>
                  <select
                    value={localFilters.condition}
                    onChange={(e) => handleFilterChange({ ...localFilters, condition: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tümü</option>
                    <option value="new">Yeni</option>
                    <option value="used">İkinci El</option>
                    <option value="refurbished">Yenilenmiş</option>
                  </select>
                </div>

                {/* Stock Filter */}
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={localFilters.inStock}
                      onChange={(e) => handleFilterChange({ ...localFilters, inStock: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Sadece Stokta Olanlar</span>
                  </label>
                </div>

                {/* Quick Filters */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Hızlı Filtreler</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleFilterChange({ ...localFilters, category: 'motor' })}
                      className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                    >
                      Motor Parçaları
                    </button>
                    <button
                      onClick={() => handleFilterChange({ ...localFilters, category: 'fren' })}
                      className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                    >
                      Fren Sistemleri
                    </button>
                    <button
                      onClick={() => handleFilterChange({ ...localFilters, category: 'filtre' })}
                      className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                    >
                      Filtreler
                    </button>
                    <button
                      onClick={() => handleFilterChange({ ...localFilters, condition: 'new', inStock: true })}
                      className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                    >
                      Yeni ve Stokta
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Custom Children */}
            {children}
          </div>

          {/* Popular Categories */}
          <div className="border-t border-gray-200 p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Popüler Kategoriler</h4>
            <div className="space-y-1">
              <a href="/categories/motor-yaglari" className="block text-sm text-gray-600 hover:text-blue-600">
                Motor Yağları
              </a>
              <a href="/categories/fren-balata" className="block text-sm text-gray-600 hover:text-blue-600">
                Fren Balata
              </a>
              <a href="/categories/amortisör" className="block text-sm text-gray-600 hover:text-blue-600">
                Amortisörler
              </a>
              <a href="/categories/filtre" className="block text-sm text-gray-600 hover:text-blue-600">
                Hava Filtreleri
              </a>
              <a href="/categories/aku" className="block text-sm text-gray-600 hover:text-blue-600">
                Aküler
              </a>
            </div>
          </div>

          {/* Help Section */}
          <div className="border-t border-gray-200 p-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-blue-900">Yardıma mı ihtiyacınız var?</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Uygun parça bulamıyor musunuz? Uzmanlarımızla iletişime geçin.
              </p>
              <a
                href="/contact"
                className="inline-block mt-2 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                İletişime Geç →
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
