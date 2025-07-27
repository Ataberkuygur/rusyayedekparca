'use client'

import { ShoppingCart } from '@/components/cart'

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <ShoppingCart />
      </div>
    </div>
  )
}
