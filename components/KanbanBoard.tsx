'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from '@dnd-kit/core'
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import {
  createBoard,
  createColumn,
  deleteColumn,
  getBoard,
  getBoardById,
  getCards,
  getColumns,
  updateCard,
  updateColumn,
} from '@/lib/supabase'
import { Board, Column, Card, ColumnWithCards } from '@/types'
import { Column as ColumnComponent } from './Column'
import { Card as CardComponent } from './Card'
import { CardModal } from './CardModal'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserMenu } from '@/components/UserMenu'

interface KanbanBoardProps {
  userId: string
  userEmail: string
  boardId?: string
}

export function KanbanBoard({ userId, userEmail, boardId }: KanbanBoardProps) {
  const [board, setBoard] = useState<Board | null>(null)
  const [columns, setColumns] = useState<ColumnWithCards[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCard, setActiveCard] = useState<Card | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<Card | null>(null)
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null)
  const [columnModalOpen, setColumnModalOpen] = useState(false)
  const [columnTitle, setColumnTitle] = useState('')
  const [savingColumn, setSavingColumn] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const loadData = useCallback(async () => {
    let currentBoard = boardId
      ? await getBoardById(boardId, userId)
      : await getBoard(userId)
    
    if (!currentBoard && !boardId) {
      currentBoard = await createBoard(userId)
    }
    
    if (currentBoard) {
      setBoard(currentBoard)
      const cols = await getColumns(currentBoard.id)
      const cards = await getCards(currentBoard.id)
      
      const columnsWithCards: ColumnWithCards[] = cols.map(col => ({
        ...col,
        cards: cards.filter(card => card.column_id === col.id).sort((a, b) => a.position - b.position),
      }))
      
      setColumns(columnsWithCards)
    } else {
      setBoard(null)
      setColumns([])
    }
    setLoading(false)
  }, [boardId, userId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type !== 'Card') {
      return
    }

    const cardId = event.active.id as string
    const card = columns.flatMap(c => c.cards).find(c => c.id === cardId)
    if (card) {
      setActiveCard(card)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveCard(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string
    const activeType = active.data.current?.type

    if (activeType === 'Column') {
      const activeIndex = columns.findIndex(c => c.id === activeId)
      const overIndex = columns.findIndex(c => c.id === overId)

      if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) return

      const reorderedColumns = arrayMove(columns, activeIndex, overIndex).map((column, index) => ({
        ...column,
        position: index,
      }))

      setColumns(reorderedColumns)
      await Promise.all(
        reorderedColumns.map((column) => updateColumn(column.id, { position: column.position }))
      )
      return
    }

    if (activeType !== 'Card') return

    const activeColumn = columns.find(c => c.cards.some(card => card.id === activeId))
    const overColumn = columns.find(c => c.id === overId || c.cards.some(card => card.id === overId))

    if (!activeColumn || !overColumn) return

    const activeCard = activeColumn.cards.find(c => c.id === activeId)
    if (!activeCard) return

    if (activeColumn.id === overColumn.id) {
      const activeIndex = activeColumn.cards.findIndex(c => c.id === activeId)
      const overIndex = overColumn.cards.findIndex(c => c.id === overId)
      
      if (activeIndex !== overIndex) {
        const newCards = arrayMove(activeColumn.cards, activeIndex, overIndex)
        
        setColumns(prev => prev.map(col => {
          if (col.id === activeColumn.id) {
            return { ...col, cards: newCards }
          }
          return col
        }))

        await updateCard(activeId, { position: overIndex })
      }
    } else {
      const overIndex = overId === overColumn.id 
        ? overColumn.cards.length 
        : overColumn.cards.findIndex(c => c.id === overId)

      const newActiveCards = activeColumn.cards.filter(c => c.id !== activeId)
      const newOverCards = [...overColumn.cards]
      newOverCards.splice(overIndex, 0, { ...activeCard, column_id: overColumn.id })

      setColumns(prev => prev.map(col => {
        if (col.id === activeColumn.id) {
          return { ...col, cards: newActiveCards }
        }
        if (col.id === overColumn.id) {
          return { ...col, cards: newOverCards }
        }
        return col
      }))

      await updateCard(activeId, { column_id: overColumn.id, position: overIndex })
    }
  }

  const handleAddCard = (columnId: string) => {
    setSelectedColumnId(columnId)
    setEditingCard(null)
    setModalOpen(true)
  }

  const handleEditCard = (card: Card) => {
    setEditingCard(card)
    setSelectedColumnId(card.column_id)
    setModalOpen(true)
  }

  const handleCardSaved = () => {
    setModalOpen(false)
    setEditingCard(null)
    setSelectedColumnId(null)
    loadData()
  }

  const handleAddColumn = async () => {
    const trimmedTitle = columnTitle.trim()
    if (!board || !trimmedTitle) return

    setSavingColumn(true)
    try {
      await createColumn(board.id, userId, trimmedTitle)
      setColumnTitle('')
      setColumnModalOpen(false)
      await loadData()
    } finally {
      setSavingColumn(false)
    }
  }

  const handleDeleteColumn = async (columnId: string) => {
    const column = columns.find((item) => item.id === columnId)
    if (!column) return

    if (!confirm(`Delete "${column.title}" and all cards in this column?`)) return

    await deleteColumn(columnId)
    const remainingColumns = columns
      .filter((item) => item.id !== columnId)
      .map((item, index) => ({ ...item, position: index }))

    setColumns(remainingColumns)
    await Promise.all(
      remainingColumns.map((item) => updateColumn(item.id, { position: item.position }))
    )
    await loadData()
  }

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: '0.5' } },
    }),
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!board) {
    return (
      <div className="apple-surface flex min-h-screen items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold" style={{ color: '#032147' }}>
            Board not found
          </h1>
          <p className="mt-2 text-sm" style={{ color: '#888888' }}>
            This board does not exist or you do not have access to it.
          </p>
          <Link
            href="/dashboard"
            className="mt-5 inline-flex h-8 items-center justify-center rounded-lg px-2.5 text-sm font-medium text-white"
            style={{ backgroundColor: '#753991' }}
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="apple-surface flex h-screen flex-col">
      <header className="border-b border-border/80 bg-white/85 px-4 py-4 backdrop-blur sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="min-w-0 truncate text-2xl font-semibold tracking-tight" style={{ color: '#032147' }}>
            {board?.title || 'My Project'}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-white px-2.5 text-sm font-medium transition-all hover:border-[#209dd7]/50 hover:bg-muted"
              style={{ color: '#032147' }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Boards
            </Link>
            <Button
              onClick={() => handleAddCard(columns[0]?.id)}
              disabled={!columns[0]}
              style={{ backgroundColor: '#209dd7' }}
              className="text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Card
            </Button>
            <Button
              onClick={() => setColumnModalOpen(true)}
              variant="outline"
              className="bg-white transition-all hover:-translate-y-0.5 hover:shadow-sm"
              style={{ color: '#753991', borderColor: '#753991' }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Column
            </Button>
            <UserMenu email={userEmail} />
          </div>
        </div>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto p-6">
          <SortableContext
            items={columns.map((column) => column.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex h-full gap-6">
            {columns.map((column) => (
              <ColumnComponent
                key={column.id}
                column={column}
                onAddCard={handleAddCard}
                onEditCard={handleEditCard}
                onCardsChanged={loadData}
                onDeleteColumn={handleDeleteColumn}
              />
            ))}
            </div>
          </SortableContext>
        </div>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeCard ? (
            <CardComponent card={activeCard} onEdit={() => {}} onDelete={() => {}} />
          ) : null}
        </DragOverlay>
      </DndContext>

      <CardModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        card={editingCard}
        columnId={selectedColumnId}
        boardId={board?.id}
        userId={userId}
        onSaved={handleCardSaved}
      />

      <Dialog open={columnModalOpen} onOpenChange={setColumnModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: '#032147' }}>
              Add Column
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-3">
            <Label htmlFor="column-title" style={{ color: '#032147' }}>
              Title
            </Label>
            <Input
              id="column-title"
              value={columnTitle}
              onChange={(event) => setColumnTitle(event.target.value)}
              placeholder="Column title"
              autoFocus
              onKeyDown={(event) => {
                if (event.key === 'Enter' && columnTitle.trim()) handleAddColumn()
              }}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setColumnModalOpen(false)} style={{ color: '#888888' }}>
              Cancel
            </Button>
            <Button
              onClick={handleAddColumn}
              disabled={!columnTitle.trim() || savingColumn}
              className="text-white"
              style={{ backgroundColor: '#209dd7' }}
            >
              {savingColumn ? 'Saving...' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
