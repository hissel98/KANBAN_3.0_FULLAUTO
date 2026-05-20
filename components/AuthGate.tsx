'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

interface AuthenticatedUser {
  id: string
  email: string
  displayName: string
}

interface AuthGateProps {
  children: (user: AuthenticatedUser) => React.ReactNode
}

export function AuthGate({ children }: AuthGateProps) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const checkSession = async () => {
      const {
        data: { session },
      } = await createClient().auth.getSession()

      if (cancelled) {
        return
      }

      if (!session) {
        window.location.replace('/login')
        return
      }

      const metadata = session.user.user_metadata
      const displayName =
        typeof metadata.display_name === 'string'
          ? metadata.display_name
          : typeof metadata.full_name === 'string'
            ? metadata.full_name
            : ''

      setUser({
        id: session.user.id,
        email: session.user.email ?? '',
        displayName,
      })
      setLoading(false)
    }

    void checkSession()

    return () => {
      cancelled = true
    }
  }, [])

  if (loading || !user) {
    return (
      <div className="apple-surface flex min-h-screen items-center justify-center font-medium" style={{ color: '#888888' }}>
        Loading...
      </div>
    )
  }

  return <>{children(user)}</>
}
