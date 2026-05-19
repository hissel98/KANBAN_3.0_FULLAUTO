'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AccountSettings } from '@/components/AccountSettings'
import { createClient } from '@/lib/supabase'

export default function SettingsPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<{ email: string; displayName: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
      } else {
        const metadata = session.user.user_metadata
        const displayName =
          typeof metadata.display_name === 'string'
            ? metadata.display_name
            : typeof metadata.full_name === 'string'
              ? metadata.full_name
              : ''

        setUserData({
          email: session.user.email ?? '',
          displayName
        })
      }
      setLoading(false)
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#f6f7fb' }}>
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-t-2" style={{ borderColor: '#209dd7' }} />
          <p style={{ color: '#032147' }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return null
  }

  return (
    <AccountSettings
      email={userData.email}
      displayName={userData.displayName}
    />
  )
}
