'use client'

import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { authValidation, authErrorUtils } from '../../utils/auth'

interface ForgotPasswordFormProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
}

export default function ForgotPasswordForm({
  onSuccess,
  onSwitchToLogin,
}: ForgotPasswordFormProps) {
  const { resetPassword, loading } = useAuth()
  
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setEmail(value)

    // Clear email error when user starts typing
    if (errors.email) {
      setErrors(prev => ({
        ...prev,
        email: '',
      }))
    }
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!authValidation.isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const { error } = await resetPassword(email.trim())

      if (error) {
        setErrors({ submit: authErrorUtils.getErrorMessage(error) })
      } else {
        setIsSuccess(true)
        onSuccess?.()
      }
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormDisabled = loading || isSubmitting

  // Success state
  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
            
            <p className="text-gray-600 mb-6">
              We've sent a password reset link to{' '}
              <span className="font-medium text-gray-900">{email}</span>
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                <strong>Didn't receive the email?</strong>
                <br />
                Check your spam folder or try again in a few minutes.
              </p>
            </div>

            {onSwitchToLogin && (
              <button
                onClick={onSwitchToLogin}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Back to Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Form state
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
          <p className="text-gray-600 mt-2">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              disabled={isFormDisabled}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.email
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 hover:border-gray-400'
              } ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder="Enter your email address"
              autoComplete="email"
              required
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm" role="alert">
                {errors.submit}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isFormDisabled}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isFormDisabled
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending reset link...
              </div>
            ) : (
              'Send Reset Link'
            )}
          </button>

          {/* Switch to Login */}
          {onSwitchToLogin && (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  disabled={isFormDisabled}
                  className="text-blue-600 hover:text-blue-800 focus:outline-none focus:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}