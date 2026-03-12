import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { boardService } from './boardService';
import type { BoardState } from '../types/types';

const mockStorage: Record<string, string> = {};

beforeEach(() => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => mockStorage[key] ?? null);
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
    mockStorage[key] = value as string;
  });
  vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => {
    delete mockStorage[key];
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
});

const emptyBoardState: BoardState = {
  cards: {},
  columns: { todo: [], inProgress: [], done: [] },
  isDragging: false,
  activeDragCardId: null,
};

const STORAGE_KEY = 'sticky-board-state';

describe('boardService.load()', () => {
  it('returns emptyBoardState when no stored data exists', () => {
    const result = boardService.load();
    expect(result).toEqual({ ok: true, data: emptyBoardState });
  });

  it('returns stored BoardState when valid data exists', () => {
    const validState = {
      cards: {
        'card-1': {
          id: 'card-1',
          title: 'Test Card',
          description: 'desc',
          color: 'yellow' as const,
          createdAt: 1000,
        },
      },
      columns: { todo: ['card-1'], inProgress: [], done: [] },
    };
    mockStorage[STORAGE_KEY] = JSON.stringify(validState);

    const result = boardService.load();
    expect(result.ok).toBe(true);
    expect(result.data.cards).toEqual(validState.cards);
    expect(result.data.columns).toEqual(validState.columns);
    expect(result.data.isDragging).toBe(false);
    expect(result.data.activeDragCardId).toBeNull();
  });

  it('returns emptyBoardState and warns when JSON is corrupt', () => {
    mockStorage[STORAGE_KEY] = 'not valid json{{{';
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = boardService.load();
    expect(result).toEqual({ ok: true, data: emptyBoardState });
    expect(warnSpy).toHaveBeenCalled();
  });

  it('returns emptyBoardState and warns when data structure is invalid', () => {
    mockStorage[STORAGE_KEY] = JSON.stringify({ cards: null });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = boardService.load();
    expect(result).toEqual({ ok: true, data: emptyBoardState });
    expect(warnSpy).toHaveBeenCalled();
  });

  it('returns emptyBoardState and warns when columns are missing', () => {
    mockStorage[STORAGE_KEY] = JSON.stringify({ cards: {} });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = boardService.load();
    expect(result).toEqual({ ok: true, data: emptyBoardState });
    expect(warnSpy).toHaveBeenCalled();
  });

  it('returns emptyBoardState and warns when a card has an invalid shape', () => {
    mockStorage[STORAGE_KEY] = JSON.stringify({
      cards: { 'c1': 'not-an-object' },
      columns: { todo: ['c1'], inProgress: [], done: [] },
    });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = boardService.load();
    expect(result).toEqual({ ok: true, data: emptyBoardState });
    expect(warnSpy).toHaveBeenCalled();
  });

  it('returns emptyBoardState and warns when localStorage.getItem throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError: blocked by browser policy');
    });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = boardService.load();
    expect(result).toEqual({ ok: true, data: emptyBoardState });
    expect(warnSpy).toHaveBeenCalled();
  });

  it('returns { ok: false, error: "UNAVAILABLE" } when localStorage.setItem throws a SecurityError (private browsing)', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      const err = new DOMException('SecurityError', 'SecurityError');
      throw err;
    });

    const result = boardService.load();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('UNAVAILABLE');
    }
  });
});

describe('boardService.save()', () => {
  it('saves valid state and returns { ok: true }', () => {
    const result = boardService.save(emptyBoardState);
    expect(result).toEqual({ ok: true });
    expect(mockStorage[STORAGE_KEY]).toBeDefined();
  });

  it('persisted data contains cards and columns', () => {
    const state: BoardState = {
      ...emptyBoardState,
      cards: {
        'card-1': {
          id: 'card-1',
          title: 'Hello',
          description: '',
          color: 'blue',
          createdAt: 999,
        },
      },
      columns: { todo: ['card-1'], inProgress: [], done: [] },
    };
    boardService.save(state);
    const saved = JSON.parse(mockStorage[STORAGE_KEY]);
    expect(saved.cards).toEqual(state.cards);
    expect(saved.columns).toEqual(state.columns);
  });

  it('does NOT persist isDragging or activeDragCardId', () => {
    const state: BoardState = {
      ...emptyBoardState,
      isDragging: true,
      activeDragCardId: 'card-99',
    };
    boardService.save(state);
    const saved = JSON.parse(mockStorage[STORAGE_KEY]);
    expect(saved.isDragging).toBeUndefined();
    expect(saved.activeDragCardId).toBeUndefined();
  });

  it('returns QUOTA_EXCEEDED when localStorage throws QuotaExceededError', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError', 'QuotaExceededError');
    });

    const result = boardService.save(emptyBoardState);
    expect(result).toEqual({ ok: false, error: 'QUOTA_EXCEEDED' });
  });

  it('returns UNAVAILABLE when localStorage throws a generic error', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage unavailable');
    });

    const result = boardService.save(emptyBoardState);
    expect(result).toEqual({ ok: false, error: 'UNAVAILABLE' });
  });

  it('returns QUOTA_EXCEEDED when localStorage throws NS_ERROR_DOM_QUOTA_REACHED (Firefox)', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('NS_ERROR_DOM_QUOTA_REACHED', 'NS_ERROR_DOM_QUOTA_REACHED');
    });

    const result = boardService.save(emptyBoardState);
    expect(result).toEqual({ ok: false, error: 'QUOTA_EXCEEDED' });
  });
});
