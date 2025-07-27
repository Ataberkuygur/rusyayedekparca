import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginForm from '../LoginForm'
import { useAuth } from '../../../contexts/AuthContext'
import { storageUtils } from '../../../utils/auth'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { beforeEach } from 'node:test'
import { describe } from 'node:test'

// Mock the auth context
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}))

// Mock the storage utils
jest.mock('../../../utils/auth', () => ({
  authValidation: {
    isValidEmail: jest.fn(),
  },
  authErrorUtils: {
    getErrorMessage: jest.fn(),
  },
  storageUtils: {
    getRememberedEmail: jest.fn(),
    saveRememberedEmail: jest.fn(),
    clearRememberedEmail: jest.fn(),
    saveRedirectUrl: jest.fn(),
  },
}))

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockStorageUtils = storageUtils as jest.Mocked<typeof storageUtils>

// Mock auth validation
const mockAuthValidation = require('../../../utils/auth').authValidation
const mockAuthErrorUtils = require('../../../utils/auth').authErrorUtils

describe('LoginForm', () => {
  const mockSignIn = jest.fn()
  const mockOnSuccess = jest.fn()
  const mockOnSwitchToRegister = jest.fn()
  const mockOnSwitchToForgotPassword = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockUseAuth.mockReturnValue({
      signIn: mockSignIn,
      loading: false,
      user: null,
      session: null,
      profile: null,
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn(),
      updatePassword: jest.fn(),
      resendVerification: jest.fn(),
      refreshProfile: jest.fn(),
    })

    mockAuthValidation.isValidEmail.mockReturnValue(true)
    mockAuthErrorUtils.getErrorMessage.mockImplementation((error) => error)
    mockStorageUtils.getRememberedEmail.mockReturnValue(null)
  })

  it('should render login form', () => {
    render(<LoginForm />)

    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('should load remembered email on mount', () => {
    mockStorageUtils.getRememberedEmail.mockReturnValue('remembered@example.com')

    render(<LoginForm />)

    expect(screen.getByDisplayValue('remembered@example.com')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Remember me' })).toBeChecked()
  })

  it('should validate email field', async () => {
    const user = userEvent.setup()
    mockAuthValidation.isValidEmail.mockReturnValue(false)

    render(<LoginForm />)

    const emailInput = screen.getByLabelText('Email Address')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    await user.type(emailInput, 'invalid-email')
    await user.click(submitButton)

    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it('should validate required fields', async () => {
    const user = userEvent.setup()

    render(<LoginForm />)

    const submitButton = screen.getByRole('button', { name: 'Sign In' })
    await user.click(submitButton)

    expect(screen.getByText('Email is required')).toBeInTheDocument()
    expect(screen.getByText('Password is required')).toBeInTheDocument()
    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it('should submit form with valid data', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue({ error: null })

    render(<LoginForm onSuccess={mockOnSuccess} />)

    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    expect(mockOnSuccess).toHaveBeenCalled()
  })

  it('should handle sign in error', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue({ error: 'Invalid credentials' })
    mockAuthErrorUtils.getErrorMessage.mockReturnValue('Invalid email or password')

    render(<LoginForm />)

    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
    })
  })

  it('should toggle password visibility', async () => {
    const user = userEvent.setup()

    render(<LoginForm />)

    const passwordInput = screen.getByLabelText('Password')
    const toggleButton = screen.getByLabelText('Show password')

    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')
    expect(screen.getByLabelText('Hide password')).toBeInTheDocument()

    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('should handle remember me functionality', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue({ error: null })

    render(<LoginForm />)

    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const rememberCheckbox = screen.getByRole('checkbox', { name: 'Remember me' })
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(rememberCheckbox)
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockStorageUtils.saveRememberedEmail).toHaveBeenCalledWith('test@example.com')
    })
  })

  it('should clear remembered email when remember me is unchecked', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue({ error: null })

    render(<LoginForm />)

    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const rememberCheckbox = screen.getByRole('checkbox', { name: 'Remember me' })
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    // Remember me is unchecked by default
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockStorageUtils.clearRememberedEmail).toHaveBeenCalled()
    })
  })

  it('should save redirect URL when provided', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue({ error: null })

    render(<LoginForm redirectTo="/dashboard" />)

    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockStorageUtils.saveRedirectUrl).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('should call switch callbacks', async () => {
    const user = userEvent.setup()

    render(
      <LoginForm
        onSwitchToRegister={mockOnSwitchToRegister}
        onSwitchToForgotPassword={mockOnSwitchToForgotPassword}
      />
    )

    const registerLink = screen.getByText('Sign up')
    const forgotPasswordLink = screen.getByText('Forgot password?')

    await user.click(registerLink)
    expect(mockOnSwitchToRegister).toHaveBeenCalled()

    await user.click(forgotPasswordLink)
    expect(mockOnSwitchToForgotPassword).toHaveBeenCalled()
  })

  it('should disable form when loading', () => {
    mockUseAuth.mockReturnValue({
      signIn: mockSignIn,
      loading: true,
      user: null,
      session: null,
      profile: null,
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn(),
      updatePassword: jest.fn(),
      resendVerification: jest.fn(),
      refreshProfile: jest.fn(),
    })

    render(<LoginForm />)

    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    expect(emailInput).toBeDisabled()
    expect(passwordInput).toBeDisabled()
    expect(submitButton).toBeDisabled()
  })

  it('should show loading state during submission', async () => {
    const user = userEvent.setup()
    let resolveSignIn: (value: any) => void
    
    mockSignIn.mockImplementation(() => {
      return new Promise((resolve) => {
        resolveSignIn = resolve
      })
    })

    render(<LoginForm />)

    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    expect(screen.getByText('Signing in...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()

    // Resolve the promise
    resolveSignIn!({ error: null })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
    })
  })

  it('should clear field errors when user starts typing', async () => {
    const user = userEvent.setup()
    mockAuthValidation.isValidEmail.mockReturnValue(false)

    render(<LoginForm />)

    const emailInput = screen.getByLabelText('Email Address')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    // Trigger validation error
    await user.click(submitButton)
    expect(screen.getByText('Email is required')).toBeInTheDocument()

    // Start typing to clear error
    await user.type(emailInput, 'test')
    expect(screen.queryByText('Email is required')).not.toBeInTheDocument()
  })
})