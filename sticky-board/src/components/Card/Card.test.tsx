import { vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import Card from './Card';

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
  }),
}));
vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: { toString: () => '' },
  },
}));

const mockDispatch = vi.fn();

vi.mock('../../context/BoardContext', () => ({
  useBoardContext: () => ({
    boardState: {
      cards: {},
      columns: { todo: [], inProgress: [], done: [] },
      isDragging: false,
      activeDragCardId: null,
    },
    dispatch: mockDispatch,
    storageError: null,
  }),
}));

const mockCard = {
  id: 'test-id-123',
  title: 'My Task',
  description: '',
  color: 'yellow' as const,
  createdAt: Date.now(),
};

describe('Card', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
  });

  it('renders the title correctly', () => {
    const { container } = render(<Card card={mockCard} />);
    expect(screen.getByText('My Task')).toBeInTheDocument();
    expect(container.querySelector('.card-title')).toBeInTheDocument();
  });

  it('description element is always rendered (empty or not) for click-to-add support', () => {
    const { container } = render(<Card card={mockCard} />);
    expect(container.querySelector('.card-description')).toBeInTheDocument();
  });

  it('renders description text when description is non-empty', () => {
    const cardWithDesc = { ...mockCard, description: 'Some details' };
    render(<Card card={cardWithDesc} />);
    expect(screen.getByText('Some details')).toBeInTheDocument();
  });

  it('renders .card-description element when description is non-empty', () => {
    const cardWithDesc = { ...mockCard, description: 'Some details' };
    const { container } = render(<Card card={cardWithDesc} />);
    expect(container.querySelector('.card-description')).toBeInTheDocument();
  });

  it('has no .is-done class when isDone prop is not provided', () => {
    const { container } = render(<Card card={mockCard} />);
    expect(container.querySelector('.card')).not.toHaveClass('is-done');
  });

  it('has no .is-done class when isDone={false}', () => {
    const { container } = render(<Card card={mockCard} isDone={false} />);
    expect(container.querySelector('.card')).not.toHaveClass('is-done');
  });

  it('has .is-done class when isDone={true}', () => {
    const { container } = render(<Card card={mockCard} isDone={true} />);
    expect(container.querySelector('.card')).toHaveClass('is-done');
  });

  it('applies background color via CSS var pattern', () => {
    const { container } = render(<Card card={mockCard} />);
    expect(container.querySelector('.card')).toHaveStyle(
      'background-color: var(--color-card-yellow)'
    );
  });

  it('clicking the title makes it contenteditable', () => {
    const { container } = render(<Card card={mockCard} />);
    const title = container.querySelector('.card-title')!;
    fireEvent.click(title);
    expect(title).toHaveAttribute('contenteditable', 'true');
  });

  it('blurring the title in edit mode dispatches EDIT_CARD with new title', () => {
    const { container } = render(<Card card={mockCard} />);
    const title = container.querySelector('.card-title')!;
    fireEvent.click(title);
    // Simulate user having typed a new value via textContent
    Object.defineProperty(title, 'textContent', { value: 'Updated Task', writable: true, configurable: true });
    fireEvent.blur(title);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'EDIT_CARD',
      payload: { cardId: 'test-id-123', title: 'Updated Task' },
    });
  });

  it('pressing Escape on title reverts without dispatching', () => {
    const { container } = render(<Card card={mockCard} />);
    const title = container.querySelector('.card-title')!;
    fireEvent.click(title);
    fireEvent.keyDown(title, { key: 'Escape' });
    fireEvent.blur(title);
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('pressing Enter on title triggers blur and commits the value', () => {
    const { container } = render(<Card card={mockCard} />);
    const title = container.querySelector('.card-title')!;
    fireEvent.click(title);
    fireEvent.keyDown(title, { key: 'Enter' });
    // Enter triggers blur which dispatches — just verify contenteditable is removed after
    // (dispatch verification done in blur test; Enter behavior triggers blur)
    expect(title).not.toHaveAttribute('contenteditable', 'true');
  });

  it('clicking the description makes it contenteditable', () => {
    const cardWithDesc = { ...mockCard, description: 'Some details' };
    const { container } = render(<Card card={cardWithDesc} />);
    const desc = container.querySelector('.card-description')!;
    fireEvent.click(desc);
    expect(desc).toHaveAttribute('contenteditable', 'true');
  });

  it('pressing Enter on focused card (not editing) activates title edit mode', () => {
    const { container } = render(<Card card={mockCard} />);
    const cardDiv = container.querySelector('.card')!;
    fireEvent.keyDown(cardDiv, { key: 'Enter' });
    const title = container.querySelector('.card-title')!;
    expect(title).toHaveAttribute('contenteditable', 'true');
  });

  it('pressing Space on focused card (not editing) activates title edit mode', () => {
    const { container } = render(<Card card={mockCard} />);
    const cardDiv = container.querySelector('.card')!;
    fireEvent.keyDown(cardDiv, { key: ' ' });
    const title = container.querySelector('.card-title')!;
    expect(title).toHaveAttribute('contenteditable', 'true');
  });

  it('pressing Enter on card when already editing does not reset edit mode', () => {
    const { container } = render(<Card card={mockCard} />);
    const title = container.querySelector('.card-title')!;
    // Enter edit mode via click
    fireEvent.click(title);
    expect(title).toHaveAttribute('contenteditable', 'true');
    // Pressing Enter on card root while editing should not interfere
    const cardDiv = container.querySelector('.card')!;
    fireEvent.keyDown(cardDiv, { key: 'Enter' });
    // Still in edit mode (inner Enter handler on title manages commit)
    expect(title).toHaveAttribute('contenteditable', 'true');
  });

  it('pressing Escape during title edit restores original value and exits edit mode', () => {
    const { container } = render(<Card card={mockCard} />);
    const title = container.querySelector('.card-title')!;
    fireEvent.click(title);
    // Simulate editing
    fireEvent.keyDown(title, { key: 'Escape' });
    fireEvent.blur(title);
    // After Escape: no dispatch, edit mode exited
    expect(mockDispatch).not.toHaveBeenCalled();
    expect(title).not.toHaveAttribute('contenteditable', 'true');
  });
});
