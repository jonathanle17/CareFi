'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/SectionHeading'
import { PrivacyNote } from '@/components/PrivacyNote'
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'

export default function SigninPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
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
    setPasswordError('')
    return true
  }

  const handleEmailBlur = () => {
    if (email) validateEmail(email)
  }

  const handlePasswordBlur = () => {
    if (password) validatePassword(password)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear any previous errors
    setGeneralError('')
    setEmailError('')
    setPasswordError('')

    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)

    if (!isEmailValid || !isPasswordValid) {
      return
    }

    setIsSubmitting(true)

    try {
      console.log('📤 [CLIENT] Sending signin request for:', email);

      // Call the signin API
      const response = await fetch('/api/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()
      console.log('📥 [CLIENT] Received response:', {
        status: response.status,
        ok: response.ok,
        data: data,
      });

      if (!response.ok) {
        // Handle API errors
        if (response.status === 401) {
          // Invalid credentials or email not confirmed
          const errorCode = data.error?.code || ''
          if (errorCode === 'unauthorized/email_not_confirmed') {
            setGeneralError(
              data.error?.message ||
                'Please check your email and confirm your account before signing in.'
            )
          } else {
            // Invalid credentials
            setGeneralError(
              data.error?.message ||
                'Invalid email or password. Please check your credentials and try again.'
            )
          }
        } else if (response.status === 400 && data.error?.details) {
          // Validation errors from API
          const details = data.error.details
          if (details.email) setEmailError(details.email)
          if (details.password) setPasswordError(details.password)
          setGeneralError('Please fix the errors below')
        } else {
          // Generic error
          setGeneralError(data.error?.message || 'Failed to sign in. Please try again.')
        }
        setIsSubmitting(false)
        return
      }

      // Success response (200)
      if (response.status === 200 && data.success) {
        console.log('✅ [CLIENT] Signin successful! Session cookies set.');
        console.log('🍪 [CLIENT] Session data received:', {
          userId: data.data.user.id,
          email: data.data.user.email,
          displayName: data.data.user.displayName,
          hasAccessToken: !!data.data.session.access_token,
          hasRefreshToken: !!data.data.session.refresh_token,
          expiresAt: data.data.session.expires_at,
        });

        // Redirect based on onboarding status
        if (data.data.user.onboardingCompleted) {
          console.log('🚀 [CLIENT] User has completed onboarding, redirecting to /analyze...');
          router.replace('/analyze')
        } else {
          console.log('🚀 [CLIENT] User needs onboarding, redirecting to /onboarding...');
          router.replace('/onboarding')
        }
      } else {
        // Unexpected response format
        setGeneralError('Unexpected response from server. Please try again.')
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('❌ [CLIENT] Signin error:', error);
      setGeneralError('Network error. Please check your connection and try again.')
      setIsSubmitting(false)
    }
  }

  const isFormValid = email && password && !emailError && !passwordError

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100/50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <SectionHeading
          eyebrow="Welcome back"
          title="Sign in to your account"
          subtitle="Continue your skincare journey and access your personalized routine"
          align="center"
        />

        <Card className="card mt-8 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error Message */}
            {generalError && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (passwordError) setPasswordError('')
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

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm text-stone-600 hover:text-stone-900 underline"
                onClick={() => {
                  // TODO: Navigate to forgot password page
                  console.log('Forgot password clicked')
                }}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-stone-900 hover:bg-stone-800 text-white cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                'Signing in...'
              ) : (
                <>
                  Sign in
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
              <span className="bg-white px-2 text-stone-500">Don't have an account?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <Button
            type="button"
            variant="ghost"
            className="w-full cursor-default"
            onClick={() => {
              router.push('/signup')
            }}
            disabled={isSubmitting}
          >
            <span className="cursor-pointer">Create account</span>
          </Button>
        </Card>

        {/* Privacy Note */}
        <div className="mt-6">
          <PrivacyNote />
        </div>
      </div>
    </div>
  )
}

