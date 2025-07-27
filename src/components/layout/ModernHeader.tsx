'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'

const Header: React.FC = () => {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { cart, itemCount } = useCart()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(searchQuery)
  }

  const handleSignOut = async () => {
    await signOut()
    setIsUserMenuOpen(false)
    router.push('/')
  }

  const navigationItems = [
    { name: 'Ana Sayfa', href: '/' },
    { name: 'Ürünler', href: '/products' },
    { name: 'Kategoriler', href: '/categories' },
    { name: 'Markalar', href: '/brands' },
    { name: 'İletişim', href: '/contact' }
  ]

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      {/* Top Bar - Hidden on mobile for better space */}
      <div className="hidden sm:block gradient-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10 text-sm">
            <div className="flex items-center space-x-6">
              <span className="flex items-center hover:text-blue-200 transition-colors">
                <svg className="icon-sm mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +90 212 555 0123
              </span>
              <span className="flex items-center hover:text-blue-200 transition-colors">
                <svg className="icon-sm mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                info@yedekparca.com
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-4 text-xs">
              <span className="bg-white/20 px-3 py-1 rounded-full font-medium">Ücretsiz Kargo - 500₺ ve Üzeri</span>
              <span>•</span>
              <span className="bg-amber-400 text-blue-900 px-3 py-1 rounded-full font-semibold">Aynı Gün Teslimat</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 fold:px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 fold:h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <div className="w-14 h-14 fold:w-12 fold:h-12 gradient-primary rounded-xl flex items-center justify-center mr-4 fold:mr-3 shadow-lg group-hover:scale-105 transition-all duration-300">
                <svg className="w-8 h-8 fold:w-6 fold:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="hidden xs:block fold:hidden sm:block">
                <h1 className="text-2xl fold:text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                  YedekParça
                </h1>
                <p className="text-xs fold:text-[10px] text-gray-500 font-medium">Otomotiv Yedek Parça</p>
              </div>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8 fold:mx-4 hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative group">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="icon-md text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ürün adı, marka, model veya yıl ile arama yapın..."
                  className="input-field pl-12 pr-4 py-3 w-full text-sm font-medium placeholder-gray-400 focus:placeholder-gray-300"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <button
                    type="submit"
                    className="btn-primary text-sm px-4 py-1.5"
                  >
                    Ara
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3 fold:space-x-2">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-3 fold:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all hover-lift group touch-manipulation active:scale-95"
            >
              <svg className="icon-md fold:w-5 fold:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 fold:h-5 fold:w-5 flex items-center justify-center font-semibold animate-pulse">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* User Menu - Hidden on small mobile, shown on tablet+ */}
            {user ? (
              <div className="relative hidden fold-open:block">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all touch-manipulation active:scale-95"
                >
                  <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <svg className="icon-sm ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-100 animate-fade-in-scale">
                    <Link
                      href="/account"
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <svg className="icon-sm mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Hesabım
                      </div>
                    </Link>
                    <Link
                      href="/account/orders"
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <svg className="icon-sm mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Siparişlerim
                      </div>
                    </Link>
                    <Link
                      href="/account/addresses"
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <svg className="icon-sm mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        Adreslerim
                      </div>
                    </Link>
                    {(user as any)?.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="block px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          <svg className="icon-sm mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Admin Panel
                        </div>
                      </Link>
                    )}
                    <hr className="my-2" />
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <svg className="icon-sm mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Çıkış Yap
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden fold-open:flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all touch-manipulation active:scale-95"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-primary text-sm px-4 py-2 touch-manipulation active:scale-95"
                >
                  Üye Ol
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 fold:p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all touch-manipulation active:scale-95"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <svg className="icon-md fold:w-5 fold:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white shadow-lg animate-in slide-in-from-top duration-200">
          <div className="px-4 fold:px-3 py-6 fold:py-4 space-y-6 fold:space-y-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ürün ara..."
                className="input-field text-base fold:text-sm py-3 fold:py-2 touch-manipulation"
                autoComplete="off"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 fold:p-1.5 text-gray-400 hover:text-gray-600 touch-manipulation active:scale-95"
                aria-label="Search"
              >
                <svg className="w-5 h-5 fold:w-4 fold:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
            
            {/* Mobile Navigation */}
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-4 fold:px-3 py-4 fold:py-3 text-base fold:text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all touch-manipulation active:scale-95"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                  <svg className="w-5 h-5 fold:w-4 fold:h-4 ml-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>

            {/* Mobile Auth Section */}
            {!user ? (
              <div className="pt-4 fold:pt-3 border-t border-gray-100 space-y-3">
                <Link
                  href="/auth/login"
                  className="block w-full px-4 fold:px-3 py-3 fold:py-2.5 text-center text-base fold:text-sm font-medium text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all touch-manipulation active:scale-95"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/auth/register"
                  className="block w-full px-4 fold:px-3 py-3 fold:py-2.5 text-center text-base fold:text-sm font-medium text-white bg-black rounded-xl hover:bg-gray-800 transition-all touch-manipulation active:scale-95"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Üye Ol
                </Link>
              </div>
            ) : (
              <div className="pt-4 fold:pt-3 border-t border-gray-100 space-y-3">
                <Link
                  href="/account"
                  className="flex items-center px-4 fold:px-3 py-3 fold:py-2.5 text-base fold:text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-all touch-manipulation active:scale-95"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5 fold:w-4 fold:h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Hesabım
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-4 fold:px-3 py-3 fold:py-2.5 text-base fold:text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all touch-manipulation active:scale-95"
                >
                  <svg className="w-5 h-5 fold:w-4 fold:h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Çıkış Yap
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay for mobile menu */}
      {(isMobileMenuOpen || isUserMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsMobileMenuOpen(false)
            setIsUserMenuOpen(false)
          }}
        />
      )}
    </header>
  )
}

export default Header
