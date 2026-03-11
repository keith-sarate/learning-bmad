import { describe, it, expect } from 'vitest';
import { boardReducer, initialBoardState } from './BoardReducer';
import type { BoardState, Card } from '../types/types';

const makeCard = (id: string): Card => ({
  id,
  title: `Card ${id}`,
  description: 'desc',
  color: 'yellow',
  createdAt: Date.now(),
});

const stateWithCards: BoardState = {
  cards: {
    'c1': makeCard('c1'),
    'c2': makeCard('c2'),
    'c3': makeCard('c3'),
  },
  columns: {
    todo: ['c1', 'c2'],
    inProgress: ['c3'],
    done: [],
  },
  isDragging: false,
  activeDragCardId: null,
};

describe('boardReducer', () => {
  it('returns initial state as a new object when given undefined (via ADD_CARD baseline)', () => {
    const card = makeCard('new');
    const result = boardReducer(initialBoardState, { type: 'ADD_CARD', payload: { card, columnId: 'todo' } });
    expect(result).not.toBe(initialBoardState);
  });

  describe('ADD_CARD', () => {
    it('adds card to cards map', () => {
      const card = makeCard('new-1');
      const result = boardReducer(initialBoardState, { type: 'ADD_CARD', payload: { card, columnId: 'todo' } });
      expect(result.cards['new-1']).toEqual(card);
    });

    it('prepends card id to the target column', () => {
      const card = makeCard('new-2');
      const result = boardReducer(stateWithCards, { type: 'ADD_CARD', payload: { card, columnId: 'todo' } });
      expect(result.columns.todo[0]).toBe('new-2');
      expect(result.columns.todo).toContain('c1');
      expect(result.columns.todo).toContain('c2');
    });

    it('returns a new state object reference', () => {
      const card = makeCard('new-3');
      const result = boardReducer(stateWithCards, { type: 'ADD_CARD', payload: { card, columnId: 'inProgress' } });
      expect(result).not.toBe(stateWithCards);
    });
  });

  describe('MOVE_CARD', () => {
    it('removes card from source column and inserts at target index in target column', () => {
      const result = boardReducer(stateWithCards, {
        type: 'MOVE_CARD',
        payload: { cardId: 'c1', fromColumn: 'todo', toColumn: 'inProgress', toIndex: 0 },
      });
      expect(result.columns.todo).not.toContain('c1');
      expect(result.columns.inProgress[0]).toBe('c1');
    });

    it('inserts at correct index', () => {
      const state: BoardState = {
        ...stateWithCards,
        columns: { ...stateWithCards.columns, inProgress: ['c3', 'c2'] },
        cards: { ...stateWithCards.cards, c2: makeCard('c2') },
      };
      const result = boardReducer(state, {
        type: 'MOVE_CARD',
        payload: { cardId: 'c1', fromColumn: 'todo', toColumn: 'inProgress', toIndex: 1 },
      });
      expect(result.columns.inProgress).toEqual(['c3', 'c1', 'c2']);
    });

    it('treats same source and target as reorder', () => {
      const result = boardReducer(stateWithCards, {
        type: 'MOVE_CARD',
        payload: { cardId: 'c1', fromColumn: 'todo', toColumn: 'todo', toIndex: 1 },
      });
      expect(result.columns.todo).toEqual(['c2', 'c1']);
    });

    it('returns a new state object reference', () => {
      const result = boardReducer(stateWithCards, {
        type: 'MOVE_CARD',
        payload: { cardId: 'c1', fromColumn: 'todo', toColumn: 'done', toIndex: 0 },
      });
      expect(result).not.toBe(stateWithCards);
    });
  });

  describe('EDIT_CARD', () => {
    it('updates title only when only title is provided', () => {
      const result = boardReducer(stateWithCards, {
        type: 'EDIT_CARD',
        payload: { cardId: 'c1', title: 'New Title' },
      });
      expect(result.cards['c1'].title).toBe('New Title');
      expect(result.cards['c1'].description).toBe(stateWithCards.cards['c1'].description);
    });

    it('updates description only when only description is provided', () => {
      const result = boardReducer(stateWithCards, {
        type: 'EDIT_CARD',
        payload: { cardId: 'c1', description: 'New Desc' },
      });
      expect(result.cards['c1'].description).toBe('New Desc');
      expect(result.cards['c1'].title).toBe(stateWithCards.cards['c1'].title);
    });

    it('does not mutate other cards', () => {
      const result = boardReducer(stateWithCards, {
        type: 'EDIT_CARD',
        payload: { cardId: 'c1', title: 'Updated' },
      });
      expect(result.cards['c2']).toBe(stateWithCards.cards['c2']);
    });

    it('returns the original state reference when cardId does not exist', () => {
      const result = boardReducer(stateWithCards, {
        type: 'EDIT_CARD',
        payload: { cardId: 'nonexistent', title: 'Ghost' },
      });
      expect(result).toBe(stateWithCards);
    });

    it('returns a new state object reference', () => {
      const result = boardReducer(stateWithCards, {
        type: 'EDIT_CARD',
        payload: { cardId: 'c1', title: 'X' },
      });
      expect(result).not.toBe(stateWithCards);
    });
  });

  describe('DELETE_CARD', () => {
    it('removes card from cards map', () => {
      const result = boardReducer(stateWithCards, {
        type: 'DELETE_CARD',
        payload: { cardId: 'c1' },
      });
      expect(result.cards['c1']).toBeUndefined();
    });

    it('removes card from its column array', () => {
      const result = boardReducer(stateWithCards, {
        type: 'DELETE_CARD',
        payload: { cardId: 'c1' },
      });
      expect(result.columns.todo).not.toContain('c1');
    });

    it('filters from all columns', () => {
      // Put c1 in done too (edge case)
      const state: BoardState = {
        ...stateWithCards,
        columns: {
          todo: ['c1'],
          inProgress: [],
          done: ['c1'], // duplicate to test all-column filtering
        },
      };
      const result = boardReducer(state, { type: 'DELETE_CARD', payload: { cardId: 'c1' } });
      expect(result.columns.todo).not.toContain('c1');
      expect(result.columns.done).not.toContain('c1');
    });

    it('returns a new state object reference', () => {
      const result = boardReducer(stateWithCards, {
        type: 'DELETE_CARD',
        payload: { cardId: 'c1' },
      });
      expect(result).not.toBe(stateWithCards);
    });
  });

  describe('REORDER_CARD', () => {
    it('moves card within a column from fromIndex to toIndex', () => {
      const result = boardReducer(stateWithCards, {
        type: 'REORDER_CARD',
        payload: { columnId: 'todo', fromIndex: 0, toIndex: 1 },
      });
      expect(result.columns.todo).toEqual(['c2', 'c1']);
    });

    it('does not alter other columns', () => {
      const result = boardReducer(stateWithCards, {
        type: 'REORDER_CARD',
        payload: { columnId: 'todo', fromIndex: 0, toIndex: 1 },
      });
      expect(result.columns.inProgress).toEqual(stateWithCards.columns.inProgress);
      expect(result.columns.done).toEqual(stateWithCards.columns.done);
    });

    it('returns a new state object reference', () => {
      const result = boardReducer(stateWithCards, {
        type: 'REORDER_CARD',
        payload: { columnId: 'todo', fromIndex: 0, toIndex: 1 },
      });
      expect(result).not.toBe(stateWithCards);
    });
  });

  describe('SET_DRAGGING', () => {
    it('sets isDragging to true and activeDragCardId to payload cardId', () => {
      const result = boardReducer(stateWithCards, {
        type: 'SET_DRAGGING',
        payload: { cardId: 'c1' },
      });
      expect(result.isDragging).toBe(true);
      expect(result.activeDragCardId).toBe('c1');
    });

    it('does not mutate the input state', () => {
      boardReducer(stateWithCards, { type: 'SET_DRAGGING', payload: { cardId: 'c1' } });
      expect(stateWithCards.isDragging).toBe(false);
      expect(stateWithCards.activeDragCardId).toBeNull();
    });

    it('returns a new state object reference', () => {
      const result = boardReducer(stateWithCards, { type: 'SET_DRAGGING', payload: { cardId: 'c1' } });
      expect(result).not.toBe(stateWithCards);
    });
  });

  describe('CLEAR_DRAGGING', () => {
    const draggingState: BoardState = { ...stateWithCards, isDragging: true, activeDragCardId: 'c1' };

    it('sets isDragging to false and activeDragCardId to null', () => {
      const result = boardReducer(draggingState, { type: 'CLEAR_DRAGGING' });
      expect(result.isDragging).toBe(false);
      expect(result.activeDragCardId).toBeNull();
    });

    it('returns a new state object reference', () => {
      const result = boardReducer(draggingState, { type: 'CLEAR_DRAGGING' });
      expect(result).not.toBe(draggingState);
    });
  });
});
