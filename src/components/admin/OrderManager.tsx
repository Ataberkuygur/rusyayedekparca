'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface Order {
  id: string
  order_number: string
  user_id: string
  status: string
  total_amount: number
  created_at: string
  updated_at: string
  shipping_address: any
  users?: {
    first_name: string
    last_name: string
    email: string
    phone?: string
  }
  order_items?: {
    id: string
    product_id: string
    quantity: number
    price: number
    products?: {
      name: string
      sku: string
      images?: string[]
    }
  }[]
}

const OrderManager: React.FC = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updating, setUpdating] = useState<string>('')
  const itemsPerPage = 20

  const statusOptions = [
    { value: 'all', label: 'Tümü' },
    { value: 'pending', label: 'Bekliyor' },
    { value: 'processing', label: 'İşleniyor' },
    { value: 'shipped', label: 'Kargoda' },
    { value: 'delivered', label: 'Teslim Edildi' },
    { value: 'completed', label: 'Tamamlandı' },
    { value: 'cancelled', label: 'İptal Edildi' },
    { value: 'refunded', label: 'İade Edildi' }
  ]

  useEffect(() => {
    fetchOrders()
  }, [currentPage, searchTerm, statusFilter])

  const fetchOrders = async () => {
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

      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      const response = await fetch(`/api/admin/orders?${params}`)
      
      if (!response.ok) {
        throw new Error('Sipariş verileri alınamadı')
      }

      const data = await response.json()
      setOrders(data.orders)
      setTotalPages(Math.ceil(data.total / itemsPerPage))
    } catch (err: any) {
      console.error('Error fetching orders:', err)
      setError(err.message || 'Sipariş verileri yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdating(orderId)
      
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          order_id: orderId,
          status: newStatus
        })
      })

      if (!response.ok) {
        throw new Error('Sipariş durumu güncellenemedi')
      }

      await fetchOrders()
      
      // Update selected order if it's the one being updated
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null)
      }
    } catch (err: any) {
      console.error('Error updating order status:', err)
      setError(err.message || 'Sipariş durumu güncellenirken bir hata oluştu')
    } finally {
      setUpdating('')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return 'text-green-600 bg-green-100'
      case 'processing':
      case 'shipped':
        return 'text-blue-600 bg-blue-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'cancelled':
      case 'refunded':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status)
    return option ? option.label : status
  }

  const canUpdateStatus = (currentStatus: string, newStatus: string) => {
    const statusFlow = ['pending', 'processing', 'shipped', 'delivered', 'completed']
    const currentIndex = statusFlow.indexOf(currentStatus)
    const newIndex = statusFlow.indexOf(newStatus)
    
    // Can always cancel or refund
    if (newStatus === 'cancelled' || newStatus === 'refunded') {
      return currentStatus !== 'completed' && currentStatus !== 'delivered'
    }
    
    // Can only move forward in the flow
    return newIndex > currentIndex
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Sipariş Yönetimi</h1>
          <p className="text-gray-600 mt-2">
            Müşteri siparişlerini takip edin ve yönetin.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sipariş Ara
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Sipariş numarası, müşteri adı veya e-posta..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sipariş Durumu
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchOrders}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Filtrele
              </button>
            </div>
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

        {/* Orders Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sipariş
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Müşteri
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tutar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
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
                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
                      </td>
                    </tr>
                  ))
                ) : orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{order.order_number}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.order_items?.length || 0} ürün
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.users?.first_name} {order.users?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.users?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          disabled={updating === order.id}
                          className={`text-xs font-medium rounded-full px-2.5 py-0.5 border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(order.status)}`}
                        >
                          {statusOptions.filter(opt => opt.value !== 'all').map(option => (
                            <option 
                              key={option.value} 
                              value={option.value}
                              disabled={!canUpdateStatus(order.status, option.value)}
                            >
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(order.total_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Detay
                        </button>
                        <a
                          href={`/admin/orders/${order.id}/invoice`}
                          className="text-green-600 hover:text-green-900"
                        >
                          Fatura
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Sipariş bulunamadı
                        </h3>
                        <p className="text-gray-500">
                          Arama kriterlerinize uygun sipariş bulunamadı.
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
                    
                    {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                      const page = i + 1
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

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Sipariş Detayları - #{selectedOrder.order_number}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Customer Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Müşteri Bilgileri</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Ad Soyad:</span> {selectedOrder.users?.first_name} {selectedOrder.users?.last_name}
                    </div>
                    <div>
                      <span className="font-medium">E-posta:</span> {selectedOrder.users?.email}
                    </div>
                    {selectedOrder.users?.phone && (
                      <div>
                        <span className="font-medium">Telefon:</span> {selectedOrder.users.phone}
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Sipariş Bilgileri</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Tarih:</span> {formatDate(selectedOrder.created_at)}
                    </div>
                    <div>
                      <span className="font-medium">Durum:</span> 
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusText(selectedOrder.status)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Toplam:</span> {formatCurrency(selectedOrder.total_amount)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shipping_address && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Teslimat Adresi</h4>
                  <div className="text-sm text-gray-600">
                    <div>{selectedOrder.shipping_address.address_line}</div>
                    <div>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postal_code}</div>
                    <div>{selectedOrder.shipping_address.country}</div>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Sipariş Ürünleri</h4>
                <div className="space-y-3">
                  {selectedOrder.order_items?.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 bg-white p-3 rounded border">
                      <div className="flex-shrink-0 w-16 h-16">
                        {item.products?.images?.[0] ? (
                          <img
                            src={item.products.images[0]}
                            alt={item.products.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{item.products?.name}</h5>
                        <p className="text-sm text-gray-500">SKU: {item.products?.sku}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-600">Adet: {item.quantity}</span>
                          <span className="font-medium">{formatCurrency(item.price)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Kapat
                </button>
                <a
                  href={`/admin/orders/${selectedOrder.id}/invoice`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Fatura Görüntüle
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderManager
