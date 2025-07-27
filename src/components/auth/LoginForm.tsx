'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { authValidation, authErrorUtils, storageUtils } from '../../utils/auth'

interface LoginFormProps {
  onSuccess?: () => void
  onSwitchToRegister?: () => void
  onSwitchToForgotPassword?: () => void
  redirectTo?: string
}

export default function LoginForm({
  onSuccess,
  onSwitchToRegister,
  onSwitchToForgotPassword,
  redirectTo
}: LoginFormProps) {
  const { signIn, loading } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Load remembered email on component mount
  useEffect(() => {
    const rememberedEmail = storageUtils.getRememberedEmail()
    if (rememberedEmail) {
      setFormData(prev => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true,
      }))
    }
  }, [])

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!authValidation.isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
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
      const { error } = await signIn({
        email: formData.email.trim(),
        password: formData.password,
      })

      if (error) {
        setErrors({ submit: authErrorUtils.getErrorMessage(error) })
      } else {
        // Handle remember me
        if (formData.rememberMe) {
          storageUtils.saveRememberedEmail(formData.email.trim())
        } else {
          storageUtils.clearRememberedEmail()
        }

        // Save redirect URL if provided
        if (redirectTo) {
          storageUtils.saveRedirectUrl(redirectTo)
        }

        // Call success callback
        onSuccess?.()
      }
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormDisabled = loading || isSubmitting

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Sign In</h2>
          <p className="text-gray-600 mt-2">Welcome back to Car Parts Store</p>
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
              value={formData.email}
              onChange={handleChange}
              disabled={isFormDisabled}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.email
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 hover:border-gray-400'
              } ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isFormDisabled}
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.password
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 hover:border-gray-400'
                } ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isFormDisabled}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-600 text-sm mt-1" role="alert">
                {errors.password}
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={isFormDisabled}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Remember me</span>
            </label>
            
            {onSwitchToForgotPassword && (
              <button
                type="button"
                onClick={onSwitchToForgotPassword}
                disabled={isFormDisabled}
                className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none focus:underline"
              >
                Forgot password?
              </button>
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
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Switch to Register */}
          {onSwitchToRegister && (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  disabled={isFormDisabled}
                  className="text-blue-600 hover:text-blue-800 focus:outline-none focus:underline font-medium"
                >
                  Sign up
                </button>
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}