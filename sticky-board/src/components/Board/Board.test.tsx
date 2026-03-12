import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('roughjs', () => ({
  default: {
    svg: () => ({ rectangle: () => document.createElementNS('http://www.w3.org/2000/svg', 'rect') }),
  },
}));

vi.mock('../../context/BoardContext', () => ({
  useBoardContext: () => ({
    boardState: {
      cards: {},
      columns: { todo: [], inProgress: [], done: [] },
      isDragging: false,
      activeDragCardId: null,
    },
    dispatch: vi.fn(),
    storageError: null,
  }),
}));

vi.mock('../CardCreationPad/CardCreationPad', () => ({
  default: () => <div data-testid="card-creation-pad" />,
}));

import Board from './Board';

describe('Board', () => {
  it('renders three column headings with DndContext mounted', () => {
    render(<Board />);
    expect(screen.getByRole('heading', { name: 'To Do' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'In Progress' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Done' })).toBeInTheDocument();
  });
});
