'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { authService, AuthUser } from '../services/auth'
import { Database } from '../types/database'

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  profile: Database['public']['Tables']['users']['Row'] | null
  loading: boolean
  signUp: (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
  }) => Promise<{ error: string | null }>
  signIn: (data: { email: string; password: string }) => Promise<{ error: string | null }>
  signOut: () => Promise<{ error: string | null }>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  updatePassword: (password: string) => Promise<{ error: string | null }>
  resendVerification: (email: string) => Promise<{ error: string | null }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Check if environment variables are configured
const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Database['public']['Tables']['users']['Row'] | null>(null)
  const [loading, setLoading] = useState(!isConfigured) // If not configured, don't load

  // Initialize auth state only if configured
  useEffect(() => {
    if (!isConfigured) {
      console.warn('Supabase not configured. Running in mock mode.')
      setLoading(false)
      return
    }

    let mounted = true

    async function initializeAuth() {
      try {
        // Get initial session
        const { session: initialSession } = await authService.getSession()
        
        if (mounted) {
          setSession(initialSession)
          setUser(initialSession?.user as AuthUser || null)
          
          // Get user profile if session exists
          if (initialSession?.user) {
            await loadUserProfile(initialSession.user.id)
          }
          
          setLoading(false)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        console.log('Auth state changed:', event, session?.user?.id)
        
        setSession(session)
        setUser(session?.user as AuthUser || null)

        if (session?.user) {
          await loadUserProfile(session.user.id)
        } else {
          setProfile(null)
        }

        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  // Load user profile from database
  const loadUserProfile = async (userId: string) => {
    try {
      const { profile: userProfile, error } = await authService.getUserProfile(userId)
      if (error) {
        console.error('Error loading user profile:', error)
      } else {
        setProfile(userProfile)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  // Refresh user profile
  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id)
    }
  }

  // Sign up function
  const signUp = async (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
  }) => {
    if (!isConfigured) {
      console.log('Mock sign up:', data.email)
      return { error: 'Authentication not configured. Please set up Supabase environment variables.' }
    }

    try {
      setLoading(true)
      const result = await authService.signUp(data)
      
      if (result.error) {
        return { error: result.error }
      }

      // Auth state will be updated by the listener
      return { error: null }
    } catch (error) {
      return { error: 'An unexpected error occurred during sign up' }
    } finally {
      setLoading(false)
    }
  }

  // Sign in function
  const signIn = async (data: { email: string; password: string }) => {
    if (!isConfigured) {
      console.log('Mock sign in:', data.email)
      return { error: 'Authentication not configured. Please set up Supabase environment variables.' }
    }

    try {
      setLoading(true)
      const result = await authService.signIn(data)
      
      if (result.error) {
        return { error: result.error }
      }

      // Auth state will be updated by the listener
      return { error: null }
    } catch (error) {
      return { error: 'An unexpected error occurred during sign in' }
    } finally {
      setLoading(false)
    }
  }

  // Sign out function
  const signOut = async () => {
    if (!isConfigured) {
      console.log('Mock sign out')
      return { error: null }
    }

    try {
      setLoading(true)
      const result = await authService.signOut()
      
      if (result.error) {
        return { error: result.error }
      }

      // Auth state will be updated by the listener
      return { error: null }
    } catch (error) {
      return { error: 'An unexpected error occurred during sign out' }
    } finally {
      setLoading(false)
    }
  }

  // Reset password function
  const resetPassword = async (email: string) => {
    if (!isConfigured) {
      console.log('Mock reset password:', email)
      return { error: 'Authentication not configured. Please set up Supabase environment variables.' }
    }

    try {
      const result = await authService.resetPassword({ email })
      return { error: result.error }
    } catch (error) {
      return { error: 'An unexpected error occurred sending reset email' }
    }
  }

  // Update password function
  const updatePassword = async (password: string) => {
    if (!isConfigured) {
      console.log('Mock update password')
      return { error: 'Authentication not configured. Please set up Supabase environment variables.' }
    }

    try {
      const result = await authService.updatePassword({ password })
      return { error: result.error }
    } catch (error) {
      return { error: 'An unexpected error occurred updating password' }
    }
  }

  // Resend verification function
  const resendVerification = async (email: string) => {
    if (!isConfigured) {
      console.log('Mock resend verification:', email)
      return { error: 'Authentication not configured. Please set up Supabase environment variables.' }
    }

    try {
      const result = await authService.resendVerification(email)
      return { error: result.error }
    } catch (error) {
      return { error: 'An unexpected error occurred resending verification' }
    }
  }

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    resendVerification,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook to require authentication
export function useRequireAuth() {
  const auth = useAuth()
  
  useEffect(() => {
    if (!auth.loading && !auth.user) {
      // Redirect to login page
      window.location.href = '/auth/login'
    }
  }, [auth.loading, auth.user])

  return auth
}

// Hook to require admin role
export function useRequireAdmin() {
  const auth = useAuth()
  
  useEffect(() => {
    if (!auth.loading) {
      if (!auth.user) {
        window.location.href = '/auth/login'
      } else if (auth.profile?.role !== 'admin') {
        window.location.href = '/unauthorized'
      }
    }
  }, [auth.loading, auth.user, auth.profile])

  return auth
}