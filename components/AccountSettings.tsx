'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserMenu } from '@/components/UserMenu'

interface AccountSettingsProps {
  email: string
  displayName: string
}

export function AccountSettings({ email, displayName }: AccountSettingsProps) {
  const [name, setName] = useState(displayName)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const saveDisplayName = async () => {
    setSavingName(true)
    setMessage(null)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      data: {
        display_name: name.trim(),
        full_name: name.trim(),
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Display name updated.')
    }

    setSavingName(false)
  }

  const changePassword = async () => {
    setMessage(null)
    setError(null)

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSavingPassword(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
    } else {
      setPassword('')
      setConfirmPassword('')
      setMessage('Password updated.')
    }

    setSavingPassword(false)
  }

  return (
    <main className="apple-surface min-h-screen">
      <header className="border-b border-white/70 bg-white/80 px-4 py-5 shadow-sm backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight" style={{ color: '#032147' }}>
              Account Settings
            </h1>
            <p className="text-sm" style={{ color: '#888888' }}>
              Manage your profile and password.
            </p>
          </div>
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
            <Link
              href="/dashboard/"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-white/85 px-3 text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#209dd7]/50 hover:bg-white hover:shadow-md"
              style={{ color: '#032147' }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Boards
            </Link>
            <UserMenu email={email} />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-4xl space-y-5 px-4 py-8 sm:px-6">
        {(message || error) && (
          <div
            className="rounded-2xl border bg-white/90 p-3 text-sm shadow-sm"
            style={{
              borderColor: error ? '#fecaca' : '#bbf7d0',
              color: error ? '#dc2626' : '#16a34a',
            }}
          >
            {error || message}
          </div>
        )}

        <Card className="tactile-card border-white/75 bg-white/90 ring-white/80">
          <CardHeader>
            <CardTitle style={{ color: '#032147' }}>Profile</CardTitle>
            <CardDescription>Set the name shown on your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display-name" style={{ color: '#032147' }}>
                Display name
              </Label>
              <Input
                id="display-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
              />
            </div>
            <Button
              onClick={saveDisplayName}
              disabled={savingName}
              className="text-white"
              style={{ backgroundColor: '#753991' }}
            >
              <Save className="w-4 h-4 mr-2" />
              {savingName ? 'Saving...' : 'Save Profile'}
            </Button>
          </CardContent>
        </Card>

        <Card className="tactile-card border-white/75 bg-white/90 ring-white/80">
          <CardHeader>
            <CardTitle style={{ color: '#032147' }}>Password</CardTitle>
            <CardDescription>Change the password for email/password sign-ins.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-password" style={{ color: '#032147' }}>
                  New password
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="New password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" style={{ color: '#032147' }}>
                  Confirm password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm password"
                />
              </div>
            </div>
            <Button
              onClick={changePassword}
              disabled={savingPassword || !password || !confirmPassword}
              variant="outline"
              style={{ color: '#209dd7', borderColor: '#209dd7' }}
            >
              {savingPassword ? 'Updating...' : 'Change Password'}
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
