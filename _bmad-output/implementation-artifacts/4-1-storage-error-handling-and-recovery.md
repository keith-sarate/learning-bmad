# Story 4.1: Storage Error Handling and Recovery

Status: review

## Story

As a user,
I want the app to handle storage failures gracefully and inform me honestly when data won't be saved,
So that I always understand the state of my data and the app never silently loses my work.

## Acceptance Criteria

1. **Given** the browser is in private/incognito mode (localStorage unavailable) **When** the app loads and `boardService.load()` is called **Then** it returns `{ ok: false, error: 'UNAVAILABLE' }`, the app renders with an empty board, and `StorageNotice.tsx` displays an informational (non-blocking) message explaining data will not be saved in this session

2. **Given** a `boardService.save(state)` call fails because storage quota is exceeded **When** the write is attempted **Then** it returns `{ ok: false, error: 'QUOTA_EXCEEDED' }`, updates `storageError` in `BoardContext`, and `StorageNotice.tsx` renders a non-blocking quota error message — the board remains fully interactive

3. **Given** localStorage contains corrupt data (invalid JSON, missing required `cards` or `columns` keys) **When** `boardService.load()` is called **Then** it returns `{ ok: true, data: emptyBoardState }`, outputs a `console.warn` describing the recovery, and the app starts with an empty board — no `throw`, no unhandled exception

4. **Given** any `boardService` function encounters any error condition **When** inspected **Then** the function returns a typed result object (`{ ok: false, error: 'UNAVAILABLE' | 'QUOTA_EXCEEDED' | 'CORRUPT' }`) — it never throws under any circumstance

5. **Given** `StorageNotice.tsx` is rendered for any error condition **When** observed **Then** it is a non-modal, non-overlay notice — it does not block any board interaction and the full board UI remains operable behind it

6. **Given** normal localStorage operation with no errors **When** the board is used normally **Then** `StorageNotice` is not rendered — it is either absent from the DOM or conditionally omitted based on `storageError === null`

7. **Given** all storage error scenarios are exercised (unavailable, quota exceeded, corrupt) **When** the browser console is inspected during each scenario **Then** no uncaught JavaScript exceptions appear — NFR7 (zero unhandled exceptions) is satisfied

## Tasks / Subtasks

- [x] Task 1 — Update `boardService.load()` return type and private browsing detection (AC: #1, #3, #4)
  - [x] Change the `load()` return type signature from `{ ok: true; data: BoardState }` to `{ ok: true; data: BoardState } | { ok: false; error: StorageError }`
  - [x] Add a localStorage availability check at the top of `load()`: wrap `localStorage.getItem(STORAGE_KEY)` in try/catch; if it throws a `SecurityError` or `DOMException` with `code === 18`, return `{ ok: false, error: 'UNAVAILABLE' }`
  - [x] Retain the existing corrupt data path: invalid JSON → `console.warn` + return `{ ok: true, data: emptyBoardState }` (this is intentionally `ok: true` — the board recovers)
  - [x] Retain the existing `save()` implementation which already returns `{ ok: false, error: 'QUOTA_EXCEEDED' }` correctly

- [x] Task 2 — Update `useBoardState.ts` to handle load failures (AC: #1, #7)
  - [x] The `useReducer` initializer currently calls `boardService.load()` and returns `result.data` — this will be `undefined` when `ok: false`; update the initializer to handle both result shapes: if `ok: false`, use `emptyBoardState` as the initial state
  - [x] Add initial storageError capture: store the load result in a variable before `useReducer`, then `useState<StorageError | null>` initialized with `loadResult.ok ? null : loadResult.error`
  - [x] The existing `useEffect` save + quota error path does not need to change

- [x] Task 3 — Create `StorageNotice` component (AC: #1, #2, #5, #6)
  - [x] Create `sticky-board/src/components/StorageNotice/StorageNotice.tsx`:
    - Accepts no props — reads `storageError` from `useBoardContext()`
    - If `storageError === null`, return `null` (render nothing)
    - For `storageError === 'UNAVAILABLE'`: render a banner/notice with text: _"Private browsing detected — your board changes won't be saved this session."_
    - For `storageError === 'QUOTA_EXCEEDED'`: render a banner/notice with text: _"Storage is full — your latest changes could not be saved. Try removing some cards."_
    - For `storageError === 'CORRUPT'`: this should NOT show a notice — the board recovered silently per AC #3 and the architecture intent (console.warn only)
    - The notice must be a `role="status"` aria-live region so screen readers announce it
  - [x] Create `sticky-board/src/components/StorageNotice/StorageNotice.css`:
    - Position: fixed, bottom of viewport (e.g., `bottom: 16px; left: 50%; transform: translateX(-50%)`)
    - Non-blocking: `pointer-events: none` on the container so it never intercepts board clicks
    - Visually distinct: warm warning tone — use `var(--color-board-background)` as base with a border, subtle shadow; handwritten font
    - Must NOT cover the board interaction layer

- [x] Task 4 — Integrate `StorageNotice` into `Board.tsx` (AC: #5, #6)
  - [x] Import `StorageNotice` in `Board.tsx`
  - [x] Render `<StorageNotice />` inside the `board` div, as a sibling to `<DndContext>` and the SVG canvas — outside DndContext per the component hierarchy in architecture.md
  - [x] Architecture component hierarchy for reference:
    ```
    Board
    ├── <svg class="board-canvas" /> (rough.js)
    ├── DndContext
    │   ├── Column (×3)
    │   └── TrashZone
    └── StorageNotice (← add here)
    ```

- [x] Task 5 — Write tests (AC: #1, #2, #3, #4, #7)
  - [x] Unit tests for `boardService.ts` in `sticky-board/src/services/boardService.test.ts` (create this file):
    - Test: `load()` returns `{ ok: false, error: 'UNAVAILABLE' }` when `localStorage.setItem` throws a `SecurityError`
    - Test: `load()` returns `{ ok: true, data: emptyBoardState }` and emits `console.warn` when JSON is corrupt
    - Test: `load()` returns `{ ok: true, data: emptyBoardState }` when localStorage has no entry
    - Test: `load()` returns `{ ok: true, data: <BoardState> }` with correct data when valid state exists
    - Test: `save()` returns `{ ok: false, error: 'QUOTA_EXCEEDED' }` when `setItem` throws `QuotaExceededError`
    - Test: `save()` returns `{ ok: true }` on successful write
  - [x] Component test for `StorageNotice.tsx` in `sticky-board/src/components/StorageNotice/StorageNotice.test.tsx`:
    - Test: renders nothing when `storageError === null`
    - Test: renders UNAVAILABLE message when `storageError === 'UNAVAILABLE'`
    - Test: renders QUOTA_EXCEEDED message when `storageError === 'QUOTA_EXCEEDED'`
    - Test: has `role="status"` on the notice element

## Dev Notes

### Key Change: `boardService.load()` Return Type

The existing `load()` always returns `{ ok: true; data: BoardState }`. This story changes the return type to also allow `{ ok: false; error: StorageError }` for the `UNAVAILABLE` case. This is a **breaking change** to the function signature.

**Update `useBoardState.ts` to handle both paths:**

```typescript
// useBoardState.ts — updated initial load handling
export function useBoardState(): BoardContextValue {
  // Must evaluate load result before useReducer to capture initial error
  const initialLoadResult = boardService.load();
  const initialState: BoardState = initialLoadResult.ok
    ? initialLoadResult.data
    : { cards: {}, columns: { todo: [], inProgress: [], done: [] }, isDragging: false, activeDragCardId: null };

  const [boardState, dispatch] = useReducer(boardReducer, initialState);
  const [storageError, setStorageError] = useState<StorageError | null>(
    initialLoadResult.ok ? null : initialLoadResult.error
  );
  // ... rest of hook unchanged
}
```

**CAUTION:** The `useReducer` initializer function form `useReducer(reducer, undefined, () => ...)` called `boardService.load()` inside a lazy initializer. Converting to an eagerly-evaluated initial state is intentional here — the lazy initializer can't pass data upward to the `storageError` state. The eager evaluation call happens only once on mount.

### Private Browsing Detection Pattern

```typescript
// boardService.ts — updated load() private browsing detection
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__sticky_board_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function load(): { ok: true; data: BoardState } | { ok: false; error: StorageError } {
  if (!isLocalStorageAvailable()) {
    return { ok: false, error: 'UNAVAILABLE' };
  }
  // ... rest of existing load logic unchanged
}
```

> **Why test with setItem, not getItem?** In private browsing mode on some browsers (Firefox, Safari), `localStorage.getItem` may succeed but `setItem` throws `SecurityError`. Testing both read and write confirms true availability before the user commits changes.

### `StorageNotice.tsx` Must Not Intercept Clicks

The notice MUST use `pointer-events: none` in its CSS. The board uses dnd-kit drag sensors which rely on pointer events — any overlapping element that intercepts pointer events would break drag behavior over the notice area.

### Architecture-Required Component Hierarchy

From [architecture.md](../../planning-artifacts/architecture.md) (Project Structure section):
- `StorageNotice` lives in `src/components/StorageNotice/`
- It renders inside `Board.tsx` but outside `DndContext`
- `storageError` is sourced from `BoardContext` (already exists as `storageError: StorageError | null` in `BoardContextValue`)

### Existing `save()` Implementation is Correct

`boardService.save()` already returns `{ ok: false, error: 'QUOTA_EXCEEDED' }` and the `useBoardState.ts` `useEffect` already calls `setStorageError(result.error)` on failure. **Do not change this path** — it already satisfies AC #2.

The only gap is:
1. `load()` returning `UNAVAILABLE` for private browsing
2. `useBoardState.ts` capturing the initial load error
3. The `StorageNotice` component itself (doesn't exist yet)

### `CORRUPT` Error — Do Not Show StorageNotice

Per AC #3, corrupt data recovery is a silent recovery — `console.warn` + empty board. There is no `storageError` set for the `CORRUPT` case (which is why `load()` returns `{ ok: true, data: emptyBoardState }` for corruption, not `{ ok: false }`). The `StorageNotice` should only render for `UNAVAILABLE` and `QUOTA_EXCEEDED`.

### No New Types Required

`StorageError = 'QUOTA_EXCEEDED' | 'UNAVAILABLE' | 'CORRUPT'` already exists in `src/types/types.ts`. No changes to the types file should be needed.

### Project Structure Notes

**Files to create:**
- `sticky-board/src/components/StorageNotice/StorageNotice.tsx`
- `sticky-board/src/components/StorageNotice/StorageNotice.css`
- `sticky-board/src/components/StorageNotice/StorageNotice.test.tsx`
- `sticky-board/src/services/boardService.test.ts`

**Files to modify:**
- `sticky-board/src/services/boardService.ts` — update `load()` return type + add `isLocalStorageAvailable()` helper
- `sticky-board/src/hooks/useBoardState.ts` — capture initial load error
- `sticky-board/src/components/Board/Board.tsx` — add `<StorageNotice />` render

**Files that should NOT be modified:**
- `sticky-board/src/types/types.ts` — all required types already exist
- `sticky-board/src/context/BoardReducer.ts` — no reducer changes needed
- `sticky-board/src/services/audioService.ts` — no audio changes needed

### References

- [Source: architecture.md#Core Architectural Decisions — Data Architecture]: boardService contract, error propagation pattern
- [Source: architecture.md#Project Structure] — StorageNotice placement in directory and component hierarchy
- [Source: architecture.md#Integration Points — Startup data flow]: how storageError flows to StorageNotice
- [Source: architecture.md#Implementation Patterns — localStorage Persistence]: useEffect sync pattern
- [Source: architecture.md#Enforcement Guidelines]: anti-pattern: never call localStorage directly outside boardService
- [Source: epics.md#Epic 4, Story 4.1]: complete acceptance criteria and BDD scenarios
- [Source: epics.md#Requirements Inventory — FR29, FR30, NFR6, NFR7]: full requirement text

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6 (GitHub Copilot)

### Debug Log References

No debug issues encountered. All tasks implemented cleanly on first attempt.

### Completion Notes List

- **Task 1**: Added `isLocalStorageAvailable()` helper that tests both `setItem`/`removeItem` (not just `getItem`) to correctly detect private browsing mode on Firefox/Safari. Updated `load()` return type to union — existing corrupt data catch path unchanged.
- **Task 2**: Replaced lazy `useReducer` initializer with eager evaluation. `initialLoadResult` is captured before `useReducer` so the initial `storageError` state can be seeded correctly from the load result. This is intentional — the lazy initializer can't pass data upward.
- **Task 3**: `StorageNotice.tsx` renders `null` for both `storageError === null` and `'CORRUPT'` (silent recovery per AC #3). Uses `role="status"` + `aria-live="polite"` for accessibility. CSS uses `pointer-events: none` to prevent interference with dnd-kit drag sensors.
- **Task 4**: `<StorageNotice />` placed as last child inside `.board` div, after `</DndContext>` — matches architecture.md component hierarchy exactly.
- **Task 5**: Added UNAVAILABLE test to existing `boardService.test.ts` (file already existed with 13 tests; added 1 new test). Created `StorageNotice.test.tsx` with 6 tests. Total: 84 tests, all passing. Pre-existing lint errors in `BoardContext.tsx`, `BoardReducer.ts`, and `Card.tsx` were present before this story — zero new lint errors introduced.

### File List

- `sticky-board/src/services/boardService.ts`
- `sticky-board/src/hooks/useBoardState.ts`
- `sticky-board/src/components/Board/Board.tsx`
- `sticky-board/src/components/StorageNotice/StorageNotice.tsx` _(created)_
- `sticky-board/src/components/StorageNotice/StorageNotice.css` _(created)_
- `sticky-board/src/components/StorageNotice/StorageNotice.test.tsx` _(created)_
- `sticky-board/src/services/boardService.test.ts` _(added UNAVAILABLE test)_

## Change Log

- 2026-03-12: Implemented Story 4.1 — Storage Error Handling and Recovery. Added `isLocalStorageAvailable()` to `boardService`, updated `load()` return type to include `UNAVAILABLE` error path, updated `useBoardState` to capture initial load error, created `StorageNotice` component with accessibility and non-blocking CSS. 84 tests passing.
