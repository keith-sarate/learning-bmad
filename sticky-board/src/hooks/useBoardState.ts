import { useReducer, useEffect, useState } from 'react';
import { boardReducer } from '../context/BoardReducer';
import { boardService } from '../services/boardService';
import type { BoardContextValue, StorageError } from '../types/types';

export function useBoardState(): BoardContextValue {
  const [boardState, dispatch] = useReducer(boardReducer, undefined, () => {
    const result = boardService.load();
    return result.data;
  });
  const [storageError, setStorageError] = useState<StorageError | null>(null);

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
