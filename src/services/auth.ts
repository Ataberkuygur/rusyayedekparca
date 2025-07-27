import { supabase } from '../lib/supabase'
import { User, Session } from '@supabase/supabase-js'
import { Database } from '../types/database'

export interface AuthUser extends User {
  user_metadata: {
    first_name?: string
    last_name?: string
    phone?: string
  }
}

export interface SignUpData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}

export interface SignInData {
  email: string
  password: string
}

export interface ResetPasswordData {
  email: string
}

export interface UpdatePasswordData {
  password: string
}

export interface AuthResponse {
  user: AuthUser | null
  session: Session | null
  error: string | null
}

export interface AuthError {
  message: string
  status?: number
}

class AuthService {
  /**
   * Sign up a new user with email and password
   */
  async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone || null,
          },
        },
      })

      if (authError) {
        return {
          user: null,
          session: null,
          error: this.formatAuthError(authError),
        }
      }

      // If user is created, also create a profile in the users table
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: data.email,
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone || null,
            role: 'customer',
          })

        if (profileError) {
          console.error('Error creating user profile:', profileError)
          // Don't return error here as auth user was created successfully
        }
      }

      return {
        user: authData.user as AuthUser,
        session: authData.session,
        error: null,
      }
    } catch (error) {
      return {
        user: null,
        session: null,
        error: 'An unexpected error occurred during sign up',
      }
    }
  }

  /**
   * Sign in an existing user with email and password
   */
  async signIn(data: SignInData): Promise<AuthResponse> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (authError) {
        return {
          user: null,
          session: null,
          error: this.formatAuthError(authError),
        }
      }

      return {
        user: authData.user as AuthUser,
        session: authData.session,
        error: null,
      }
    } catch (error) {
      return {
        user: null,
        session: null,
        error: 'An unexpected error occurred during sign in',
      }
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        return { error: this.formatAuthError(error) }
      }

      return { error: null }
    } catch (error) {
      return { error: 'An unexpected error occurred during sign out' }
    }
  }

  /**
   * Get the current user session
   */
  async getSession(): Promise<{ session: Session | null; error: string | null }> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        return { session: null, error: this.formatAuthError(error) }
      }

      return { session, error: null }
    } catch (error) {
      return { session: null, error: 'An unexpected error occurred getting session' }
    }
  }

  /**
   * Get the current user
   */
  async getUser(): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        return { user: null, error: this.formatAuthError(error) }
      }

      return { user: user as AuthUser, error: null }
    } catch (error) {
      return { user: null, error: 'An unexpected error occurred getting user' }
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(data: ResetPasswordData): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        return { error: this.formatAuthError(error) }
      }

      return { error: null }
    } catch (error) {
      return { error: 'An unexpected error occurred sending reset email' }
    }
  }

  /**
   * Update user password
   */
  async updatePassword(data: UpdatePasswordData): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (error) {
        return { error: this.formatAuthError(error) }
      }

      return { error: null }
    } catch (error) {
      return { error: 'An unexpected error occurred updating password' }
    }
  }

  /**
   * Resend email verification
   */
  async resendVerification(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      })

      if (error) {
        return { error: this.formatAuthError(error) }
      }

      return { error: null }
    } catch (error) {
      return { error: 'An unexpected error occurred resending verification' }
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }

  /**
   * Get user profile from the users table
   */
  async getUserProfile(userId: string): Promise<{
    profile: Database['public']['Tables']['users']['Row'] | null
    error: string | null
  }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        return { profile: null, error: error.message }
      }

      return { profile: data, error: null }
    } catch (error) {
      return { profile: null, error: 'An unexpected error occurred getting profile' }
    }
  }

  /**
   * Update user profile in the users table
   */
  async updateUserProfile(
    userId: string,
    updates: Partial<Database['public']['Tables']['users']['Update']>
  ): Promise<{
    profile: Database['public']['Tables']['users']['Row'] | null
    error: string | null
  }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        return { profile: null, error: error.message }
      }

      return { profile: data, error: null }
    } catch (error) {
      return { profile: null, error: 'An unexpected error occurred updating profile' }
    }
  }

  /**
   * Format Supabase auth errors into user-friendly messages
   */
  private formatAuthError(error: any): string {
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Invalid email or password. Please try again.'
      case 'Email not confirmed':
        return 'Please check your email and click the confirmation link before signing in.'
      case 'User already registered':
        return 'An account with this email already exists. Please sign in instead.'
      case 'Password should be at least 6 characters':
        return 'Password must be at least 6 characters long.'
      case 'Unable to validate email address: invalid format':
        return 'Please enter a valid email address.'
      case 'Email rate limit exceeded':
        return 'Too many email requests. Please wait a moment before trying again.'
      case 'For security purposes, you can only request this once every 60 seconds':
        return 'Please wait 60 seconds before requesting another password reset.'
      default:
        return error.message || 'An unexpected error occurred. Please try again.'
    }
  }
}

// Export singleton instance
export const authService = new AuthService()