'use client'

import React from 'react'
import Link from 'next/link'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-black">YedekParça</span>
            </div>
            <p className="text-gray-600 text-sm">
              Kaliteli yedek parça ve profesyonel hizmet anlayışımızla yanınızdayız.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-black uppercase tracking-wider mb-4">
              Hızlı Linkler
            </h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-600 hover:text-black text-sm transition-colors">Ana Sayfa</Link></li>
              <li><Link href="/products" className="text-gray-600 hover:text-black text-sm transition-colors">Ürünler</Link></li>
              <li><Link href="/about" className="text-gray-600 hover:text-black text-sm transition-colors">Hakkımızda</Link></li>
              <li><Link href="/contact" className="text-gray-600 hover:text-black text-sm transition-colors">İletişim</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-sm font-semibold text-black uppercase tracking-wider mb-4">
              Müşteri Hizmetleri
            </h3>
            <ul className="space-y-2">
              <li><Link href="/help" className="text-gray-600 hover:text-black text-sm transition-colors">Yardım</Link></li>
              <li><Link href="/returns" className="text-gray-600 hover:text-black text-sm transition-colors">İade & Değişim</Link></li>
              <li><Link href="/shipping" className="text-gray-600 hover:text-black text-sm transition-colors">Kargo Bilgileri</Link></li>
              <li><Link href="/warranty" className="text-gray-600 hover:text-black text-sm transition-colors">Garanti</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-black uppercase tracking-wider mb-4">
              İletişim
            </h3>
            <div className="space-y-2">
              <p className="text-gray-600 text-sm">+90 212 555 0123</p>
              <p className="text-gray-600 text-sm">info@yedekparca.com</p>
              <p className="text-gray-600 text-sm">İstanbul, Türkiye</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-600 text-sm">
            © {currentYear} YedekParça. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
