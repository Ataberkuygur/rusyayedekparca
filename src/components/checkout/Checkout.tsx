import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { PaymentService } from '@/services/payments'
import { OrderService } from '@/services/orders'

// Step components
import ShippingStep from './steps/ShippingStep'
import PaymentStep from './steps/PaymentStep'
import ReviewStep from './steps/ReviewStep'
import SuccessStep from './steps/SuccessStep'

interface CheckoutData {
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
    sessionId?: string
  }
}

const STEPS = [
  { id: 'shipping', title: 'Teslimat Bilgileri', component: ShippingStep },
  { id: 'payment', title: 'Ödeme Yöntemi', component: PaymentStep },
  { id: 'review', title: 'Sipariş Özeti', component: ReviewStep },
  { id: 'success', title: 'Sipariş Tamamlandı', component: SuccessStep }
]

export default function Checkout() {
  const router = useRouter()
  const { cart, clearCart } = useCart()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)

  // Get cart items and total
  const items = cart?.items || []
  const total = cart?.total || 0
  
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    shipping: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'TR'
    },
    billing: {
      sameAsShipping: true,
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'TR'
    },
    payment: {
      method: 'shopier'
    }
  })

  // Redirect if cart is empty
  useEffect(() => {
    if (!items.length && currentStep < 3) {
      router.push('/cart')
    }
  }, [items, currentStep, router])

  const updateCheckoutData = (stepData: Partial<CheckoutData>) => {
    setCheckoutData(prev => ({ ...prev, ...stepData }))
  }

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCreateOrder = async () => {
    setLoading(true)
    setError(null)

    try {
      // Prepare order data
      const orderData = {
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.product?.price || 0
        })),
        shipping_address: {
          street: checkoutData.shipping.address,
          city: checkoutData.shipping.city,
          state: checkoutData.shipping.state,
          postal_code: checkoutData.shipping.postalCode,
          country: checkoutData.shipping.country
        },
        billing_address: checkoutData.billing.sameAsShipping ? undefined : {
          street: checkoutData.billing.address,
          city: checkoutData.billing.city,
          state: checkoutData.billing.state,
          postal_code: checkoutData.billing.postalCode,
          country: checkoutData.billing.country
        },
        payment_method: {
          type: checkoutData.payment.method,
          payment_session_id: checkoutData.payment.sessionId
        }
      }

      // Create order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Sipariş oluşturulamadı')
      }

      const order = result.data
      setOrderId(order.id)

      // If payment method is Shopier, create payment session
      if (checkoutData.payment.method === 'shopier') {
        const paymentData = {
          order_id: order.id,
          amount: total,
          currency: 'TRY',
          product_name: `Sipariş #${order.order_number}`,
          product_type: 0, // Physical product
          buyer_name: `${checkoutData.shipping.firstName} ${checkoutData.shipping.lastName}`,
          buyer_email: checkoutData.shipping.email,
          buyer_phone: checkoutData.shipping.phone,
          buyer_address: checkoutData.shipping.address
        }

        const paymentResponse = await fetch('/api/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(paymentData)
        })

        const paymentResult = await paymentResponse.json()

        if (!paymentResult.success) {
          throw new Error(paymentResult.error || 'Ödeme oturumu oluşturulamadı')
        }

        // Redirect to Shopier payment page
        window.location.href = paymentResult.data.url
        return
      }

      // For other payment methods, go to success step
      clearCart()
      nextStep()

    } catch (err) {
      console.error('Order creation failed:', err)
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const CurrentStepComponent = STEPS[currentStep].component

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <nav aria-label="Progress">
            <ol className="flex items-center">
              {STEPS.map((step, index) => (
                <li key={step.id} className={`relative ${index !== STEPS.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                  <div className="flex items-center">
                    <div className={`
                      relative flex h-8 w-8 items-center justify-center rounded-full
                      ${index < currentStep 
                        ? 'bg-green-600 text-white' 
                        : index === currentStep 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-300 text-gray-500'
                      }
                    `}>
                      {index < currentStep ? (
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <span className={`
                      ml-4 text-sm font-medium
                      ${index <= currentStep ? 'text-gray-900' : 'text-gray-500'}
                    `}>
                      {step.title}
                    </span>
                  </div>
                  {index !== STEPS.length - 1 && (
                    <div className={`
                      absolute top-4 left-4 -ml-px mt-0.5 h-full w-0.5
                      ${index < currentStep ? 'bg-green-600' : 'bg-gray-300'}
                    `} />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
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

        {/* Step Content */}
        <div className="bg-white shadow rounded-lg">
          <CurrentStepComponent
            data={checkoutData}
            updateData={updateCheckoutData}
            onNext={nextStep}
            onPrev={prevStep}
            onCreateOrder={handleCreateOrder}
            loading={loading}
            currentStep={currentStep}
            totalSteps={STEPS.length}
            orderId={orderId}
          />
        </div>
      </div>
    </div>
  )
}
