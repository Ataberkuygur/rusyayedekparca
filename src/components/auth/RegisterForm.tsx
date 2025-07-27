'use client'

import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { authValidation, authErrorUtils } from '../../utils/auth'

interface RegisterFormProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
}

export default function RegisterForm({
  onSuccess,
  onSwitchToLogin,
}: RegisterFormProps) {
  const { signUp, loading } = useAuth()
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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

    // Clear confirm password error when password changes
    if (name === 'password' && errors.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: '',
      }))
    }
  }

  // Format phone number as user types
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    const formattedPhone = authValidation.formatPhone(value)
    
    setFormData(prev => ({
      ...prev,
      phone: formattedPhone,
    }))

    // Clear phone error when user starts typing
    if (errors.phone) {
      setErrors(prev => ({
        ...prev,
        phone: '',
      }))
    }
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    } else if (!authValidation.isValidName(formData.firstName.trim())) {
      newErrors.firstName = 'First name must be 2-50 characters long'
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    } else if (!authValidation.isValidName(formData.lastName.trim())) {
      newErrors.lastName = 'Last name must be 2-50 characters long'
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!authValidation.isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Phone validation (optional)
    if (formData.phone.trim() && !authValidation.isValidPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else {
      const passwordValidation = authValidation.isValidPassword(formData.password)
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0] // Show first error
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    // Terms acceptance validation
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions'
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
      const { error } = await signUp({
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim() || undefined,
      })

      if (error) {
        setErrors({ submit: authErrorUtils.getErrorMessage(error) })
      } else {
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
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-600 mt-2">Join Car Parts Store today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={isFormDisabled}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.firstName
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 hover:border-gray-400'
                } ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder="John"
                autoComplete="given-name"
                required
              />
              {errors.firstName && (
                <p className="text-red-600 text-sm mt-1" role="alert">
                  {errors.firstName}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={isFormDisabled}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.lastName
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 hover:border-gray-400'
                } ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder="Doe"
                autoComplete="family-name"
                required
              />
              {errors.lastName && (
                <p className="text-red-600 text-sm mt-1" role="alert">
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

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
              placeholder="john@example.com"
              autoComplete="email"
              required
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-gray-500">(optional)</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              disabled={isFormDisabled}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.phone
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 hover:border-gray-400'
              } ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder="(555) 123-4567"
              autoComplete="tel"
            />
            {errors.phone && (
              <p className="text-red-600 text-sm mt-1" role="alert">
                {errors.phone}
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
                placeholder="Create a strong password"
                autoComplete="new-password"
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

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isFormDisabled}
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.confirmPassword
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 hover:border-gray-400'
                } ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder="Confirm your password"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isFormDisabled}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
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
            {errors.confirmPassword && (
              <p className="text-red-600 text-sm mt-1" role="alert">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div>
            <label className="flex items-start">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                disabled={isFormDisabled}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                required
              />
              <span className="ml-2 text-sm text-gray-700">
                I agree to the{' '}
                <a href="/terms" className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </a>
              </span>
            </label>
            {errors.acceptTerms && (
              <p className="text-red-600 text-sm mt-1" role="alert">
                {errors.acceptTerms}
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
                Creating account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>

          {/* Switch to Login */}
          {onSwitchToLogin && (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
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