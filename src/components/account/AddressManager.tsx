'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { UserAddress } from '@/services/users'

const AddressManager: React.FC = () => {
  const { user } = useAuth()
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    first_name: '',
    last_name: '',
    phone: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Turkey',
    is_default: false
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      fetchAddresses()
    }
  }, [user])

  const fetchAddresses = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/users/addresses')
      
      if (!response.ok) {
        throw new Error('Adresler alınamadı')
      }

      const data = await response.json()
      setAddresses(data.addresses)
    } catch (err) {
      console.error('Error fetching addresses:', err)
      setError('Adresler yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSubmitting(true)
      setError('')

      const url = editingAddress 
        ? `/api/users/addresses/${editingAddress.id}`
        : '/api/users/addresses'
      
      const method = editingAddress ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Adres kaydedilemedi')
      }

      const data = await response.json()
      alert(data.message)
      
      // Refresh addresses
      await fetchAddresses()
      
      // Reset form
      setShowForm(false)
      setEditingAddress(null)
      setFormData({
        title: '',
        first_name: '',
        last_name: '',
        phone: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'Turkey',
        is_default: false
      })
    } catch (err: any) {
      console.error('Error saving address:', err)
      setError(err.message || 'Adres kaydedilirken bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (address: UserAddress) => {
    setEditingAddress(address)
    setFormData({
      title: address.title,
      first_name: address.first_name,
      last_name: address.last_name,
      phone: address.phone,
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2 || '',
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
      is_default: address.is_default
    })
    setShowForm(true)
  }

  const handleDelete = async (addressId: string) => {
    if (!confirm('Bu adresi silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const response = await fetch(`/api/users/addresses/${addressId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Adres silinemedi')
      }

      const data = await response.json()
      alert(data.message)
      
      // Refresh addresses
      await fetchAddresses()
    } catch (err) {
      console.error('Error deleting address:', err)
      alert('Adres silinirken bir hata oluştu')
    }
  }

  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await fetch(`/api/users/addresses/${addressId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'set_default' }),
      })

      if (!response.ok) {
        throw new Error('Varsayılan adres ayarlanamadı')
      }

      const data = await response.json()
      alert(data.message)
      
      // Refresh addresses
      await fetchAddresses()
    } catch (err) {
      console.error('Error setting default address:', err)
      alert('Varsayılan adres ayarlanırken bir hata oluştu')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingAddress(null)
    setFormData({
      title: '',
      first_name: '',
      last_name: '',
      phone: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'Turkey',
      is_default: false
    })
    setError('')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Giriş Yapın
          </h2>
          <p className="text-gray-600">
            Adres defterinizi görüntülemek için giriş yapmanız gerekiyor.
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Adres Defteri</h1>
              <p className="text-gray-600 mt-2">
                Teslimat adreslerinizi yönetin ve varsayılan adres seçin.
              </p>
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Yeni Adres Ekle
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Address Form */}
        {showForm && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingAddress ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}
              </h2>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adres Başlığı *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ev, İş, vb."
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_default"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_default" className="ml-2 block text-sm text-gray-900">
                    Varsayılan adres olarak ayarla
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ad *
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Soyad *
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0555 123 45 67"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adres Satır 1 *
                </label>
                <input
                  type="text"
                  value={formData.address_line_1}
                  onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Sokak, mahalle, bina no"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adres Satır 2
                </label>
                <input
                  type="text"
                  value={formData.address_line_2}
                  onChange={(e) => setFormData({ ...formData, address_line_2: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Daire, kat, apartman adı (opsiyonel)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Şehir *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İl/Bölge *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Posta Kodu *
                  </label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ülke *
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Turkey">Türkiye</option>
                  <option value="Germany">Almanya</option>
                  <option value="France">Fransa</option>
                  <option value="United Kingdom">İngiltere</option>
                  <option value="United States">Amerika Birleşik Devletleri</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Kaydediliyor...' : (editingAddress ? 'Güncelle' : 'Kaydet')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Address List */}
        {addresses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="bg-white shadow rounded-lg p-6 relative"
              >
                {address.is_default && (
                  <div className="absolute top-4 right-4">
                    <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                      Varsayılan
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {address.title}
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="font-medium">{address.first_name} {address.last_name}</p>
                    <p>{address.address_line_1}</p>
                    {address.address_line_2 && <p>{address.address_line_2}</p>}
                    <p>{address.city}, {address.state} {address.postal_code}</p>
                    <p>{address.country}</p>
                    <p>Tel: {address.phone}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(address)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Düzenle
                    </button>
                    {!address.is_default && (
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        Varsayılan Yap
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Sil
                  </button>
                </div>
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
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Kayıtlı adres yok
            </h3>
            <p className="mt-2 text-gray-500">
              Hızlı sipariş için adres ekleyin.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                İlk Adresinizi Ekleyin
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AddressManager
