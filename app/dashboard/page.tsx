import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/server'
import { KanbanBoard } from '@/components/KanbanBoard'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <KanbanBoard userId={session.user.id} />
  )
}
