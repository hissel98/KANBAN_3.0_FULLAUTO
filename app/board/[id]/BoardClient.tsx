'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { KanbanBoard } from '@/components/KanbanBoard'
import { createClient } from '@/lib/supabase'

export function BoardClient() {
  const router = useRouter()
  const params = useParams()
  const [userData, setUserData] = useState<{ userId: string; userEmail: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
      } else {
        setUserData({
          userId: session.user.id,
          userEmail: session.user.email ?? ''
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

  const boardId = params.id as string

  return <KanbanBoard userId={userData.userId} userEmail={userData.userEmail} boardId={boardId} />
}
