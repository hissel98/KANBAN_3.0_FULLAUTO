'use client'

import type { CSSProperties } from 'react'
import { useState } from 'react'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ColumnWithCards, Card } from '@/types'
import { Card as CardComponent } from './Card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Edit2, Check, X, GripVertical, Trash2 } from 'lucide-react'
import { updateColumn } from '@/lib/supabase'

interface ColumnProps {
  column: ColumnWithCards
  onAddCard: (columnId: string) => void
  onEditCard: (card: Card) => void
  onCardsChanged: () => void
  onDeleteColumn: (columnId: string) => void
}

export function Column({ column, onAddCard, onEditCard, onCardsChanged, onDeleteColumn }: ColumnProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(column.title)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: 'Column', column },
  })

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  }

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
      style={style}
      className="flex w-[min(84vw,20rem)] flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-white/75 bg-white/72 shadow-[0_18px_48px_rgb(3_33_71/0.08)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_64px_rgb(3_33_71/0.13)] sm:w-80"
    >
      <div className="border-b border-white/75 bg-white/80 p-4">
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
            <div className="flex min-w-0 items-center gap-2">
              <Button
                size="icon-sm"
                variant="ghost"
                className="h-11 w-11 cursor-grab active:cursor-grabbing sm:h-8 sm:w-8"
                aria-label={`Reorder ${column.title}`}
                {...attributes}
                {...listeners}
              >
                <GripVertical className="w-4 h-4" style={{ color: '#888888' }} />
              </Button>
              <h3 className="truncate font-semibold tracking-tight" style={{ color: '#032147' }}>
                {column.title}
              </h3>
            </div>
            <span className="mr-1 rounded-full bg-[#209dd7]/10 px-2 py-0.5 text-xs font-semibold" style={{ color: '#209dd7' }}>
              {column.cards.length}
            </span>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-11 w-11 sm:h-8 sm:w-8"
              >
                <Edit2 className="w-4 h-4" style={{ color: '#888888' }} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onAddCard(column.id)}
                className="h-11 w-11 sm:h-8 sm:w-8"
              >
                <Plus className="w-4 h-4" style={{ color: '#753991' }} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onDeleteColumn(column.id)}
                className="h-11 w-11 sm:h-8 sm:w-8"
              >
                <Trash2 className="w-4 h-4" style={{ color: '#888888' }} />
              </Button>
            </div>
          </div>
        )}
      </div>

      <SortableContext
        items={column.cards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="min-h-[200px] flex-1 overflow-y-auto bg-white/30 p-3">
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
