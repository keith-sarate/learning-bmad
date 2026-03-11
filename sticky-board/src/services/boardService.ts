import type { BoardState, StorageError } from '../types/types';

const STORAGE_KEY = 'sticky-board-state';

const emptyBoardState: BoardState = {
  cards: {},
  columns: { todo: [], inProgress: [], done: [] },
  isDragging: false,
  activeDragCardId: null,
};

function isValidCard(card: unknown): boolean {
  if (!card || typeof card !== 'object') return false;
  const c = card as Record<string, unknown>;
  return (
    typeof c.id === 'string' &&
    typeof c.title === 'string' &&
    typeof c.description === 'string' &&
    typeof c.color === 'string' &&
    typeof c.createdAt === 'number'
  );
}

function isValidBoardState(data: unknown): data is Pick<BoardState, 'cards' | 'columns'> {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  if (typeof d.cards !== 'object' || d.cards === null || Array.isArray(d.cards)) return false;
  const cards = d.cards as Record<string, unknown>;
  if (!Object.values(cards).every(isValidCard)) return false;
  if (!d.columns || typeof d.columns !== 'object') return false;
  const cols = d.columns as Record<string, unknown>;
  return Array.isArray(cols.todo) && Array.isArray(cols.inProgress) && Array.isArray(cols.done);
}

function load(): { ok: true; data: BoardState } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return { ok: true, data: emptyBoardState };
    const parsed: unknown = JSON.parse(raw);
    if (!isValidBoardState(parsed)) {
      console.warn('[boardService] Corrupt localStorage data detected. Resetting to empty board.');
      return { ok: true, data: emptyBoardState };
    }
    return { ok: true, data: { ...emptyBoardState, cards: parsed.cards, columns: parsed.columns } };
  } catch {
    console.warn('[boardService] Failed to load board state. Resetting to empty board.');
    return { ok: true, data: emptyBoardState };
  }
}

function save(state: BoardState): { ok: true } | { ok: false; error: StorageError } {
  try {
    const persistable = { cards: state.cards, columns: state.columns };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
    return { ok: true };
  } catch (err) {
    if (
      err instanceof DOMException &&
      (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    ) {
      return { ok: false, error: 'QUOTA_EXCEEDED' };
    }
    return { ok: false, error: 'UNAVAILABLE' };
  }
}

export const boardService = { load, save };
