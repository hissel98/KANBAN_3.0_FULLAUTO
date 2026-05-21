'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const [user, setUser] = useState<AuthenticatedUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await createClient().auth.getSession()

        if (cancelled) {
          return
        }

        if (!session) {
          router.replace('/login/')
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
      } catch (error) {
        console.error('Unable to check auth session:', error)

        if (!cancelled) {
          router.replace('/login/')
        }
      }
    }

    void checkSession()

    return () => {
      cancelled = true
    }
  }, [router])

  if (loading || !user) {
    return (
      <div className="apple-surface flex min-h-screen items-center justify-center font-medium" style={{ color: '#888888' }}>
        Loading...
      </div>
    )
  }

  return <>{children(user)}</>
}
