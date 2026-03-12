import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

let mockIsDragging = false;
let mockIsOver = false;

vi.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({ setNodeRef: vi.fn(), isOver: mockIsOver }),
}));

vi.mock('../../context/BoardContext', () => ({
  useBoardContext: () => ({
    boardState: {
      cards: {},
      columns: { todo: [], inProgress: [], done: [] },
      isDragging: mockIsDragging,
      activeDragCardId: null,
    },
    dispatch: vi.fn(),
    storageError: null,
  }),
}));

import TrashZone from './TrashZone';

describe('TrashZone', () => {
  afterEach(() => {
    mockIsDragging = false;
    mockIsOver = false;
  });

  it('does NOT render when isDragging is false', () => {
    mockIsDragging = false;
    render(<TrashZone />);
    expect(screen.queryByRole('region', { name: 'Drop here to delete card' })).not.toBeInTheDocument();
  });

  it('renders trash zone when isDragging is true', () => {
    mockIsDragging = true;
    render(<TrashZone />);
    expect(screen.getByRole('region', { name: 'Drop here to delete card' })).toBeInTheDocument();
    expect(screen.getByText('Drop to delete')).toBeInTheDocument();
  });

  it('has correct role="region" and aria-label when visible', () => {
    mockIsDragging = true;
    render(<TrashZone />);
    const zone = screen.getByRole('region', { name: 'Drop here to delete card' });
    expect(zone).toHaveAttribute('aria-label', 'Drop here to delete card');
  });

  it('applies .is-active class when isOver is true', () => {
    mockIsDragging = true;
    mockIsOver = true;
    render(<TrashZone />);
    const zone = screen.getByRole('region', { name: 'Drop here to delete card' });
    expect(zone).toHaveClass('is-active');
  });

  it('does NOT apply .is-active class when isOver is false', () => {
    mockIsDragging = true;
    mockIsOver = false;
    render(<TrashZone />);
    const zone = screen.getByRole('region', { name: 'Drop here to delete card' });
    expect(zone).not.toHaveClass('is-active');
  });
});
