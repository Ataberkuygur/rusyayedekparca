import { ProtectedRoute } from '@/components/auth'
import { UserProfile } from '@/components/account'

export default function PreferencesPage() {
  return (
    <ProtectedRoute>
      <UserProfile />
    </ProtectedRoute>
  )
}
