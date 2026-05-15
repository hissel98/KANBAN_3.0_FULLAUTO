'use client'

import { useState } from 'react'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ColumnWithCards, Card } from '@/types'
import { Card as CardComponent } from './Card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Edit2, Check, X } from 'lucide-react'
import { updateColumn } from '@/lib/supabase'

interface ColumnProps {
  column: ColumnWithCards
  onAddCard: (columnId: string) => void
  onEditCard: (card: Card) => void
  onCardsChanged: () => void
}

export function Column({ column, onAddCard, onEditCard, onCardsChanged }: ColumnProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(column.title)

  const { setNodeRef } = useSortable({
    id: column.id,
    data: { type: 'Column', column },
  })

  const handleSaveTitle = async () => {
    if (title.trim() && title !== column.title) {
      await updateColumn(column.id, { title: title.trim() })
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTitle(column.title)
    setIsEditing(false)
  }

  return (
    <div
      ref={setNodeRef}
      className="flex-shrink-0 w-80 bg-gray-50 rounded-lg border border-gray-200 flex flex-col"
    >
      <div className="p-4 border-b border-gray-200 bg-white rounded-t-lg">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle()
                if (e.key === 'Escape') handleCancel()
              }}
            />
            <Button size="icon" variant="ghost" onClick={handleSaveTitle}>
              <Check className="w-4 h-4" style={{ color: '#209dd7' }} />
            </Button>
            <Button size="icon" variant="ghost" onClick={handleCancel}>
              <X className="w-4 h-4" style={{ color: '#888888' }} />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <h3 className="font-semibold" style={{ color: '#032147' }}>
              {column.title}
            </h3>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8"
              >
                <Edit2 className="w-4 h-4" style={{ color: '#888888' }} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onAddCard(column.id)}
                className="h-8 w-8"
              >
                <Plus className="w-4 h-4" style={{ color: '#753991' }} />
              </Button>
            </div>
          </div>
        )}
      </div>

      <SortableContext
        items={column.cards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 p-3 overflow-y-auto min-h-[200px]">
          {column.cards.map((card) => (
            <CardComponent
              key={card.id}
              card={card}
              onEdit={() => onEditCard(card)}
              onDelete={onCardsChanged}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}
