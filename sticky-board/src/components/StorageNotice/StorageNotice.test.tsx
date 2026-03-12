import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StorageNotice from './StorageNotice';
import { BoardContext } from '../../context/BoardContext';
import type { BoardContextValue, StorageError } from '../../types/types';
import { boardReducer } from '../../context/BoardReducer';

const emptyBoardState = {
  cards: {},
  columns: { todo: [], inProgress: [], done: [] },
  isDragging: false,
  activeDragCardId: null,
};

function renderWithStorageError(storageError: StorageError | null) {
  const value: BoardContextValue = {
    boardState: emptyBoardState,
    dispatch: () => {},
    storageError,
  };
  // Use the real reducer but provide a dummy dispatch to satisfy the type
  void boardReducer;
  return render(
    <BoardContext.Provider value={value}>
      <StorageNotice />
    </BoardContext.Provider>
  );
}

describe('StorageNotice', () => {
  it('renders nothing when storageError is null', () => {
    const { container } = renderWithStorageError(null);
    expect(container.firstChild).toBeNull();
  });

  it('renders UNAVAILABLE message when storageError is "UNAVAILABLE"', () => {
    renderWithStorageError('UNAVAILABLE');
    expect(
      screen.getByText(/private browsing detected/i)
    ).toBeInTheDocument();
  });

  it('renders QUOTA_EXCEEDED message when storageError is "QUOTA_EXCEEDED"', () => {
    renderWithStorageError('QUOTA_EXCEEDED');
    expect(
      screen.getByText(/storage is full/i)
    ).toBeInTheDocument();
  });

  it('renders nothing when storageError is "CORRUPT" (silent recovery)', () => {
    const { container } = renderWithStorageError('CORRUPT');
    expect(container.firstChild).toBeNull();
  });

  it('has role="status" on the notice element for UNAVAILABLE', () => {
    renderWithStorageError('UNAVAILABLE');
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has role="status" on the notice element for QUOTA_EXCEEDED', () => {
    renderWithStorageError('QUOTA_EXCEEDED');
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
