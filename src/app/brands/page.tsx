'use client'

import React from 'react'
import Link from 'next/link'

const brands = [
  {
    id: 'bosch',
    name: 'Bosch',
    description: 'Alman kalitesi otomotiv parçaları',
    logo: 'B',
    productCount: 234,
    featured: true
  },
  {
    id: 'oem',
    name: 'OEM',
    description: 'Orijinal ekipman üreticisi parçaları',
    logo: 'O',
    productCount: 456,
    featured: true
  },
  {
    id: 'denso',
    name: 'Denso',
    description: 'Japon teknolojisi yedek parçalar',
    logo: 'D',
    productCount: 189,
    featured: true
  },
  {
    id: 'gates',
    name: 'Gates',
    description: 'Kayış ve hortum uzmanı',
    logo: 'G',
    productCount: 156,
    featured: false
  },
  {
    id: 'mobil1',
    name: 'Mobil 1',
    description: 'Premium motor yağları',
    logo: 'M',
    productCount: 78,
    featured: false
  },
  {
    id: 'fram',
    name: 'FRAM',
    description: 'Filtre teknolojilerinde lider',
    logo: 'F',
    productCount: 145,
    featured: false
  },
  {
    id: 'mann-filter',
    name: 'Mann Filter',
    description: 'Alman filtre teknolojisi',
    logo: 'MF',
    productCount: 167,
    featured: false
  },
  {
    id: 'brembo',
    name: 'Brembo',
    description: 'İtalyan fren sistemi uzmanı',
    logo: 'BR',
    productCount: 98,
    featured: true
  },
  {
    id: 'continental',
    name: 'Continental',
    description: 'Lastik ve otomotiv teknolojileri',
    logo: 'C',
    productCount: 143,
    featured: false
  },
  {
    id: 'valeo',
    name: 'Valeo',
    description: 'Fransız otomotiv teknolojisi',
    logo: 'V',
    productCount: 201,
    featured: false
  },
  {
    id: 'sachs',
    name: 'Sachs',
    description: 'Süspansiyon ve amortisör',
    logo: 'S',
    productCount: 134,
    featured: false
  },
  {
    id: 'mahle',
    name: 'Mahle',
    description: 'Motor parçaları ve filtreler',
    logo: 'MA',
    productCount: 178,
    featured: false
  }
]

export default function BrandsPage() {
  const featuredBrands = brands.filter(brand => brand.featured)
  const otherBrands = brands.filter(brand => !brand.featured)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Brands */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-black mb-6">Öne Çıkan Markalar</h2>
          <div className="grid grid-cols-3 fold:grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-4 gap-3 fold:gap-2 sm:gap-6">
            {featuredBrands.map((brand) => (
              <Link
                key={brand.id}
                href={`/products?brand=${brand.id}`}
                className="group bg-white rounded-lg border-2 border-black p-3 fold:p-2 sm:p-6 hover:shadow-xl transition-all hover:bg-gray-50 touch-manipulation active:scale-95"
              >
                <div className="text-center">
                  <div className="w-10 h-10 fold:w-8 fold:h-8 sm:w-16 sm:h-16 bg-black text-white rounded-lg flex items-center justify-center text-sm fold:text-xs sm:text-xl font-bold mx-auto mb-2 fold:mb-1 sm:mb-4 group-hover:bg-gray-800 transition-colors">
                    {brand.logo}
                  </div>
                  <h3 className="text-xs fold:text-[10px] sm:text-lg font-bold text-black mb-1 fold:mb-0.5 sm:mb-2 group-hover:text-gray-800 leading-tight">
                    {brand.name}
                  </h3>
                  <p className="text-[10px] fold:text-[8px] sm:text-sm text-gray-600 mb-2 fold:mb-1 sm:mb-4 leading-relaxed line-clamp-2 fold:hidden sm:block">
                    {brand.description}
                  </p>
                  <div className="text-[9px] fold:text-[8px] sm:text-sm font-medium text-gray-500">
                    {brand.productCount} ürün
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* All Brands */}
        <div>
          <h2 className="text-2xl font-bold text-black mb-6">Tüm Markalar</h2>
          <div className="grid grid-cols-3 fold:grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 fold:gap-2 sm:gap-4">
            {otherBrands.map((brand) => (
              <Link
                key={brand.id}
                href={`/products?brand=${brand.id}`}
                className="group bg-white rounded-lg border border-gray-200 p-3 fold:p-2 sm:p-4 hover:shadow-lg transition-all hover:border-black touch-manipulation active:scale-95"
              >
                <div className="flex fold:flex-col items-center space-x-3 fold:space-x-0 fold:space-y-2">
                  <div className="w-8 h-8 fold:w-6 fold:h-6 sm:w-12 sm:h-12 bg-gray-100 text-black rounded-lg flex items-center justify-center text-xs fold:text-[9px] sm:text-sm font-bold group-hover:bg-black group-hover:text-white transition-colors flex-shrink-0">
                    {brand.logo}
                  </div>
                  <div className="flex-1 fold:text-center min-w-0">
                    <h3 className="font-semibold text-black group-hover:text-gray-800 text-xs fold:text-[10px] sm:text-base leading-tight truncate">
                      {brand.name}
                    </h3>
                    <p className="text-[9px] fold:text-[8px] sm:text-sm text-gray-500 truncate">
                      {brand.productCount} ürün
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
