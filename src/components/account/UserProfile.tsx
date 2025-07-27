'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { type UserProfile as UserProfileType, type UserPreferences } from '@/services/users'

const UserProfile: React.FC = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfileType | null>(null)
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('profile')

  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    date_of_birth: ''
  })

  const [preferencesForm, setPreferencesForm] = useState({
    newsletter_subscribed: false,
    sms_notifications: true,
    email_notifications: true,
    preferred_language: 'tr' as 'tr' | 'en',
    preferred_currency: 'TRY' as 'TRY' | 'USD' | 'EUR'
  })

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')

      const [profileRes, preferencesRes] = await Promise.all([
        fetch('/api/users/profile'),
        fetch('/api/users/preferences')
      ])

      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setProfile(profileData.profile)
        setProfileForm({
          first_name: profileData.profile?.first_name || '',
          last_name: profileData.profile?.last_name || '',
          phone: profileData.profile?.phone || '',
          date_of_birth: profileData.profile?.date_of_birth || ''
        })
      }

      if (preferencesRes.ok) {
        const preferencesData = await preferencesRes.json()
        setPreferences(preferencesData.preferences)
        setPreferencesForm({
          newsletter_subscribed: preferencesData.preferences?.newsletter_subscribed || false,
          sms_notifications: preferencesData.preferences?.sms_notifications || true,
          email_notifications: preferencesData.preferences?.email_notifications || true,
          preferred_language: preferencesData.preferences?.preferred_language || 'tr',
          preferred_currency: preferencesData.preferences?.preferred_currency || 'TRY'
        })
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Veriler yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileForm),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Profil güncellenemedi')
      }

      const data = await response.json()
      setProfile(data.profile)
      setSuccess('Profil başarıyla güncellendi')
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      console.error('Error updating profile:', err)
      setError(err.message || 'Profil güncellenirken bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const response = await fetch('/api/users/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferencesForm),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Tercihler güncellenemedi')
      }

      const data = await response.json()
      setPreferences(data.preferences)
      setSuccess('Tercihler başarıyla güncellendi')
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      console.error('Error updating preferences:', err)
      setError(err.message || 'Tercihler güncellenirken bir hata oluştu')
    } finally {
      setSaving(false)
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
            Profilinizi görüntülemek için giriş yapmanız gerekiyor.
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
            <div className="bg-white shadow rounded-lg">
              <div className="p-6">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
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
          <h1 className="text-3xl font-bold text-gray-900">Profil Ayarları</h1>
          <p className="text-gray-600 mt-2">
            Kişisel bilgilerinizi ve tercihlerinizi yönetin.
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-green-600">{success}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Kişisel Bilgiler
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'preferences'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Tercihler
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Kişisel Bilgiler
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        E-posta Adresi
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        E-posta adresi değiştirilemez
                      </p>
                    </div>

                    <div></div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ad *
                      </label>
                      <input
                        type="text"
                        value={profileForm.first_name}
                        onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
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
                        value={profileForm.last_name}
                        onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0555 123 45 67"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Doğum Tarihi
                      </label>
                      <input
                        type="date"
                        value={profileForm.date_of_birth}
                        onChange={(e) => setProfileForm({ ...profileForm, date_of_birth: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                  </button>
                </div>
              </form>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <form onSubmit={handlePreferencesSubmit} className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Bildirim Tercihleri
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          E-posta Bildirimleri
                        </label>
                        <p className="text-sm text-gray-500">
                          Sipariş durumu ve önemli güncellemeler için e-posta alın
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferencesForm.email_notifications}
                        onChange={(e) => setPreferencesForm({ 
                          ...preferencesForm, 
                          email_notifications: e.target.checked 
                        })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          SMS Bildirimleri
                        </label>
                        <p className="text-sm text-gray-500">
                          Acil güncellemeler için SMS alın
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferencesForm.sms_notifications}
                        onChange={(e) => setPreferencesForm({ 
                          ...preferencesForm, 
                          sms_notifications: e.target.checked 
                        })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Haber Bülteni
                        </label>
                        <p className="text-sm text-gray-500">
                          Yeni ürünler ve özel teklifler hakkında bilgi alın
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferencesForm.newsletter_subscribed}
                        onChange={(e) => setPreferencesForm({ 
                          ...preferencesForm, 
                          newsletter_subscribed: e.target.checked 
                        })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Dil ve Para Birimi
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tercih Edilen Dil
                      </label>
                      <select
                        value={preferencesForm.preferred_language}
                        onChange={(e) => setPreferencesForm({ 
                          ...preferencesForm, 
                          preferred_language: e.target.value as 'tr' | 'en'
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="tr">Türkçe</option>
                        <option value="en">English</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tercih Edilen Para Birimi
                      </label>
                      <select
                        value={preferencesForm.preferred_currency}
                        onChange={(e) => setPreferencesForm({ 
                          ...preferencesForm, 
                          preferred_currency: e.target.value as 'TRY' | 'USD' | 'EUR'
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="TRY">Türk Lirası (₺)</option>
                        <option value="USD">US Dollar ($)</option>
                        <option value="EUR">Euro (€)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Kaydediliyor...' : 'Tercihleri Kaydet'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile
