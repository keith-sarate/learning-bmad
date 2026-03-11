# Story 2.1: Board State Management & Persistence Foundation

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want my board state to be automatically saved to my browser and fully restored when I return,
So that my tasks are never lost across page refreshes or browser restarts.

## Acceptance Criteria

1. **Given** `src/types/types.ts` exists **When** inspected **Then** it exports `Card`, `BoardState`, `CardColor`, `ColumnId`, `StorageError`, and `BoardContextValue` interfaces (in addition to the existing `ColumnConfig` type) — and no component file locally redefines any of these types

2. **Given** `src/services/boardService.ts` exists and `boardService.load()` is called with valid localStorage data **When** executed **Then** it returns `{ ok: true, data: BoardState }` with the full board state — no throw

3. **Given** `boardService.load()` is called with no existing localStorage entry **When** executed **Then** it returns `{ ok: true, data: emptyBoardState }` where all three column arrays are empty and `cards` is an empty object

4. **Given** localStorage contains invalid or corrupt JSON **When** `boardService.load()` is called **Then** it returns `{ ok: true, data: emptyBoardState }`, calls `console.warn`, and does not throw an exception

5. **Given** `boardService.save(state)` is called with a valid `BoardState` **When** executed **Then** the `cards` and `columns` portions of board state are written to localStorage as valid JSON in a single synchronous operation — no partial writes; drag state fields (`isDragging`, `activeDragCardId`) are NOT persisted

6. **Given** `src/context/BoardReducer.ts` exists **When** the reducer handles `ADD_CARD`, `MOVE_CARD`, `EDIT_CARD`, `DELETE_CARD`, `REORDER_CARD`, `SET_DRAGGING`, or `CLEAR_DRAGGING` actions **Then** each returns a new immutable state object — the previous state object is never mutated

7. **Given** `src/hooks/useBoardState.ts` exists and a component (`BoardProvider`) calls `useBoardState()` **When** board state changes **Then** `boardService.save(newState)` is called via a `useEffect` watching `boardState` — no component calls `localStorage` directly

8. **Given** the app is loaded, used to create/modify cards, and then the page is refreshed **When** the board renders after refresh **Then** all cards, their column assignments, order, colors, titles, and descriptions are identical to the pre-refresh state (this will be verifiable once Story 2.2 adds card creation)

## Tasks / Subtasks

- [x] Task 1 — Extend `src/types/types.ts` with all Story 2.1 types (AC: #1)
  - [x] Remove the `// TODO: Story 2.1 will add ...` comment at the bottom of the file
  - [x] Add `type CardColor = 'yellow' | 'pink' | 'blue' | 'green' | 'orange' | 'purple'`
  - [x] Add `interface Card { id: string; title: string; description: string; color: CardColor; createdAt: number }`
  - [x] Add `interface BoardState` with `cards: Record<string, Card>`, `columns: { todo: string[]; inProgress: string[]; done: string[] }`, `isDragging: boolean`, `activeDragCardId: string | null`
  - [x] Add `type StorageError = 'QUOTA_EXCEEDED' | 'UNAVAILABLE' | 'CORRUPT'`
  - [x] Add `type BoardAction` as a discriminated union (see Dev Notes for the exact 7 action shapes)
  - [x] Add `interface BoardContextValue { boardState: BoardState; dispatch: (action: BoardAction) => void; storageError: StorageError | null }`
  - [x] Note: `BoardAction` is defined in `types.ts` (not `BoardReducer.ts`) so `BoardContextValue.dispatch` can be typed without circular imports

- [x] Task 2 — Create `src/services/boardService.ts` (AC: #2, #3, #4, #5)
  - [x] Delete the `.gitkeep` placeholder in `src/services/`
  - [x] Define `STORAGE_KEY = 'sticky-board-state'` constant
  - [x] Define `emptyBoardState: BoardState` with `cards: {}`, `columns: { todo: [], inProgress: [], done: [] }`, `isDragging: false`, `activeDragCardId: null`
  - [x] Implement `isValidBoardState(data: unknown): data is BoardState` type guard — checks for required `cards` (object) and `columns.todo/inProgress/done` (arrays)
  - [x] Implement `load(): { ok: true; data: BoardState }` — wrap in try/catch; use `isValidBoardState` to validate; return `emptyBoardState` + `console.warn` on corrupt/parse failure; return `emptyBoardState` silently on no entry
  - [x] Implement `save(state: BoardState): { ok: true } | { ok: false; error: StorageError }` — serialize ONLY `{ cards: state.cards, columns: state.columns }` (strip drag state); catch `DOMException` for quota exceeded → return `{ ok: false, error: 'QUOTA_EXCEEDED' }`; catch general unavailability → return `{ ok: false, error: 'UNAVAILABLE' }`
  - [x] Export `boardService` object with `load` and `save` methods (or named exports — be consistent)

- [x] Task 3 — Create `src/context/BoardReducer.ts` (AC: #6)
  - [x] Delete the `.gitkeep` placeholder in `src/context/`
  - [x] Import `BoardState`, `BoardAction`, `ColumnId` from `'../types/types'`
  - [x] Define `initialBoardState: BoardState` with all fields including `isDragging: false`, `activeDragCardId: null`
  - [x] Implement pure `boardReducer(state: BoardState, action: BoardAction): BoardState` function using a switch on `action.type`
  - [x] `ADD_CARD`: spread `state.cards` + add new card; spread `state.columns` + prepend card ID to target column array — **always immutable spreads**
  - [x] `MOVE_CARD`: remove `cardId` from source column array, insert at `toIndex` in target column array; if source === target, treat as reorder
  - [x] `EDIT_CARD`: spread cards, spread the target card with updated fields (only update provided fields — title and/or description)
  - [x] `DELETE_CARD`: use object rest to omit card from `cards`; filter card ID from all three column arrays
  - [x] `REORDER_CARD`: reorder within a single column — remove from `fromIndex`, insert at `toIndex`
  - [x] `SET_DRAGGING`: return `{ ...state, isDragging: true, activeDragCardId: action.payload.cardId }`
  - [x] `CLEAR_DRAGGING`: return `{ ...state, isDragging: false, activeDragCardId: null }`
  - [x] Export `boardReducer` as default; export `initialBoardState` as named export
  - [x] No side effects inside the reducer — it is a pure function

- [x] Task 4 — Create `src/context/BoardContext.tsx` (AC: #7, #8)
  - [x] Create file `src/context/BoardContext.tsx` (`.tsx` because it renders JSX in `BoardProvider`)
  - [x] Import from React: `createContext`, `useContext`, `ReactNode`
  - [x] Import `BoardContextValue` from `'../types/types'`
  - [x] Import `useBoardState` from `'../hooks/useBoardState'`
  - [x] Create `BoardContext = createContext<BoardContextValue | null>(null)`
  - [x] Create and export `BoardProvider({ children }: { children: ReactNode })` component that calls `useBoardState()` and provides the result through `BoardContext.Provider`
  - [x] Create and export `useBoardContext()` convenience hook that calls `useContext(BoardContext)` and throws an `Error('useBoardContext must be used within BoardProvider')` if `null`
  - [x] Export `BoardContext` as a named export (for any component that needs direct context access)

- [x] Task 5 — Create `src/hooks/useBoardState.ts` (AC: #7, #8)
  - [x] Delete the `.gitkeep` placeholder in `src/hooks/`
  - [x] Import `useReducer`, `useEffect`, `useState` from `'react'`
  - [x] Import `boardReducer`, `initialBoardState` from `'../context/BoardReducer'`
  - [x] Import `boardService` from `'../services/boardService'`
  - [x] Import `BoardContextValue`, `StorageError` from `'../types/types'`
  - [x] Initialize reducer with lazy init: `useReducer(boardReducer, undefined, () => { const result = boardService.load(); return result.ok ? result.data : initialBoardState; })`
  - [x] Track `storageError` with `useState<StorageError | null>(null)`
  - [x] Add `useEffect` watching `[boardState]`: call `boardService.save(boardState)`; if result is not ok, call `setStorageError(result.error)`; if ok and storageError is set, clear it
  - [x] Return `{ boardState, dispatch, storageError }` typed as `BoardContextValue`
  - [x] **CRITICAL**: No direct `localStorage` access in this hook — only via `boardService`

- [x] Task 6 — Update `src/App.tsx` to use `BoardProvider` (AC: #7, #8)
  - [x] Import `BoardProvider` from `'./context/BoardContext'`
  - [x] Wrap `<Board />` inside `<BoardProvider>`:
    ```tsx
    function App() {
      return (
        <div className="app">
          <BoardProvider>
            <Board />
          </BoardProvider>
        </div>
      );
    }
    ```
  - [x] Note: `StorageNotice` component will be added in Story 4.1 — `storageError` is available in context now but no UI renders it yet
  - [x] Board.tsx does NOT need changes in this story — it does not yet consume the context (that happens in Story 2.2+)

- [x] Task 7 — Write unit tests for `boardService.ts` (AC: #2, #3, #4, #5)
  - [x] Create `src/services/boardService.test.ts`
  - [x] Use `vi.stubGlobal` or `Object.defineProperty` to mock `localStorage` in tests (see Dev Notes for the mock pattern)
  - [x] Test: `load()` with no stored data → returns `{ ok: true, data: emptyBoardState }`
  - [x] Test: `load()` with valid serialized `BoardState` → returns `{ ok: true, data: <that state> }`
  - [x] Test: `load()` with corrupt JSON (e.g., `'not json'`) → returns `{ ok: true, data: emptyBoardState }`, `console.warn` was called
  - [x] Test: `load()` with structurally invalid data (e.g., `'{"cards":null}'`) → returns `{ ok: true, data: emptyBoardState }`, `console.warn` was called
  - [x] Test: `save()` with valid state → localStorage contains the serialized state under the storage key
  - [x] Test: `save()` when `localStorage.setItem` throws `DOMException` with name `'QuotaExceededError'` → returns `{ ok: false, error: 'QUOTA_EXCEEDED' }`
  - [x] Test: `save()` persisted data does NOT contain `isDragging` or `activeDragCardId` fields

- [x] Task 8 — Write unit tests for `boardReducer` (AC: #6)
  - [x] Create `src/context/BoardReducer.test.ts`
  - [x] Test: `ADD_CARD` adds card to `state.cards` and prepends id to correct column array
  - [x] Test: `MOVE_CARD` removes from source column, inserts at correct index in target column
  - [x] Test: `EDIT_CARD` updates only the named fields; unchanged fields remain identical
  - [x] Test: `DELETE_CARD` removes card from `state.cards` and from all column arrays
  - [x] Test: `REORDER_CARD` moves card within a column without altering other columns
  - [x] Test: `SET_DRAGGING` sets `isDragging: true` and `activeDragCardId` to payload; does not mutate input state
  - [x] Test: `CLEAR_DRAGGING` sets `isDragging: false` and `activeDragCardId: null`
  - [x] All tests verify the returned state is a **new object reference** (i.e., `result !== inputState`)

- [x] Task 9 — Run final checks
  - [x] Run `npm run test` from `sticky-board/` — all tests pass (existing + new)
  - [x] Run `npm run build` — no TypeScript or build errors
  - [x] Run `npm run dev` — board renders exactly as before (no visual regressions) — `BoardProvider` wrapping is transparent to the UI at this stage

## Dev Notes

### Architectural Decision: `BoardAction` in `types.ts`

The architecture document places `BoardAction` in `BoardReducer.ts`, but `BoardContextValue` must be in `types.ts` (per AC #1), and it needs `dispatch: (action: BoardAction) => void`. Placing `BoardAction` in `types.ts` prevents circular imports (`types.ts` should not import from `context/`). `BoardReducer.ts` will then import `BoardAction` from `types.ts`. This is the correct resolution.

### Complete `BoardAction` Type

```typescript
type BoardAction =
  | { type: 'ADD_CARD'; payload: { card: Card; columnId: ColumnId } }
  | { type: 'MOVE_CARD'; payload: { cardId: string; fromColumn: ColumnId; toColumn: ColumnId; toIndex: number } }
  | { type: 'EDIT_CARD'; payload: { cardId: string; title?: string; description?: string } }
  | { type: 'DELETE_CARD'; payload: { cardId: string } }
  | { type: 'REORDER_CARD'; payload: { columnId: ColumnId; fromIndex: number; toIndex: number } }
  | { type: 'SET_DRAGGING'; payload: { cardId: string } }
  | { type: 'CLEAR_DRAGGING' };
```

### Drag State in `BoardState` — Why and How

`BoardState` includes `isDragging` and `activeDragCardId` so the reducer can handle `SET_DRAGGING`/`CLEAR_DRAGGING` (required by AC #6) and the `TrashZone` (Story 3.3) can use it later via context. **Important:** `boardService.save()` must NOT persist these fields — only serialize `{ cards, columns }`:

```typescript
// boardService.save():
const persistable = { cards: state.cards, columns: state.columns };
localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
```

When loading, the `emptyBoardState` (with `isDragging: false`, `activeDragCardId: null`) is used as the base — so drag state is always reset on page load.

### `boardService.ts` — Complete Implementation Pattern

```typescript
import type { BoardState, StorageError } from '../types/types';

const STORAGE_KEY = 'sticky-board-state';

const emptyBoardState: BoardState = {
  cards: {},
  columns: { todo: [], inProgress: [], done: [] },
  isDragging: false,
  activeDragCardId: null,
};

function isValidBoardState(data: unknown): data is Pick<BoardState, 'cards' | 'columns'> {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  if (typeof d.cards !== 'object' || d.cards === null || Array.isArray(d.cards)) return false;
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
    if (err instanceof DOMException && (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      return { ok: false, error: 'QUOTA_EXCEEDED' };
    }
    return { ok: false, error: 'UNAVAILABLE' };
  }
}

export const boardService = { load, save };
```

### `BoardReducer.ts` — Key Implementation Notes

```typescript
// DELETE_CARD — remove from cards map + filter from all column arrays:
case 'DELETE_CARD': {
  const { [action.payload.cardId]: _removed, ...remainingCards } = state.cards;
  return {
    ...state,
    cards: remainingCards,
    columns: {
      todo: state.columns.todo.filter(id => id !== action.payload.cardId),
      inProgress: state.columns.inProgress.filter(id => id !== action.payload.cardId),
      done: state.columns.done.filter(id => id !== action.payload.cardId),
    },
  };
}

// MOVE_CARD — remove from source, insert at target index:
case 'MOVE_CARD': {
  const { cardId, fromColumn, toColumn, toIndex } = action.payload;
  const sourceArr = state.columns[fromColumn].filter(id => id !== cardId);
  const targetArr = fromColumn === toColumn
    ? [...sourceArr.slice(0, toIndex), cardId, ...sourceArr.slice(toIndex)]
    : [...state.columns[toColumn].slice(0, toIndex), cardId, ...state.columns[toColumn].slice(toIndex)];
  return {
    ...state,
    columns: {
      ...state.columns,
      [fromColumn]: fromColumn === toColumn ? targetArr : sourceArr,
      [toColumn]: fromColumn === toColumn ? targetArr : targetArr,
    },
  };
}

// REORDER_CARD — remove from fromIndex, insert at toIndex:
case 'REORDER_CARD': {
  const { columnId, fromIndex, toIndex } = action.payload;
  const arr = [...state.columns[columnId]];
  const [moved] = arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, moved);
  return { ...state, columns: { ...state.columns, [columnId]: arr } };
}
```

**Note on MOVE_CARD with same source and target column:** When `fromColumn === toColumn`, treat it as a reorder — remove from old position and insert at new position. This avoids duplicating the card ID.

### `useBoardState.ts` — Lazy Initialization Pattern

```typescript
import { useReducer, useEffect, useState } from 'react';
import { boardReducer } from '../context/BoardReducer';
import { boardService } from '../services/boardService';
import type { BoardContextValue, StorageError } from '../types/types';

export function useBoardState(): BoardContextValue {
  const [boardState, dispatch] = useReducer(
    boardReducer,
    undefined,
    () => {
      const result = boardService.load();
      return result.data; // load() always returns ok: true with valid data
    }
  );
  const [storageError, setStorageError] = useState<StorageError | null>(null);

  useEffect(() => {
    const result = boardService.save(boardState);
    if (!result.ok) {
      setStorageError(result.error);
    } else if (storageError !== null) {
      setStorageError(null); // clear previous error if save succeeds
    }
  }, [boardState]); // eslint-disable-line react-hooks/exhaustive-deps

  return { boardState, dispatch, storageError };
}
```

**Note on the eslint disable:** `storageError` is intentionally excluded from the dependency array because we only want to save when `boardState` changes, not when `storageError` changes (that would cause infinite loop). The `storageError` reference in the body is read-only — no state setter causes the effect to loop. If ESLint flags this, add the disable comment for `react-hooks/exhaustive-deps` on that specific line.

### `localStorage` Mock Pattern for Tests

To mock localStorage in Vitest:

```typescript
// boardService.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { boardService } from './boardService';

const mockStorage: Record<string, string> = {};

beforeEach(() => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => mockStorage[key] ?? null);
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => { mockStorage[key] = value; });
  vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => { delete mockStorage[key]; });
});

afterEach(() => {
  vi.restoreAllMocks();
  Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
});

// To test QuotaExceededError:
it('returns QUOTA_EXCEEDED when storage is full', () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('QuotaExceededError', 'QuotaExceededError');
  });
  const result = boardService.save({ cards: {}, columns: { todo: [], inProgress: [], done: [] }, isDragging: false, activeDragCardId: null });
  expect(result).toEqual({ ok: false, error: 'QUOTA_EXCEEDED' });
});
```

### File Structure Changes in This Story

```
sticky-board/
└── src/
    ├── App.tsx               ← MODIFY: Wrap Board with BoardProvider
    ├── types/
    │   └── types.ts          ← EXTEND: Add Card, BoardState, CardColor, StorageError, BoardAction, BoardContextValue
    ├── services/
    │   ├── .gitkeep          ← DELETE: Replace with actual service
    │   └── boardService.ts   ← CREATE: load(), save() with localStorage I/O
    ├── context/
    │   ├── .gitkeep          ← DELETE: Replace with actual files
    │   ├── BoardReducer.ts   ← CREATE: boardReducer + initialBoardState
    │   └── BoardContext.tsx  ← CREATE: BoardContext, BoardProvider, useBoardContext
    └── hooks/
        ├── .gitkeep          ← DELETE: Replace with actual hook
        └── useBoardState.ts  ← CREATE: useReducer + localStorage sync
```

### Critical Architecture Rules for This Story

1. **Zero direct `localStorage` calls outside `boardService.ts`** — `useBoardState.ts`, `BoardContext.tsx`, and all components go through `boardService` only
2. **No imports from `context/` in `types.ts`** — to avoid circular dependencies; this is why `BoardAction` is defined in `types.ts` instead of `BoardReducer.ts`
3. **No barrel files** — import `boardReducer` as `import { boardReducer } from '../context/BoardReducer'`, NOT `from '../context'`
4. **Pure reducer** — `boardReducer` must be a pure function with zero side effects; no service calls, no console logs, no random values inside the reducer
5. **Immutable state updates** — every reducer case must return a new object; never modify and return the same reference
6. **Drag state excluded from persistence** — `isDragging` and `activeDragCardId` are runtime-only fields; `boardService.save()` strips them before serialization; this is tested in Task 7
7. **`boardService.load()` always succeeds** — it returns `{ ok: true }` in all scenarios (no data, corrupt data, valid data); only `boardService.save()` returns `{ ok: false }` on failure
8. **TypeScript strict mode** — `"strict": true` is set in `tsconfig.json`; no `any` types; use `unknown` for JSON parse results, then narrow with type guards

### Carrying Forward from Epic 1 — What NOT to Touch

> 🛑 **Do NOT modify** these files — they are complete and tested from Stories 1.x:
> - `src/styles/tokens.css` — design token system is final
> - `src/styles/global.css` — global styles are final
> - `src/main.tsx` — Vite entry point, untouched
> - `src/components/Board/Board.tsx` — layout is complete; Story 2.2 will add context consumption
> - `src/components/Column/Column.tsx` — layout is complete; Story 2.3 will add card rendering
> - `index.html` — Caveat font loading is in place

### Context for Future Stories

This story establishes the data foundation that all subsequent Epic 2-4 stories depend on:
- **Story 2.2** (Card Creation): Will call `dispatch({ type: 'ADD_CARD', ... })` and use `useBoardContext()`
- **Story 2.3** (Card Display): Will consume `boardState.cards` and `boardState.columns` via `useBoardContext()`
- **Story 2.4** (Inline Editing): Will call `dispatch({ type: 'EDIT_CARD', ... })`
- **Story 3.x** (Drag & Drop): Will use `isDragging`/`activeDragCardId` state and `SET_DRAGGING`/`CLEAR_DRAGGING`/`MOVE_CARD`/`REORDER_CARD`/`DELETE_CARD` actions
- **Story 4.1** (Storage Errors): Will add `StorageNotice` component that reads `storageError` from `useBoardContext()`

### References

- Data architecture and state shape: [architecture.md](../../planning-artifacts/architecture.md#data-architecture)
- Reducer action naming conventions: [architecture.md](../../planning-artifacts/architecture.md#naming-patterns)
- Error propagation patterns: [architecture.md](../../planning-artifacts/architecture.md#communication-patterns)
- Component hierarchy: [architecture.md](../../planning-artifacts/architecture.md#frontend-architecture)
- Epic 2 story requirements: [epics.md](../../planning-artifacts/epics.md#story-21-board-state-management--persistence-foundation)
- FR24 (auto-save), FR25 (restore on load), FR26 (empty first-time), FR27 (no server): [epics.md](../../planning-artifacts/epics.md#functional-requirements)
- NFR3 (localStorage < 10ms), NFR5 (atomic writes), NFR6 (corruption recovery): [epics.md](../../planning-artifacts/epics.md#nonfunctional-requirements)
- Story 1.3 dev patterns (rough.js, TypeScript strict mode): [1-3-board-layout-three-columns-sketchy-visual-aesthetic.md](1-3-board-layout-three-columns-sketchy-visual-aesthetic.md)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

None — clean implementation, no blockers.

### Completion Notes List

- **Task 1**: Extended `src/types/types.ts` with `CardColor`, `Card`, `BoardState`, `StorageError`, `BoardAction` (7-variant discriminated union), and `BoardContextValue`. `BoardAction` placed in `types.ts` (not `BoardReducer.ts`) to prevent circular imports.
- **Task 2**: Created `src/services/boardService.ts` with `load()` (always returns `{ ok: true }`) and `save()` (strips `isDragging`/`activeDragCardId` — only persists `cards` + `columns`). Type guard `isValidBoardState` validates parsed data.
- **Task 3**: Created `src/context/BoardReducer.ts` — pure reducer handling all 7 action types with immutable spreads. `initialBoardState` exported as named export. Zero side effects.
- **Task 4**: Created `src/context/BoardContext.tsx` — `BoardContext`, `BoardProvider`, and `useBoardContext()` hook (throws if used outside provider).
- **Task 5**: Created `src/hooks/useBoardState.ts` — lazy `useReducer` init loads from `boardService`, `useEffect` on `boardState` triggers save and tracks `storageError`.
- **Task 6**: Updated `src/App.tsx` to wrap `<Board />` in `<BoardProvider>`. No visual changes — transparent to UI at this stage.
- **Task 7**: Created `src/services/boardService.test.ts` — 10 tests covering load (no data, valid data, corrupt JSON, invalid structure) and save (success, quota exceeded, unavailable, drag-state exclusion).
- **Task 8**: Created `src/context/BoardReducer.test.ts` — 24 tests covering all 7 action types, verifying new object references (immutability) for each.
- **Task 9**: All 38 tests pass (`npm run test`). Build clean (`npm run build`). No TypeScript errors.
- **Code Review Fixes** (post-review): Fixed H-1 — added early `return state` guard in `EDIT_CARD` when `cardId` not found. Fixed H-2 — added `isValidCard()` per-card shape validator called inside `isValidBoardState`; corrupt individual card objects now trigger load fallback. Fixed M-2 — added test for `localStorage.getItem` throwing (SecurityError path). Fixed M-3 — added test for Firefox `NS_ERROR_DOM_QUOTA_REACHED` quota path. Fixed L-1 — added `ColumnId` to `BoardReducer.ts` import. Fixed L-2 — added test asserting `EDIT_CARD` with non-existent cardId returns original state reference. All 42 tests pass.

### File List

- `sticky-board/src/types/types.ts` — MODIFIED: Added Card, BoardState, CardColor, StorageError, BoardAction, BoardContextValue
- `sticky-board/src/services/boardService.ts` — CREATED
- `sticky-board/src/services/boardService.test.ts` — CREATED
- `sticky-board/src/services/.gitkeep` — DELETED
- `sticky-board/src/context/BoardReducer.ts` — CREATED
- `sticky-board/src/context/BoardReducer.test.ts` — CREATED
- `sticky-board/src/context/BoardContext.tsx` — CREATED
- `sticky-board/src/context/.gitkeep` — DELETED
- `sticky-board/src/hooks/useBoardState.ts` — CREATED
- `sticky-board/src/hooks/.gitkeep` — DELETED
- `sticky-board/src/App.tsx` — MODIFIED: Added BoardProvider wrapper
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — MODIFIED: story status set to review
