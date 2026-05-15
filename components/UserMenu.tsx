'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronDown, LogOut, Settings, User } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

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
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="relative" ref={menuRef}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="max-w-52"
        style={{ color: '#032147', borderColor: '#ecad0a' }}
      >
        <User className="w-4 h-4" style={{ color: '#209dd7' }} />
        <span className="hidden max-w-32 truncate sm:inline">{email || 'Account'}</span>
        <ChevronDown className="w-4 h-4" style={{ color: '#888888' }} />
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-lg border border-gray-200 bg-white py-2 text-sm shadow-lg"
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
            href="/settings"
            role="menuitem"
            className="mt-1 flex w-full items-center gap-2 px-3 py-2 text-left font-medium hover:bg-gray-50"
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
            className="mt-1 flex w-full items-center gap-2 px-3 py-2 text-left font-medium hover:bg-gray-50 disabled:opacity-60"
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
