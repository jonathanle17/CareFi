'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/SectionHeading'
import { PrivacyNote } from '@/components/PrivacyNote'
import { Mail, Lock, ArrowRight } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
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
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters')
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

    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)

    if (!isEmailValid || !isPasswordValid) {
      return
    }

    setIsSubmitting(true)

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800))

    // TODO: Backend signup implementation
    // For now, just navigate to analyze page
    router.push('/analyze')
  }

  const isFormValid = email && password && !emailError && !passwordError

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
                  placeholder="At least 6 characters"
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

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-stone-900 hover:bg-stone-800 text-white"
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
            className="w-full"
            onClick={() => {
              // TODO: Navigate to sign-in page when it exists
              console.log('Sign in clicked')
            }}
            disabled={isSubmitting}
          >
            Sign in instead
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
