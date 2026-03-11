# Story 2.3: Card Display Component

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want each card to display its title, optional description, and color identity clearly,
So that I can distinguish and read my tasks at a glance as if they were real sticky notes.

## Acceptance Criteria

1. **Given** a card with `color: 'yellow'` **When** rendered **Then** its background is `var(--color-card-yellow)` — no hardcoded hex color value appears in any component CSS file

2. **Given** each of the 6 card colors **When** the card text (title and description) is evaluated against the card background **Then** every combination meets WCAG 2.1 AA contrast ratio of 4.5:1 minimum using `#2C2416` as primary text color

3. **Given** a card with only a title and no description (`description: ''`) **When** rendered **Then** only the title is displayed — no empty description area, no placeholder text, and no blank space where description would appear

4. **Given** a card has a non-empty description **When** rendered **Then** the description text is visible below the title in a separate `<p>` element with class `card-description`

5. **Given** a card with a description text that exceeds the card's visible description area **When** rendered **Then** the description area scrolls independently within the card boundaries (`overflow-y: auto` on `.card-description`)

6. **Given** cards are displayed in any column **When** their text is inspected **Then** all card text (title and description) uses `var(--font-handwritten)` — the Caveat font

7. **Given** a card is rendered **When** inspected **Then** it has a subtle drop shadow applied via `box-shadow: 0 2px 4px var(--color-card-shadow)` — a CSS custom property from `tokens.css`

8. **Given** a card is in the Done column **When** rendered **Then** the CSS class `.is-done` is applied to the card root element and the card displays at `opacity: 0.55` with `filter: saturate(0.7)` — no inline `style` attribute used for this state, and the transition uses `var(--transition-done-fade)`

9. **Given** a card is NOT in the Done column **When** rendered **Then** no `.is-done` class is present and the card displays at full opacity with full saturation

10. **Given** a Done-column card's title is inspected for WCAG contrast **When** the reduced opacity is factored in **Then** Done card titles render at `font-weight: 700` to compensate for the fading effect

## Tasks / Subtasks

- [x] Task 1 — Expand `Card.tsx` to support description and done state (AC: #3, #4, #6, #8, #9, #10)
  - [x] Add `isDone?: boolean` to `CardProps` interface:
    ```tsx
    interface CardProps {
      card: CardType;
      isDone?: boolean;
    }
    ```
  - [x] Update the root `div` to conditionally apply `.is-done` class:
    ```tsx
    <div
      className={`card${isDone ? ' is-done' : ''}`}
      style={{ backgroundColor: `var(--color-card-${card.color})` }}
      data-card-id={card.id}
    >
    ```
  - [x] Conditionally render description only when `card.description` is non-empty:
    ```tsx
    {card.description && (
      <p className="card-description">{card.description}</p>
    )}
    ```
  - [x] Keep `<p className="card-title">{card.title}</p>` as-is — title always renders
  - [x] **IMPORT ORDER** must follow project convention: React imports → type imports → CSS import → local types → component function → `export default`

- [x] Task 2 — Expand `Card.css` with description styles and done state (AC: #1, #2, #3, #5, #7, #8, #10)
  - [x] Update `.card` to add CSS transition for the done fade:
    ```css
    .card {
      border-radius: var(--border-radius-card);
      box-shadow: 0 2px 4px var(--color-card-shadow);
      padding: var(--spacing-md);
      min-height: var(--card-min-height);
      cursor: pointer;
      font-family: var(--font-handwritten);
      transition: opacity var(--transition-done-fade), filter var(--transition-done-fade);
    }
    ```
  - [x] Add `.is-done` class implementing the Done visual state per UX spec:
    ```css
    .card.is-done {
      opacity: 0.55;
      filter: saturate(0.7);
    }
    ```
  - [x] Add contrast-boost rule for Done card titles:
    ```css
    .card.is-done .card-title {
      font-weight: var(--font-weight-bold);
    }
    ```
  - [x] Add `.card-description` styles for scrollable description area:
    ```css
    .card-description {
      font-size: var(--font-size-card-desc);
      color: var(--color-text-card-desc);
      margin: var(--spacing-xs) 0 0 0;
      font-family: var(--font-handwritten);
      font-weight: var(--font-weight-normal);
      line-height: var(--line-height-card);
      max-height: 120px;
      overflow-y: auto;
    }
    ```
  - [x] **CRITICAL:** Zero hardcoded hex values in `Card.css` — all visual values reference CSS custom properties from `tokens.css`

- [x] Task 3 — Update `Column.tsx` to pass `isDone` prop to Card (AC: #8, #9)
  - [x] In the `cards.map()` render, add `isDone={id === 'done'}` prop:
    ```tsx
    {(cards ?? []).map((card) => (
      <CardComponent key={card.id} card={card} isDone={id === 'done'} />
    ))}
    ```
  - [x] No other changes to `Column.tsx` are needed — this single prop addition is the full scope

- [x] Task 4 — Write tests for the expanded `Card` component (AC: #3, #4, #5, #8, #9, #10)
  - [x] Update or create `src/components/Card/Card.test.tsx`
  - [x] Import: `import { render, screen } from '@testing-library/react'`
  - [x] Helper: define a minimal `mockCard` fixture:
    ```tsx
    const mockCard = {
      id: 'test-id-123',
      title: 'My Task',
      description: '',
      color: 'yellow' as const,
      createdAt: Date.now(),
    };
    ```
  - [x] **Test 1:** Card renders the title correctly — `screen.getByText('My Task')` present
  - [x] **Test 2:** Card with empty description renders NO `.card-description` element — `expect(screen.queryByRole('paragraph', { name: ... })).toBeNull()` or check `container.querySelector('.card-description')` is null when `description: ''`
  - [x] **Test 3:** Card with non-empty description renders the description text — create card with `description: 'Some details'`, expect `screen.getByText('Some details')` to be in document
  - [x] **Test 4:** Card without `isDone` prop has no `.is-done` class — `expect(container.querySelector('.card')).not.toHaveClass('is-done')`
  - [x] **Test 5:** Card with `isDone={false}` has no `.is-done` class
  - [x] **Test 6:** Card with `isDone={true}` has `.is-done` class — `expect(container.querySelector('.card')).toHaveClass('is-done')`
  - [x] **Test 7:** Card background color uses the CSS var pattern — `expect(container.querySelector('.card')).toHaveStyle('background-color: var(--color-card-yellow)')`
  - [x] Mock pattern: no context needed for Card tests — Card is a pure presentational component with no context dependencies
  - [x] All existing Column tests (if any) must still pass after the `isDone` prop addition — `isDone` is optional so existing usages without the prop remain unbroken

- [x] Task 5 — Run final checks
  - [x] Run `npm run test` from `sticky-board/` — all tests pass (existing + new)
  - [x] Run `npm run build` — no TypeScript or build errors
  - [x] Run `npm run dev` — verify:
    - Cards render with correct background color
    - Cards with descriptions show them; cards without descriptions show no empty gap
    - Moving a card to the Done column (manually add to the `done` array in localStorage or via code) renders it with faded/desaturated appearance

## Change Log

- 2026-03-11: Implemented Story 2.3 — Card Display Component. Expanded Card.tsx with isDone prop and conditional description rendering. Expanded Card.css with is-done state, transition, and card-description styles. Updated Column.tsx to pass isDone={id === 'done'}. Created Card.test.tsx with 8 tests. All 60 tests pass. Build clean.

## Dev Notes

### Previous Story (2.2) Key Learnings

Story 2.2 created a **minimal** `Card.tsx` intentionally, with the explicit note: *"Story 2.3 (Card Display Component) will significantly expand this component — description rendering, Done state, drop shadow detail, WCAG compliance. Keep it minimal here."* The current placeholder card looks like:

```tsx
// Current Card.tsx (minimal from 2.2 - REPLACE in this story)
function Card({ card }: CardProps) {
  return (
    <div
      className="card"
      style={{ backgroundColor: `var(--color-card-${card.color})` }}
      data-card-id={card.id}
    >
      <p className="card-title">{card.title}</p>
    </div>
  );
}
```

This story's primary work is expanding this placeholder into the production card component.

### Done State — `.is-done` CSS Approach

Per UX spec, Done state is: `opacity: 0.55` + `filter: saturate(0.7)`. Do NOT use overlay divs, pseudo-elements, or `--color-done-overlay`. The `filter` property handles desaturation, `opacity` handles fade. Both are compositor-thread-safe (no layout/paint hit).

**Transition added to `.card`:** `transition: opacity var(--transition-done-fade), filter var(--transition-done-fade)`. The token `--transition-done-fade: 300ms ease` is already defined in `tokens.css`. This means when a card is dragged into Done (future Epic 3), the fade-in will animate automatically.

**WCAG contrast on Done:** Because `opacity: 0.55` reduces effective contrast, the UX spec prescribes `font-weight: 700` on Done card titles as a compensating measure. This is implemented via `.card.is-done .card-title { font-weight: var(--font-weight-bold); }` — already matches the font-weight already set on normal `.card-title`, so it's a safety rule for future-proofing.

### `isDone` Prop Pattern — Why Not Column Context?

The `isDone` prop is passed down from `Column.tsx` (`isDone={id === 'done'}`). This keeps `Card.tsx` as a pure presentational component with no context dependencies — it makes what to render explicit and testable with zero mock setup. Do NOT:
- Access `useBoardContext()` inside Card — Card should never reach for context
- Check `card.columnId` — there is no `columnId` field on `Card` type; column membership is tracked only in `boardState.columns` arrays
- Use inline styles for the done state (e.g., `style={{ opacity: 0.55 }}`) — the AC explicitly requires a CSS class

### Description Rendering — Conditional Guard

The guard `{card.description && ...}` correctly handles the empty string case because `''` is falsy in JavaScript/TypeScript. This satisfies AC #3 cleanly without needing `card.description !== ''` or `card.description?.length > 0`.

### Description — `max-height` and Scrollable

The max-height of `120px` on `.card-description` gives approximately 5–6 lines of Caveat at 0.875rem before scrolling activates. This preserves the compact post-it feel while supporting longer notes. `overflow-y: auto` (not `scroll`) means the scrollbar only appears when needed — no permanent scrollbar gutter on short descriptions.

### `card-description` Needs `font-family` — Don't Rely on Inheritance

Even though `font-family: var(--font-handwritten)` is set on `.card`, always declare it explicitly on `.card-description` as well. Font inheritance works, but explicit declarations make the intent clear and prevent breakage if `.card-description` is ever moved or exracted.

### Project File Structure (Required)

The `Card` component lives at `src/components/Card/Card.tsx` and `src/components/Card/Card.css`. No other files need to be created or renamed.

### `Column.tsx` — Minimal Change

Only one line changes in Column.tsx: adding `isDone={id === 'done'}` to the `<CardComponent>` call. The `isDone` prop is optional (`isDone?: boolean`) in `CardProps`, so Column instances passing no `isDone` (e.g., in tests) remain valid TypeScript.

### No Barrel Files

Direct imports only:
- ✅ `import type { Card as CardType } from '../../types/types'`
- ❌ Never `import type { Card } from '../../types'`

### Tokens in Use for This Story

| Token | Value | Usage |
|---|---|---|
| `--color-card-yellow` | `#FFE135` | Dynamic background via inline style |
| `--color-card-shadow` | `rgba(0,0,0,0.15)` | Card box-shadow |
| `--color-text-primary` | `#2C2416` | Card title text color |
| `--color-text-card-desc` | `#4A3A28` | Card description text color |
| `--font-handwritten` | `'Caveat', 'Patrick Hand', cursive` | All card text |
| `--font-size-card-title` | `1.05rem` | Title font size |
| `--font-size-card-desc` | `0.875rem` | Description font size |
| `--font-weight-bold` | `700` | Title weight + Done title contrast boost |
| `--font-weight-normal` | `400` | Description weight |
| `--line-height-card` | `1.4` | Card content line height |
| `--spacing-md` | `16px` | Card padding |
| `--spacing-xs` | `4px` | Description top margin |
| `--border-radius-card` | `2px` | Card border radius |
| `--card-min-height` | `80px` | Card minimum height |
| `--transition-done-fade` | `300ms ease` | Done state CSS transition |

### WCAG Contrast Notes

All 6 card colors against `#2C2416` text:
- Yellow (`#FFE135`): tightest — passes AA at 4.5:1+ with this text color (UX spec confirmed)
- Pink, Blue, Green, Orange, Purple: all pass more comfortably
- Done state fading is compensated by `font-weight: 700` on titles (already bold anyway)
- Description text `#4A3A28` on yellow: slightly lower contrast — if a future audit flags this, the fix is to darken `--color-text-card-desc` on yellow cards only (not in scope this story)

### Story 2.4 Preparation — Do NOT Pre-Implement

Story 2.4 adds inline editing via `contenteditable`. This story should:
- **NOT** add any `contenteditable` attributes
- **NOT** add click handlers for editing on the card
- **NOT** add `onBlur` or `onKeyDown` handlers
- **ONLY** render title and description as static `<p>` elements

Story 2.4's dev agent will modify `Card.tsx` and `Card.css` further — keep this story's scope clean.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-2.3-Card-Display-Component]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Done-State]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Typography-Scale]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Accessibility]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend-Architecture]
- [Source: sticky-board/src/styles/tokens.css]
- [Source: sticky-board/src/components/Card/Card.tsx] (current minimal placeholder from Story 2.2)
- [Source: sticky-board/src/components/Column/Column.tsx] (passes cards; needs isDone prop added)
- [Source: _bmad-output/implementation-artifacts/2-2-card-creation-with-color-selection.md#Task-2-Note]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-5 (GitHub Copilot)

### Debug Log References

### Completion Notes List

### Completion Notes List

- Task 1: Expanded CardProps with `isDone?: boolean`, added conditional `.is-done` class to root div, added conditional `{card.description && <p className="card-description">}` guard.
- Task 2: Updated `.card` with `transition: opacity/filter var(--transition-done-fade)`. Added `.card.is-done` (opacity 0.55, saturate 0.7), `.card.is-done .card-title` (font-weight bold), `.card-description` (max-height 120px, overflow-y auto). Zero hardcoded hex values.
- Task 3: Single-line change in Column.tsx — added `isDone={id === 'done'}` to CardComponent render.
- Task 4: Created Card.test.tsx with 8 unit tests covering all specified test cases. Card is a pure presentational component — no context mocking needed.
- Task 5: `npm run test` — 60/60 pass. `npm run build` — clean TypeScript + Vite build.

### File List

- sticky-board/src/components/Card/Card.tsx
- sticky-board/src/components/Card/Card.css
- sticky-board/src/components/Card/Card.test.tsx
- sticky-board/src/components/Column/Column.tsx
- _bmad-output/implementation-artifacts/sprint-status.yaml
