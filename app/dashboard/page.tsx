import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/server'
import { BoardDashboard } from '@/components/BoardDashboard'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <BoardDashboard userId={session.user.id} />
  )
}
