'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform?: () => boolean
    }
  }
}

const AUTH_TIMEOUT_MS = 20000

const isCapacitorNative = () =>
  typeof window !== 'undefined' &&
  typeof window.Capacitor?.isNativePlatform === 'function' &&
  window.Capacitor.isNativePlatform()

const getAuthCode = (callbackUrl: URL) => {
  const queryCode = callbackUrl.searchParams.get('code')

  if (queryCode) {
    return queryCode
  }

  const hashParams = new URLSearchParams(callbackUrl.hash.replace(/^#/, ''))

  return hashParams.get('code')
}

const getAuthError = (callbackUrl: URL) => {
  const queryError =
    callbackUrl.searchParams.get('error_description') ?? callbackUrl.searchParams.get('error')

  if (queryError) {
    return queryError
  }

  const hashParams = new URLSearchParams(callbackUrl.hash.replace(/^#/, ''))

  return hashParams.get('error_description') ?? hashParams.get('error')
}

const isAuthCallbackUrl = (callbackUrl: URL) =>
  callbackUrl.protocol === 'com.dasistmeinetest.kanban:' &&
  callbackUrl.host === 'auth' &&
  callbackUrl.pathname.startsWith('/callback')

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

export function AuthDeepLinkHandler() {
  const router = useRouter()

  useEffect(() => {
    if (!isCapacitorNative()) {
      return
    }

    let removeAppUrlListener: (() => void) | undefined
    let cancelled = false

    const handleAuthCallback = async (url: string) => {
      let callbackUrl: URL

      try {
        callbackUrl = new URL(url)
      } catch {
        return
      }

      if (!isAuthCallbackUrl(callbackUrl)) {
        return
      }

      const authError = getAuthError(callbackUrl)

      if (authError) {
        const { Browser } = await import('@capacitor/browser')
        await Browser.close()
        router.replace(`/login/?authError=${encodeURIComponent(authError)}`)
        return
      }

      const code = getAuthCode(callbackUrl)

      if (!code) {
        const { Browser } = await import('@capacitor/browser')
        await Browser.close()
        router.replace('/login/?authError=missing-code')
        return
      }

      try {
        const [{ Browser }] = await Promise.all([import('@capacitor/browser')])
        const { error } = await withAuthTimeout(
          createClient().auth.exchangeCodeForSession(code),
          'Completing Google sign-in'
        )

        await Browser.close()

        if (cancelled) {
          return
        }

        if (error) {
          router.replace(`/login/?authError=${encodeURIComponent(error.message)}`)
          return
        }

        router.replace('/dashboard/')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Google sign-in failed.'
        router.replace(`/login/?authError=${encodeURIComponent(message)}`)
      }
    }

    const setupDeepLinkHandler = async () => {
      const [{ App }] = await Promise.all([import('@capacitor/app')])
      const listener = await App.addListener('appUrlOpen', async ({ url }) => {
        await handleAuthCallback(url)
      })
      const launchUrl = await App.getLaunchUrl()

      if (launchUrl?.url) {
        await handleAuthCallback(launchUrl.url)
      }

      removeAppUrlListener = () => {
        void listener.remove()
      }
    }

    void setupDeepLinkHandler()

    return () => {
      cancelled = true
      removeAppUrlListener?.()
    }
  }, [router])

  return null
}
