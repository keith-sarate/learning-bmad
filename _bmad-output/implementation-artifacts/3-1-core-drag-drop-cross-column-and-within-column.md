# Story 3.1: Core Drag & Drop — Cross-Column and Within-Column

Status: review

## Story

As a user,
I want to pick up any card and drag it to any column or reorder it within the same column,
So that managing task status is a direct, physical gesture — not a menu selection or a button click.

## Acceptance Criteria

1. **Given** the board is rendered with at least one card **When** the user begins dragging a card **Then** `onDragStart` fires and dispatches `SET_DRAGGING` with the active card's ID stored in board state

2. **Given** a card is dragged to a different column **When** the drag ends over a valid column drop target **Then** `dispatch(MOVE_CARD)` moves the card from its origin column to the target column at the drop position

3. **Given** a card is dragged within the same column to a new position **When** the drag ends **Then** `dispatch(REORDER_CARD)` updates that column's card array to reflect the new order

4. **Given** a card is dropped on a valid column target **When** the drop completes **Then** the card appears at the exact position in the column determined by where it was released — not forced to top or bottom

5. **Given** a card drag is cancelled (Escape key pressed or pointer released outside any valid target) **When** `onDragEnd` fires **Then** `dispatch(CLEAR_DRAGGING)` fires and the card returns to its original column and position

6. **Given** `DndContext` is mounted in `Board.tsx` **When** the codebase is inspected **Then** all `onDragStart`, `onDragOver`, and `onDragEnd` handlers exist exclusively in `Board.tsx` — no DnD event handling in `Column.tsx` or `Card.tsx`

7. **Given** a pointer sensor is configured on `DndContext` **When** inspected **Then** the activation distance is set to 8px — preventing accidental drag triggers during click-to-edit interactions

## Tasks / Subtasks

- [x] Task 1 — Update `Card.tsx` to be a draggable sortable item (AC: #1, #7)
  - [x] Add import: `import { useSortable } from '@dnd-kit/sortable';`
  - [x] Add import: `import { CSS } from '@dnd-kit/utilities';`
  - [x] Call `useSortable({ id: card.id })` inside the component to get:
    ```tsx
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = useSortable({ id: card.id });
    ```
  - [x] Compose the inline drag style (transform + transition only — no layout-triggering properties):
    ```tsx
    const dragStyle: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
    };
    ```
  - [x] Update the card `<div>` to use `setNodeRef`, spread `attributes`, apply `dragStyle`, and CONDITIONALLY spread `listeners` (only when NOT editing to prevent drag conflicting with contenteditable):
    ```tsx
    <div
      ref={setNodeRef}
      className={`card${isDone ? ' is-done' : ''}`}
      style={{
        backgroundColor: `var(--color-card-${card.color})`,
        ...dragStyle,
      }}
      data-card-id={card.id}
      {...attributes}
      {...(editingField === null ? listeners : {})}
    >
    ```
  - [x] **CRITICAL:** `{...(editingField === null ? listeners : {})}` — this prevents drag from activating when the user is in contenteditable editing mode. Even with the 8px activation threshold, this guard ensures drag listeners are fully removed during editing.
  - [x] **Import order must follow project convention:** React imports → `useSortable` → `CSS` → type imports → `useBoardContext` → CSS file

- [x] Task 2 — Update `Column.tsx` to be a droppable sortable container (AC: #2, #3, #4)
  - [x] Add import: `import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';`
  - [x] Add import: `import { useDroppable } from '@dnd-kit/core';`
  - [x] Call `useDroppable` to make the column a valid drop target (especially needed for empty columns):
    ```tsx
    const { setNodeRef: setDroppableRef } = useDroppable({ id });
    ```
  - [x] Derive card IDs for `SortableContext`:
    ```tsx
    const cardIds = (cards ?? []).map((c) => c.id);
    ```
  - [x] Apply `setDroppableRef` to the `column-cards` div (this makes empty column space droppable):
    ```tsx
    <div className="column-cards" ref={setDroppableRef}>
    ```
  - [x] Wrap the card rendering list only (NOT `CardCreationPad`, NOT empty state) in `SortableContext`:
    ```tsx
    <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
      {(cards ?? []).map((card) => (
        <CardComponent key={card.id} card={card} isDone={id === 'done'} />
      ))}
    </SortableContext>
    ```
  - [x] The final `column-cards` JSX structure should be:
    ```tsx
    <div className="column-cards" ref={setDroppableRef}>
      {isTodo && <CardCreationPad />}
      <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
        {(cards ?? []).map((card) => (
          <CardComponent key={card.id} card={card} isDone={id === 'done'} />
        ))}
      </SortableContext>
      {children}
      {showEmptyState && (
        <div className="column-empty-state">{emptyStateText}</div>
      )}
    </div>
    ```
  - [x] **NOTE:** `children` prop is used in Column tests — keep it in place after `SortableContext`
  - [x] **NOTE:** `showEmptyState` logic remains unchanged: `!isTodo && !hasCards && !children`

- [x] Task 3 — Update `Board.tsx` to mount `DndContext` with all event handlers (AC: #1, #2, #3, #4, #5, #6, #7)
  - [x] Add imports from `@dnd-kit/core`:
    ```tsx
    import {
      DndContext,
      PointerSensor,
      useSensor,
      useSensors,
      closestCorners,
    } from '@dnd-kit/core';
    import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
    ```
  - [x] Add `ColumnId` to the existing type import from `../../types/types`:
    ```tsx
    import type { ColumnConfig, Card, ColumnId } from '../../types/types';
    ```
  - [x] Extract both `boardState` AND `dispatch` from `useBoardContext()`:
    ```tsx
    const { boardState, dispatch } = useBoardContext();
    ```
    (Currently only `boardState` is destructured — add `dispatch`)
  - [x] Set up the pointer sensor with the critical 8px activation constraint (prevents drag during click-to-edit):
    ```tsx
    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: { distance: 8 },
      })
    );
    ```
  - [x] Implement `handleDragStart` — dispatches `SET_DRAGGING`:
    ```tsx
    function handleDragStart(event: DragStartEvent) {
      dispatch({ type: 'SET_DRAGGING', payload: { cardId: event.active.id as string } });
    }
    ```
  - [x] Implement `handleDragOver` — no state update needed for Story 3.1 (visual column highlights are Story 3.2); required by AC #6 to exist in Board.tsx:
    ```tsx
    function handleDragOver(_event: DragEndEvent) {
      // Column highlight visual feedback is handled in Story 3.2
    }
    ```
  - [x] Implement `handleDragEnd` — the core dispatch logic (full implementation per story spec)
  - [x] Wrap the `board-columns` div in `DndContext` with sensors and all three handlers
  - [x] **IMPORTANT:** Place `handleDragStart`, `handleDragOver`, `handleDragEnd` as named functions BEFORE the `return` statement but AFTER the `useRef`, `useCallback`, `useEffect` hooks.
  - [x] **ORDERING NOTE:** `const sensors = useSensors(...)` must be declared at the top of the component body (with other hooks), not inside the JSX

- [x] Task 4 — Add/update tests for new DnD setup (AC: #6, #7)
  - [x] Create `src/components/Board/Board.test.tsx`:
    - Smoke test: Board renders without errors with DndContext
    - Mock both `BoardContext` and `rough.js` (same as App.test.tsx but more direct)
    - Test that three column headings render (this validates DndContext didn't break rendering)
  - [x] Update `Column.test.tsx` — add a `vi.mock` for `@dnd-kit/sortable` to prevent test environment issues
  - [x] Update `Card.test.tsx` — add a `vi.mock` for `@dnd-kit/sortable` and `@dnd-kit/utilities`
  - [x] **Run all tests after changes:** `npm run test` from `sticky-board/` — all existing tests still pass (66/66 ✅)
  - [x] **Run build check:** `npm run build` — zero TypeScript errors ✅

- [x] Task 5 — Final validation
  - [x] Manual smoke test: start dev server (`npm run dev`), drag a card between columns — card moves
  - [x] Manual smoke test: drag a card within a column — card reorders
  - [x] Manual smoke test: drag and press Escape — card returns to original position
  - [x] Click on card title to edit — no accidental drag should fire on click without movement
  - [x] Check localStorage after drag — card's new column assignment is persisted

## Dev Notes

### Project Structure Notes

All DnD changes are confined to three existing files:
- `src/components/Board/Board.tsx` — DndContext + handlers
- `src/components/Column/Column.tsx` — SortableContext + useDroppable
- `src/components/Card/Card.tsx` — useSortable

New test files:
- `src/components/Board/Board.test.tsx` — new file (Board didn't have tests before)

Mocks to add in existing tests:
- `Card.test.tsx` — mock `@dnd-kit/sortable` and `@dnd-kit/utilities`
- `Column.test.tsx` — mock `@dnd-kit/sortable` and `@dnd-kit/core`

### Architecture Compliance

**DnD Boundary (CRITICAL):** `DndContext` mounts in `Board.tsx` and wraps all Column components. ALL event handlers (`onDragStart`, `onDragOver`, `onDragEnd`) live exclusively in `Board.tsx`. `Column.tsx` uses `useDroppable` (registers as droppable target) and `SortableContext` (manages sortable order). `Card.tsx` uses `useSortable` (registers as draggable+droppable sortable item). Neither `Column.tsx` nor `Card.tsx` has any DnD event handlers [Source: architecture.md#Frontend Architecture > DnD Boundary]

**State Boundary:** `boardState.columns` is the source of truth for card order. `MOVE_CARD` moves a card between columns; `REORDER_CARD` moves a card within a column. Both reducers create new immutable state. `boardService.save()` persists via the `useEffect` in `useBoardState.ts` automatically on every state change [Source: architecture.md#State Management > State Update Patterns]

**Animation Boundary:** `CSS.Transform.toString(transform)` from `@dnd-kit/utilities` outputs only `translate(x, y)` — compositor-thread-only transform. No width/height/top/left changes during drag (Story 3.2 adds `.is-dragging` tilt on top of this) [Source: architecture.md#Animation & Performance Budget]

**Sensor Configuration:** `PointerSensor` with `activationConstraint: { distance: 8 }` — the 8px threshold is the primary guard against accidental drag during click-to-edit. The additional `editingField === null` listener guard in `Card.tsx` is a defense-in-depth measure [Source: architecture.md#Process Patterns > Inline Editing]

### dnd-kit API Reference (v6)

**Key imports:**
```tsx
// @dnd-kit/core
import { DndContext, PointerSensor, useSensor, useSensors, closestCorners, useDroppable } from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';

// @dnd-kit/sortable
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';

// @dnd-kit/utilities
import { CSS } from '@dnd-kit/utilities';
```

**`useSortable` returns:**
- `attributes` — ARIA and role attributes to spread on the draggable element
- `listeners` — pointer event handlers (onPointerDown etc.) — only spread when NOT editing
- `setNodeRef` — ref callback to attach to the dragged DOM element
- `transform` — `{ x, y, scaleX, scaleY }` during drag, `null` otherwise
- `transition` — CSS transition string for smooth animation, `undefined` otherwise
- `isDragging` — boolean: true when THIS card is the active dragged item (useful for Story 3.2 .is-dragging class)

**`CSS.Transform.toString(transform)`** returns `'translate3d(x, y, 0) scaleX(s) scaleY(s)'` during drag, or `''` when transform is null. Always safe to use as `transform` CSS property value.

**`closestCorners` collision detection** is the recommended strategy for kanban boards. It calculates distance from the pointer to the nearest corner of each droppable element — works better than `closestCenter` for columns laid out side-by-side.

**`useDroppable`** on a column container: when a card is dragged over empty column space (no card underneath the pointer), the `over.id` in `onDragEnd` becomes the column's droppable ID (e.g., `'todo'`). Without `useDroppable` on the column, empty columns would not register as drop targets.

### `handleDragEnd` Logic Explained

The dispatch sequence in `onDragEnd` is critical:
1. **`CLEAR_DRAGGING` first, unconditionally** — this cleans up the dragging state even on cancelled drags. If `CLEAR_DRAGGING` is conditional (only when `over` exists), cancellation will leave the board in a stuck `isDragging: true` state.

2. **`over === null` = cancelled** — Escape key or pointer released outside any droppable. `CLEAR_DRAGGING` already fired. No card movement dispatch.

3. **`activeId === overId`** — dropped exactly on itself (unusual but possible). No change needed.

4. **`isOverColumn = true`** — `over.id` is a column ID like `'todo'`. This happens when hovering over the column's empty droppable area (registered by `useDroppable`). Insert at end of that column (`toIndex = columns[toColumn].length`).

5. **`isOverColumn = false`** — `over.id` is a card ID. Find which column it's in. Choose `MOVE_CARD` or `REORDER_CARD` based on same/different columns.

### Insertion Index Behavior

When dropping over a card (by hovering pointer over that card), `toIndex = columns[toColumn].indexOf(overId)`. This inserts the dragged card AT the hovered card's position, shifting the hovered card down. This matches the standard kanban insertion behavior visible in Trello/Jira.

Example: `columns.todo = ['A', 'B', 'C']`, drag `B` to hover over `A`:
- `fromIndex = 1`, `toIndex = 0`
- `REORDER_CARD` → `arr.splice(1, 1)` → `['A', 'C']` → `arr.splice(0, 0, 'B')` → `['B', 'A', 'C']` ✓

### Interaction with Existing Contenteditable (Card.tsx)

The `editingField` state in `Card.tsx` (from Story 2.4) guards the drag listeners:
```tsx
{...(editingField === null ? listeners : {})}
```

This means:
- When `editingField === null` (normal state) → listeners spread → drag can activate
- When `editingField === 'title'` or `'description'` (editing) → no listeners → drag completely disabled on that card
- `handleTitleClick` / `handleDescriptionClick` already guard with `if (editingField) return` — no double-entry risk

### `Card.tsx` `transform`/`transition` Note

The `style` prop on the card div merges `backgroundColor` (existing) with `dragStyle` (new):
```tsx
style={{
  backgroundColor: `var(--color-card-${card.color})`,
  ...dragStyle,
}}
```

During drag: `dragStyle = { transform: 'translate3d(x,y,0)', transition: 'transform 200ms ease' }`
When not dragging: `dragStyle = { transform: '', transition: undefined }` — no visual change

### Known Scope Boundaries for This Story

Story 3.1 does NOT include:
- **Tilt animation (`.is-dragging`)** — Story 3.2
- **Trash zone** (`TrashZone.tsx`) — Story 3.3 (not created yet)
- **Drop sound** (`audioService.ts`) — Story 3.4 (not created yet)
- **Done column fade** (`.is-done` is already implemented from Story 2.3 — no changes)  
- **Column highlight on drag-over** — Story 3.2
- **`DragOverlay`** — deferred (native useSortable transform is sufficient for core DnD; avoid DragOverlay complexity in this story)
- **`onDragOver` state updates** — deferred; the handler exists in Board.tsx (satisfies AC) but does not update state (visual reordering feedback during cross-column drag is Story 3.2)

### Test Mock Pattern (Verified from Existing Tests)

All existing tests mock `useBoardContext` with:
```tsx
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
```

The new dnd-kit mocks follow the same vi.mock pattern. Add them BEFORE the component import (Vitest hoists vi.mock calls automatically, but placing them early is idiomatic).

### File Change Summary

| File | Change Type | What Changes |
|------|-------------|--------------|
| `src/components/Card/Card.tsx` | Modify | Add `useSortable`, `CSS` imports; add `dragStyle`; update card div ref/style/attributes |
| `src/components/Column/Column.tsx` | Modify | Add `SortableContext`, `verticalListSortingStrategy`, `useDroppable` imports; add `cardIds`; wrap card list; apply `setDroppableRef` to column-cards div |
| `src/components/Board/Board.tsx` | Modify | Add `DndContext`, `PointerSensor`, `useSensor`, `useSensors`, `closestCorners` imports; add type imports; extract `dispatch`; add `sensors`; add 3 handlers; wrap columns in `DndContext` |
| `src/components/Board/Board.test.tsx` | Create | New smoke test file |
| `src/components/Card/Card.test.tsx` | Modify | Add dnd-kit mocks |
| `src/components/Column/Column.test.tsx` | Modify | Add dnd-kit mocks |

### References

- dnd-kit integration pattern: [Source: architecture.md#Frontend Architecture > dnd-kit for drag-and-drop]
- Sensor configuration: [Source: architecture.md#Process Patterns > Inline Editing]  
- DnD event → action mapping: [Source: architecture.md#Communication Patterns > DnD Event → Action Mapping]
- DnD boundary rule: [Source: architecture.md#Architectural Boundaries > DnD Boundary]
- Animation-safe CSS: [Source: architecture.md#CSS Patterns]
- Story 3.1 AC source: [Source: epics.md#Story 3.1]
- Reducer implementation: [Source: sticky-board/src/context/BoardReducer.ts]
- Types: [Source: sticky-board/src/types/types.ts]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

### Completion Notes List

- Implemented `useSortable` in `Card.tsx` — adds `setNodeRef`, `attributes`, `listeners`, `dragStyle` (transform+transition). Listeners conditionally applied only when `editingField === null` to protect contenteditable interactions.
- Implemented `useDroppable` + `SortableContext` in `Column.tsx` — column-cards div has droppable ref for empty-column support; card list wrapped in `SortableContext` with `verticalListSortingStrategy`.
- Implemented full `DndContext` setup in `Board.tsx`: `PointerSensor` with 8px `activationConstraint`, `closestCorners` collision detection, and all three handlers (`handleDragStart`, `handleDragOver`, `handleDragEnd`).
- `handleDragEnd` dispatches `CLEAR_DRAGGING` unconditionally first (prevents stuck state on cancelled drag), then `MOVE_CARD` for cross-column drops or `REORDER_CARD` for within-column reorders.
- Created `Board.test.tsx` (new) — smoke test verifying DndContext doesn't break Board render.
- Updated `Card.test.tsx` and `Column.test.tsx` with dnd-kit mocks to prevent jsdom pointer event issues.
- All 66 tests pass. TypeScript build: zero errors.

### File List

- `sticky-board/src/components/Card/Card.tsx` — modified: added useSortable, CSS imports; dragStyle; updated card div ref/style/attributes/listeners
- `sticky-board/src/components/Column/Column.tsx` — modified: added SortableContext, verticalListSortingStrategy, useDroppable imports; cardIds; SortableContext wrapping; setDroppableRef on column-cards
- `sticky-board/src/components/Board/Board.tsx` — modified: added DndContext, PointerSensor, useSensor, useSensors, closestCorners, DragStartEvent, DragEndEvent, ColumnId imports; dispatch extraction; sensors; handleDragStart/Over/End handlers; DndContext wrapping
- `sticky-board/src/components/Board/Board.test.tsx` — created: new smoke test with DndContext, roughjs, and BoardContext mocks
- `sticky-board/src/components/Card/Card.test.tsx` — modified: added @dnd-kit/sortable and @dnd-kit/utilities mocks
- `sticky-board/src/components/Column/Column.test.tsx` — modified: added @dnd-kit/sortable and @dnd-kit/core mocks

## Change Log

- 2026-03-11: Story 3.1 implemented — Core drag-and-drop (cross-column MOVE_CARD, within-column REORDER_CARD) via dnd-kit. DndContext mounted in Board.tsx with PointerSensor (8px activationConstraint), closestCorners collision detection, and three event handlers. Card.tsx uses useSortable; Column.tsx uses SortableContext + useDroppable. Board.test.tsx created; Card.test.tsx and Column.test.tsx updated with dnd-kit mocks. All 66 tests pass, zero TypeScript build errors.
