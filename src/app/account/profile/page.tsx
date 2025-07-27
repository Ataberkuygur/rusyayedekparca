import { ProtectedRoute } from '@/components/auth'
import { UserProfile } from '@/components/account'

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <UserProfile />
    </ProtectedRoute>
  )
}
