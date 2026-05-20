'use client'

import { useEffect, useState } from 'react'
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

const isCapacitorNative = () =>
  typeof window !== 'undefined' &&
  typeof window.Capacitor?.isNativePlatform === 'function' &&
  window.Capacitor.isNativePlatform()

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let removeAppUrlListener: (() => void) | undefined

    const checkUser = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        window.location.href = '/dashboard'
      }
    }

    const setupDeepLinkHandler = async () => {
      if (!isCapacitorNative()) {
        return
      }

      const [{ App }, { Browser }] = await Promise.all([
        import('@capacitor/app'),
        import('@capacitor/browser'),
      ])

      const listener = await App.addListener('appUrlOpen', async ({ url }) => {
        let callbackUrl: URL

        try {
          callbackUrl = new URL(url)
        } catch {
          return
        }

        const isNativeAuthCallback =
          callbackUrl.protocol === 'com.dasistmeinetest.kanban:' &&
          callbackUrl.host === 'auth' &&
          callbackUrl.pathname.startsWith('/callback')
        const isWebAuthCallback =
          callbackUrl.host === window.location.host &&
          callbackUrl.pathname.startsWith('/auth/callback')

        if (!isNativeAuthCallback && !isWebAuthCallback) {
          return
        }

        const code = callbackUrl.searchParams.get('code')

        if (!code) {
          await Browser.close()
          setError('Google sign-in callback did not include an auth code.')
          setLoading(false)
          return
        }

        const { error } = await createClient().auth.exchangeCodeForSession(code)
        await Browser.close()

        if (error) {
          setError(error.message)
          setLoading(false)
          return
        }

        window.location.href = '/dashboard'
      })

      removeAppUrlListener = () => {
        void listener.remove()
      }
    }

    void checkUser()
    void setupDeepLinkHandler()

    return () => {
      removeAppUrlListener?.()
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const { error } = await createClient().auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const { error } = await createClient().auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Check your email for the confirmation link.')
    }
    setLoading(false)
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)

    if (isCapacitorNative()) {
      const [{ Browser }] = await Promise.all([
        import('@capacitor/browser'),
      ])

      const { data, error } = await createClient().auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: APP_AUTH_CALLBACK_URL,
          skipBrowserRedirect: true,
        },
      })

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

      await Browser.open({ url: data.url })
      return
    }

    const { error } = await createClient().auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
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
          <form className="space-y-5">
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
                type="button"
                onClick={handleLogin}
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
