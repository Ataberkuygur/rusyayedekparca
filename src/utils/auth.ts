import { supabase } from '../lib/supabase'
import { User, Session } from '@supabase/supabase-js'

/**
 * Validation utilities for authentication forms
 */
export const authValidation = {
  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  /**
   * Validate password strength
   */
  isValidPassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (password.length < 6) {
      errors.push('Password must be at least 6 characters long')
    }

    if (password.length > 128) {
      errors.push('Password must be less than 128 characters')
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  },

  /**
   * Validate name format
   */
  isValidName(name: string): boolean {
    return name.trim().length >= 2 && name.trim().length <= 50
  },

  /**
   * Validate phone number format (US format)
   */
  isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  },

  /**
   * Format phone number to consistent format
   */
  formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    if (cleaned.length === 11 && cleaned[0] === '1') {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
    }
    return phone
  },
}

/**
 * Session management utilities
 */
export const sessionUtils = {
  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      return !!session
    } catch {
      return false
    }
  },

  /**
   * Get current user session
   */
  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      return session
    } catch {
      return null
    }
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    } catch {
      return null
    }
  },

  /**
   * Check if user has specific role
   */
  async hasRole(role: 'customer' | 'admin'): Promise<boolean> {
    try {
      const user = await this.getCurrentUser()
      if (!user) return false

      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      return profile?.role === role
    } catch {
      return false
    }
  },

  /**
   * Check if user is admin
   */
  async isAdmin(): Promise<boolean> {
    return this.hasRole('admin')
  },

  /**
   * Check if user is customer
   */
  async isCustomer(): Promise<boolean> {
    return this.hasRole('customer')
  },
}

/**
 * Route protection utilities
 */
export const routeUtils = {
  /**
   * Protected routes that require authentication
   */
  protectedRoutes: [
    '/dashboard',
    '/profile',
    '/orders',
    '/cart',
    '/checkout',
  ],

  /**
   * Admin-only routes
   */
  adminRoutes: [
    '/admin',
    '/admin/dashboard',
    '/admin/products',
    '/admin/orders',
    '/admin/users',
    '/admin/analytics',
  ],

  /**
   * Guest-only routes (redirect if authenticated)
   */
  guestRoutes: [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
  ],

  /**
   * Check if route requires authentication
   */
  isProtectedRoute(pathname: string): boolean {
    return this.protectedRoutes.some(route => pathname.startsWith(route))
  },

  /**
   * Check if route requires admin access
   */
  isAdminRoute(pathname: string): boolean {
    return this.adminRoutes.some(route => pathname.startsWith(route))
  },

  /**
   * Check if route is guest-only
   */
  isGuestRoute(pathname: string): boolean {
    return this.guestRoutes.some(route => pathname.startsWith(route))
  },

  /**
   * Get redirect URL after login
   */
  getRedirectUrl(currentPath: string, defaultPath: string = '/dashboard'): string {
    // Don't redirect to auth pages
    if (this.isGuestRoute(currentPath)) {
      return defaultPath
    }
    return currentPath
  },
}

/**
 * Error handling utilities for authentication
 */
export const authErrorUtils = {
  /**
   * Get user-friendly error message
   */
  getErrorMessage(error: any): string {
    if (typeof error === 'string') return error

    const message = error?.message || error?.error_description || 'An unexpected error occurred'

    // Map common Supabase errors to user-friendly messages
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'Invalid email or password. Please try again.',
      'Email not confirmed': 'Please check your email and click the confirmation link.',
      'User already registered': 'An account with this email already exists.',
      'Password should be at least 6 characters': 'Password must be at least 6 characters long.',
      'Unable to validate email address: invalid format': 'Please enter a valid email address.',
      'Email rate limit exceeded': 'Too many requests. Please wait before trying again.',
      'For security purposes, you can only request this once every 60 seconds': 'Please wait 60 seconds before trying again.',
    }

    return errorMap[message] || message
  },

  /**
   * Check if error is a network error
   */
  isNetworkError(error: any): boolean {
    if (!error) return false
    return !!(error.name === 'NetworkError' || 
           (error.message && error.message.includes('fetch')) ||
           (error.message && error.message.includes('network')))
  },

  /**
   * Check if error is a validation error
   */
  isValidationError(error: any): boolean {
    if (!error || !error.message) return false
    return !!(error.message.includes('validation') ||
           error.message.includes('invalid') ||
           error.message.includes('required'))
  },
}

/**
 * Local storage utilities for auth state
 */
export const storageUtils = {
  /**
   * Keys for localStorage
   */
  keys: {
    REDIRECT_URL: 'auth_redirect_url',
    REMEMBER_EMAIL: 'auth_remember_email',
  },

  /**
   * Save redirect URL for after login
   */
  saveRedirectUrl(url: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.keys.REDIRECT_URL, url)
    }
  },

  /**
   * Get and clear redirect URL
   */
  getAndClearRedirectUrl(): string | null {
    if (typeof window === 'undefined') return null
    
    const url = localStorage.getItem(this.keys.REDIRECT_URL)
    if (url) {
      localStorage.removeItem(this.keys.REDIRECT_URL)
    }
    return url
  },

  /**
   * Save email for remember me functionality
   */
  saveRememberedEmail(email: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.keys.REMEMBER_EMAIL, email)
    }
  },

  /**
   * Get remembered email
   */
  getRememberedEmail(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.keys.REMEMBER_EMAIL)
  },

  /**
   * Clear remembered email
   */
  clearRememberedEmail(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.keys.REMEMBER_EMAIL)
    }
  },
}