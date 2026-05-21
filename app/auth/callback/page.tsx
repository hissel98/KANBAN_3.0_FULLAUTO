'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const completeSignIn = async () => {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const authError = params.get('error_description') ?? params.get('error')

      if (authError) {
        router.replace(`/login/?authError=${encodeURIComponent(authError)}`)
        return
      }

      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        router.replace('/dashboard/')
        return
      }

      if (!code) {
        router.replace('/login/')
        return
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        router.replace(`/login/?authError=${encodeURIComponent(error.message)}`)
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
