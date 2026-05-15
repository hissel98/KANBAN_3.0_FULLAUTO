'use client'

import { useState, useEffect } from 'react'
import { Card as CardType } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createCard, updateCard } from '@/lib/supabase'

interface CardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  card: CardType | null
  columnId: string | null
  boardId: string | undefined
  userId: string
  onSaved: () => void
}

export function CardModal({
  open,
  onOpenChange,
  card,
  columnId,
  boardId,
  userId,
  onSaved,
}: CardModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (card) {
      setTitle(card.title)
      setDescription(card.description || '')
    } else {
      setTitle('')
      setDescription('')
    }
  }, [card, open])

  const handleSave = async () => {
    if (!title.trim() || !columnId || !boardId) return

    setSaving(true)
    try {
      if (card) {
        await updateCard(card.id, {
          title: title.trim(),
          description: description.trim(),
        })
      } else {
        await createCard({
          board_id: boardId,
          column_id: columnId,
          user_id: userId,
          title: title.trim(),
          description: description.trim(),
          position: Date.now(),
        })
      }
      onSaved()
    } catch (error) {
      console.error('Error saving card:', error)
    } finally {
      setSaving(false)
    }
  }

  const isEdit = !!card

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle style={{ color: '#032147' }}>
            {isEdit ? 'Edit Card' : 'Create Card'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" style={{ color: '#032147' }}>
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter card title"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && title.trim()) handleSave()
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" style={{ color: '#888888' }}>
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description (optional)"
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            style={{ color: '#888888' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            style={{ backgroundColor: '#753991' }}
            className="text-white"
          >
            {saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
