export type ColumnId = 'todo' | 'inProgress' | 'done';

export interface ColumnConfig {
  id: ColumnId;
  title: string;
  emptyStateText: string;
}

export type CardColor = 'yellow' | 'pink' | 'blue' | 'green' | 'orange' | 'purple';

export interface Card {
  id: string;
  title: string;
  description: string;
  color: CardColor;
  createdAt: number;
}

export interface BoardState {
  cards: Record<string, Card>;
  columns: {
    todo: string[];
    inProgress: string[];
    done: string[];
  };
  isDragging: boolean;
  activeDragCardId: string | null;
}

export type StorageError = 'QUOTA_EXCEEDED' | 'UNAVAILABLE' | 'CORRUPT';

export type BoardAction =
  | { type: 'ADD_CARD'; payload: { card: Card; columnId: ColumnId } }
  | { type: 'MOVE_CARD'; payload: { cardId: string; fromColumn: ColumnId; toColumn: ColumnId; toIndex: number } }
  | { type: 'EDIT_CARD'; payload: { cardId: string; title?: string; description?: string } }
  | { type: 'DELETE_CARD'; payload: { cardId: string } }
  | { type: 'REORDER_CARD'; payload: { columnId: ColumnId; fromIndex: number; toIndex: number } }
  | { type: 'SET_DRAGGING'; payload: { cardId: string } }
  | { type: 'CLEAR_DRAGGING' };

export interface BoardContextValue {
  boardState: BoardState;
  dispatch: (action: BoardAction) => void;
  storageError: StorageError | null;
}
