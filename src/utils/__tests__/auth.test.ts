import {
  authValidation,
  sessionUtils,
  routeUtils,
  authErrorUtils,
  storageUtils,
} from '../auth'
import { supabase } from '../../lib/supabase'

// Mock Supabase
jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  },
}))

const mockSupabase = supabase as jest.Mocked<typeof supabase>

describe('authValidation', () => {
  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      expect(authValidation.isValidEmail('test@example.com')).toBe(true)
      expect(authValidation.isValidEmail('user.name+tag@domain.co.uk')).toBe(true)
      expect(authValidation.isValidEmail('user123@test-domain.org')).toBe(true)
    })

    it('should reject invalid email formats', () => {
      expect(authValidation.isValidEmail('invalid-email')).toBe(false)
      expect(authValidation.isValidEmail('test@')).toBe(false)
      expect(authValidation.isValidEmail('@example.com')).toBe(false)
      expect(authValidation.isValidEmail('')).toBe(false)
    })
  })

  describe('isValidPassword', () => {
    it('should validate strong passwords', () => {
      const result = authValidation.isValidPassword('Password123')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject passwords that are too short', () => {
      const result = authValidation.isValidPassword('Pass1')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must be at least 6 characters long')
    })

    it('should reject passwords without lowercase letters', () => {
      const result = authValidation.isValidPassword('PASSWORD123')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one lowercase letter')
    })

    it('should reject passwords without uppercase letters', () => {
      const result = authValidation.isValidPassword('password123')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one uppercase letter')
    })

    it('should reject passwords without numbers', () => {
      const result = authValidation.isValidPassword('Password')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one number')
    })

    it('should reject passwords that are too long', () => {
      const longPassword = 'A'.repeat(129) + '1a'
      const result = authValidation.isValidPassword(longPassword)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must be less than 128 characters')
    })
  })

  describe('isValidName', () => {
    it('should validate correct names', () => {
      expect(authValidation.isValidName('John')).toBe(true)
      expect(authValidation.isValidName('Mary Jane')).toBe(true)
      expect(authValidation.isValidName('José')).toBe(true)
    })

    it('should reject invalid names', () => {
      expect(authValidation.isValidName('J')).toBe(false)
      expect(authValidation.isValidName('')).toBe(false)
      expect(authValidation.isValidName('   ')).toBe(false)
      expect(authValidation.isValidName('A'.repeat(51))).toBe(false)
    })
  })

  describe('isValidPhone', () => {
    it('should validate correct phone formats', () => {
      expect(authValidation.isValidPhone('(555) 123-4567')).toBe(true)
      expect(authValidation.isValidPhone('555-123-4567')).toBe(true)
      expect(authValidation.isValidPhone('555.123.4567')).toBe(true)
      expect(authValidation.isValidPhone('5551234567')).toBe(true)
      expect(authValidation.isValidPhone('+1 555 123 4567')).toBe(true)
    })

    it('should reject invalid phone formats', () => {
      expect(authValidation.isValidPhone('123')).toBe(false)
      expect(authValidation.isValidPhone('555-123-456')).toBe(false)
      expect(authValidation.isValidPhone('abc-def-ghij')).toBe(false)
    })
  })

  describe('formatPhone', () => {
    it('should format 10-digit numbers', () => {
      expect(authValidation.formatPhone('5551234567')).toBe('(555) 123-4567')
      expect(authValidation.formatPhone('555-123-4567')).toBe('(555) 123-4567')
    })

    it('should format 11-digit numbers starting with 1', () => {
      expect(authValidation.formatPhone('15551234567')).toBe('+1 (555) 123-4567')
    })

    it('should return original for invalid formats', () => {
      expect(authValidation.formatPhone('123')).toBe('123')
      expect(authValidation.formatPhone('invalid')).toBe('invalid')
    })
  })
})

describe('sessionUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('isAuthenticated', () => {
    it('should return true when session exists', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { access_token: 'token' } },
        error: null,
      })

      const result = await sessionUtils.isAuthenticated()
      expect(result).toBe(true)
    })

    it('should return false when no session', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      const result = await sessionUtils.isAuthenticated()
      expect(result).toBe(false)
    })

    it('should return false on error', async () => {
      mockSupabase.auth.getSession.mockRejectedValue(new Error('Network error'))

      const result = await sessionUtils.isAuthenticated()
      expect(result).toBe(false)
    })
  })

  describe('getCurrentSession', () => {
    it('should return session when available', async () => {
      const mockSession = { access_token: 'token' }
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      const result = await sessionUtils.getCurrentSession()
      expect(result).toEqual(mockSession)
    })

    it('should return null on error', async () => {
      mockSupabase.auth.getSession.mockRejectedValue(new Error('Network error'))

      const result = await sessionUtils.getCurrentSession()
      expect(result).toBeNull()
    })
  })

  describe('getCurrentUser', () => {
    it('should return user when available', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const result = await sessionUtils.getCurrentUser()
      expect(result).toEqual(mockUser)
    })

    it('should return null on error', async () => {
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Network error'))

      const result = await sessionUtils.getCurrentUser()
      expect(result).toBeNull()
    })
  })

  describe('hasRole', () => {
    it('should return true when user has the role', async () => {
      const mockUser = { id: 'user-123' }
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { role: 'admin' },
            error: null,
          }),
        }),
      })

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      } as any)

      const result = await sessionUtils.hasRole('admin')
      expect(result).toBe(true)
    })

    it('should return false when user does not have the role', async () => {
      const mockUser = { id: 'user-123' }
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { role: 'customer' },
            error: null,
          }),
        }),
      })

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      } as any)

      const result = await sessionUtils.hasRole('admin')
      expect(result).toBe(false)
    })

    it('should return false when no user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await sessionUtils.hasRole('admin')
      expect(result).toBe(false)
    })
  })
})

describe('routeUtils', () => {
  describe('isProtectedRoute', () => {
    it('should identify protected routes', () => {
      expect(routeUtils.isProtectedRoute('/dashboard')).toBe(true)
      expect(routeUtils.isProtectedRoute('/dashboard/settings')).toBe(true)
      expect(routeUtils.isProtectedRoute('/profile')).toBe(true)
      expect(routeUtils.isProtectedRoute('/orders')).toBe(true)
      expect(routeUtils.isProtectedRoute('/cart')).toBe(true)
      expect(routeUtils.isProtectedRoute('/checkout')).toBe(true)
    })

    it('should identify non-protected routes', () => {
      expect(routeUtils.isProtectedRoute('/')).toBe(false)
      expect(routeUtils.isProtectedRoute('/products')).toBe(false)
      expect(routeUtils.isProtectedRoute('/about')).toBe(false)
      expect(routeUtils.isProtectedRoute('/auth/login')).toBe(false)
    })
  })

  describe('isAdminRoute', () => {
    it('should identify admin routes', () => {
      expect(routeUtils.isAdminRoute('/admin')).toBe(true)
      expect(routeUtils.isAdminRoute('/admin/dashboard')).toBe(true)
      expect(routeUtils.isAdminRoute('/admin/products')).toBe(true)
      expect(routeUtils.isAdminRoute('/admin/orders')).toBe(true)
    })

    it('should identify non-admin routes', () => {
      expect(routeUtils.isAdminRoute('/dashboard')).toBe(false)
      expect(routeUtils.isAdminRoute('/profile')).toBe(false)
      expect(routeUtils.isAdminRoute('/')).toBe(false)
    })
  })

  describe('isGuestRoute', () => {
    it('should identify guest routes', () => {
      expect(routeUtils.isGuestRoute('/auth/login')).toBe(true)
      expect(routeUtils.isGuestRoute('/auth/register')).toBe(true)
      expect(routeUtils.isGuestRoute('/auth/forgot-password')).toBe(true)
    })

    it('should identify non-guest routes', () => {
      expect(routeUtils.isGuestRoute('/dashboard')).toBe(false)
      expect(routeUtils.isGuestRoute('/')).toBe(false)
      expect(routeUtils.isGuestRoute('/products')).toBe(false)
    })
  })

  describe('getRedirectUrl', () => {
    it('should return default path for guest routes', () => {
      expect(routeUtils.getRedirectUrl('/auth/login')).toBe('/dashboard')
      expect(routeUtils.getRedirectUrl('/auth/register', '/home')).toBe('/home')
    })

    it('should return current path for non-guest routes', () => {
      expect(routeUtils.getRedirectUrl('/products')).toBe('/products')
      expect(routeUtils.getRedirectUrl('/profile')).toBe('/profile')
    })
  })
})

describe('authErrorUtils', () => {
  describe('getErrorMessage', () => {
    it('should return string errors as-is', () => {
      expect(authErrorUtils.getErrorMessage('Custom error')).toBe('Custom error')
    })

    it('should map known Supabase errors', () => {
      expect(authErrorUtils.getErrorMessage({ message: 'Invalid login credentials' }))
        .toBe('Invalid email or password. Please try again.')
      
      expect(authErrorUtils.getErrorMessage({ message: 'Email not confirmed' }))
        .toBe('Please check your email and click the confirmation link.')
      
      expect(authErrorUtils.getErrorMessage({ message: 'User already registered' }))
        .toBe('An account with this email already exists.')
    })

    it('should return original message for unknown errors', () => {
      expect(authErrorUtils.getErrorMessage({ message: 'Unknown error' }))
        .toBe('Unknown error')
    })

    it('should handle errors without message', () => {
      expect(authErrorUtils.getErrorMessage({}))
        .toBe('An unexpected error occurred')
    })
  })

  describe('isNetworkError', () => {
    it('should identify network errors', () => {
      expect(authErrorUtils.isNetworkError({ name: 'NetworkError' })).toBe(true)
      expect(authErrorUtils.isNetworkError({ message: 'fetch failed' })).toBe(true)
      expect(authErrorUtils.isNetworkError({ message: 'network timeout' })).toBe(true)
    })

    it('should not identify non-network errors', () => {
      expect(authErrorUtils.isNetworkError({ message: 'Invalid credentials' })).toBe(false)
      expect(authErrorUtils.isNetworkError({ name: 'ValidationError' })).toBe(false)
      expect(authErrorUtils.isNetworkError({})).toBe(false)
      expect(authErrorUtils.isNetworkError(null)).toBe(false)
      expect(authErrorUtils.isNetworkError(undefined)).toBe(false)
    })
  })

  describe('isValidationError', () => {
    it('should identify validation errors', () => {
      expect(authErrorUtils.isValidationError({ message: 'validation failed' })).toBe(true)
      expect(authErrorUtils.isValidationError({ message: 'invalid email' })).toBe(true)
      expect(authErrorUtils.isValidationError({ message: 'field required' })).toBe(true)
    })

    it('should not identify non-validation errors', () => {
      expect(authErrorUtils.isValidationError({ message: 'Network error' })).toBe(false)
      expect(authErrorUtils.isValidationError({ message: 'Server error' })).toBe(false)
    })
  })
})

describe('storageUtils', () => {
  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  }

  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    })
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('saveRedirectUrl', () => {
    it('should save redirect URL to localStorage', () => {
      storageUtils.saveRedirectUrl('/dashboard')
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        storageUtils.keys.REDIRECT_URL,
        '/dashboard'
      )
    })
  })

  describe('getAndClearRedirectUrl', () => {
    it('should get and clear redirect URL', () => {
      localStorageMock.getItem.mockReturnValue('/dashboard')

      const result = storageUtils.getAndClearRedirectUrl()

      expect(result).toBe('/dashboard')
      expect(localStorageMock.getItem).toHaveBeenCalledWith(storageUtils.keys.REDIRECT_URL)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(storageUtils.keys.REDIRECT_URL)
    })

    it('should return null when no URL stored', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const result = storageUtils.getAndClearRedirectUrl()

      expect(result).toBeNull()
      expect(localStorageMock.removeItem).not.toHaveBeenCalled()
    })
  })

  describe('saveRememberedEmail', () => {
    it('should save email to localStorage', () => {
      storageUtils.saveRememberedEmail('test@example.com')
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        storageUtils.keys.REMEMBER_EMAIL,
        'test@example.com'
      )
    })
  })

  describe('getRememberedEmail', () => {
    it('should get remembered email', () => {
      localStorageMock.getItem.mockReturnValue('test@example.com')

      const result = storageUtils.getRememberedEmail()

      expect(result).toBe('test@example.com')
      expect(localStorageMock.getItem).toHaveBeenCalledWith(storageUtils.keys.REMEMBER_EMAIL)
    })
  })

  describe('clearRememberedEmail', () => {
    it('should clear remembered email', () => {
      storageUtils.clearRememberedEmail()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(storageUtils.keys.REMEMBER_EMAIL)
    })
  })
})