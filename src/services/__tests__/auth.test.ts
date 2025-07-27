import { authService, SignUpData, SignInData } from '../auth'
import { supabase } from '../../lib/supabase'

// Mock Supabase
jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      getUser: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
      resend: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      })),
    })),
  },
}))

const mockSupabase = supabase as jest.Mocked<typeof supabase>

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('signUp', () => {
    const signUpData: SignUpData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      phone: '(555) 123-4567',
    }

    it('should successfully sign up a new user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {
          first_name: 'John',
          last_name: 'Doe',
          phone: '(555) 123-4567',
        },
      }
      const mockSession = { access_token: 'token-123' }

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      })

      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
      })
      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      } as any)

      const result = await authService.signUp(signUpData)

      expect(result.user).toEqual(mockUser)
      expect(result.session).toEqual(mockSession)
      expect(result.error).toBeNull()

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          data: {
            first_name: signUpData.firstName,
            last_name: signUpData.lastName,
            phone: signUpData.phone,
          },
        },
      })

      expect(mockSupabase.from).toHaveBeenCalledWith('users')
      expect(mockInsert).toHaveBeenCalledWith({
        id: mockUser.id,
        email: signUpData.email,
        first_name: signUpData.firstName,
        last_name: signUpData.lastName,
        phone: signUpData.phone,
        role: 'customer',
      })
    })

    it('should handle sign up errors', async () => {
      const mockError = { message: 'User already registered' }

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      })

      const result = await authService.signUp(signUpData)

      expect(result.user).toBeNull()
      expect(result.session).toBeNull()
      expect(result.error).toBe('An account with this email already exists. Please sign in instead.')
    })

    it('should handle unexpected errors', async () => {
      mockSupabase.auth.signUp.mockRejectedValue(new Error('Network error'))

      const result = await authService.signUp(signUpData)

      expect(result.user).toBeNull()
      expect(result.session).toBeNull()
      expect(result.error).toBe('An unexpected error occurred during sign up')
    })
  })

  describe('signIn', () => {
    const signInData: SignInData = {
      email: 'test@example.com',
      password: 'password123',
    }

    it('should successfully sign in a user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      }
      const mockSession = { access_token: 'token-123' }

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      })

      const result = await authService.signIn(signInData)

      expect(result.user).toEqual(mockUser)
      expect(result.session).toEqual(mockSession)
      expect(result.error).toBeNull()

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: signInData.email,
        password: signInData.password,
      })
    })

    it('should handle invalid credentials', async () => {
      const mockError = { message: 'Invalid login credentials' }

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      })

      const result = await authService.signIn(signInData)

      expect(result.user).toBeNull()
      expect(result.session).toBeNull()
      expect(result.error).toBe('Invalid email or password. Please try again.')
    })

    it('should handle unexpected errors', async () => {
      mockSupabase.auth.signInWithPassword.mockRejectedValue(new Error('Network error'))

      const result = await authService.signIn(signInData)

      expect(result.user).toBeNull()
      expect(result.session).toBeNull()
      expect(result.error).toBe('An unexpected error occurred during sign in')
    })
  })

  describe('signOut', () => {
    it('should successfully sign out', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      const result = await authService.signOut()

      expect(result.error).toBeNull()
      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    })

    it('should handle sign out errors', async () => {
      const mockError = { message: 'Sign out failed' }
      mockSupabase.auth.signOut.mockResolvedValue({ error: mockError })

      const result = await authService.signOut()

      expect(result.error).toBe('Sign out failed')
    })
  })

  describe('getSession', () => {
    it('should successfully get session', async () => {
      const mockSession = { access_token: 'token-123' }

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      const result = await authService.getSession()

      expect(result.session).toEqual(mockSession)
      expect(result.error).toBeNull()
    })

    it('should handle session errors', async () => {
      const mockError = { message: 'Session expired' }

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: mockError,
      })

      const result = await authService.getSession()

      expect(result.session).toBeNull()
      expect(result.error).toBe('Session expired')
    })
  })

  describe('getUser', () => {
    it('should successfully get user', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const result = await authService.getUser()

      expect(result.user).toEqual(mockUser)
      expect(result.error).toBeNull()
    })

    it('should handle user errors', async () => {
      const mockError = { message: 'User not found' }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: mockError,
      })

      const result = await authService.getUser()

      expect(result.user).toBeNull()
      expect(result.error).toBe('User not found')
    })
  })

  describe('resetPassword', () => {
    // Mock window.location.origin
    beforeAll(() => {
      // @ts-ignore
      global.window = { location: { origin: 'http://localhost' } }
    })

    it('should successfully send reset password email', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null })

      const result = await authService.resetPassword({ email: 'test@example.com' })

      expect(result.error).toBeNull()
      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        { redirectTo: 'http://localhost/auth/reset-password' }
      )
    })

    it('should handle reset password errors', async () => {
      const mockError = { message: 'Email rate limit exceeded' }
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: mockError })

      const result = await authService.resetPassword({ email: 'test@example.com' })

      expect(result.error).toBe('Too many email requests. Please wait a moment before trying again.')
    })
  })

  describe('updatePassword', () => {
    it('should successfully update password', async () => {
      mockSupabase.auth.updateUser.mockResolvedValue({ error: null })

      const result = await authService.updatePassword({ password: 'newpassword123' })

      expect(result.error).toBeNull()
      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'newpassword123',
      })
    })

    it('should handle update password errors', async () => {
      const mockError = { message: 'Password should be at least 6 characters' }
      mockSupabase.auth.updateUser.mockResolvedValue({ error: mockError })

      const result = await authService.updatePassword({ password: 'short' })

      expect(result.error).toBe('Password must be at least 6 characters long.')
    })
  })

  describe('resendVerification', () => {
    it('should successfully resend verification email', async () => {
      mockSupabase.auth.resend.mockResolvedValue({ error: null })

      const result = await authService.resendVerification('test@example.com')

      expect(result.error).toBeNull()
      expect(mockSupabase.auth.resend).toHaveBeenCalledWith({
        type: 'signup',
        email: 'test@example.com',
      })
    })

    it('should handle resend verification errors', async () => {
      const mockError = { message: 'For security purposes, you can only request this once every 60 seconds' }
      mockSupabase.auth.resend.mockResolvedValue({ error: mockError })

      const result = await authService.resendVerification('test@example.com')

      expect(result.error).toBe('Please wait 60 seconds before requesting another password reset.')
    })
  })

  describe('getUserProfile', () => {
    it('should successfully get user profile', async () => {
      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'customer',
      }

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
        }),
      })

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      } as any)

      const result = await authService.getUserProfile('user-123')

      expect(result.profile).toEqual(mockProfile)
      expect(result.error).toBeNull()
      expect(mockSupabase.from).toHaveBeenCalledWith('users')
    })

    it('should handle profile not found', async () => {
      const mockError = { message: 'Profile not found' }

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
        }),
      })

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      } as any)

      const result = await authService.getUserProfile('user-123')

      expect(result.profile).toBeNull()
      expect(result.error).toBe('Profile not found')
    })
  })

  describe('updateUserProfile', () => {
    it('should successfully update user profile', async () => {
      const mockUpdatedProfile = {
        id: 'user-123',
        email: 'test@example.com',
        first_name: 'Jane',
        last_name: 'Doe',
        role: 'customer',
      }

      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockUpdatedProfile, error: null }),
          }),
        }),
      })

      mockSupabase.from.mockReturnValue({
        update: mockUpdate,
      } as any)

      const result = await authService.updateUserProfile('user-123', {
        first_name: 'Jane',
      })

      expect(result.profile).toEqual(mockUpdatedProfile)
      expect(result.error).toBeNull()
      expect(mockSupabase.from).toHaveBeenCalledWith('users')
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          first_name: 'Jane',
          updated_at: expect.any(String),
        })
      )
    })

    it('should handle update profile errors', async () => {
      const mockError = { message: 'Update failed' }

      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
          }),
        }),
      })

      mockSupabase.from.mockReturnValue({
        update: mockUpdate,
      } as any)

      const result = await authService.updateUserProfile('user-123', {
        first_name: 'Jane',
      })

      expect(result.profile).toBeNull()
      expect(result.error).toBe('Update failed')
    })
  })

  describe('onAuthStateChange', () => {
    it('should set up auth state change listener', () => {
      const mockCallback = jest.fn()
      const mockUnsubscribe = jest.fn()

      mockSupabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: mockUnsubscribe },
      })

      const result = authService.onAuthStateChange(mockCallback)

      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalledWith(mockCallback)
      expect(result).toEqual({ data: { subscription: mockUnsubscribe } })
    })
  })
})