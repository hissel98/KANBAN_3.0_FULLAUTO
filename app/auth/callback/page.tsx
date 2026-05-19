'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient()
      
      // Check if there's a hash fragment (from OAuth deep link)
      const hash = window.location.hash
      const queryCode = searchParams.get('code')
      
      let code: string | null = queryCode
      
      // Parse hash fragment for access_token or code
      if (hash) {
        const params = new URLSearchParams(hash.substring(1))
        const hashCode = params.get('code')
        if (hashCode) {
          code = hashCode
        }
      }

      if (code) {
        try {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (!exchangeError) {
            router.push('/dashboard')
          } else {
            console.error('Auth exchange error:', exchangeError)
            setError(exchangeError.message)
            setTimeout(() => router.push('/login'), 2000)
          }
        } catch (err) {
          console.error('Auth callback exception:', err)
          setError('Authentication failed')
          setTimeout(() => router.push('/login'), 2000)
        }
      } else {
        // No code found, redirect to login
        router.push('/login')
      }
    }

    handleAuthCallback()
  }, [searchParams, router])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#f6f7fb' }}>
        <div className="text-center">
          <div className="mb-4 rounded-full bg-red-100 p-4">
            <svg className="mx-auto h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p style={{ color: '#032147' }}>Authentication failed</p>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
          <p className="text-sm text-gray-400 mt-4">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#f6f7fb' }}>
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-t-2" style={{ borderColor: '#209dd7' }} />
        <p style={{ color: '#032147' }}>Completing sign in...</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#f6f7fb' }}>
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-t-2" style={{ borderColor: '#209dd7' }} />
          <p style={{ color: '#032147' }}>Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
