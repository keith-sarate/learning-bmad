# Story 3.3: Card Deletion via Trash Zone

Status: review

## Story

As a user,
I want to delete a card by dragging it to the trash zone that appears while I drag,
So that deletion is always discoverable through natural drag behavior — no right-click menus, no delete buttons, no confirmation dialogs.

## Acceptance Criteria

1. **Given** a card drag begins **When** the `TrashZone` renders **Then** `TrashZone.tsx` uses `useDroppable` from dnd-kit with a distinct droppable ID (`'trash'`)

2. **Given** a card is being dragged and hovers over the `TrashZone` **When** the droppable activates **Then** the `TrashZone` displays a visual activation state (distinct hover appearance using `.is-active` CSS class) indicating it is a destructive target

3. **Given** a card is dropped onto the `TrashZone` **When** `onDragEnd` fires **Then** `dispatch(DELETE_CARD, { cardId })` is called and the card is immediately removed from both the `cards` record and the originating column array in board state

4. **Given** a card is deleted via the trash zone **When** board state is inspected **Then** the card's ID appears in neither `state.cards` nor any of the three column arrays (`todo`, `inProgress`, `done`)

5. **Given** a card is dropped onto the `TrashZone` **When** `onDragEnd` completes **Then** `audioService.playDrop()` is NOT called — the drop sound plays only for valid column drops, never for trash drops

6. **Given** a card drag is released without reaching the `TrashZone` **When** the drag ends **Then** no deletion occurs — the card returns to its original position if no valid column target was hit

7. **Given** the board is NOT in a drag state **When** the DOM is inspected **Then** the `TrashZone` is not visible — it returns `null` from render (absent from the DOM entirely)

## Tasks / Subtasks

- [x] Task 1 — Update `TrashZone.tsx` to add `useDroppable` and `.is-active` class (AC: #1, #2, #7)
  - [x] Add `useDroppable` import from `@dnd-kit/core`:
    ```tsx
    import { useDroppable } from '@dnd-kit/core';
    ```
  - [x] Call `useDroppable({ id: 'trash' })` inside the component function, destructuring `setNodeRef` and `isOver`:
    ```tsx
    const { setNodeRef, isOver } = useDroppable({ id: 'trash' });
    ```
    **CRITICAL:** `useDroppable` must always be called (hooks rules — no conditional call). The `if (!boardState.isDragging) return null;` early exit stays AFTER the hook call.
  - [x] Apply `setNodeRef` to the outer div via `ref={setNodeRef}`
  - [x] Apply `.is-active` class conditionally based on `isOver`:
    ```tsx
    className={`trash-zone${isOver ? ' is-active' : ''}`}
    ```
  - [x] Final `TrashZone.tsx` should look like:
    ```tsx
    import { useDroppable } from '@dnd-kit/core';
    import { useBoardContext } from '../../context/BoardContext';
    import './TrashZone.css';

    function TrashZone() {
      const { boardState } = useBoardContext();
      const { setNodeRef, isOver } = useDroppable({ id: 'trash' });

      if (!boardState.isDragging) return null;

      return (
        <div
          ref={setNodeRef}
          className={`trash-zone${isOver ? ' is-active' : ''}`}
          role="region"
          aria-label="Drop here to delete card"
        >
          <span className="trash-zone-icon" aria-hidden="true">🗑️</span>
          <span className="trash-zone-label">Drop to delete</span>
        </div>
      );
    }

    export default TrashZone;
    ```

- [x] Task 2 — Update `TrashZone.css` to add `.trash-zone.is-active` rule (AC: #2)
  - [x] Add the `.trash-zone.is-active` rule AFTER the existing `.trash-zone` block (the transitions already defined on `.trash-zone` will animate this state change):
    ```css
    .trash-zone.is-active {
      background-color: rgba(232, 88, 74, 0.12);
      border-color: var(--color-trash-active);
      color: var(--color-trash-active);
    }
    ```
  - **WHY rgba background:** Provides a warm red tint without obscuring the parchment texture. `--color-trash-active` is `#E8584A` — already in `tokens.css`.
  - **WHY no transform here:** The `.trash-zone` base block already uses `transform: translateX(-50%)` for centering. Adding a `scale` in `.is-active` would compound the translate and could shift position. The border/color change is sufficient visual feedback.

- [x] Task 3 — Update `Board.tsx` `handleDragEnd` to detect trash drop and dispatch `DELETE_CARD` (AC: #3, #4, #5, #6)
  - [x] In `handleDragEnd`, after the `if (activeId === overId) return;` guard and BEFORE the `columnIds` declaration, add the trash zone detection block:
    ```tsx
    // Trash zone — delete card (no audio, per architecture communication patterns)
    if (overId === 'trash') {
      dispatch({ type: 'DELETE_CARD', payload: { cardId: activeId } });
      return;
    }
    ```
  - **WHY no `CLEAR_DRAGGING` dispatch here:** `CLEAR_DRAGGING` is already dispatched unconditionally at the TOP of `handleDragEnd` (before the `if (!over) return;` guard). The trash case returns early after `DELETE_CARD` — dragging is already cleared.
  - **WHY no `audioService.playDrop()` here:** `audioService` is added in Story 3.4. Even after Story 3.4, trash drops must NOT trigger the drop sound (AC #5 and architecture.md communication patterns: "onDragEnd over TrashZone → dispatch(DELETE_CARD) → dispatch(CLEAR_DRAGGING) (no sound)").
  - [x] The updated `handleDragEnd` flow (showing the full context of the insertion point):
    ```tsx
    function handleDragEnd(event: DragEndEvent) {
      const { active, over } = event;

      // ALWAYS clear dragging first — even on cancelled drag (no over target)
      dispatch({ type: 'CLEAR_DRAGGING' });
      setActiveOverColumnId(null);

      if (!over) return; // drag cancelled — card returns to original position

      const activeId = active.id as string;
      const overId = over.id as string;

      if (activeId === overId) return; // dropped on itself — no change

      // Trash zone — delete card (no audio, per architecture communication patterns)
      if (overId === 'trash') {
        dispatch({ type: 'DELETE_CARD', payload: { cardId: activeId } });
        return;
      }

      const columnIds: ColumnId[] = ['todo', 'inProgress', 'done'];
      // ... rest of existing column dispatch logic unchanged ...
    }
    ```

- [x] Task 4 — Update `TrashZone.test.tsx` to mock `useDroppable` and test `.is-active` class (AC: #1, #2)
  - [x] Add a module-level `mockIsOver` variable and `@dnd-kit/core` mock (same pattern as `mockIsDragging` already established in this file):
    ```tsx
    let mockIsOver = false;

    vi.mock('@dnd-kit/core', () => ({
      useDroppable: () => ({ setNodeRef: vi.fn(), isOver: mockIsOver }),
    }));
    ```
    Place this BEFORE the existing `vi.mock('../../context/BoardContext', ...)` block.
  - [x] Add `mockIsOver = false;` reset to the existing `afterEach` block alongside `mockIsDragging = false;`
  - [x] Add two new tests for the `.is-active` class behavior (with `isDragging: true` as prerequisite):
    ```tsx
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
    ```
  - **NOTE:** The three existing tests in `TrashZone.test.tsx` (`does NOT render when isDragging is false`, `renders trash zone when isDragging is true`, `has correct role="region"`) continue to pass unchanged — the `@dnd-kit/core` mock simply adds `useDroppable` support the component now requires.

- [x] Task 5 — Verify `Board.test.tsx` requires no changes (AC: #3)
  - [x] `Board.test.tsx` already mocks `TrashZone` completely:
    ```tsx
    vi.mock('../TrashZone/TrashZone', () => ({ default: () => <div data-testid="trash-zone-mock" /> }));
    ```
    When `TrashZone.tsx` is updated to use `useDroppable`, this full mock prevents any `@dnd-kit/core` import from reaching Board's test execution context. No change needed.
  - [x] The `DELETE_CARD` action is already comprehensively tested in `BoardReducer.test.ts` with 4 tests covering: card removal from map, column array filtering, all-column filtering, and new state object reference. No new reducer tests needed.

- [x] Task 6 — Run all tests and build check (AC: all)
  - [x] `cd sticky-board && npm run test -- --run` — all 73 tests pass (3 original + 2 new TrashZone tests)
  - [x] `npm run build` — zero TypeScript errors
  - [ ] Task 7 — Manual smoke test: `npm run dev`, drag a card to the trash zone, verify: (a) zone highlights red on hover, (b) card is deleted on drop, (c) no deletion if drag cancelled
  - [ ] Add `useDroppable` import from `@dnd-kit/core`:
    ```tsx
    import { useDroppable } from '@dnd-kit/core';
    ```
  - [ ] Call `useDroppable({ id: 'trash' })` inside the component function, destructuring `setNodeRef` and `isOver`:
    ```tsx
    const { setNodeRef, isOver } = useDroppable({ id: 'trash' });
    ```
    **CRITICAL:** `useDroppable` must always be called (hooks rules — no conditional call). The `if (!boardState.isDragging) return null;` early exit stays AFTER the hook call.
  - [ ] Apply `setNodeRef` to the outer div via `ref={setNodeRef}`
  - [ ] Apply `.is-active` class conditionally based on `isOver`:
    ```tsx
    className={`trash-zone${isOver ? ' is-active' : ''}`}
    ```
  - [ ] Final `TrashZone.tsx` should look like:
    ```tsx
    import { useDroppable } from '@dnd-kit/core';
    import { useBoardContext } from '../../context/BoardContext';
    import './TrashZone.css';

    function TrashZone() {
      const { boardState } = useBoardContext();
      const { setNodeRef, isOver } = useDroppable({ id: 'trash' });

      if (!boardState.isDragging) return null;

      return (
        <div
          ref={setNodeRef}
          className={`trash-zone${isOver ? ' is-active' : ''}`}
          role="region"
          aria-label="Drop here to delete card"
        >
          <span className="trash-zone-icon" aria-hidden="true">🗑️</span>
          <span className="trash-zone-label">Drop to delete</span>
        </div>
      );
    }

    export default TrashZone;
    ```

- [ ] Task 2 — Update `TrashZone.css` to add `.trash-zone.is-active` rule (AC: #2)
  - [ ] Add the `.trash-zone.is-active` rule AFTER the existing `.trash-zone` block (the transitions already defined on `.trash-zone` will animate this state change):
    ```css
    .trash-zone.is-active {
      background-color: rgba(232, 88, 74, 0.12);
      border-color: var(--color-trash-active);
      color: var(--color-trash-active);
    }
    ```
  - **WHY rgba background:** Provides a warm red tint without obscuring the parchment texture. `--color-trash-active` is `#E8584A` — already in `tokens.css`.
  - **WHY no transform here:** The `.trash-zone` base block already uses `transform: translateX(-50%)` for centering. Adding a `scale` in `.is-active` would compound the translate and could shift position. The border/color change is sufficient visual feedback.

- [ ] Task 3 — Update `Board.tsx` `handleDragEnd` to detect trash drop and dispatch `DELETE_CARD` (AC: #3, #4, #5, #6)
  - [ ] In `handleDragEnd`, after the `if (activeId === overId) return;` guard and BEFORE the `columnIds` declaration, add the trash zone detection block:
    ```tsx
    // Trash zone — delete card (no audio, per architecture communication patterns)
    if (overId === 'trash') {
      dispatch({ type: 'DELETE_CARD', payload: { cardId: activeId } });
      return;
    }
    ```
  - **WHY no `CLEAR_DRAGGING` dispatch here:** `CLEAR_DRAGGING` is already dispatched unconditionally at the TOP of `handleDragEnd` (before the `if (!over) return;` guard). The trash case returns early after `DELETE_CARD` — dragging is already cleared.
  - **WHY no `audioService.playDrop()` here:** `audioService` is added in Story 3.4. Even after Story 3.4, trash drops must NOT trigger the drop sound (AC #5 and architecture.md communication patterns: "onDragEnd over TrashZone → dispatch(DELETE_CARD) → dispatch(CLEAR_DRAGGING) (no sound)").
  - [ ] The updated `handleDragEnd` flow (showing the full context of the insertion point):
    ```tsx
    function handleDragEnd(event: DragEndEvent) {
      const { active, over } = event;

      // ALWAYS clear dragging first — even on cancelled drag (no over target)
      dispatch({ type: 'CLEAR_DRAGGING' });
      setActiveOverColumnId(null);

      if (!over) return; // drag cancelled — card returns to original position

      const activeId = active.id as string;
      const overId = over.id as string;

      if (activeId === overId) return; // dropped on itself — no change

      // Trash zone — delete card (no audio, per architecture communication patterns)
      if (overId === 'trash') {
        dispatch({ type: 'DELETE_CARD', payload: { cardId: activeId } });
        return;
      }

      const columnIds: ColumnId[] = ['todo', 'inProgress', 'done'];
      // ... rest of existing column dispatch logic unchanged ...
    }
    ```

- [ ] Task 4 — Update `TrashZone.test.tsx` to mock `useDroppable` and test `.is-active` class (AC: #1, #2)
  - [ ] Add a module-level `mockIsOver` variable and `@dnd-kit/core` mock (same pattern as `mockIsDragging` already established in this file):
    ```tsx
    let mockIsOver = false;

    vi.mock('@dnd-kit/core', () => ({
      useDroppable: () => ({ setNodeRef: vi.fn(), isOver: mockIsOver }),
    }));
    ```
    Place this BEFORE the existing `vi.mock('../../context/BoardContext', ...)` block.
  - [ ] Add `mockIsOver = false;` reset to the existing `afterEach` block alongside `mockIsDragging = false;`
  - [ ] Add two new tests for the `.is-active` class behavior (with `isDragging: true` as prerequisite):
    ```tsx
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
    ```
  - **NOTE:** The three existing tests in `TrashZone.test.tsx` (`does NOT render when isDragging is false`, `renders trash zone when isDragging is true`, `has correct role="region"`) continue to pass unchanged — the `@dnd-kit/core` mock simply adds `useDroppable` support the component now requires.

- [ ] Task 5 — Verify `Board.test.tsx` requires no changes (AC: #3)
  - [ ] `Board.test.tsx` already mocks `TrashZone` completely:
    ```tsx
    vi.mock('../TrashZone/TrashZone', () => ({ default: () => <div data-testid="trash-zone-mock" /> }));
    ```
    When `TrashZone.tsx` is updated to use `useDroppable`, this full mock prevents any `@dnd-kit/core` import from reaching Board's test execution context. No change needed.
  - [ ] The `DELETE_CARD` action is already comprehensively tested in `BoardReducer.test.ts` with 4 tests covering: card removal from map, column array filtering, all-column filtering, and new state object reference. No new reducer tests needed.

- [ ] Task 6 — Run all tests and build check (AC: all)
  - [ ] `cd sticky-board && npm run test -- --run` — all tests pass (target: current count + 2 new TrashZone tests)
  - [ ] `npm run build` — zero TypeScript errors
  - [ ] Task 7 — Manual smoke test: `npm run dev`, drag a card to the trash zone, verify: (a) zone highlights red on hover, (b) card is deleted on drop, (c) no deletion if drag cancelled

## Dev Notes

### Previous Story (3.2) Intelligence

**From Story 3.2 implementation — what was built that this story directly extends:**

- **`TrashZone.tsx` created as visual-only** — the file exists with conditional render on `boardState.isDragging`, basic structure with `role="region"` aria label. Story 3.3 adds `useDroppable` to make it a functional drop target.
- **`TrashZone.css` created** — `.trash-zone` base rule uses fixed positioning, existing tokens (`--color-trash-rest`, `--spacing-xl`, `--transition-default`). Transitions on `background-color`, `color`, `border-color` are already defined — the `.is-active` class will animate smoothly via these transitions.
- **`Board.tsx` `handleDragEnd` structure** — `CLEAR_DRAGGING` is dispatched unconditionally at the START of `handleDragEnd`. After that, early returns for `!over` and `activeId === overId`. The trash detection goes BEFORE `columnIds` declaration.
- **`TrashZone` is already mounted inside `DndContext`** in `Board.tsx` — the dnd-kit droppable registration via `useDroppable` will work correctly because the component is already inside the context boundary.
- **`Board.test.tsx`** — fully mocks `TrashZone` with `vi.mock`. No changes needed when TrashZone imports `useDroppable`.
- **Test mock pattern established** — use module-level variable pattern for per-test state switching (like `mockIsDragging` in `TrashZone.test.tsx`).

### `useDroppable` Hook Rules (CRITICAL)

**React Hooks Rules — call order must be stable:**
```tsx
function TrashZone() {
  const { boardState } = useBoardContext();  // Hook 1 — always first
  const { setNodeRef, isOver } = useDroppable({ id: 'trash' });  // Hook 2 — always second

  if (!boardState.isDragging) return null;  // Early exit AFTER all hooks
  // ...
}
```
**WHY:** React requires hooks to be called in the same order on every render. The `if (!boardState.isDragging) return null` early exit is safe only AFTER all `use*` calls. Moving the early exit before `useDroppable` would violate the Rules of Hooks.

### DnD Architecture Boundary (Story 3.3 scope)

Per `architecture.md#Architectural Boundaries > DnD Boundary`:
- `useDroppable({ id: 'trash' })` lives in `TrashZone.tsx` (correct — component registers itself as droppable)
- Detection of `overId === 'trash'` in `handleDragEnd` lives in `Board.tsx` (correct — all DnD event logic in Board only)
- `TrashZone` does NOT call `dispatch` directly — Board.tsx handles all dispatch on drag events

Per `architecture.md#Communication Patterns > DnD Event → Action Mapping`:
```
onDragEnd over TrashZone → dispatch(DELETE_CARD) → dispatch(CLEAR_DRAGGING) (no sound)
```
`CLEAR_DRAGGING` is already the first dispatch in our `handleDragEnd`. `DELETE_CARD` is dispatched after. This is correct.

### `DELETE_CARD` Reducer — Already Implemented

The `DELETE_CARD` case in `BoardReducer.ts` is complete and thoroughly tested:
```typescript
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
```
**This correctly satisfies AC #4** — card ID is removed from both `state.cards` and ALL three column arrays. `BoardReducer.test.ts` has 4 covering tests. No changes to the reducer are needed.

### Token Reference (TrashZone)

| Token | Value | Used In |
|---|---|---|
| `--color-trash-rest` | `#8B7355` | `.trash-zone` base — already in `TrashZone.css` |
| `--color-trash-active` | `#E8584A` | `.trash-zone.is-active` — add in Task 2 |
| `--transition-default` | `200ms ease` | `.trash-zone` transitions — already in `TrashZone.css` |
| `--color-board-background` | `#F5EFE0` | `.trash-zone` background — already in `TrashZone.css` |

### Scope Boundaries — What This Story Does NOT Include

- **`audioService.playDrop()`** — Story 3.4 adds the audio service. This story's `handleDragEnd` does NOT call `audioService` for any drop (neither column nor trash). Story 3.4 will add the column drop call.
- **Done column fade** — Already implemented in Story 2.3 (`.is-done` on Card.tsx). No changes needed.
- **Column highlight logic** — Implemented in Story 3.2 (`activeOverColumnId` state, `isHighlighted` prop). No changes needed.
- **Confirmation dialog** — Explicitly excluded by the user story. Deletion is instant on drop.
- **Undo** — Out of scope for MVP per PRD.

### File Change Summary

| File | Change Type | What Changes |
|------|-------------|--------------|
| `src/components/TrashZone/TrashZone.tsx` | Modify | Import `useDroppable`; call hook; apply `setNodeRef`; add `.is-active` class condition |
| `src/components/TrashZone/TrashZone.css` | Modify | Add `.trash-zone.is-active` rule |
| `src/components/Board/Board.tsx` | Modify | Add `overId === 'trash'` check in `handleDragEnd` dispatching `DELETE_CARD` |
| `src/components/TrashZone/TrashZone.test.tsx` | Modify | Add `@dnd-kit/core` mock; add `mockIsOver` variable; add 2 `.is-active` tests |

**No changes needed to:**
- `src/context/BoardReducer.ts` — `DELETE_CARD` case already implemented
- `src/types/types.ts` — all types already defined
- `src/styles/tokens.css` — all tokens already added in Story 3.2
- `src/components/Board/Board.test.tsx` — TrashZone is fully mocked
- `src/context/BoardReducer.test.ts` — `DELETE_CARD` comprehensively tested

### References

- `DELETE_CARD` action: [Source: sticky-board/src/context/BoardReducer.ts]
- DnD event → action mapping: [Source: _bmad-output/planning-artifacts/architecture.md#Communication Patterns > DnD Event → Action Mapping]
- DnD boundary: [Source: _bmad-output/planning-artifacts/architecture.md#Architectural Boundaries > DnD Boundary]
- `useDroppable` hook: [Source: https://docs.dndkit.com/api-documentation/droppable/usedroppable]
- TrashZone tokens: [Source: sticky-board/src/styles/tokens.css]
- BoardState with isDragging: [Source: sticky-board/src/context/BoardReducer.ts]
- Story 3.2 previous implementation: [Source: _bmad-output/implementation-artifacts/3-2-drag-visual-feedback-animations.md]
- Epics Story 3.3 definition: [Source: _bmad-output/planning-artifacts/epics.md#Story 3.3]
- Audio NOT for trash: [Source: _bmad-output/planning-artifacts/epics.md#Story 3.4 AC#5]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6 (GitHub Copilot)

### Debug Log References

No issues encountered. Implementation matched story specifications exactly.

### Completion Notes List

- ✅ Task 1: `TrashZone.tsx` updated — `useDroppable({ id: 'trash' })` called after context hook (hooks rules compliant), early return moved after hook calls, `ref={setNodeRef}` and conditional `.is-active` class applied.
- ✅ Task 2: `TrashZone.css` updated — `.trash-zone.is-active` rule added after `.trash-zone-label` block; uses `rgba(232, 88, 74, 0.12)` background + `--color-trash-active` border/color; transitions animate via existing `.trash-zone` transition rules.
- ✅ Task 3: `Board.tsx` `handleDragEnd` updated — `overId === 'trash'` check inserted after `activeId === overId` guard, before `columnIds` declaration; dispatches `DELETE_CARD` and returns early; no audio call (Story 3.4 scope).
- ✅ Task 4: `TrashZone.test.tsx` updated — `@dnd-kit/core` mock added with `useDroppable` returning `mockIsOver`; `mockIsOver` reset in `afterEach`; 2 new tests added for `.is-active` class (pass/fail scenarios).
- ✅ Task 5: `Board.test.tsx` verified — no changes needed; TrashZone fully mocked; `DELETE_CARD` reducer already comprehensively tested.
- ✅ Task 6: All 73 tests pass; TypeScript build clean (zero errors).
- AC #1: TrashZone uses `useDroppable` with id `'trash'` ✅
- AC #2: `.is-active` class applied on `isOver` ✅
- AC #3: `dispatch(DELETE_CARD, { cardId })` fires on drop to trash ✅
- AC #4: `DELETE_CARD` reducer removes card from both `state.cards` and all three column arrays ✅ (pre-existing reducer)
- AC #5: No `audioService.playDrop()` call on trash drop ✅
- AC #6: Early return on `!over` preserves no-deletion on drag cancel ✅
- AC #7: `if (!boardState.isDragging) return null` — TrashZone absent from DOM when not dragging ✅

### File List

- `sticky-board/src/components/TrashZone/TrashZone.tsx` — modified
- `sticky-board/src/components/TrashZone/TrashZone.css` — modified
- `sticky-board/src/components/Board/Board.tsx` — modified
- `sticky-board/src/components/TrashZone/TrashZone.test.tsx` — modified
