import React, { useState } from 'react'

interface ShippingData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
}

interface ShippingStepProps {
  data: {
    shipping: ShippingData
    billing: any
  }
  updateData: (data: any) => void
  onNext: () => void
  currentStep: number
}

export default function ShippingStep({ data, updateData, onNext }: ShippingStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState(data.shipping)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Ad gereklidir'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Soyad gereklidir'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-posta gereklidir'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon numarası gereklidir'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Adres gereklidir'
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Şehir gereklidir'
    }

    if (!formData.state.trim()) {
      newErrors.state = 'İl gereklidir'
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Posta kodu gereklidir'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof ShippingData, value: string) => {
    const newFormData = { ...formData, [field]: value }
    setFormData(newFormData)
    updateData({ shipping: newFormData })

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleNext = () => {
    if (validateForm()) {
      onNext()
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Teslimat Bilgileri</h2>
        <p className="mt-1 text-sm text-gray-600">
          Siparişinizin teslim edileceği adresi girin
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            Ad *
          </label>
          <input
            type="text"
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.firstName 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="Adınız"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Soyad *
          </label>
          <input
            type="text"
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.lastName 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="Soyadınız"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            E-posta *
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="email@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Telefon *
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.phone 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="0555 123 45 67"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        {/* Address */}
        <div className="sm:col-span-2">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Adres *
          </label>
          <input
            type="text"
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.address 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="Mahalle, Sokak, No"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
          )}
        </div>

        {/* City */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            İlçe *
          </label>
          <input
            type="text"
            id="city"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.city 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="İlçe"
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-600">{errors.city}</p>
          )}
        </div>

        {/* State */}
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700">
            İl *
          </label>
          <select
            id="state"
            value={formData.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
            className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.state 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-300 focus:border-blue-500'
            }`}
          >
            <option value="">İl seçin</option>
            <option value="İstanbul">İstanbul</option>
            <option value="Ankara">Ankara</option>
            <option value="İzmir">İzmir</option>
            <option value="Bursa">Bursa</option>
            <option value="Antalya">Antalya</option>
            <option value="Adana">Adana</option>
            <option value="Konya">Konya</option>
            <option value="Gaziantep">Gaziantep</option>
            <option value="Kayseri">Kayseri</option>
            <option value="Mersin">Mersin</option>
          </select>
          {errors.state && (
            <p className="mt-1 text-sm text-red-600">{errors.state}</p>
          )}
        </div>

        {/* Postal Code */}
        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
            Posta Kodu *
          </label>
          <input
            type="text"
            id="postalCode"
            value={formData.postalCode}
            onChange={(e) => handleInputChange('postalCode', e.target.value)}
            className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.postalCode 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="34000"
          />
          {errors.postalCode && (
            <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
          )}
        </div>

        {/* Country */}
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
            Ülke
          </label>
          <input
            type="text"
            id="country"
            value={formData.country}
            readOnly
            className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Devam Et
          <svg className="ml-2 -mr-1 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  )
}
