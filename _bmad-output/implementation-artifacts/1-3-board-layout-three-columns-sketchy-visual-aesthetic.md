# Story 1.3: Board Layout, Three Columns & Sketchy Visual Aesthetic

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to see the Sticky Board with its three columns and hand-drawn aesthetic when I open the app,
So that I immediately understand the board structure and feel the tactile, physical quality of the product.

## Acceptance Criteria

1. **Given** the app loads **When** the board renders **Then** exactly three columns are visible — "To Do", "In Progress", and "Done" — in that fixed left-to-right order

2. **Given** a desktop viewport ≥ 1024px wide **When** the board renders **Then** all three columns are fully visible without horizontal scrolling

3. **Given** the board renders **When** the DOM and SVG output is inspected **Then** `Board.tsx` uses rough.js to draw SVG sketchy outlines/backgrounds for the board area and column borders — not plain CSS rectangles or `border` properties

4. **Given** the board renders **When** any column or board structural text is inspected **Then** all text uses `var(--font-handwritten)` — the Caveat Google Font

5. **Given** a column contains no cards **When** rendered **Then** an empty-state placeholder element is visible inside the column indicating it is a valid drop target (e.g., a dashed outline or subtle text prompt)

6. **Given** a column contains cards that exceed its visible height **When** a user scrolls within that column **Then** the column scrolls independently without affecting the scroll position of the other columns

7. **Given** column name labels are inspected across the entire UI **When** searched **Then** no settings panel, rename button, or column customization option exists anywhere in the interface

## Tasks / Subtasks

- [x] Task 1 — Create `src/types/types.ts` with minimal types needed for Board/Column (AC: #1)
  - [x] Create `src/types/types.ts` and delete the `.gitkeep` placeholder in `src/types/`
  - [x] Export `type ColumnId = 'todo' | 'inProgress' | 'done'` — used by Board and Column now, extended in Story 2.1
  - [x] Export `interface ColumnConfig { id: ColumnId; title: string; emptyStateText: string }` — static column definitions
  - [x] Add `TODO: Story 2.1 will add Card, BoardState, CardColor, StorageError, BoardContextValue here` comment

- [x] Task 2 — Create `src/components/Column/Column.tsx` and `Column.css` (AC: #1, #3, #4, #5, #6, #7)
  - [x] Create directory `src/components/Column/`
  - [x] Create `Column.tsx` with `ColumnProps: { id: ColumnId; title: string; emptyStateText: string; children?: React.ReactNode }`
  - [x] Use `useRef<HTMLDivElement>` for the column container and `useRef<SVGSVGElement>` for the rough.js SVG
  - [x] Implement `drawSketchyBorder()` helper that reads border and background colors via `getComputedStyle(document.documentElement)`, clears the SVG, then calls `rough.svg(svgRef.current)` and appends `rc.rectangle(...)` child
  - [x] Use `useEffect` to call `drawSketchyBorder()` on mount
  - [x] Add `ResizeObserver` in the same `useEffect` to re-call `drawSketchyBorder()` on column resize; clean up observer in return
  - [x] Render column-header `<h2>` with `{title}` and `className="column-header"`
  - [x] Render `{children}` in the cards area — placeholder `<div className="column-cards">` for now (Story 2+ will populate)
  - [x] Render empty-state `<div className="column-empty-state">` with `{emptyStateText}` that is ONLY shown when `!children` (or no card children — for now always show since no cards exist)
  - [x] Export `default Column`
  - [x] Create `Column.css`: column container (position relative, flex column, overflow-y auto for independent scroll), absolutely-positioned `pointer-events: none; z-index: 0` SVG layer for rough.js, column-inner layout layer at `z-index: 1`, column-header styles using `var(--font-handwritten)`, `var(--font-size-column-header)`, `var(--color-text-column-header)`, column-empty-state with `var(--color-text-empty-state)`, `var(--font-size-empty-state)`, `var(--font-handwritten)`

- [x] Task 3 — Create `src/components/Board/Board.tsx` and `Board.css` (AC: #1, #2, #3, #4)
  - [x] Create directory `src/components/Board/`
  - [x] Create `Board.tsx`: define the three column configs as a `const COLUMNS: ColumnConfig[]` array with `{ id: 'todo', title: 'To Do', emptyStateText: 'Your tasks go here' }`, `{ id: 'inProgress', title: 'In Progress', emptyStateText: 'Drag cards here to start' }`, `{ id: 'done', title: 'Done', emptyStateText: 'Completed tasks land here' }`
  - [x] Use `useRef<HTMLDivElement>` for the board container and `useRef<SVGSVGElement>` for the board-level rough.js SVG
  - [x] Implement `drawBoardBackground()` that clears the SVG, reads board dimensions, and draws a full rough.js sketchy rectangle covering the board area using `rough.svg(svgRef.current)` and warm brown stroke — creates the corkboard frame effect
  - [x] Use `useEffect` + `ResizeObserver` to call `drawBoardBackground()` on mount and resize; clean up in return
  - [x] Render the three `<Column>` components inside a `<div className="board-columns">` grid
  - [x] Render an absolutely-positioned `<svg className="board-canvas" ref={boardSvgRef} aria-hidden="true" />` behind the columns
  - [x] Export `default Board`
  - [x] Create `Board.css`: board container (position relative, max-width `var(--board-max-width)`, margin 0 auto, padding `var(--spacing-md)`, min-height 100vh), board-canvas SVG (position absolute, inset 0, pointer-events none, z-index 0), board-columns (display grid, grid-template-columns `repeat(3, 1fr)`, gap `var(--gap-columns)`, position relative, z-index 1)

- [x] Task 4 — Replace `src/App.tsx` (completely replace Vite scaffold) (AC: #1)
  - [x] Replace the current Vite counter/logo content in `App.tsx` with a clean version that imports and renders `<Board />`
  - [x] Import `'./App.css'` and `Board` from `'./components/Board/Board'` — NO other imports (no useState, no reactLogo, no viteLogo)
  - [x] The App function returns: `<div className="app"><Board /></div>`
  - [x] Remove unused imports: `useState`, `reactLogo`, `viteLogo`

- [x] Task 5 — Clean `src/App.css` (keep #root fix from Story 1.2, add `.app` layout class)
  - [x] Remove all Vite-specific classes (`.logo`, `.logo:hover`, `.logo.react:hover`, `@keyframes logo-spin`, `.card`, `.read-the-docs`) from App.css
  - [x] Keep the `#root` rule (already cleaned in Story 1.2): `#root { margin: 0 auto; }`
  - [x] Add `.app { min-height: 100vh; display: flex; flex-direction: column; }` — minimal app wrapper

- [x] Task 6 — Update `src/App.test.tsx` to match new App structure (regression guard)
  - [x] Replace the current smoke test with one that checks for board-level rendering: import `screen` from RTL, render `<App />`, check that three column headings are present using `screen.getByRole('heading', { name: 'To Do' })`, etc.
  - [x] Keep the `renders without crashing` test name or update to something descriptive like `renders board with three columns`
  - [x] Run `npm run test` to pass before marking complete

- [x] Task 7 — Write `Column.test.tsx` unit tests (AC: #1, #4, #5, #7)
  - [x] Create `src/components/Column/Column.test.tsx`
  - [x] Test: "renders with the given title as a heading" — `render(<Column id="todo" title="To Do" emptyStateText="..." />)`, expect `screen.getByRole('heading', { name: 'To Do' })` to exist
  - [x] Test: "renders empty-state placeholder when no children" — expect the empty-state text to be in the document
  - [x] Test: "does not render empty-state when children are provided" — pass a dummy child, expect empty-state text NOT in document
  - [x] Note: rough.js will throw/warn in jsdom (no real SVG support) — add a `vi.mock('roughjs', ...)` stub or wrap the draw call in a try/catch; see Dev Notes for the mock pattern

- [x] Task 8 — Run final checks
  - [x] Run `npm run test` from `sticky-board/` — all tests pass (smoke + Column tests)
  - [x] Run `npm run build` — no TypeScript or build errors
  - [x] Run `npm run dev` and visually confirm: warm cream background, three Caveat-font columns, rough.js sketchy borders visible, empty-state text visible, no Vite logo or counter anywhere

## Dev Notes

### Technology in Use for This Story

| Technology | Details |
|---|---|
| roughjs | v4.6.x — installed in Story 1.1. Import: `import rough from 'roughjs'`. Has built-in TypeScript types. |
| React (useRef, useEffect, useCallback) | For DOM measurements and imperative SVG drawing |
| ResizeObserver | Browser API for responsive SVG redraw — no polyfill needed (evergreen browsers only) |
| CSS Grid | `repeat(3, 1fr)` — three equal columns |
| CSS Custom Properties | All visual values from `src/styles/tokens.css` (fully in place from Story 1.2) |
| Google Fonts (Caveat) | Already loaded in `index.html` from Story 1.2 |

### rough.js Integration — Exact Implementation Pattern

This is the most critical technical detail in this story. rough.js is an imperative SVG drawing library. Use this exact pattern:

**Importing rough.js:**
```typescript
import rough from 'roughjs';
```

**Column.tsx — drawing sketchy column border:**
```typescript
const containerRef = useRef<HTMLDivElement>(null);
const svgRef = useRef<SVGSVGElement>(null);

const drawSketchyBorder = useCallback(() => {
  const container = containerRef.current;
  const svg = svgRef.current;
  if (!container || !svg) return;

  const { width, height } = container.getBoundingClientRect();
  if (width === 0 || height === 0) return; // guard against zero-size during initial mount

  // Resize SVG to match container
  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(height));

  // Clear existing rough.js drawings
  while (svg.firstChild) svg.removeChild(svg.firstChild);

  // Read CSS custom property values for rough.js (it does NOT accept CSS var references)
  const style = getComputedStyle(document.documentElement);
  const borderColor = style.getPropertyValue('--color-column-border').trim();   // '#8B7355'
  const bgColor = style.getPropertyValue('--color-column-background').trim();   // '#EDE8D8'

  const rc = rough.svg(svg);
  const padding = 3;
  svg.appendChild(
    rc.rectangle(padding, padding, width - padding * 2, height - padding * 2, {
      stroke: borderColor,
      strokeWidth: 2,
      roughness: 1.5,
      fill: bgColor,
      fillStyle: 'solid',
    })
  );
}, []);

useEffect(() => {
  drawSketchyBorder();

  const observer = new ResizeObserver(() => drawSketchyBorder());
  if (containerRef.current) observer.observe(containerRef.current);
  return () => observer.disconnect();
}, [drawSketchyBorder]);
```

**Board.tsx — drawing board background frame:**
```typescript
// Similar pattern — draw a full board-width background rectangle
// Use '--color-board-background' fill and '--color-column-border' stroke
// This creates the subtle corkboard frame behind all columns
```

**⚠️ Critical rough.js rules:**
1. **NEVER** pass `var(--token)` strings to rough.js `stroke` or `fill` — use `getComputedStyle` to resolve them first
2. **Always** clear the SVG (`while(svg.firstChild) svg.removeChild(svg.firstChild)`) before re-drawing — otherwise drawings stack on top of each other
3. **Always** set `svg.setAttribute('width', ...)` and `setAttribute('height', ...)` before drawing — rough.js draws relative to SVG dimensions
4. **Guard against zero-size**: if `getBoundingClientRect()` returns `{ width: 0, height: 0 }` (happens during initial render), skip drawing — the ResizeObserver will call again once the element has dimensions
5. The SVG layer must have `pointer-events: none` in CSS to prevent blocking mouse events on cards

**rough.js in jsdom (tests):** jsdom does not support `getBoundingClientRect()` (returns zero) and has no real SVG rendering. This causes the drawSketchyBorder/drawBoardBackground functions to hit the zero-size guard and exit safely. **No mock is needed** as long as the zero-size guard is implemented. Alternatively, mock the entire `roughjs` module in tests: `vi.mock('roughjs', () => ({ default: { svg: () => ({ rectangle: () => document.createElementNS('http://www.w3.org/2000/svg', 'rect') }) } }))`.

### File Structure Changes in This Story

```
sticky-board/
└── src/
    ├── App.tsx           ← REPLACE: Remove Vite scaffold, render <Board />
    ├── App.css           ← MODIFY: Remove Vite-specific classes, add .app layout
    ├── App.test.tsx      ← UPDATE: Test for three column headings instead of Vite content
    ├── types/
    │   ├── .gitkeep      ← DELETE: Replace with actual file
    │   └── types.ts      ← CREATE: Minimal ColumnId + ColumnConfig types
    └── components/
        ├── Board/
        │   ├── Board.tsx ← CREATE: CSS grid + rough.js board frame
        │   └── Board.css ← CREATE: Board container, grid, SVG layer positioning
        └── Column/
            ├── Column.tsx ← CREATE: Column header, empty state, rough.js border
            ├── Column.css ← CREATE: Column styles, independent scroll, empty state
            └── Column.test.tsx ← CREATE: Column unit tests
```

> 🛑 **Do NOT touch**: `src/styles/tokens.css`, `src/styles/global.css`, `src/main.tsx`, `src/context/`, `src/hooks/`, `src/services/` — These are either already complete or belong to Story 2.1+

### Critical Architecture Rules for This Story

1. **rough.js SVG layers must be `z-index: 0`, `position: absolute`, `pointer-events: none`** — the grid of columns sits at `z-index: 1`; failing to set `pointer-events: none` will intercept all mouse events on cards
2. **Column scrolls independently** — the column's card area must have `overflow-y: auto` (or `scroll`) and a fixed or max height; the column header is `position: sticky; top: 0` within the column so it stays visible during scroll
3. **No hardcoded hex values** — use `getComputedStyle(document.documentElement).getPropertyValue('--color-column-border').trim()` to pass color values to rough.js; the CSS token system remains the single source of truth
4. **No barrel files** — import `Column` as `import Column from './components/Column/Column'`, NOT `from './components/Column'`
5. **TypeScript strict mode** — all props interfaces typed explicitly (`ColumnProps`, `BoardProps`); no `any`; all `useRef` calls typed with their element type (`useRef<SVGSVGElement>(null)`)
6. **Board.tsx owns DndContext eventually** — this story creates Board.tsx in its final location per the architecture; Story 3+ will add DnD. The component's slot for DnD event handlers (onDragStart, onDragOver, onDragEnd) should NOT be pre-added now — implement only what story 1.3 needs
7. **App.tsx is the last Vite scaffold code** — after this story, no Vite-generated placeholder code remains in the project; App.tsx becomes a clean, minimal host component
8. **Column header is sticky** — per UX spec, the column header is "always visible (sticky top within the column)" so use `position: sticky; top: 0` within the column container. The column bg color must also be applied to the sticky header so it doesn't become transparent during scroll

### Component Props Reference

**ColumnProps (defined in `Column.tsx`):**
```typescript
interface ColumnProps {
  id: ColumnId;
  title: string;
  emptyStateText: string;
  children?: React.ReactNode;  // Will hold Card components in Story 2+
}
```

**BoardProps:** None for now (Board is self-contained with hardcoded column configs). Story 2.1 will add `state` and `dispatch` props when BoardContext is introduced.

**COLUMNS constant in Board.tsx:**
```typescript
const COLUMNS: ColumnConfig[] = [
  { id: 'todo',       title: 'To Do',       emptyStateText: 'Your tasks go here' },
  { id: 'inProgress', title: 'In Progress', emptyStateText: 'Drag cards here to start' },
  { id: 'done',       title: 'Done',        emptyStateText: 'Completed tasks land here' },
];
```

### CSS Layout Details

**Board layout (Board.css):**
```css
.board {
  position: relative;
  max-width: var(--board-max-width);   /* 1400px */
  margin: 0 auto;
  padding: var(--spacing-md);          /* 16px padding */
  min-height: 100vh;
}

.board-canvas {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.board-columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--gap-columns);             /* 24px between columns */
  position: relative;
  z-index: 1;
  min-height: calc(100vh - var(--spacing-2xl));  /* columns fill viewport height */
}
```

**Column layout (Column.css):**
```css
.column {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 400px; /* Visible even when empty */
  /* No border-radius or border here — rough.js SVG handles the visual border */
}

.column-border-canvas {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  width: 100%;
  height: 100%;
}

.column-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.column-header {
  font-family: var(--font-handwritten);
  font-size: var(--font-size-column-header);  /* 1.25rem */
  font-weight: var(--font-weight-bold);       /* 700 */
  color: var(--color-text-column-header);     /* #5C4A2A */
  padding: var(--column-padding) var(--column-padding) var(--spacing-md);
  margin: 0;
  position: sticky;
  top: 0;
  background-color: transparent; /* rough.js SVG provides the fill */
  z-index: 2;  /* above the column inner content */
  line-height: var(--line-height-card);
}

.column-cards {
  flex: 1;
  overflow-y: auto;
  padding: 0 var(--column-padding) var(--column-padding);
  display: flex;
  flex-direction: column;
  gap: var(--gap-cards);
}

.column-empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  font-family: var(--font-handwritten);
  font-size: var(--font-size-empty-state);
  color: var(--color-text-empty-state);
  text-align: center;
  border: 2px dashed var(--color-text-empty-state);
  border-radius: 4px;
  margin: var(--spacing-sm) 0;
  min-height: 80px;
}
```

### Previous Story Intelligence (Stories 1.1 and 1.2)

Lessons and state from Stories 1.1 and 1.2 that impact Story 1.3:

- **`src/App.tsx` is still the Vite scaffold** — it renders the Vite counter + logos; this story replaces it completely. The file was intentionally left untouched in stories 1.1 and 1.2 per their Notes.
- **`src/App.css` was cleaned**: Story 1.2 removed `max-width: 1280px`, `text-align: center`, and `padding: 2rem` from the `#root` rule; only `#root { margin: 0 auto; }` remains. Add the `.app` class but do NOT re-introduce those removed properties.
- **`src/App.test.tsx` currently imports React from 'react'** — NO IT DOESN'T (checked: the test just uses RTL render, no React import needed); update to test for Board structure not Vite content
- **`src/styles/tokens.css` is complete** — all design tokens available; no changes needed
- **`src/assets/react.svg` exists** — after replacing App.tsx, this file is no longer imported; leave it in place (don't delete it, as it's not causing harm and cleanup isn't this story's job; also `react.svg` is in `.gitkeep`-less assets which will be used by future stories potentially)
- **Vite version deployed is 7.3.1** (newer than architecture doc anticipated) — NO impact on this story
- **`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `roughjs`** are all already installed and available in `package.json`
- **`src/types/.gitkeep`** exists in types dir — delete it when creating `types.ts`
- **Working directory for ALL npm commands**: `sticky-board/` (the directory with `package.json`)
- **`src/context/.gitkeep`, `src/hooks/.gitkeep`, `src/services/.gitkeep`** — DO NOT touch these; they belong to Story 2.1

### Git Intelligence

Recent commits show:
1. `7fa8b38` — Story 1.2 implementation (tokens.css, global.css, index.html, main.tsx changes)
2. `50054a2` — Story 1.1 code review fixes
3. `11bc903` — Story 1.1 implementation

Pattern from recent work: Stories follow create → code review → implement in `sticky-board/` directory. Build and test pass before committing.

### Testing Approach

**rough.js in jsdom:** jsdom provides zero-size `getBoundingClientRect()` which means the zero-size guard in `drawSketchyBorder()` will exit early with no error. No mock needed IF the guard is coded properly (`if (width === 0 || height === 0) return`). This is the preferred approach over mocking roughjs.

**Column.test.tsx tests to write:**
```typescript
// Test 1: Renders heading with correct title
import { render, screen } from '@testing-library/react';
import Column from './Column';

test('renders column heading with given title', () => {
  render(<Column id="todo" title="To Do" emptyStateText="Your tasks go here" />);
  expect(screen.getByRole('heading', { name: 'To Do' })).toBeInTheDocument();
});

// Test 2: Shows empty state when no children
test('shows empty state text when no children', () => {
  render(<Column id="todo" title="To Do" emptyStateText="Your tasks go here" />);
  expect(screen.getByText('Your tasks go here')).toBeInTheDocument();
});

// Test 3: Hides empty state when children provided
test('hides empty state when children are provided', () => {
  render(
    <Column id="todo" title="To Do" emptyStateText="Your tasks go here">
      <div>A card</div>
    </Column>
  );
  expect(screen.queryByText('Your tasks go here')).not.toBeInTheDocument();
});
```

**Updated App.test.tsx:**
```typescript
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders board with three columns', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'To Do' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'In Progress' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Done' })).toBeInTheDocument();
  });
});
```

### Project Context Reference

- Component hierarchy: [architecture.md — Frontend Architecture: Component hierarchy](../planning-artifacts/architecture.md)
- rough.js integration: [architecture.md — Requirements to Structure Mapping](../planning-artifacts/architecture.md)
- Board layout CSS: [architecture.md — Implementation Patterns: CSS Patterns](../planning-artifacts/architecture.md)
- Column component: [ux-design-specification.md — Component Strategy: Column](../planning-artifacts/ux-design-specification.md)
- Board component: [ux-design-specification.md — Component Strategy: Board](../planning-artifacts/ux-design-specification.md)
- Empty state behavior: [ux-design-specification.md — Component Strategy: EmptyColumnState](../planning-artifacts/ux-design-specification.md)
- Typography tokens: [implementation-artifacts/1-2-design-token-system-global-stylesheet.md — Design Token Values](./1-2-design-token-system-global-stylesheet.md)
- Color tokens: [implementation-artifacts/1-2-design-token-system-global-stylesheet.md — Design Token Values](./1-2-design-token-system-global-stylesheet.md)
- Naming conventions: [architecture.md — Naming Patterns](../planning-artifacts/architecture.md)
- Structure rules (no barrel files): [architecture.md — Structure Patterns](../planning-artifacts/architecture.md)
- AC source: [planning-artifacts/epics.md — Story 1.3](../planning-artifacts/epics.md)
- UX empty state text: [ux-design-specification.md — Component Strategy: EmptyColumnState](../planning-artifacts/ux-design-specification.md)
- Previous story: [implementation-artifacts/1-2-design-token-system-global-stylesheet.md](./1-2-design-token-system-global-stylesheet.md)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6 (GitHub Copilot)

### Debug Log References

- ResizeObserver not available in jsdom — resolved by adding no-op stub in `setupTests.ts` using `(globalThis as Record<string, unknown>).ResizeObserver`; `global.ResizeObserver` was rejected by TypeScript browser lib

### Completion Notes List

- Implemented `src/types/types.ts` with `ColumnId` union type and `ColumnConfig` interface; deleted `.gitkeep`
- Created `Column` component with rough.js SVG sketchy border (zero-size guard handles jsdom), ResizeObserver for responsive redraw, empty-state shown only when no children
- Created `Board` component with rough.js sketchy background frame, CSS Grid 3-column layout, responsive ResizeObserver
- Replaced Vite scaffold in `App.tsx` with minimal `<Board />` host; all unused imports removed
- Cleaned `App.css`: removed all Vite-specific classes, added `.app` layout wrapper
- Updated `App.test.tsx` to assert three column headings present
- Wrote `Column.test.tsx` with 3 tests covering title render, empty-state visibility, and empty-state hiding with children
- All 4 tests pass; `npm run build` succeeds with zero errors/warnings

### Code Review Fixes (2026-03-11)

- **[H1] Fixed independent column scrolling** — moved `overflow-y: auto` from `.column-cards` to `.column-inner`, added `flex: 1; min-height: 0` on `.column-inner` to give it a definite constrained height as a flex child, removed `overflow: hidden` from `.column-inner`. Columns now scroll independently when cards fill the column.
- **[M2] Fixed sticky column header** — `.column-header { position: sticky }` was non-functional because the scroll container (`.column-inner`) had `overflow: hidden`. Now `.column-inner` is the scroll container (`overflow-y: auto`) so sticky anchors correctly.
- **[L1] Applied `id` prop** — `Column.tsx` now destructures `id` and sets `data-column-id={id}` on the root `<div>`, enabling DnD drop-target identification in Story 3+.
- **[L3] Fixed board-columns height** — changed `.board-columns` from `min-height: calc(100vh - var(--spacing-2xl))` (48px subtraction, incorrect) to `height: calc(100vh - var(--spacing-md) * 2)` (32px = 2× board padding, correct). Definite grid height ensures columns receive a definite cross-axis size for scroll to work.

### File List

- sticky-board/src/types/types.ts (created)
- sticky-board/src/types/.gitkeep (deleted)
- sticky-board/src/components/Column/Column.tsx (created)
- sticky-board/src/components/Column/Column.css (created)
- sticky-board/src/components/Column/Column.test.tsx (created)
- sticky-board/src/components/Board/Board.tsx (created)
- sticky-board/src/components/Board/Board.css (created)
- sticky-board/src/App.tsx (modified)
- sticky-board/src/App.css (modified)
- sticky-board/src/App.test.tsx (modified)
- sticky-board/src/setupTests.ts (modified)

## Change Log

- 2026-03-11: Story 1.3 implemented — Board layout, three-column grid, rough.js sketchy aesthetic, Caveat font, empty-state placeholders, Vite scaffold fully replaced
