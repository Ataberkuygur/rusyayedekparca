import React, { useState } from 'react'

interface PaymentStepProps {
  data: {
    payment: {
      method: 'shopier' | 'card' | 'transfer'
    }
    billing: {
      sameAsShipping: boolean
      firstName: string
      lastName: string
      address: string
      city: string
      state: string
      postalCode: string
      country: string
    }
    shipping: any
  }
  updateData: (data: any) => void
  onNext: () => void
  onPrev: () => void
  currentStep: number
}

export default function PaymentStep({ data, updateData, onNext, onPrev }: PaymentStepProps) {
  const [paymentMethod, setPaymentMethod] = useState(data.payment.method)
  const [billingData, setBillingData] = useState(data.billing)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handlePaymentMethodChange = (method: 'shopier' | 'card' | 'transfer') => {
    setPaymentMethod(method)
    updateData({ payment: { method } })
  }

  const handleBillingChange = (field: string, value: string | boolean) => {
    const newBillingData = { ...billingData, [field]: value }
    setBillingData(newBillingData)
    updateData({ billing: newBillingData })
  }

  const validateBillingAddress = () => {
    if (billingData.sameAsShipping) return true

    const newErrors: Record<string, string> = {}

    if (!billingData.firstName.trim()) {
      newErrors.billingFirstName = 'Ad gereklidir'
    }

    if (!billingData.lastName.trim()) {
      newErrors.billingLastName = 'Soyad gereklidir'
    }

    if (!billingData.address.trim()) {
      newErrors.billingAddress = 'Adres gereklidir'
    }

    if (!billingData.city.trim()) {
      newErrors.billingCity = 'Şehir gereklidir'
    }

    if (!billingData.state.trim()) {
      newErrors.billingState = 'İl gereklidir'
    }

    if (!billingData.postalCode.trim()) {
      newErrors.billingPostalCode = 'Posta kodu gereklidir'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateBillingAddress()) {
      onNext()
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Ödeme Yöntemi</h2>
        <p className="mt-1 text-sm text-gray-600">
          Ödeme yönteminizi seçin ve fatura adresinizi belirtin
        </p>
      </div>

      {/* Payment Methods */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ödeme Yöntemi Seçin</h3>
        
        <div className="space-y-4">
          {/* Shopier */}
          <label className="relative flex items-start">
            <div className="flex items-center h-5">
              <input
                type="radio"
                name="payment-method"
                value="shopier"
                checked={paymentMethod === 'shopier'}
                onChange={() => handlePaymentMethodChange('shopier')}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
              />
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <div className="text-sm">
                <div className="font-medium text-gray-900 flex items-center">
                  <span>Shopier ile Ödeme</span>
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Önerilen
                  </span>
                </div>
                <div className="text-gray-500 mt-1">
                  Güvenli ödeme. Kredi kartı, banka kartı veya havale ile ödeyebilirsiniz.
                </div>
                <div className="mt-2 flex space-x-2">
                  <img src="/visa.png" alt="Visa" className="h-6" />
                  <img src="/mastercard.png" alt="Mastercard" className="h-6" />
                  <img src="/amex.png" alt="Amex" className="h-6" />
                </div>
              </div>
            </div>
          </label>

          {/* Bank Transfer */}
          <label className="relative flex items-start">
            <div className="flex items-center h-5">
              <input
                type="radio"
                name="payment-method"
                value="transfer"
                checked={paymentMethod === 'transfer'}
                onChange={() => handlePaymentMethodChange('transfer')}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
              />
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <div className="text-sm">
                <div className="font-medium text-gray-900">Banka Havalesi</div>
                <div className="text-gray-500 mt-1">
                  Sipariş onayından sonra banka bilgilerimizi e-posta ile göndereceğiz.
                </div>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Billing Address */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Fatura Adresi</h3>
        
        <div className="mb-4">
          <label className="relative flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                checked={billingData.sameAsShipping}
                onChange={(e) => handleBillingChange('sameAsShipping', e.target.checked)}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <div className="font-medium text-gray-900">Teslimat adresi ile aynı</div>
            </div>
          </label>
        </div>

        {!billingData.sameAsShipping && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Billing First Name */}
            <div>
              <label htmlFor="billingFirstName" className="block text-sm font-medium text-gray-700">
                Ad *
              </label>
              <input
                type="text"
                id="billingFirstName"
                value={billingData.firstName}
                onChange={(e) => handleBillingChange('firstName', e.target.value)}
                className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.billingFirstName 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="Adınız"
              />
              {errors.billingFirstName && (
                <p className="mt-1 text-sm text-red-600">{errors.billingFirstName}</p>
              )}
            </div>

            {/* Billing Last Name */}
            <div>
              <label htmlFor="billingLastName" className="block text-sm font-medium text-gray-700">
                Soyad *
              </label>
              <input
                type="text"
                id="billingLastName"
                value={billingData.lastName}
                onChange={(e) => handleBillingChange('lastName', e.target.value)}
                className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.billingLastName 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="Soyadınız"
              />
              {errors.billingLastName && (
                <p className="mt-1 text-sm text-red-600">{errors.billingLastName}</p>
              )}
            </div>

            {/* Billing Address */}
            <div className="sm:col-span-2">
              <label htmlFor="billingAddress" className="block text-sm font-medium text-gray-700">
                Adres *
              </label>
              <input
                type="text"
                id="billingAddress"
                value={billingData.address}
                onChange={(e) => handleBillingChange('address', e.target.value)}
                className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.billingAddress 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="Mahalle, Sokak, No"
              />
              {errors.billingAddress && (
                <p className="mt-1 text-sm text-red-600">{errors.billingAddress}</p>
              )}
            </div>

            {/* Billing City */}
            <div>
              <label htmlFor="billingCity" className="block text-sm font-medium text-gray-700">
                İlçe *
              </label>
              <input
                type="text"
                id="billingCity"
                value={billingData.city}
                onChange={(e) => handleBillingChange('city', e.target.value)}
                className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.billingCity 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="İlçe"
              />
              {errors.billingCity && (
                <p className="mt-1 text-sm text-red-600">{errors.billingCity}</p>
              )}
            </div>

            {/* Billing State */}
            <div>
              <label htmlFor="billingState" className="block text-sm font-medium text-gray-700">
                İl *
              </label>
              <select
                id="billingState"
                value={billingData.state}
                onChange={(e) => handleBillingChange('state', e.target.value)}
                className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.billingState 
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
              </select>
              {errors.billingState && (
                <p className="mt-1 text-sm text-red-600">{errors.billingState}</p>
              )}
            </div>

            {/* Billing Postal Code */}
            <div>
              <label htmlFor="billingPostalCode" className="block text-sm font-medium text-gray-700">
                Posta Kodu *
              </label>
              <input
                type="text"
                id="billingPostalCode"
                value={billingData.postalCode}
                onChange={(e) => handleBillingChange('postalCode', e.target.value)}
                className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.billingPostalCode 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="34000"
              />
              {errors.billingPostalCode && (
                <p className="mt-1 text-sm text-red-600">{errors.billingPostalCode}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="mr-2 -ml-1 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Geri
        </button>
        
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
