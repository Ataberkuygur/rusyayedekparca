import { ProtectedRoute } from '@/components/auth'
import { OrderHistory } from '@/components/account'

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrderHistory />
    </ProtectedRoute>
  )
}
