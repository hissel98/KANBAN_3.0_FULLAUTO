'use client'

import type { CSSProperties } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card as CardType } from '@/types'
import { Card as CardUI, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2 } from 'lucide-react'
import { deleteCard } from '@/lib/supabase'

interface CardProps {
  card: CardType
  onEdit: () => void
  onDelete: () => void
}

export function Card({ card, onEdit, onDelete }: CardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: 'Card', card },
  })

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    touchAction: 'none',
  }

  const handleDelete = async () => {
    if (confirm('Delete this card?')) {
      await deleteCard(card.id)
      onDelete()
    }
  }

  return (
    <CardUI
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="mb-3 cursor-grab border-white/70 bg-white/95 shadow-sm transition-all duration-200 active:cursor-grabbing hover:-translate-y-0.5 hover:shadow-md"
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="break-words text-sm font-medium leading-5" style={{ color: '#032147' }}>
              {card.title}
            </h4>
            {card.description && (
              <p className="mt-1 line-clamp-2 break-words text-xs leading-5" style={{ color: '#888888' }}>
                {card.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 transition-opacity sm:opacity-0 sm:group-hover/card:opacity-100">
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="h-11 w-11 sm:h-7 sm:w-7"
            >
              <Edit2 className="w-3 h-3" style={{ color: '#209dd7' }} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                handleDelete()
              }}
              className="h-11 w-11 sm:h-7 sm:w-7"
            >
              <Trash2 className="w-3 h-3" style={{ color: '#888888' }} />
            </Button>
          </div>
        </div>
      </CardContent>
    </CardUI>
  )
}
