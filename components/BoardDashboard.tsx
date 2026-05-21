'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { CalendarDays, Edit2, Plus, Trash2 } from 'lucide-react'
import type { Board } from '@/types'
import { createBoard, deleteBoard, getBoards, updateBoard } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserMenu } from '@/components/UserMenu'

interface BoardDashboardProps {
  userId: string
  userEmail: string
}

export function BoardDashboard({ userId, userEmail }: BoardDashboardProps) {
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBoard, setEditingBoard] = useState<Board | null>(null)
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)

  const loadBoards = useCallback(async () => {
    setBoards(await getBoards(userId))
    setLoading(false)
  }, [userId])

  useEffect(() => {
    let cancelled = false

    const fetchBoards = async () => {
      const nextBoards = await getBoards(userId)
      if (!cancelled) {
        setBoards(nextBoards)
        setLoading(false)
      }
    }

    void fetchBoards()

    return () => {
      cancelled = true
    }
  }, [userId])

  const openCreateModal = () => {
    setEditingBoard(null)
    setTitle('')
    setModalOpen(true)
  }

  const openRenameModal = (board: Board) => {
    setEditingBoard(board)
    setTitle(board.title)
    setModalOpen(true)
  }

  const handleSave = async () => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return

    setSaving(true)
    try {
      if (editingBoard) {
        await updateBoard(editingBoard.id, { title: trimmedTitle })
      } else {
        await createBoard(userId, trimmedTitle)
      }
      setModalOpen(false)
      await loadBoards()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (board: Board) => {
    if (!confirm(`Delete "${board.title}" and all of its cards?`)) return

    await deleteBoard(board.id)
    await loadBoards()
  }

  return (
    <main className="apple-surface min-h-screen">
      <header className="border-b border-white/70 bg-white/80 px-4 py-5 shadow-sm backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight" style={{ color: '#032147' }}>
              Boards
            </h1>
            <p className="text-sm" style={{ color: '#888888' }}>
              Choose a board or create a new workspace.
            </p>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Button
              onClick={openCreateModal}
              className="h-11 flex-1 text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:flex-none"
              style={{ backgroundColor: '#209dd7' }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Board
            </Button>
            <UserMenu email={userEmail} />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {loading ? (
          <div className="py-20 text-center" style={{ color: '#888888' }}>
            Loading boards...
          </div>
        ) : boards.length === 0 ? (
          <div className="glass-panel rounded-2xl border border-dashed border-white/80 p-10 text-center">
            <h2 className="text-lg font-semibold" style={{ color: '#032147' }}>
              No boards yet
            </h2>
            <p className="mt-2 text-sm" style={{ color: '#888888' }}>
              Create your first board to start organizing work.
            </p>
            <Button
              onClick={openCreateModal}
              className="mt-5 text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ backgroundColor: '#209dd7' }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Board
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {boards.map((board) => (
              <Card key={board.id} className="tactile-card border-white/75 bg-white/90 ring-white/80">
                <CardHeader>
                  <CardTitle className="pr-2 text-lg" style={{ color: '#032147' }}>
                    <Link className="hover:underline" href={`/board/?id=${board.id}`}>
                      {board.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 leading-5">
                    <CalendarDays className="h-4 w-4" />
                    Created {new Date(board.created_at).toLocaleDateString()}
                  </CardDescription>
                  <CardAction className="flex items-center gap-1">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => openRenameModal(board)}
                      aria-label={`Rename ${board.title}`}
                      className="h-11 w-11 sm:h-8 sm:w-8"
                    >
                      <Edit2 className="w-4 h-4" style={{ color: '#209dd7' }} />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => handleDelete(board)}
                      aria-label={`Delete ${board.title}`}
                      className="h-11 w-11 sm:h-8 sm:w-8"
                    >
                      <Trash2 className="w-4 h-4" style={{ color: '#888888' }} />
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/board/?id=${board.id}`}
                    className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-border bg-white/85 px-3 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:border-[#209dd7]/50 hover:bg-white hover:shadow-md sm:h-10"
                    style={{ color: '#032147' }}
                  >
                    Open Board
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[calc(100dvh-1rem)] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: '#032147' }}>
              {editingBoard ? 'Rename Board' : 'Create Board'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-3">
            <Label htmlFor="board-title" style={{ color: '#032147' }}>
              Title
            </Label>
            <Input
              id="board-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Board title"
              autoFocus
              onKeyDown={(event) => {
                if (event.key === 'Enter' && title.trim()) handleSave()
              }}
            />
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="h-11" style={{ color: '#888888' }}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!title.trim() || saving}
              className="h-11 text-white"
              style={{ backgroundColor: '#209dd7' }}
            >
              {saving ? 'Saving...' : editingBoard ? 'Rename' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
