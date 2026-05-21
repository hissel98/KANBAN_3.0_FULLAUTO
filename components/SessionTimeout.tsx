'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const DEFAULT_SESSION_TIMEOUT_MINUTES = 30
const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'] as const
const PUBLIC_AUTH_PATHS = ['/login', '/auth/callback'] as const

// Allows deploy-time tuning while keeping the required 30-minute default.
function getSessionTimeoutMs() {
  const configuredMinutes = Number(process.env.NEXT_PUBLIC_SESSION_TIMEOUT_MINUTES)
  const timeoutMinutes =
    Number.isFinite(configuredMinutes) && configuredMinutes > 0
      ? configuredMinutes
      : DEFAULT_SESSION_TIMEOUT_MINUTES

  return timeoutMinutes * 60 * 1000
}

export const SESSION_TIMEOUT_MS = getSessionTimeoutMs()

function isPublicAuthPath(pathname: string | null) {
  const normalizedPathname = pathname?.replace(/\/$/, '') || null

  return PUBLIC_AUTH_PATHS.some((path) => normalizedPathname === path || normalizedPathname?.startsWith(`${path}/`))
}

export function useSessionTimeout(timeoutMs = SESSION_TIMEOUT_MS) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const timeoutRef = useRef<number | null>(null)

  const clearSessionTimer = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const handleTimeout = useCallback(async () => {
    clearSessionTimer()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return
    }

    await supabase.auth.signOut()

    if (window.location.pathname.replace(/\/$/, '') !== '/login') {
      router.replace('/login/')
    }
  }, [clearSessionTimer, router, supabase])

  const resetSessionTimer = useCallback(() => {
    clearSessionTimer()
    timeoutRef.current = window.setTimeout(() => {
      void handleTimeout()
    }, timeoutMs)
  }, [clearSessionTimer, handleTimeout, timeoutMs])

  useEffect(() => {
    if (isPublicAuthPath(pathname)) {
      clearSessionTimer()
      return
    }

    resetSessionTimer()

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, resetSessionTimer, { passive: true })
    })

    return () => {
      clearSessionTimer()
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, resetSessionTimer)
      })
    }
  }, [clearSessionTimer, pathname, resetSessionTimer])
}

export function SessionTimeout() {
  useSessionTimeout()

  return null
}
