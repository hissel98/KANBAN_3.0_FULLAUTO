'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CalendarDays, Edit2, Plus, Trash2 } from 'lucide-react'
import { Board } from '@/types'
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

  const loadBoards = async () => {
    setLoading(true)
    setBoards(await getBoards(userId))
    setLoading(false)
  }

  useEffect(() => {
    loadBoards()
  }, [])

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
      <header className="border-b border-border/80 bg-white/85 px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#032147' }}>
              Boards
            </h1>
            <p className="text-sm" style={{ color: '#888888' }}>
              Choose a board or create a new workspace.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={openCreateModal}
              className="text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ backgroundColor: '#209dd7' }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Board
            </Button>
            <UserMenu email={userEmail} />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {loading ? (
          <div className="py-20 text-center" style={{ color: '#888888' }}>
            Loading boards...
          </div>
        ) : boards.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-white/90 p-10 text-center shadow-sm">
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
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((board) => (
              <Card key={board.id} className="rounded-xl border-white/70 bg-white/95 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                <CardHeader>
                  <CardTitle style={{ color: '#032147' }}>
                    <Link className="hover:underline" href={`/board/${board.id}`}>
                      {board.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Created {new Date(board.created_at).toLocaleDateString()}
                  </CardDescription>
                  <CardAction className="flex items-center gap-1">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => openRenameModal(board)}
                      aria-label={`Rename ${board.title}`}
                    >
                      <Edit2 className="w-4 h-4" style={{ color: '#209dd7' }} />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => handleDelete(board)}
                      aria-label={`Delete ${board.title}`}
                    >
                      <Trash2 className="w-4 h-4" style={{ color: '#888888' }} />
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/board/${board.id}`}
                    className="inline-flex h-9 w-full items-center justify-center rounded-lg border border-border bg-white px-2.5 text-sm font-medium transition-all hover:border-[#209dd7]/50 hover:bg-muted"
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
        <DialogContent className="sm:max-w-md">
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
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setModalOpen(false)} style={{ color: '#888888' }}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!title.trim() || saving}
              className="text-white"
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
