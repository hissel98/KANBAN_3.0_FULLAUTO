'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronDown, LogOut, Settings, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase'

interface UserMenuProps {
  email: string
}

export function UserMenu({ email }: UserMenuProps) {
  const router = useRouter()
  const menuRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleSignOut = async () => {
    setSigningOut(true)
    await createClient().auth.signOut()
    router.replace('/login/')
  }

  return (
    <div className="relative min-w-0" ref={menuRef}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="h-11 w-full justify-between bg-white/90 sm:max-w-52"
        style={{ color: '#032147', borderColor: '#ecad0a' }}
      >
        <User className="w-4 h-4" style={{ color: '#209dd7' }} />
        <span className="hidden max-w-32 truncate sm:inline">{email || 'Account'}</span>
        <ChevronDown className="w-4 h-4" style={{ color: '#888888' }} />
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-[100] mt-2 w-[min(16rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-white py-2 text-sm shadow-lg"
        >
          <div className="border-b border-gray-100 px-3 pb-2">
            <p className="text-xs font-medium uppercase" style={{ color: '#888888' }}>
              Signed in as
            </p>
            <p className="mt-1 truncate font-medium" style={{ color: '#032147' }}>
              {email || 'Unknown user'}
            </p>
          </div>
          <Link
            href="/settings/"
            role="menuitem"
            className="mt-1 flex min-h-11 w-full items-center gap-2 px-3 py-2 text-left font-medium hover:bg-muted"
            style={{ color: '#032147' }}
            onClick={() => setOpen(false)}
          >
            <Settings className="w-4 h-4" style={{ color: '#209dd7' }} />
            Account Settings
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            disabled={signingOut}
            className="mt-1 flex min-h-11 w-full items-center gap-2 px-3 py-2 text-left font-medium hover:bg-muted disabled:opacity-60"
            style={{ color: '#753991' }}
          >
            <LogOut className="w-4 h-4" />
            {signingOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      )}
    </div>
  )
}
