'use client'

import { createBrowserClient } from '@supabase/ssr'
import { Board, Column, Card } from '@/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const createClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

export async function getBoard(userId: string): Promise<Board | null> {
  const supabase = createClient()
  
  const { data: boards, error } = await supabase
    .from('boards')
    .select('*')
    .eq('user_id', userId)
    .order('position')
    .order('created_at')
    .limit(1)
  
  if (error) {
    console.error('Error fetching board:', error)
    return null
  }
  
  return boards?.[0] || null
}

export async function getBoards(userId: string): Promise<Board[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('user_id', userId)
    .order('position')
    .order('created_at')

  if (error) {
    console.error('Error fetching boards:', error)
    return []
  }

  return data || []
}

export async function getBoardById(boardId: string, userId: string): Promise<Board | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('id', boardId)
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching board:', error)
    return null
  }

  return data
}

export async function createBoard(userId: string, title = 'My Project'): Promise<Board | null> {
  const supabase = createClient()
  const boards = await getBoards(userId)
  
  const { data, error } = await supabase
    .from('boards')
    .insert({ user_id: userId, title, position: boards.length })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating board:', error)
    return null
  }
  
  const defaultColumns = [
    { board_id: data.id, user_id: userId, title: 'To Do', position: 0 },
    { board_id: data.id, user_id: userId, title: 'In Progress', position: 1 },
    { board_id: data.id, user_id: userId, title: 'Done', position: 2 },
  ]
  
  const { error: colError } = await supabase
    .from('columns')
    .insert(defaultColumns)
  
  if (colError) {
    console.error('Error creating columns:', colError)
  }
  
  return data
}

export async function updateBoard(boardId: string, updates: Partial<Board>) {
  const supabase = createClient()

  const { error } = await supabase
    .from('boards')
    .update(updates)
    .eq('id', boardId)

  if (error) {
    console.error('Error updating board:', error)
    throw error
  }
}

export async function deleteBoard(boardId: string) {
  const supabase = createClient()

  const { error: cardsError } = await supabase
    .from('cards')
    .delete()
    .eq('board_id', boardId)

  if (cardsError) {
    console.error('Error deleting board cards:', cardsError)
    throw cardsError
  }

  const { error: columnsError } = await supabase
    .from('columns')
    .delete()
    .eq('board_id', boardId)

  if (columnsError) {
    console.error('Error deleting board columns:', columnsError)
    throw columnsError
  }

  const { error } = await supabase
    .from('boards')
    .delete()
    .eq('id', boardId)

  if (error) {
    console.error('Error deleting board:', error)
    throw error
  }
}

export async function getColumns(boardId: string): Promise<Column[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('columns')
    .select('*')
    .eq('board_id', boardId)
    .order('position')
  
  if (error) {
    console.error('Error fetching columns:', error)
    return []
  }
  
  return data || []
}

export async function updateColumn(columnId: string, updates: Partial<Column>) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('columns')
    .update(updates)
    .eq('id', columnId)
  
  if (error) {
    console.error('Error updating column:', error)
    throw error
  }
}

export async function getCards(boardId: string): Promise<Card[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('board_id', boardId)
    .order('position')
  
  if (error) {
    console.error('Error fetching cards:', error)
    return []
  }
  
  return data || []
}

export async function createCard(card: Omit<Card, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('cards')
    .insert(card)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating card:', error)
    throw error
  }
  
  return data
}

export async function updateCard(cardId: string, updates: Partial<Card>) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('cards')
    .update(updates)
    .eq('id', cardId)
  
  if (error) {
    console.error('Error updating card:', error)
    throw error
  }
}

export async function deleteCard(cardId: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', cardId)
  
  if (error) {
    console.error('Error deleting card:', error)
    throw error
  }
}
