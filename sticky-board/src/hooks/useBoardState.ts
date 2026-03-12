import { useReducer, useEffect, useState } from 'react';
import { boardReducer } from '../context/BoardReducer';
import { boardService } from '../services/boardService';
import type { BoardContextValue, StorageError } from '../types/types';

export function useBoardState(): BoardContextValue {
  const initialLoadResult = boardService.load();
  const initialState: BoardState = initialLoadResult.ok
    ? initialLoadResult.data
    : { cards: {}, columns: { todo: [], inProgress: [], done: [] }, isDragging: false, activeDragCardId: null };

  const [boardState, dispatch] = useReducer(boardReducer, initialState);
  const [storageError, setStorageError] = useState<StorageError | null>(
    initialLoadResult.ok ? null : initialLoadResult.error
  );

  useEffect(() => {
    const result = boardService.save(boardState);
    if (!result.ok) {
      setStorageError(result.error);
    } else if (storageError !== null) {
      setStorageError(null);
    }
  }, [boardState]); // eslint-disable-line react-hooks/exhaustive-deps

  return { boardState, dispatch, storageError };
}
