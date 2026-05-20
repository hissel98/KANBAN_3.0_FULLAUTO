'use client'

import { AuthGate } from '@/components/AuthGate'
import { BoardDashboard } from '@/components/BoardDashboard'

export default function DashboardPage() {
  return (
    <AuthGate>
      {(user) => <BoardDashboard userId={user.id} userEmail={user.email} />}
    </AuthGate>
  )
}
