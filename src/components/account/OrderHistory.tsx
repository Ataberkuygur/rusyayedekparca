'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface Order {
  id: string
  order_number: string
  status: string
  total_amount: number
  created_at: string
  shipping_address: any
  order_items: Array<{
    id: string
    quantity: number
    price: number
    products: {
      id: string
      name: string
      images: string[]
      price: number
    }
  }>
}

const OrderHistory: React.FC = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [reorderLoading, setReorderLoading] = useState('')

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/users/orders?limit=50')
      
      if (!response.ok) {
        throw new Error('Siparişler alınamadı')
      }

      const data = await response.json()
      setOrders(data.orders)
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError('Siparişler yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleReorder = async (orderId: string) => {
    try {
      setReorderLoading(orderId)

      const response = await fetch('/api/users/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      })

      if (!response.ok) {
        throw new Error('Tekrar sipariş verilemedi')
      }

      const data = await response.json()
      alert(`${data.itemsAdded} ürün sepete eklendi`)
    } catch (err) {
      console.error('Error reordering:', err)
      alert('Tekrar sipariş verilirken bir hata oluştu')
    } finally {
      setReorderLoading('')
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
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-800 bg-green-100'
      case 'processing':
        return 'text-blue-800 bg-blue-100'
      case 'pending':
        return 'text-yellow-800 bg-yellow-100'
      case 'cancelled':
        return 'text-red-800 bg-red-100'
      default:
        return 'text-gray-800 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı'
      case 'processing':
        return 'İşleniyor'
      case 'pending':
        return 'Bekliyor'
      case 'cancelled':
        return 'İptal Edildi'
      default:
        return status
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Giriş Yapın
          </h2>
          <p className="text-gray-600">
            Sipariş geçmişinizi görüntülemek için giriş yapmanız gerekiyor.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sipariş Geçmişi</h1>
          <p className="text-gray-600 mt-2">
            Tüm siparişlerinizi ve durumlarını buradan takip edebilirsiniz.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white shadow rounded-lg overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Sipariş #{order.order_number}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusText(order.status)}
                      </span>
                      <span className="text-lg font-semibold text-gray-900">
                        {formatCurrency(order.total_amount)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4">
                  <div className="space-y-4">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-16 h-16">
                          {item.products.images?.[0] ? (
                            <img
                              src={item.products.images[0]}
                              alt={item.products.name}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {item.products.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Adet: {item.quantity} × {formatCurrency(item.price)}
                          </p>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(item.quantity * item.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {selectedOrder?.id === order.id ? 'Detayları Gizle' : 'Detayları Göster'}
                    </button>
                    <div className="flex space-x-4">
                      {order.status === 'completed' && (
                        <button
                          onClick={() => handleReorder(order.id)}
                          disabled={reorderLoading === order.id}
                          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {reorderLoading === order.id ? 'Ekleniyor...' : 'Tekrar Sipariş Ver'}
                        </button>
                      )}
                      <a
                        href={`/account/orders/${order.id}`}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Detay Görüntüle
                      </a>
                    </div>
                  </div>
                </div>

                {selectedOrder?.id === order.id && (
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Teslimat Adresi
                        </h4>
                        {order.shipping_address ? (
                          <div className="text-sm text-gray-600">
                            <p>{order.shipping_address.first_name} {order.shipping_address.last_name}</p>
                            <p>{order.shipping_address.address_line_1}</p>
                            {order.shipping_address.address_line_2 && (
                              <p>{order.shipping_address.address_line_2}</p>
                            )}
                            <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
                            <p>{order.shipping_address.phone}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Adres bilgisi bulunamadı</p>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Sipariş Özeti
                        </h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex justify-between">
                            <span>Ürün sayısı:</span>
                            <span>{order.order_items.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Toplam miktar:</span>
                            <span>{order.order_items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                          </div>
                          <div className="flex justify-between font-medium text-gray-900 pt-1 border-t">
                            <span>Toplam tutar:</span>
                            <span>{formatCurrency(order.total_amount)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Henüz sipariş yok
            </h3>
            <p className="mt-2 text-gray-500">
              İlk siparişinizi vermek için ürünleri inceleyin.
            </p>
            <div className="mt-6">
              <a
                href="/products"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Ürünleri İncele
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderHistory
