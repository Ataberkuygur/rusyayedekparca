import React from 'react'
import Link from 'next/link'

interface SuccessStepProps {
  orderId: string | null
  data: {
    shipping: {
      firstName: string
      lastName: string
      email: string
    }
  }
  currentStep: number
}

export default function SuccessStep({ orderId, data }: SuccessStepProps) {
  return (
    <div className="p-6 text-center">
      <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
        <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>

      <h2 className="text-3xl font-bold text-gray-900 mb-2">
        Siparişiniz Alındı!
      </h2>
      
      <p className="text-lg text-gray-600 mb-6">
        Merhaba {data.shipping.firstName}, siparişiniz başarıyla oluşturuldu.
      </p>

      {orderId && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sipariş Detayları</h3>
          <p className="text-gray-600">
            <span className="font-medium">Sipariş Numarası:</span> {orderId}
          </p>
          <p className="text-gray-600 mt-1">
            <span className="font-medium">E-posta:</span> {data.shipping.email}
          </p>
        </div>
      )}

      <div className="bg-blue-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Ne Olacak?</h3>
        <div className="text-left space-y-2 text-blue-800">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Sipariş onayı e-postanıza gönderildi</span>
          </div>
          <div className="flex items-center">
            <svg className="h-5 w-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Siparişinizi hazırlamaya başlıyoruz</span>
          </div>
          <div className="flex items-center">
            <svg className="h-5 w-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Kargo takip bilgisi e-posta ile gönderilecek</span>
          </div>
          <div className="flex items-center">
            <svg className="h-5 w-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Tahmini teslimat süresi: 2-3 iş günü</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/orders"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Siparişlerimi Görüntüle
        </Link>
        
        <Link
          href="/products"
          className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Alışverişe Devam Et
        </Link>
      </div>

      <div className="mt-8 pt-6 border-t text-sm text-gray-500">
        <p>
          Herhangi bir sorunuz varsa, lütfen{' '}
          <a href="/contact" className="text-blue-600 hover:text-blue-500">
            bizimle iletişime geçin
          </a>
          .
        </p>
      </div>
    </div>
  )
}
