'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export default function HomePage() {
  useEffect(() => {
    const redirectToEntry = async () => {
      const {
        data: { session },
      } = await createClient().auth.getSession()

      window.location.replace(session ? '/dashboard' : '/login')
    }

    void redirectToEntry()
  }, [])

  return (
    <div className="apple-surface flex min-h-screen items-center justify-center font-medium" style={{ color: '#888888' }}>
      Loading...
    </div>
  )
}
