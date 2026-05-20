'use client'

import { AccountSettings } from '@/components/AccountSettings'
import { AuthGate } from '@/components/AuthGate'

export default function SettingsPage() {
  return (
    <AuthGate>
      {(user) => (
        <AccountSettings
          email={user.email}
          displayName={user.displayName}
        />
      )}
    </AuthGate>
  )
}
