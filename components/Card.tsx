'use client'

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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
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
      className="mb-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm" style={{ color: '#032147' }}>
              {card.title}
            </h4>
            {card.description && (
              <p className="text-xs mt-1 line-clamp-2" style={{ color: '#888888' }}>
                {card.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="h-6 w-6"
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
              className="h-6 w-6"
            >
              <Trash2 className="w-3 h-3" style={{ color: '#888888' }} />
            </Button>
          </div>
        </div>
      </CardContent>
    </CardUI>
  )
}
