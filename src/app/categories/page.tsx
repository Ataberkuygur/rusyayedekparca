'use client'

import React from 'react'
import Link from 'next/link'

const categories = [
  {
    id: 'fren-sistemi',
    name: 'Fren Sistemi',
    description: 'Fren diskleri, balata, kampana ve fren hidroliği',
    icon: '🛑',
    productCount: 245
  },
  {
    id: 'motor-parcalari',
    name: 'Motor Parçaları',
    description: 'Piston, segman, supap, silindir kafası ve motor yağları',
    icon: '🔧',
    productCount: 389
  },
  {
    id: 'sanziman',
    name: 'Şanzıman',
    description: 'Manuel ve otomatik şanzıman parçaları',
    icon: '⚙️',
    productCount: 156
  },
  {
    id: 'suspansiyon',
    name: 'Süspansiyon',
    description: 'Amortisör, yay, salıncak ve rotil parçaları',
    icon: '🔩',
    productCount: 198
  },
  {
    id: 'elektrik',
    name: 'Elektrik',
    description: 'Akü, alternatör, marş motoru ve elektrik kabloları',
    icon: '⚡',
    productCount: 167
  },
  {
    id: 'filtreler',
    name: 'Filtreler',
    description: 'Hava, yağ, yakıt ve kabin filtreleri',
    icon: '🔍',
    productCount: 134
  },
  {
    id: 'kayislar-hortumlar',
    name: 'Kayışlar & Hortumlar',
    description: 'Triger kayışı, V kayış ve radyatör hortumları',
    icon: '🔄',
    productCount: 98
  },
  {
    id: 'aydinlatma',
    name: 'Aydınlatma',
    description: 'Far, stop lambası, sinyal ve sis farları',
    icon: '💡',
    productCount: 145
  },
  {
    id: 'kaporta',
    name: 'Kaporta',
    description: 'Çamurluk, kapı, kaput ve tampon parçaları',
    icon: '🚗',
    productCount: 223
  },
  {
    id: 'ic-aksam',
    name: 'İç Aksam',
    description: 'Koltuk, direksiyon, gösterge paneli ve döşeme',
    icon: '🪑',
    productCount: 112
  },
  {
    id: 'egzoz-sistemi',
    name: 'Egzoz Sistemi',
    description: 'Egzoz borusu, susturucu ve katalitik konvertör',
    icon: '💨',
    productCount: 87
  },
  {
    id: 'yakit-sistemi',
    name: 'Yakıt Sistemi',
    description: 'Yakıt pompası, enjektör ve yakıt deposu',
    icon: '⛽',
    productCount: 76
  }
]

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 fold:grid-cols-1 fold-open:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 fold:gap-2 sm:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.id}`}
              className="group bg-white rounded-lg border border-gray-200 p-3 fold:p-2 sm:p-6 hover:shadow-lg transition-all hover:border-black touch-manipulation active:scale-95"
            >
              <div className="text-center">
                <div className="text-2xl fold:text-xl sm:text-4xl mb-2 fold:mb-1 sm:mb-4">{category.icon}</div>
                <h3 className="text-sm fold:text-xs sm:text-lg font-semibold text-black mb-1 fold:mb-0.5 sm:mb-2 group-hover:text-gray-800 leading-tight">
                  {category.name}
                </h3>
                <p className="text-xs fold:text-[10px] sm:text-sm text-gray-600 mb-2 fold:mb-1 sm:mb-4 leading-relaxed line-clamp-2 fold:hidden sm:block">
                  {category.description}
                </p>
                <div className="text-xs fold:text-[10px] sm:text-sm font-medium text-gray-500">
                  {category.productCount} ürün
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
