import { redirect } from 'next/navigation'
import { KanbanBoard } from '@/components/KanbanBoard'
import { createServerSupabaseClient } from '@/lib/server'

interface BoardPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function BoardPage({ params }: BoardPageProps) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { id } = await params

  return <KanbanBoard userId={session.user.id} boardId={id} />
}
