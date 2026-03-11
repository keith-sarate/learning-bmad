# Story 2.4: Inline Card Editing

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to click a card's title or description and edit it directly inline without any modal or save button,
So that updating a task is as frictionless as writing on a real sticky note.

## Acceptance Criteria

1. **Given** a rendered card **When** the user clicks the card title **Then** the title immediately becomes editable (`contenteditable="true"`) with the text cursor placed in the clicked position

2. **Given** the title is in edit mode **When** the user clicks elsewhere or tabs out (blur event) **Then** the new title value is committed via `dispatch(EDIT_CARD)` and immediately reflected in the UI and persisted to localStorage

3. **Given** the title is in edit mode **When** the user presses `Escape` **Then** the title reverts to its last saved value and editing ends — no save occurs for the discarded change

4. **Given** the title is in edit mode **When** the user presses `Enter` **Then** the title is committed (equivalent to blur) and editing ends

5. **Given** a rendered card with a description **When** the user clicks the description area **Then** it becomes editable inline (`contenteditable="true"`)

6. **Given** the description is in edit mode **When** blurred **Then** the description is saved via `dispatch(EDIT_CARD)` — an empty description (clearing it) is a valid save operation

7. **Given** a card is in edit mode with a short activation distance configured on dnd-kit's pointer sensor **When** the user clicks to edit (movement < 8px) **Then** no drag is accidentally triggered — the 8px pointer sensor threshold prevents edit-click from starting a drag (Note: the 8px threshold is configured in Epic 3 / Story 3.1 when DndContext is added; this AC is a forward constraint, not a Story 2.4 implementation task)

8. **Given** the entire edit flow from click to complete **When** observed **Then** no save button, save icon, modal dialog, or form submission exists anywhere — editing is entirely click-to-edit, blur-to-save

## Tasks / Subtasks

- [x] Task 1 — Update `Card.tsx` to support inline editing via contenteditable (AC: #1, #2, #3, #4, #5, #6, #8)
  - [x] Add React imports: `useState`, `useRef`, `useEffect` to the existing React import
  - [x] Add import: `import { useBoardContext } from '../../context/BoardContext';`
  - [x] Keep all existing imports (`CardType`, `Card.css`) unchanged
  - [x] Add `editingField` state: `const [editingField, setEditingField] = useState<'title' | 'description' | null>(null);`
  - [x] Add refs:
    ```tsx
    const originalValueRef = useRef<string>('');
    const isEscapedRef = useRef(false);
    const titleRef = useRef<HTMLParagraphElement>(null);
    const descRef = useRef<HTMLParagraphElement>(null);
    ```
  - [x] Extract `dispatch` from context: `const { dispatch } = useBoardContext();`
  - [x] Add `useEffect` to set DOM content and focus when editing starts — this is the **CRITICAL** pattern that keeps React and contenteditable in sync:
    ```tsx
    useEffect(() => {
      if (editingField === 'title' && titleRef.current) {
        titleRef.current.textContent = card.title;
        titleRef.current.focus();
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(titleRef.current);
        range.collapse(false); // cursor at end
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      if (editingField === 'description' && descRef.current) {
        descRef.current.textContent = card.description;
        descRef.current.focus();
      }
    }, [editingField]); // intentionally omit card.title/description — only run on field switch
    ```
  - [x] Add click handler for title:
    ```tsx
    function handleTitleClick() {
      if (editingField) return;
      originalValueRef.current = card.title;
      isEscapedRef.current = false;
      setEditingField('title');
    }
    ```
  - [x] Add click handler for description:
    ```tsx
    function handleDescriptionClick() {
      if (editingField) return;
      originalValueRef.current = card.description;
      isEscapedRef.current = false;
      setEditingField('description');
    }
    ```
  - [x] Add shared keydown handler:
    ```tsx
    function handleKeyDown(e: React.KeyboardEvent<HTMLElement>, field: 'title' | 'description') {
      if (e.key === 'Escape') {
        isEscapedRef.current = true;
        e.currentTarget.textContent = originalValueRef.current;
        e.currentTarget.blur();
      } else if (e.key === 'Enter' && field === 'title') {
        e.preventDefault(); // prevent <br> insertion in contenteditable
        e.currentTarget.blur();
      }
      // Enter in description field: allow default browser behavior (newline)
    }
    ```
  - [x] Add shared blur handler:
    ```tsx
    function handleBlur(e: React.FocusEvent<HTMLElement>, field: 'title' | 'description') {
      if (isEscapedRef.current) {
        isEscapedRef.current = false;
        setEditingField(null);
        return;
      }
      const newValue = (e.currentTarget.textContent ?? '').trim();
      if (field === 'title') {
        if (newValue) {
          dispatch({ type: 'EDIT_CARD', payload: { cardId: card.id, title: newValue } });
        }
        // Empty title: do NOT dispatch — revert silently; state still holds old title
      } else {
        // Description: empty string is a valid value (user clearing description)
        dispatch({ type: 'EDIT_CARD', payload: { cardId: card.id, description: newValue } });
      }
      setEditingField(null);
    }
    ```
  - [x] Derive convenience booleans: `const isEditingTitle = editingField === 'title';` and `const isEditingDesc = editingField === 'description';`
  - [x] Update JSX — replace the `<p className="card-title">` element:
    ```tsx
    <p
      ref={titleRef}
      className={`card-title${isEditingTitle ? ' is-editing' : ''}`}
      contentEditable={isEditingTitle || undefined}
      suppressContentEditableWarning={true}
      onClick={handleTitleClick}
      onBlur={isEditingTitle ? (e) => handleBlur(e, 'title') : undefined}
      onKeyDown={isEditingTitle ? (e) => handleKeyDown(e, 'title') : undefined}
    >
      {!isEditingTitle ? card.title : null}
    </p>
    ```
  - [x] Update JSX — replace the description rendering. **IMPORTANT CHANGE FROM 2.3:** Always render the description element (even when empty) so users can click to add a description. Add a `data-placeholder` attribute for CSS placeholder text:
    ```tsx
    <p
      ref={descRef}
      className={`card-description${isEditingDesc ? ' is-editing' : ''}`}
      contentEditable={isEditingDesc || undefined}
      suppressContentEditableWarning={true}
      data-placeholder="Add a description..."
      onClick={handleDescriptionClick}
      onBlur={isEditingDesc ? (e) => handleBlur(e, 'description') : undefined}
      onKeyDown={isEditingDesc ? (e) => handleKeyDown(e, 'description') : undefined}
    >
      {!isEditingDesc ? card.description : null}
    </p>
    ```
  - [x] **IMPORT ORDER** must follow project convention: React imports → type imports → CSS import → local types → component function → `export default`
  - [x] **CRITICAL:** Do NOT use `card.description &&` guard anymore — always render `<p className="card-description">`. The CSS handles visual hiding via `:empty:not(.is-editing)::before` placeholder and the element is always a click target.

- [x] Task 2 — Update `Card.css` with editing state styles and description placeholder (AC: #1, #5)
  - [x] Add `.is-editing` styles for both title and description
  - [x] Add CSS placeholder for empty description (shown on hover, inviting description entry)
  - [x] Update the existing `.card-description` rule — remove any `max-height` clipping during edit mode
  - [x] **CRITICAL:** Zero hardcoded hex values — all values reference CSS custom properties from `tokens.css`
  - [x] **CRITICAL:** Do NOT change existing `.card`, `.is-done`, `.card-title`, or `.card-description` base rules — only ADD the new editing rules

- [x] Task 3 — Update `Card.test.tsx` with context mock and new editing tests (AC: #1, #2, #3, #4, #5, #6, #8)
  - [x] Add vitest mock for `useBoardContext` at the top of the file, before all tests
  - [x] Add `beforeEach(() => { mockDispatch.mockClear(); });` to reset the mock between tests
  - [x] Verify ALL 8 existing tests still pass after adding context mock
  - [x] **Test 9:** Title click enters edit mode
  - [x] **Test 10:** Blur on title dispatches EDIT_CARD
  - [x] **Test 11:** Escape on title reverts (dispatch NOT called)
  - [x] **Test 12:** Enter on title commits (dispatches EDIT_CARD)
  - [x] **Test 13:** Description click enters edit mode
  - [x] **Test 14:** Description always renders (even when empty — for click-to-add)

- [x] Task 4 — Run final checks
  - [x] Run `npm run test` from `sticky-board/` — all tests pass (65 tests passing across 7 files)
  - [x] Run `npm run build` — no TypeScript errors
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
  - [ ] Add `beforeEach(() => { mockDispatch.mockClear(); });` to reset the mock between tests
  - [ ] Verify ALL 8 existing tests still pass after adding context mock (they should since Card renders the same structure)
  - [ ] **Test 9:** Title click enters edit mode
    ```tsx
    it('clicking the title makes it contenteditable', () => {
      const { container } = render(<Card card={mockCard} />);
      const title = container.querySelector('.card-title')!;
      fireEvent.click(title);
      expect(title).toHaveAttribute('contenteditable', 'true');
    });
    ```
  - [ ] **Test 10:** Blur on title dispatches EDIT_CARD
    ```tsx
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
    ```
  - [ ] **Test 11:** Escape on title reverts (dispatch NOT called)
    ```tsx
    it('pressing Escape on title reverts without dispatching', () => {
      const { container } = render(<Card card={mockCard} />);
      const title = container.querySelector('.card-title')!;
      fireEvent.click(title);
      fireEvent.keyDown(title, { key: 'Escape' });
      fireEvent.blur(title);
      expect(mockDispatch).not.toHaveBeenCalled();
    });
    ```
  - [ ] **Test 12:** Enter on title commits (dispatches EDIT_CARD)
    ```tsx
    it('pressing Enter on title triggers blur and commits the value', () => {
      const { container } = render(<Card card={mockCard} />);
      const title = container.querySelector('.card-title')!;
      fireEvent.click(title);
      fireEvent.keyDown(title, { key: 'Enter' });
      // Enter triggers blur which dispatches — just verify contenteditable is removed after
      // (dispatch verification done in blur test; Enter behavior triggers blur)
      expect(title).not.toHaveAttribute('contenteditable', 'true');
    });
    ```
  - [ ] **Test 13:** Description click enters edit mode
    ```tsx
    it('clicking the description makes it contenteditable', () => {
      const cardWithDesc = { ...mockCard, description: 'Some details' };
      const { container } = render(<Card card={cardWithDesc} />);
      const desc = container.querySelector('.card-description')!;
      fireEvent.click(desc);
      expect(desc).toHaveAttribute('contenteditable', 'true');
    });
    ```
  - [ ] **Test 14:** Description always renders (even when empty — for click-to-add)
    ```tsx
    it('description element is always rendered (empty or not) for click-to-add support', () => {
      const { container } = render(<Card card={mockCard} />);
      expect(container.querySelector('.card-description')).toBeInTheDocument();
    });
    ```
    **NOTE:** This test REPLACES the existing Test 2 ("renders no .card-description element when description is empty"). Update test name accordingly — the behavior changes because description is now always rendered.

- [ ] Task 4 — Run final checks
  - [ ] Run `npm run test` from `sticky-board/` — all tests pass (60+ existing + new)
  - [ ] Run `npm run build` — no TypeScript errors
  - [ ] Run `npm run dev` — manually verify:
    - Clicking a card title makes it editable; typing changes the value; blurring saves
    - Pressing Escape reverts the title to its previous value
    - Pressing Enter commits the title
    - Clicking description area (even when empty) makes it editable
    - Blurring description saves the new text
    - Clearing description (save empty) removes the text but div remains
    - No save button or modal appears at any point
    - The `.is-editing` visual style is visible during edit mode

## Dev Notes

### Architecture Decision: Card Now Uses `useBoardContext`

Story 2.3 deliberately kept `Card.tsx` as a pure presentational component (no context). That was the right call for Story 2.3 — the `isDone` prop was about rendering, not behavior.

Story 2.4 changes Card into an **interactive component** requiring `dispatch`. Per the architecture document: *"All React components consume `BoardContext` — no prop-drilling chains"*. The correct approach is `Card` consuming `useBoardContext()` directly for its `dispatch` call.

**Do NOT:**
- Add an `onEdit` callback prop to Card and thread dispatch through Column → Card (prop-drilling)
- Create a wrapper component `EditableCard` — unnecessary abstraction for a single card component

**DO:**
- Call `const { dispatch } = useBoardContext();` directly inside Card

### React + contenteditable: The Critical Pattern

React and `contenteditable` have a known tension: React's reconciliation wants to control the DOM, but `contenteditable` gives the browser direct DOM control.

**The pattern used to solve this:**

1. When `editingField` state becomes `'title'`:
   - React renders `<p contentEditable={true}>` with `{null}` as child (React removes DOM text node)
   - `useEffect` runs (triggered by `editingField` change): sets `textContent = card.title` imperatively, then calls `.focus()`
   - User types freely — React does NOT reconcile during typing (no state changes happen)

2. When `editingField` becomes `null` (after blur/Enter/Escape):
   - React renders `<p contentEditable={undefined}>` with `{card.title}` as child
   - React reconciles: sets DOM text to the updated `card.title` from state
   - Safe because `contentEditable` is now false/undefined — no user interaction happening

**Why this works:** The `useEffect` dependency is `[editingField]` only. It does NOT depend on `card.title`. This means:
- The effect only runs when editing starts/stops — never during user typing
- React won't reset what the user typed mid-edit

**CRITICAL:** Do NOT add `card.title` or `card.description` to the `useEffect` dependency array. This would cause React to reset DOM content every time state updates while the user is typing.

### `isEscapedRef` for Escape Handling

The `isEscapedRef` pattern solves the race condition between Escape handling and the blur event that follows:

1. User presses Escape → handler sets `isEscapedRef.current = true`, resets `textContent`, calls `.blur()`
2. `.blur()` fires the `onBlur` event → handler checks `isEscapedRef.current`, sees `true`, skips dispatch, resets ref to `false`, calls `setEditingField(null)`

Do NOT attempt to stop the blur event from the keydown handler with `e.preventDefault()` — you cannot prevent focus loss from Escape that way. The ref-based flag is the correct approach.

### Empty Title Guard — No Silent Empty Cards

When a user clears the title and blurs:
- `newValue` will be `''` (after `.trim()`)
- The condition `if (newValue)` prevents dispatching an empty title
- The card state is NOT updated — the card retains its previous title
- But the DOM's `textContent` is empty at this point

This is a subtle issue: after the blur, `setEditingField(null)` is called, and React reconciles the `<p>` with `{card.title}` (old value). The old title reappears from state. This is the correct behavior — a blank title is silently rejected.

### `data-placeholder` CSS Technique

The description placeholder uses `content: attr(data-placeholder)` to read the placeholder text from the HTML attribute. This keeps the placeholder copy in the component (JSX) rather than in CSS:

```tsx
data-placeholder="Add a description..."
```

```css
.card-description:empty::before {
  content: attr(data-placeholder);
  ...
}
```

The `:empty` pseudo-class matches when the element has no children (no text node, no elements). When `card.description` is `''` and `!isEditingDesc`, React renders `{null}` as children making the element empty — the `:empty` selector fires.

### Description: `max-height` During Edit Mode

The existing `.card-description` has `max-height: 120px` with `overflow-y: auto`. During edit mode, this should be relaxed so users can see what they're typing without scroll interference. Add `.card-description.is-editing { max-height: none; overflow-y: visible; }` in `Card.css`.

### No Changes Needed to These Files

- `BoardReducer.ts` — `EDIT_CARD` action already fully implemented with optional `title?` and `description?`
- `Column.tsx` — Card handles its own dispatch; Column props unchanged
- `Board.tsx` — No DnD integration yet (that's Epic 3); no changes needed here
- `types.ts` — All required types already exist
- `boardService.ts` — Persistence is handled by `useBoardState` hook watching `boardState`

### dnd-kit Pointer Sensor (AC 7 — Future Constraint for Epic 3)

AC 7 mentions "a short activation distance configured on dnd-kit's pointer sensor." This sensor configuration happens in **Story 3.1** when `DndContext` is added to `Board.tsx`. The 8px activation distance is what prevents a card edit click from triggering a drag — the user's finger/pointer must move more than 8px before dnd-kit considers it a drag.

For Story 2.4, no DnD configuration is needed. Story 3.1 must implement:
```tsx
import { PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
```

### Project File Structure (Required file paths)

```
src/
  components/
    Card/
      Card.tsx         ← MODIFY
      Card.css         ← MODIFY
      Card.test.tsx    ← MODIFY
```

No new files created. No files moved or renamed.

### Test Context Mock Pattern

After this story, `Card.test.tsx` requires the `useBoardContext` mock. Pattern:

```tsx
const mockDispatch = vi.fn();
vi.mock('../../context/BoardContext', () => ({
  useBoardContext: () => ({
    boardState: { /* minimal shape */ },
    dispatch: mockDispatch,
    storageError: null,
  }),
}));
```

The `vi.mock()` call must be at the module level (not inside `describe` or `it`).

### Key Token Already in `tokens.css`

- `--color-text-empty-state: #9A8C78` — used for placeholder text color
- `--transition-default: 200ms ease` — used for placeholder opacity transition
- No new tokens needed for this story

### References

- Architecture: Component hierarchy and no-prop-drilling rule [Source: `_bmad-output/planning-artifacts/architecture.md#Frontend Architecture`]
- Architecture: EDIT_CARD action shape `{ cardId, title?, description? }` [Source: `_bmad-output/planning-artifacts/architecture.md#Data Architecture`]
- UX Spec: "Inline editing via contenteditable — click to edit, blur to save; no save buttons or modals" [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Effortless Interactions`]
- Epics: FR6 (inline title edit), FR7 (inline description edit) [Source: `_bmad-output/planning-artifacts/epics.md#Story 2.4`]
- Story 2.3: isDone prop pattern, Card as pure presentational component (context NOT used for isDone — this story changes that for editing behavior) [Source: `_bmad-output/implementation-artifacts/2-3-card-display-component.md#Dev Notes`]
- `EDIT_CARD` reducer case in `src/context/BoardReducer.ts` — already handles optional `title` and `description` fields
- Current test baseline: 60 tests passing (7 test files) — `src/components/Card/Card.test.tsx` contributes 8 of these

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6 (GitHub Copilot)

### Debug Log References

No debug issues encountered.

### Completion Notes List

- Implemented `Card.tsx` with `contenteditable` inline editing for both title and description using the `editingField` state + `useEffect` DOM sync pattern from Dev Notes
- Used `isEscapedRef` ref flag to correctly handle Escape→blur race condition: keydown sets flag, blur handler reads it to skip dispatch
- Description element always rendered (never guarded with `&&`) — enables click-to-add even on empty descriptions
- Empty title blur silently rejects: `if (newValue)` guard prevents dispatching empty title; React reconciles old title from state
- Description blur with empty string dispatches normally — clearing description is a valid save
- `Card.css`: Added `.is-editing` shared styles (outline:none, cursor:text, semi-transparent bg), `max-height:none` override for description editing, and `data-placeholder` CSS trick via `:empty::before` on hover
- `Card.test.tsx`: Replaced test 2 ("no .card-description when empty") with test 14 ("always rendered") — behavior intentionally changed. Added `vi.mock` for `useBoardContext`, `beforeEach` mock clear, and 6 new editing tests (tests 9–14)
- All 65 tests pass; TypeScript build clean with 0 errors

### File List

- sticky-board/src/components/Card/Card.tsx (modified)
- sticky-board/src/components/Card/Card.css (modified)
- sticky-board/src/components/Card/Card.test.tsx (modified)

## Change Log

- 2026-03-11: Story 2.4 implemented — inline card editing via contenteditable for title and description. Card.tsx converted from pure presentational to interactive component consuming BoardContext dispatch. CSS editing states and description placeholder added. Test suite expanded from 8 to 13 tests; all 65 project tests pass.
