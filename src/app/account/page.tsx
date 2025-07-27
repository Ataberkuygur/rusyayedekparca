import { ProtectedRoute } from '@/components/auth'
import { UserDashboard } from '@/components/account'

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <UserDashboard />
    </ProtectedRoute>
  )
}
