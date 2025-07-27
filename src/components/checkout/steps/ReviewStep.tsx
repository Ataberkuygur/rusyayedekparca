import React from 'react'
import { useCart } from '@/contexts/CartContext'

interface ReviewStepProps {
  data: {
    shipping: {
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
    payment: {
      method: 'shopier' | 'card' | 'transfer'
    }
  }
  onPrev: () => void
  onCreateOrder: () => void
  loading: boolean
  currentStep: number
}

export default function ReviewStep({ data, onPrev, onCreateOrder, loading }: ReviewStepProps) {
  const { cart } = useCart()
  
  const items = cart?.items || []
  const subtotal = cart?.subtotal || 0
  const tax = subtotal * 0.08 // 8% tax rate
  const shipping = subtotal > 100 ? 0 : 15 // Free shipping over ₺100
  const total = cart?.total || 0

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'shopier':
        return 'Shopier ile Ödeme'
      case 'transfer':
        return 'Banka Havalesi'
      case 'card':
        return 'Kredi Kartı'
      default:
        return method
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Sipariş Özeti</h2>
        <p className="mt-1 text-sm text-gray-600">
          Sipariş detaylarınızı kontrol edin ve onaylayın
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Details */}
        <div>
          {/* Shipping Address */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Teslimat Adresi</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium">
                {data.shipping.firstName} {data.shipping.lastName}
              </p>
              <p className="text-gray-600">{data.shipping.email}</p>
              <p className="text-gray-600">{data.shipping.phone}</p>
              <p className="text-gray-600 mt-2">
                {data.shipping.address}<br/>
                {data.shipping.city}, {data.shipping.state}<br/>
                {data.shipping.postalCode} {data.shipping.country}
              </p>
            </div>
          </div>

          {/* Billing Address */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Fatura Adresi</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              {data.billing.sameAsShipping ? (
                <p className="text-gray-600">Teslimat adresi ile aynı</p>
              ) : (
                <>
                  <p className="font-medium">
                    {data.billing.firstName} {data.billing.lastName}
                  </p>
                  <p className="text-gray-600 mt-2">
                    {data.billing.address}<br/>
                    {data.billing.city}, {data.billing.state}<br/>
                    {data.billing.postalCode} {data.billing.country}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Ödeme Yöntemi</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium">{getPaymentMethodText(data.payment.method)}</p>
              {data.payment.method === 'transfer' && (
                <p className="text-sm text-gray-600 mt-1">
                  Sipariş onayından sonra banka bilgileri e-posta ile gönderilecektir.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Sipariş Detayları</h3>
          
          {/* Items */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={typeof item.product?.images?.[0] === 'string' 
                        ? item.product.images[0] 
                        : item.product?.images?.[0]?.url || '/placeholder-product.jpg'
                      }
                      alt={item.product?.name || 'Ürün'}
                      className="h-16 w-16 rounded-md object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.product?.name || 'Ürün'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {item.product?.make} {item.product?.model} {item.product?.year}
                    </p>
                    <p className="text-sm text-gray-500">
                      Adet: {item.quantity}
                    </p>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    ₺{((item.product?.price || 0) * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white border rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Ara Toplam</span>
                <span>₺{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>KDV (%8)</span>
                <span>₺{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Kargo</span>
                <span>{shipping === 0 ? 'Ücretsiz' : `₺${shipping.toFixed(2)}`}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-medium">
                  <span>Toplam</span>
                  <span>₺{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="mt-4">
            <label className="flex items-start">
              <input
                type="checkbox"
                required
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-600">
                <a href="/terms" className="text-blue-600 hover:text-blue-500">
                  Kullanım Koşulları
                </a>{' '}
                ve{' '}
                <a href="/privacy" className="text-blue-600 hover:text-blue-500">
                  Gizlilik Politikası
                </a>
                'nı okudum ve kabul ediyorum.
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          disabled={loading}
          className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="mr-2 -ml-1 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Geri
        </button>
        
        <button
          type="button"
          onClick={onCreateOrder}
          disabled={loading}
          className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              İşleniyor...
            </>
          ) : (
            'Siparişi Onayla'
          )}
        </button>
      </div>
    </div>
  )
}
