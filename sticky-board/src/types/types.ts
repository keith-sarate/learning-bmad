export type ColumnId = 'todo' | 'inProgress' | 'done';

export interface ColumnConfig {
  id: ColumnId;
  title: string;
  emptyStateText: string;
}

// TODO: Story 2.1 will add Card, BoardState, CardColor, StorageError, BoardContextValue here
