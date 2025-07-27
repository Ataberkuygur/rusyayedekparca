'use client'

import { Suspense } from 'react'
import Checkout from '@/components/checkout/Checkout'

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    }>
      <Checkout />
    </Suspense>
  )
}
