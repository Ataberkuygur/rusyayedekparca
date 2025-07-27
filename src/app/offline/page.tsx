'use client'

import React from 'react'
import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <svg
            className="w-24 h-24 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Çevrimdışısınız
          </h1>
          <p className="text-gray-600 leading-relaxed">
            İnternet bağlantınızı kontrol edin ve tekrar deneyin. Bazı özellikler çevrimdışı kullanılabilir.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
          >
            Tekrar Dene
          </button>
          
          <Link
            href="/"
            className="block w-full px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-xl">
          <h3 className="font-medium text-blue-900 mb-2">
            Çevrimdışı Özellikler
          </h3>
          <ul className="text-sm text-blue-700 space-y-1 text-left">
            <li>• Önceden görüntülenen sayfalar</li>
            <li>• Sepet içeriği (yerel)</li>
            <li>• Favori ürünler</li>
            <li>• Arama geçmişi</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
