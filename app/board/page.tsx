'use client'

import { useEffect, useState } from 'react'
import { AuthGate } from '@/components/AuthGate'
import { KanbanBoard } from '@/components/KanbanBoard'

function BoardPageContent({ userId, userEmail }: { userId: string; userEmail: string }) {
  const [boardId, setBoardId] = useState<string | undefined>(undefined)

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id')
    setBoardId(id || undefined)
  }, [])

  return <KanbanBoard userId={userId} userEmail={userEmail} boardId={boardId} />
}

export default function BoardPage() {
  return (
    <AuthGate>
      {(user) => <BoardPageContent userId={user.id} userEmail={user.email} />}
    </AuthGate>
  )
}
