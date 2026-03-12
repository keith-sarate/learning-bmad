import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Column from './Column';

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  verticalListSortingStrategy: {},
}));
vi.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({ setNodeRef: vi.fn() }),
}));

vi.mock('../../context/BoardContext', () => ({
  useBoardContext: () => ({
    dispatch: vi.fn(),
    boardState: {
      cards: {},
      columns: { todo: [], inProgress: [], done: [] },
      isDragging: false,
      activeDragCardId: null,
    },
    storageError: null,
  }),
}));

describe('Column', () => {
  it('renders column heading with given title', () => {
    render(<Column id="todo" title="To Do" emptyStateText="Your tasks go here" />);
    expect(screen.getByRole('heading', { name: 'To Do' })).toBeInTheDocument();
  });

  it('shows empty state text for non-todo column when no cards', () => {
    render(<Column id="inProgress" title="In Progress" emptyStateText="Drag cards here to start" />);
    expect(screen.getByText('Drag cards here to start')).toBeInTheDocument();
  });

  it('hides empty state when children are provided', () => {
    render(
      <Column id="inProgress" title="In Progress" emptyStateText="Drag cards here to start">
        <div>A card</div>
      </Column>
    );
    expect(screen.queryByText('Drag cards here to start')).not.toBeInTheDocument();
  });

  it('applies column-highlighted class when isHighlighted is true', () => {
    render(<Column id="todo" title="To Do" emptyStateText="Your tasks go here" isHighlighted={true} />);
    const column = document.querySelector('[data-column-id="todo"]');
    expect(column).toHaveClass('column-highlighted');
  });

  it('does NOT apply column-highlighted class when isHighlighted is false', () => {
    render(<Column id="todo" title="To Do" emptyStateText="Your tasks go here" isHighlighted={false} />);
    const column = document.querySelector('[data-column-id="todo"]');
    expect(column).not.toHaveClass('column-highlighted');
  });
});
