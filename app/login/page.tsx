'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform?: () => boolean
    }
  }
}

const APP_AUTH_CALLBACK_URL = 'com.dasistmeinetest.kanban://auth/callback'
const AUTH_TIMEOUT_MS = 20000

const isCapacitorNative = () =>
  typeof window !== 'undefined' &&
  typeof window.Capacitor?.isNativePlatform === 'function' &&
  window.Capacitor.isNativePlatform()

async function withAuthTimeout<T>(promise: Promise<T>, action: string) {
  let timeoutId: number | undefined

  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timeoutId = window.setTimeout(() => {
          reject(new Error(`${action} timed out. Check your internet connection and Supabase auth settings.`))
        }, AUTH_TIMEOUT_MS)
      }),
    ])
  } finally {
    if (timeoutId) {
      window.clearTimeout(timeoutId)
    }
  }
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await withAuthTimeout(supabase.auth.getSession(), 'Checking the current session')
        if (session) {
          router.replace('/dashboard/')
        }
      } catch (error) {
        console.error('Unable to check auth session:', error)
      }
    }

    void checkUser()

    const authError = new URLSearchParams(window.location.search).get('authError')

    if (authError) {
      setError(authError)
      window.history.replaceState(null, '', '/login/')
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const { error } = await withAuthTimeout(
        createClient().auth.signInWithPassword({
          email,
          password,
        }),
        'Signing in'
      )

      if (error) {
        setError(error.message)
        return
      }

      router.replace('/dashboard/')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Sign-in failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const { error } = await withAuthTimeout(
        createClient().auth.signUp({
          email,
          password,
        }),
        'Signing up'
      )

      if (error) {
        setError(error.message)
        return
      }

      setMessage('Check your email for the confirmation link.')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Sign-up failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (isCapacitorNative()) {
        const [{ Browser }] = await Promise.all([
          import('@capacitor/browser'),
        ])

        const { data, error } = await withAuthTimeout(
          createClient().auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: APP_AUTH_CALLBACK_URL,
              skipBrowserRedirect: true,
            },
          }),
          'Starting Google sign-in'
        )

        if (error) {
          setError(error.message)
          setLoading(false)
          return
        }

        if (!data.url) {
          setError('Google sign-in URL could not be created.')
          setLoading(false)
          return
        }

        setLoading(false)
        void Browser.open({ url: data.url }).catch((error) => {
          setError(error instanceof Error ? error.message : 'Google sign-in could not be opened.')
        })
        return
      }

      const { error } = await withAuthTimeout(
        createClient().auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback/`,
          },
        }),
        'Starting Google sign-in'
      )

      if (error) {
        setError(error.message)
        setLoading(false)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Google sign-in failed.')
      setLoading(false)
    }
  }

  return (
    <div className="apple-surface flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="glass-panel w-full max-w-md border-white/75 bg-white/90 p-1 shadow-[0_30px_100px_rgb(3_33_71/0.16)] ring-white/70 transition-all duration-300 hover:shadow-[0_34px_110px_rgb(3_33_71/0.2)]">
        <CardHeader className="px-6 pt-7 text-center">
          <div className="mx-auto mb-3 h-2 w-16 rounded-full shadow-[0_8px_24px_rgb(236_173_10/0.35)]" style={{ backgroundColor: '#ecad0a' }} />
          <CardTitle className="text-3xl font-semibold tracking-tight" style={{ color: '#032147' }}>
            Project Management
          </CardTitle>
          <CardDescription className="text-[0.95rem] leading-6" style={{ color: '#888888' }}>
            Sign in to access your Kanban board
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="email" style={{ color: '#032147' }}>
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-white/90"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" style={{ color: '#032147' }}>
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-white/90"
                required
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm" style={{ color: '#dc2626' }}>
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm" style={{ color: '#16a34a' }}>
                {message}
              </div>
            )}

            <div className="space-y-2 pt-2">
              <Button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                variant="outline"
                className="h-12 w-full bg-white/90 transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ color: '#032147', borderColor: '#ecad0a' }}
              >
                Sign in with Google
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full text-white transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ backgroundColor: '#209dd7' }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
              <Button
                type="button"
                onClick={handleSignUp}
                disabled={loading}
                variant="outline"
                className="h-12 w-full bg-white/90 transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ color: '#753991', borderColor: '#753991' }}
              >
                Sign Up
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
