import type { BoardState, BoardAction } from '../types/types';

export const initialBoardState: BoardState = {
  cards: {},
  columns: { todo: [], inProgress: [], done: [] },
  isDragging: false,
  activeDragCardId: null,
};

export function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case 'ADD_CARD': {
      const { card, columnId } = action.payload;
      return {
        ...state,
        cards: { ...state.cards, [card.id]: card },
        columns: {
          ...state.columns,
          [columnId]: [card.id, ...state.columns[columnId]],
        },
      };
    }

    case 'MOVE_CARD': {
      const { cardId, fromColumn, toColumn, toIndex } = action.payload;
      const sourceArr = state.columns[fromColumn].filter((id) => id !== cardId);

      if (fromColumn === toColumn) {
        const reordered = [...sourceArr.slice(0, toIndex), cardId, ...sourceArr.slice(toIndex)];
        return {
          ...state,
          columns: {
            ...state.columns,
            [fromColumn]: reordered,
          },
        };
      }

      const targetArr = [
        ...state.columns[toColumn].slice(0, toIndex),
        cardId,
        ...state.columns[toColumn].slice(toIndex),
      ];
      return {
        ...state,
        columns: {
          ...state.columns,
          [fromColumn]: sourceArr,
          [toColumn]: targetArr,
        },
      };
    }

    case 'EDIT_CARD': {
      const { cardId, title, description } = action.payload;
      const existingCard = state.cards[cardId];
      if (!existingCard) return state;
      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: {
            ...existingCard,
            ...(title !== undefined ? { title } : {}),
            ...(description !== undefined ? { description } : {}),
          },
        },
      };
    }

    case 'DELETE_CARD': {
      const { cardId } = action.payload;
      const { [cardId]: _removed, ...remainingCards } = state.cards;
      return {
        ...state,
        cards: remainingCards,
        columns: {
          todo: state.columns.todo.filter((id) => id !== cardId),
          inProgress: state.columns.inProgress.filter((id) => id !== cardId),
          done: state.columns.done.filter((id) => id !== cardId),
        },
      };
    }

    case 'REORDER_CARD': {
      const { columnId, fromIndex, toIndex } = action.payload;
      const arr = [...state.columns[columnId]];
      const [moved] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, moved);
      return {
        ...state,
        columns: { ...state.columns, [columnId]: arr },
      };
    }

    case 'SET_DRAGGING': {
      return { ...state, isDragging: true, activeDragCardId: action.payload.cardId };
    }

    case 'CLEAR_DRAGGING': {
      return { ...state, isDragging: false, activeDragCardId: null };
    }

    default:
      return state;
  }
}

export default boardReducer;
