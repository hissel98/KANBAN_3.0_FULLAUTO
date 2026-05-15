export interface Board {
  id: string;
  user_id: string;
  title: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Column {
  id: string;
  board_id: string;
  user_id: string;
  title: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Card {
  id: string;
  board_id: string;
  column_id: string;
  user_id: string;
  title: string;
  description: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface ColumnWithCards extends Column {
  cards: Card[];
}

export interface BoardData extends Board {
  columns: ColumnWithCards[];
}
