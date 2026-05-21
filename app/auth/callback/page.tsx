'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const completeSignIn = async () => {
      const code = new URLSearchParams(window.location.search).get('code')

      if (!code) {
        router.replace('/login/')
        return
      }

      const { error } = await createClient().auth.exchangeCodeForSession(code)

      if (error) {
        setError(error.message)
        return
      }

      router.replace('/dashboard/')
    }

    void completeSignIn()
  }, [router])

  return (
    <div className="apple-surface flex min-h-screen items-center justify-center px-4">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-white/75 bg-white/90 p-6 text-center shadow-[0_30px_100px_rgb(3_33_71/0.16)]">
        <h1 className="text-xl font-semibold" style={{ color: '#032147' }}>
          Completing sign-in...
        </h1>
        {error && (
          <p className="mt-3 text-sm" style={{ color: '#dc2626' }}>
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
