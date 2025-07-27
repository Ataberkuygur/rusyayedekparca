'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface InventoryItem {
  id: string
  product_id: string
  quantity: number
  reserved_quantity: number
  min_stock_level: number
  max_stock_level: number
  products?: {
    name: string
    sku: string
    price: number
    images?: string[]
    category?: string
    brand?: string
  }
}

interface BulkUpdateItem {
  id: string
  quantity: number
}

const InventoryManager: React.FC = () => {
  const { user } = useAuth()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStock, setFilterStock] = useState<'all' | 'low' | 'out'>('all')
  const [bulkUpdates, setBulkUpdates] = useState<BulkUpdateItem[]>([])
  const [updating, setUpdating] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 20

  useEffect(() => {
    fetchInventory()
  }, [currentPage, searchTerm, filterStock])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      setError('')

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      })

      if (searchTerm) {
        params.append('search', searchTerm)
      }

      if (filterStock !== 'all') {
        params.append('filter', filterStock)
      }

      const response = await fetch(`/api/admin/inventory?${params}`)
      
      if (!response.ok) {
        throw new Error('Envanter verileri alınamadı')
      }

      const data = await response.json()
      setItems(data.items)
      setTotalPages(Math.ceil(data.total / itemsPerPage))
    } catch (err: any) {
      console.error('Error fetching inventory:', err)
      setError(err.message || 'Envanter verileri yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const updateInventory = async (productId: string, newQuantity: number) => {
    try {
      const response = await fetch('/api/admin/inventory', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: newQuantity
        })
      })

      if (!response.ok) {
        throw new Error('Stok güncellenemedi')
      }

      await fetchInventory()
    } catch (err: any) {
      console.error('Error updating inventory:', err)
      setError(err.message || 'Stok güncellenirken bir hata oluştu')
    }
  }

  const handleBulkUpdate = async () => {
    if (bulkUpdates.length === 0) return

    try {
      setUpdating(true)
      
      const response = await fetch('/api/admin/inventory/bulk', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ updates: bulkUpdates })
      })

      if (!response.ok) {
        throw new Error('Toplu güncelleme başarısız')
      }

      setBulkUpdates([])
      await fetchInventory()
    } catch (err: any) {
      console.error('Error bulk updating inventory:', err)
      setError(err.message || 'Toplu güncelleme sırasında bir hata oluştu')
    } finally {
      setUpdating(false)
    }
  }

  const addToBulkUpdate = (itemId: string, quantity: number) => {
    setBulkUpdates(prev => {
      const existing = prev.find(item => item.id === itemId)
      if (existing) {
        return prev.map(item => 
          item.id === itemId ? { ...item, quantity } : item
        )
      }
      return [...prev, { id: itemId, quantity }]
    })
  }

  const removeFromBulkUpdate = (itemId: string) => {
    setBulkUpdates(prev => prev.filter(item => item.id !== itemId))
  }

  const getStockStatus = (item: InventoryItem) => {
    const availableStock = item.quantity - item.reserved_quantity
    
    if (availableStock <= 0) {
      return { status: 'Stokta Yok', color: 'text-red-600 bg-red-100' }
    } else if (availableStock <= item.min_stock_level) {
      return { status: 'Düşük Stok', color: 'text-yellow-600 bg-yellow-100' }
    } else {
      return { status: 'Stokta', color: 'text-green-600 bg-green-100' }
    }
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = !searchTerm || 
      item.products?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.products?.sku?.toLowerCase().includes(searchTerm.toLowerCase())

    if (!matchesSearch) return false

    const availableStock = item.quantity - item.reserved_quantity

    switch (filterStock) {
      case 'low':
        return availableStock <= item.min_stock_level && availableStock > 0
      case 'out':
        return availableStock <= 0
      default:
        return true
    }
  })

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Giriş Yapın
          </h2>
          <p className="text-gray-600">
            Admin paneline erişmek için giriş yapmanız gerekiyor.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Envanter Yönetimi</h1>
          <p className="text-gray-600 mt-2">
            Ürün stoklarını izleyin ve güncelleyin.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ürün Ara
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ürün adı veya SKU..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stok Durumu
              </label>
              <select
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value as 'all' | 'low' | 'out')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tümü</option>
                <option value="low">Düşük Stok</option>
                <option value="out">Stokta Yok</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchInventory}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Filtrele
              </button>
            </div>

            {bulkUpdates.length > 0 && (
              <div className="flex items-end">
                <button
                  onClick={handleBulkUpdate}
                  disabled={updating}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {updating ? 'Güncelleniyor...' : `${bulkUpdates.length} Ürünü Güncelle`}
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ürün
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mevcut Stok
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rezerve
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kullanılabilir
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Min/Max
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  [...Array(10)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 bg-gray-200 rounded-md animate-pulse"></div>
                          </div>
                          <div className="ml-4">
                            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredItems.length > 0 ? (
                  filteredItems.map((item) => {
                    const stockStatus = getStockStatus(item)
                    const availableStock = item.quantity - item.reserved_quantity
                    const bulkUpdate = bulkUpdates.find(update => update.id === item.id)
                    
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {item.products?.images?.[0] ? (
                                <img
                                  className="h-10 w-10 rounded-md object-cover"
                                  src={item.products.images[0]}
                                  alt={item.products.name}
                                />
                              ) : (
                                <div className="h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center">
                                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {item.products?.name || 'Ürün Adı Bilinmiyor'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.products?.category} - {item.products?.brand}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.products?.sku || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={bulkUpdate ? bulkUpdate.quantity : item.quantity}
                              onChange={(e) => {
                                const newQuantity = parseInt(e.target.value) || 0
                                addToBulkUpdate(item.id, newQuantity)
                              }}
                              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              min="0"
                            />
                            {bulkUpdate && (
                              <button
                                onClick={() => removeFromBulkUpdate(item.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.reserved_quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {availableStock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.min_stock_level} / {item.max_stock_level}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                            {stockStatus.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => updateInventory(item.product_id, bulkUpdate?.quantity || item.quantity)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Güncelle
                          </button>
                          <a
                            href={`/admin/products/${item.product_id}`}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Görüntüle
                          </a>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Ürün bulunamadı
                        </h3>
                        <p className="text-gray-500">
                          Arama kriterlerinize uygun ürün bulunamadı.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Önceki
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Sonraki
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Sayfa <span className="font-medium">{currentPage}</span> / <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1
                      if (page === currentPage || page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === currentPage
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <span key={page} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                            ...
                          </span>
                        )
                      }
                      return null
                    })}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InventoryManager
