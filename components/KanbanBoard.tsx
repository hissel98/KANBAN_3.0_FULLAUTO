'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
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
import type { Board, Column as ColumnType, Card, ColumnWithCards } from '@/types'
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
  const columnsRef = useRef<ColumnWithCards[]>([])
  const dragSnapshotRef = useRef<ColumnWithCards[] | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 8 },
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
    const timeout = window.setTimeout(() => {
      void loadData()
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [loadData])

  useEffect(() => {
    columnsRef.current = columns
  }, [columns])

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type !== 'Card') {
      return
    }

    const cardId = event.active.id as string
    const card = columns.flatMap(c => c.cards).find(c => c.id === cardId)
    if (card) {
      dragSnapshotRef.current = columnsRef.current
      setActiveCard(card)
    }
  }

  const reindexCards = (cards: Card[]) =>
    cards.map((card, index) => ({
      ...card,
      position: index,
    }))

  const persistCards = async (cards: Card[]) => {
    await Promise.all(
      cards.map((card) =>
        updateCard(card.id, {
          column_id: card.column_id,
          position: card.position,
        })
      )
    )
  }

  const findColumnForItem = (items: ColumnWithCards[], itemId: string) =>
    items.find(column => column.id === itemId || column.cards.some(card => card.id === itemId))

  const normalizeColumnCards = (items: ColumnWithCards[]) =>
    items.map(column => ({
      ...column,
      cards: reindexCards(column.cards.map(card => ({ ...card, column_id: column.id }))),
    }))

  const moveCardInColumns = (items: ColumnWithCards[], activeId: string, overId: string) => {
    const activeColumn = findColumnForItem(items, activeId)
    const overColumn = findColumnForItem(items, overId)

    if (!activeColumn || !overColumn) return items

    const activeCard = activeColumn.cards.find(card => card.id === activeId)
    if (!activeCard) return items

    if (activeColumn.id === overColumn.id) {
      const activeIndex = activeColumn.cards.findIndex(card => card.id === activeId)
      const overIndex = overId === overColumn.id
        ? activeColumn.cards.length - 1
        : overColumn.cards.findIndex(card => card.id === overId)

      if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) return items

      return normalizeColumnCards(items.map(column => {
        if (column.id !== activeColumn.id) return column
        return { ...column, cards: arrayMove(column.cards, activeIndex, overIndex) }
      }))
    }

    const overIndex = overId === overColumn.id
      ? overColumn.cards.length
      : overColumn.cards.findIndex(card => card.id === overId)
    const destinationIndex = overIndex >= 0 ? overIndex : overColumn.cards.length

    return normalizeColumnCards(items.map(column => {
      if (column.id === activeColumn.id) {
        return { ...column, cards: column.cards.filter(card => card.id !== activeId) }
      }

      if (column.id === overColumn.id) {
        const destinationCards = [...column.cards]
        destinationCards.splice(destinationIndex, 0, { ...activeCard, column_id: overColumn.id })
        return { ...column, cards: destinationCards }
      }

      return column
    }))
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event

    if (!over || active.data.current?.type !== 'Card') return

    const activeId = active.id as string
    const overId = over.id as string

    setColumns(prev => {
      const next = moveCardInColumns(prev, activeId, overId)
      columnsRef.current = next
      return next
    })
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveCard(null)

    if (!over) {
      if (dragSnapshotRef.current) {
        setColumns(dragSnapshotRef.current)
        columnsRef.current = dragSnapshotRef.current
      }
      dragSnapshotRef.current = null
      return
    }

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

    if (activeType !== 'Card') {
      dragSnapshotRef.current = null
      return
    }

    const finalColumns = moveCardInColumns(columnsRef.current, activeId, overId)
    const finalCards = finalColumns.flatMap(column => column.cards)

    setColumns(finalColumns)
    columnsRef.current = finalColumns
    dragSnapshotRef.current = null

    try {
      await persistCards(finalCards)
    } catch (error) {
      console.error('Error moving card:', error)
      await loadData()
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

  const handleColumnUpdated = (columnId: string, updates: Partial<ColumnType>) => {
    setColumns(prev =>
      prev.map(col =>
        col.id === columnId ? { ...col, ...updates } : col
      )
    )
  }

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: '0.5' } },
    }),
  }

  if (loading) {
    return <div className="apple-surface flex h-dvh items-center justify-center font-medium" style={{ color: '#888888' }}>Loading...</div>
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
            href="/dashboard/"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl px-3 text-sm font-semibold text-white"
            style={{ backgroundColor: '#753991' }}
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="apple-surface flex h-dvh flex-col overflow-hidden">
      <header className="relative z-50 border-b border-white/70 bg-white/80 px-4 py-5 shadow-sm backdrop-blur-xl sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="min-w-0 truncate text-3xl font-semibold tracking-tight" style={{ color: '#032147' }}>
            {board?.title || 'My Project'}
          </h1>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
            <Link
              href="/dashboard/"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-white/85 px-3 text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#209dd7]/50 hover:bg-white hover:shadow-md sm:h-10"
              style={{ color: '#032147' }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Boards
            </Link>
            <Button
              onClick={() => handleAddCard(columns[0]?.id)}
              disabled={!columns[0]}
              style={{ backgroundColor: '#209dd7' }}
              className="h-11 text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:h-10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Card
            </Button>
            <Button
              onClick={() => setColumnModalOpen(true)}
              variant="outline"
              className="h-11 bg-white/85 transition-all hover:-translate-y-0.5 hover:shadow-md sm:h-10"
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
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={() => {
          if (dragSnapshotRef.current) {
            setColumns(dragSnapshotRef.current)
            columnsRef.current = dragSnapshotRef.current
          }
          dragSnapshotRef.current = null
          setActiveCard(null)
        }}
      >
        <div className="flex-1 touch-pan-x overflow-x-auto overscroll-x-contain px-3 py-5 sm:px-6 sm:py-7">
          <SortableContext
            items={columns.map((column) => column.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex h-full min-w-max gap-4 pr-3 sm:gap-6 sm:pr-6">
            {columns.map((column) => (
              <ColumnComponent
                key={column.id}
                column={column}
                onAddCard={handleAddCard}
                onEditCard={handleEditCard}
                onCardsChanged={loadData}
                onDeleteColumn={handleDeleteColumn}
                onColumnUpdated={handleColumnUpdated}
              />
            ))}
            </div>
          </SortableContext>
        </div>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeCard ? (
            <CardComponent card={activeCard} onEdit={() => {}} onDelete={() => {}} dragOverlay />
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
        <DialogContent className="max-h-[calc(100dvh-1rem)] overflow-y-auto sm:max-w-md">
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
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setColumnModalOpen(false)} className="h-11" style={{ color: '#888888' }}>
              Cancel
            </Button>
            <Button
              onClick={handleAddColumn}
              disabled={!columnTitle.trim() || savingColumn}
              className="h-11 text-white"
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
