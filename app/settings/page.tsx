import { redirect } from 'next/navigation'
import { AccountSettings } from '@/components/AccountSettings'
import { createServerSupabaseClient } from '@/lib/server'

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const metadata = session.user.user_metadata
  const displayName =
    typeof metadata.display_name === 'string'
      ? metadata.display_name
      : typeof metadata.full_name === 'string'
        ? metadata.full_name
        : ''

  return (
    <AccountSettings
      email={session.user.email ?? ''}
      displayName={displayName}
    />
  )
}
