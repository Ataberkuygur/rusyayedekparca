import { ProtectedRoute } from '@/components/auth'
import { AddressManager } from '@/components/account'

export default function AddressesPage() {
  return (
    <ProtectedRoute>
      <AddressManager />
    </ProtectedRoute>
  )
}
