'use client'

import React, { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { storageUtils } from '../../utils/auth'

interface ProtectedRouteProps {
  children: ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  redirectTo?: string
  fallback?: ReactNode
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  requireAdmin = false,
  redirectTo,
  fallback,
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return // Wait for auth to load

    // If authentication is required but user is not authenticated
    if (requireAuth && !user) {
      // Save current URL for redirect after login
      if (typeof window !== 'undefined') {
        storageUtils.saveRedirectUrl(window.location.pathname + window.location.search)
      }
      
      const loginUrl = redirectTo || '/auth/login'
      router.push(loginUrl)
      return
    }

    // If admin role is required but user is not admin
    if (requireAdmin && user && profile?.role !== 'admin') {
      router.push('/unauthorized')
      return
    }

    // If user is authenticated but shouldn't be (guest-only pages)
    if (!requireAuth && user) {
      const redirectUrl = storageUtils.getAndClearRedirectUrl() || '/dashboard'
      router.push(redirectUrl)
      return
    }
  }, [user, profile, loading, requireAuth, requireAdmin, redirectTo, router])

  // Show loading state
  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      )
    )
  }

  // Check authentication requirements
  if (requireAuth && !user) {
    return null // Will redirect in useEffect
  }

  // Check admin requirements
  if (requireAdmin && (!user || profile?.role !== 'admin')) {
    return null // Will redirect in useEffect
  }

  // Check guest-only requirements
  if (!requireAuth && user) {
    return null // Will redirect in useEffect
  }

  return <>{children}</>
}

// Convenience components for common use cases
export function AuthenticatedRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requireAuth'>) {
  return (
    <ProtectedRoute requireAuth={true} {...props}>
      {children}
    </ProtectedRoute>
  )
}

export function AdminRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requireAuth' | 'requireAdmin'>) {
  return (
    <ProtectedRoute requireAuth={true} requireAdmin={true} {...props}>
      {children}
    </ProtectedRoute>
  )
}

export function GuestRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requireAuth'>) {
  return (
    <ProtectedRoute requireAuth={false} {...props}>
      {children}
    </ProtectedRoute>
  )
}