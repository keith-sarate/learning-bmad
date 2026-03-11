import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CardCreationPad from './CardCreationPad';

const mockDispatch = vi.fn();

vi.mock('../../context/BoardContext', () => ({
  useBoardContext: () => ({
    dispatch: mockDispatch,
    boardState: {
      cards: {},
      columns: { todo: [], inProgress: [], done: [] },
      isDragging: false,
      activeDragCardId: null,
    },
    storageError: null,
  }),
}));

beforeEach(() => {
  vi.stubGlobal('crypto', { randomUUID: () => 'a1b2c3d4-e5f6-4789-8abc-def012345678' });
  mockDispatch.mockClear();
});

describe('CardCreationPad', () => {
  it('clicking the creation pad shows the ColorPicker', async () => {
    const user = userEvent.setup();
    render(<CardCreationPad />);

    await user.click(screen.getByRole('button', { name: 'Create a new card' }));

    expect(screen.getByRole('menu', { name: 'Choose card color' })).toBeInTheDocument();
  });

  it('clicking the [+] button shows the ColorPicker', async () => {
    const user = userEvent.setup();
    render(<CardCreationPad />);

    await user.click(screen.getByRole('button', { name: 'Add a new card' }));

    expect(screen.getByRole('menu', { name: 'Choose card color' })).toBeInTheDocument();
  });

  it('clicking a color swatch transitions to card-creating state and hides the ColorPicker', async () => {
    const user = userEvent.setup();
    render(<CardCreationPad />);

    await user.click(screen.getByRole('button', { name: 'Create a new card' }));
    await user.click(screen.getByLabelText('Create blue card'));

    expect(screen.queryByRole('menu', { name: 'Choose card color' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('New card title')).toBeInTheDocument();
  });

  it('typing a title and blurring dispatches ADD_CARD with correct payload', async () => {
    const user = userEvent.setup();
    render(<CardCreationPad />);

    await user.click(screen.getByRole('button', { name: 'Create a new card' }));
    await user.click(screen.getByLabelText('Create yellow card'));

    const input = screen.getByLabelText('New card title');
    await user.type(input, 'My test card');
    await user.tab();

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'ADD_CARD',
      payload: {
        card: {
          id: 'a1b2c3d4-e5f6-4789-8abc-def012345678',
          title: 'My test card',
          description: '',
          color: 'yellow',
          createdAt: expect.any(Number),
        },
        columnId: 'todo',
      },
    });
  });

  it('blurring with empty title does not dispatch ADD_CARD', async () => {
    const user = userEvent.setup();
    render(<CardCreationPad />);

    await user.click(screen.getByRole('button', { name: 'Create a new card' }));
    await user.click(screen.getByLabelText('Create pink card'));

    const input = screen.getByLabelText('New card title');
    await user.click(input);
    await user.tab();

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('pressing Escape cancels creation without dispatching ADD_CARD', async () => {
    const user = userEvent.setup();
    render(<CardCreationPad />);

    await user.click(screen.getByRole('button', { name: 'Create a new card' }));
    await user.click(screen.getByLabelText('Create green card'));

    const input = screen.getByLabelText('New card title');
    await user.type(input, 'Some text');
    await user.keyboard('{Escape}');

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('card ID in dispatched action is the stubbed UUID', async () => {
    const user = userEvent.setup();
    render(<CardCreationPad />);

    await user.click(screen.getByRole('button', { name: 'Create a new card' }));
    await user.click(screen.getByLabelText('Create orange card'));

    const input = screen.getByLabelText('New card title');
    await user.type(input, 'Card with UUID');
    await user.tab();

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    const dispatchedCard = mockDispatch.mock.calls[0][0].payload.card;
    expect(dispatchedCard.id).toBe('a1b2c3d4-e5f6-4789-8abc-def012345678');
    expect(dispatchedCard.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
  });
});
