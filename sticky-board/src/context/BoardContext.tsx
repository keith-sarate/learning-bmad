import { createContext, useContext, type ReactNode } from 'react';
import type { BoardContextValue } from '../types/types';
import { useBoardState } from '../hooks/useBoardState';

export const BoardContext = createContext<BoardContextValue | null>(null);

export function BoardProvider({ children }: { children: ReactNode }) {
  const value = useBoardState();
  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
}

export function useBoardContext(): BoardContextValue {
  const context = useContext(BoardContext);
  if (context === null) {
    throw new Error('useBoardContext must be used within BoardProvider');
  }
  return context;
}
