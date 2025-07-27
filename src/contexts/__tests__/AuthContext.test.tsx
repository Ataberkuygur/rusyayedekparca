import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'
import { authService } from '../../services/auth'

// Mock the auth service
jest.mock('../../services/auth', () => ({
  authService: {
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(),
    signUp: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    resetPassword: jest.fn(),
    updatePassword: jest.fn(),
    resendVerification: jest.fn(),
    getUserProfile: jest.fn(),
  },
}))

const mockAuthService = authService as jest.Mocked<typeof authService>

// Test component that uses the auth context
function TestComponent() {
  const auth = useAuth()
  
  return (
    <div>
      <div data-testid="loading">{auth.loading ? 'loading' : 'loaded'}</div>
      <div data-testid="user">{auth.user ? auth.user.email : 'no user'}</div>
      <div data-testid="profile">{auth.profile ? auth.profile.first_name : 'no profile'}</div>
      <button onClick={() => auth.signIn({ email: 'test@example.com', password: 'password' })}>
        Sign In
      </button>
      <button onClick={() => auth.signOut()}>Sign Out</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default mock implementations
    mockAuthService.getSession.mockResolvedValue({ session: null, error: null })
    mockAuthService.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    })
    mockAuthService.getUserProfile.mockResolvedValue({ profile: null, error: null })
  })

  it('should provide auth context to children', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Should start in loading state
    expect(screen.getByTestId('loading')).toHaveTextContent('loading')
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
    })
    
    expect(screen.getByTestId('user')).toHaveTextContent('no user')
    expect(screen.getByTestId('profile')).toHaveTextContent('no profile')
  })

  it('should initialize with existing session', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' }
    const mockSession = { user: mockUser, access_token: 'token' }
    const mockProfile = { id: 'user-123', first_name: 'John', last_name: 'Doe', email: 'test@example.com' }

    mockAuthService.getSession.mockResolvedValue({ session: mockSession, error: null })
    mockAuthService.getUserProfile.mockResolvedValue({ profile: mockProfile, error: null })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
    })

    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    expect(screen.getByTestId('profile')).toHaveTextContent('John')
  })

  it('should handle auth state changes', async () => {
    let authStateCallback: (event: string, session: any) => void

    mockAuthService.onAuthStateChange.mockImplementation((callback) => {
      authStateCallback = callback
      return { data: { subscription: { unsubscribe: jest.fn() } } }
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
    })

    // Simulate sign in
    const mockUser = { id: 'user-123', email: 'test@example.com' }
    const mockSession = { user: mockUser, access_token: 'token' }
    const mockProfile = { id: 'user-123', first_name: 'John', last_name: 'Doe', email: 'test@example.com' }

    mockAuthService.getUserProfile.mockResolvedValue({ profile: mockProfile, error: null })

    act(() => {
      authStateCallback!('SIGNED_IN', mockSession)
    })

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
      expect(screen.getByTestId('profile')).toHaveTextContent('John')
    })

    // Simulate sign out
    act(() => {
      authStateCallback!('SIGNED_OUT', null)
    })

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('no user')
      expect(screen.getByTestId('profile')).toHaveTextContent('no profile')
    })
  })

  it('should handle sign in', async () => {
    mockAuthService.signIn.mockResolvedValue({ user: null, session: null, error: null })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
    })

    const signInButton = screen.getByText('Sign In')
    act(() => {
      signInButton.click()
    })

    await waitFor(() => {
      expect(mockAuthService.signIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      })
    })
  })

  it('should handle sign in error', async () => {
    mockAuthService.signIn.mockResolvedValue({
      user: null,
      session: null,
      error: 'Invalid credentials',
    })

    const TestErrorComponent = () => {
      const auth = useAuth()
      const [error, setError] = React.useState<string | null>(null)

      const handleSignIn = async () => {
        const result = await auth.signIn({ email: 'test@example.com', password: 'wrong' })
        setError(result.error)
      }

      return (
        <div>
          <div data-testid="error">{error || 'no error'}</div>
          <button onClick={handleSignIn}>Sign In</button>
        </div>
      )
    }

    render(
      <AuthProvider>
        <TestErrorComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('no error')
    })

    const signInButton = screen.getByText('Sign In')
    act(() => {
      signInButton.click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials')
    })
  })

  it('should handle sign out', async () => {
    mockAuthService.signOut.mockResolvedValue({ error: null })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
    })

    const signOutButton = screen.getByText('Sign Out')
    act(() => {
      signOutButton.click()
    })

    await waitFor(() => {
      expect(mockAuthService.signOut).toHaveBeenCalled()
    })
  })

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useAuth must be used within an AuthProvider')

    consoleSpy.mockRestore()
  })

  it('should handle profile loading error', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' }
    const mockSession = { user: mockUser, access_token: 'token' }

    mockAuthService.getSession.mockResolvedValue({ session: mockSession, error: null })
    mockAuthService.getUserProfile.mockResolvedValue({ profile: null, error: 'Profile not found' })

    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
    })

    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    expect(screen.getByTestId('profile')).toHaveTextContent('no profile')

    consoleSpy.mockRestore()
  })
})