'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/SectionHeading'
import { PrivacyNote } from '@/components/PrivacyNote'
import { Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [displayNameError, setDisplayNameError] = useState('')
  const [generalError, setGeneralError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      setEmailError('Email is required')
      return false
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address')
      return false
    }
    setEmailError('')
    return true
  }

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError('Password is required')
      return false
    }
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return false
    }
    if (!/[a-zA-Z]/.test(password)) {
      setPasswordError('Password must contain at least one letter')
      return false
    }
    if (!/[0-9]/.test(password)) {
      setPasswordError('Password must contain at least one number')
      return false
    }
    setPasswordError('')
    return true
  }

  const validateDisplayName = (name: string): boolean => {
    if (name && name.length > 80) {
      setDisplayNameError('Display name must be 80 characters or less')
      return false
    }
    setDisplayNameError('')
    return true
  }

  const handleEmailBlur = () => {
    if (email) validateEmail(email)
  }

  const handlePasswordBlur = () => {
    if (password) validatePassword(password)
  }

  const handleDisplayNameBlur = () => {
    if (displayName) validateDisplayName(displayName)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear any previous general errors
    setGeneralError('')

    // Validate all fields
    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)
    const isDisplayNameValid = validateDisplayName(displayName)

    if (!isEmailValid || !isPasswordValid || !isDisplayNameValid) {
      return
    }

    setIsSubmitting(true)

    try {
      // Call the signup API
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          displayName: displayName || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle API errors
        if (response.status === 409) {
          // Email already in use
          setGeneralError('This email is already registered. Please sign in instead.')
        } else if (response.status === 400 && data.error?.details) {
          // Validation errors from API
          const details = data.error.details
          if (details.email) setEmailError(details.email)
          if (details.password) setPasswordError(details.password)
          if (details.displayName) setDisplayNameError(details.displayName)
          setGeneralError('Please fix the errors below')
        } else {
          // Generic error
          setGeneralError(data.error?.message || 'Failed to create account. Please try again.')
        }
        setIsSubmitting(false)
        return
      }

      // Success! Navigate to the next page
      router.push('/onboarding')
    } catch (error) {
      // Network or unexpected error
      console.error('Signup error:', error)
      setGeneralError('Network error. Please check your connection and try again.')
      setIsSubmitting(false)
    }
  }

  const isFormValid = email && password && !emailError && !passwordError && !displayNameError

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100/50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <SectionHeading
          eyebrow="Almost there"
          title="Create your account"
          subtitle="Sign up to save your personalized skincare routine and track your progress"
          align="center"
        />

        <Card className="card mt-8 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error Message */}
            {generalError && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{generalError}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                  <Mail className="w-5 h-5" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (emailError) setEmailError('')
                    if (generalError) setGeneralError('')
                  }}
                  onBlur={handleEmailBlur}
                  className={`pl-11 ${emailError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  disabled={isSubmitting}
                />
              </div>
              {emailError && (
                <p className="text-sm text-red-600 mt-1.5">{emailError}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                  <Lock className="w-5 h-5" />
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters, 1 letter & 1 number"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (passwordError) setPasswordError('')
                    if (generalError) setGeneralError('')
                  }}
                  onBlur={handlePasswordBlur}
                  className={`pl-11 ${passwordError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  disabled={isSubmitting}
                />
              </div>
              {passwordError && (
                <p className="text-sm text-red-600 mt-1.5">{passwordError}</p>
              )}
            </div>

            {/* Display Name Field */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-stone-700 mb-2">
                Display Name <span className="text-stone-500 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                  <User className="w-5 h-5" />
                </div>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="How should we call you?"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value)
                    if (displayNameError) setDisplayNameError('')
                    if (generalError) setGeneralError('')
                  }}
                  onBlur={handleDisplayNameBlur}
                  className={`pl-11 ${displayNameError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  disabled={isSubmitting}
                />
              </div>
              {displayNameError && (
                <p className="text-sm text-red-600 mt-1.5">{displayNameError}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-stone-900 hover:bg-stone-800 text-white cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                'Creating account...'
              ) : (
                <>
                  Create account
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-stone-500">Already have an account?</span>
            </div>
          </div>

          {/* Sign In Link */}
          <Button
            type="button"
            variant="ghost"
            className="w-full cursor-default"
            onClick={() => {
              router.push('/signin')
            }}
            disabled={isSubmitting}
          >
            <span className="cursor-pointer">Sign in instead</span>
          </Button>
        </Card>

        {/* Privacy Note */}
        <div className="mt-6">
          <PrivacyNote />
        </div>

        {/* Terms */}
        <p className="text-center text-xs text-stone-500 mt-4">
          By creating an account, you agree to our{' '}
          <a href="#" className="underline hover:text-stone-700">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="underline hover:text-stone-700">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}
