---
stepsCompleted: [step-01-validate-prerequisites, step-02-design-epics, step-03-create-stories, step-04-final-validation]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
---

# learning-bmad - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Sticky Board (learning-bmad), decomposing the requirements from the PRD, UX Design, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: User can create a new card by clicking the sticky-note pad in the corner of the board
FR2: User can create a new card by clicking the [+] button
FR3: User selects a card color from a predefined palette at the time of creation
FR4: User enters a card title (required; displayed on the card face)
FR5: User can enter an optional card description (scrollable; accessible via edit mode)
FR6: User can edit a card's title inline by clicking on it — no modal, no separate edit screen
FR7: User can edit a card's description inline by clicking on it
FR8: User can delete a card by dragging it to the trash zone
FR9: The trash zone is only visible while a card drag is in progress
FR10: The board always displays exactly three columns: To Do, In Progress, Done
FR11: Column names are fixed and not user-configurable in the MVP
FR12: The full board is visible without horizontal scrolling on desktop viewports ≥ 1024px wide
FR13: Columns scroll vertically when they contain more cards than fit in the visible area
FR14: User can drag a card from any column to any other column
FR15: User can drag a card within the same column to reorder it
FR16: A dragged card displays a tilt animation while in motion
FR17: The trash zone appears in a consistent on-screen location when any card drag begins
FR18: Releasing a card on a valid column target places the card at the drop position in that column
FR19: A soft sound plays when a card is dropped onto a column
FR20: Cards in the Done column display in a faded/muted visual state to signal completion
FR21: The board background and column borders render with a hand-drawn sketchy aesthetic (rough.js or equivalent)
FR22: The card creation entry point (sticky-note pad) uses a peel animation to suggest interactivity
FR23: All card text uses a handwritten-style font (Caveat or Patrick Hand via Google Fonts)
FR24: All board state — cards, column assignments, card order, card colors, card content — is automatically saved to localStorage after every change
FR25: Board state is fully restored from localStorage on page load
FR26: A first-time user with no localStorage data sees an empty board ready for use
FR27: No board data is ever sent to any server or external service
FR28: Empty columns display a placeholder visual confirming they are valid drop targets
FR29: If localStorage is unavailable (e.g., private browsing mode), the app functions normally but does not attempt to persist — the user sees an informational notice that data will not be saved
FR30: If a localStorage write fails due to storage quota exceeded, the app surfaces a clear, non-blocking message and does not silently lose data

### NonFunctional Requirements

NFR1: App is interactive (all gestures responsive) within 3 seconds of page load on standard broadband
NFR2: Drag interactions are smooth at 60fps — no jank or stutter during card movement on target hardware (mid-range desktop/laptop)
NFR3: localStorage reads and writes complete in < 10ms for a typical board (up to 50 cards)
NFR4: Total JavaScript bundle does not exceed 400KB gzipped
NFR5: Board state is written to localStorage atomically — a failed or interrupted write never leaves a partially-saved or corrupt board state
NFR6: On detecting a corrupt localStorage entry, the app recovers gracefully by defaulting to an empty board state rather than throwing an unhandled error
NFR7: Zero unhandled JavaScript exceptions during normal usage (create, edit, move, delete cards)
NFR8: All interactive controls are reachable and operable via keyboard navigation
NFR9: Completion state (Done) is communicated through at least two visual signals (fading + column position), not color alone
NFR10: Card text meets WCAG 2.1 AA contrast against all colors in the default card color palette
NFR11: Pinch-to-zoom and browser zoom do not break the layout or make content inaccessible

### Additional Requirements

**From Architecture:**
- Project scaffold via `npm create vite@latest sticky-board -- --template react-ts` — this must be the first implementation story (Epic 1, Story 1)
- TypeScript strict mode (`strict: true` in tsconfig.json) enforced throughout
- State management: `useReducer` + React Context (`BoardContext` + `BoardReducer`) — no additional state library
- All localStorage I/O centralized in `boardService.ts` — zero direct localStorage calls in any other module
- dnd-kit for drag-and-drop (headless, no CSS opinions)
- rough.js for sketchy SVG board aesthetic
- Google Fonts: Caveat or Patrick Hand (loaded via `<link>` in `index.html`)
- CSS custom properties as design token system (all visual values in `tokens.css`)
- `crypto.randomUUID()` for all card ID generation — no Math.random() or Date.now() fallbacks
- Service functions return result objects `{ ok: true, data }` / `{ ok: false, error }` — never throw
- No barrel files (`index.ts` re-exports) — import directly from source files
- Component structure: `App > BoardContext.Provider > Board > DndContext > Column(×3) + TrashZone + StorageNotice`
- Vitest + React Testing Library for unit and component testing

**From UX:**
- Color selection is the first gesture in card creation (choose color before typing title)
- Persistence must be invisible — no loading spinners, no save confirmations, no sync indicators
- Dog-ear/peel animation on CardCreationPad hover (signals interactivity without a tooltip)
- Card tilt animation during drag (transform: rotate, compositor-only)
- Done column fade state is a primary design feature, not a CSS afterthought
- Empty board state must communicate invitation and possibility, not absence or error
- Inline editing via contenteditable — click to edit, blur to save; no save buttons or modals
- No onboarding modals, tooltip overlays, or confirmation dialogs for any interaction
- Warm off-white paper texture background (cream, subtle)
- Drop sound only on valid column drops (not drag cancels, not trash drops)

### FR Coverage Map

FR1: Epic 2 — Card creation via sticky-note pad
FR2: Epic 2 — Card creation via [+] button
FR3: Epic 2 — Color picker at card creation time
FR4: Epic 2 — Card title (required field)
FR5: Epic 2 — Optional card description (scrollable, edit mode)
FR6: Epic 2 — Inline title editing (contenteditable, no modal)
FR7: Epic 2 — Inline description editing (contenteditable, no modal)
FR8: Epic 3 — Drag-to-trash deletion
FR9: Epic 3 — Trash zone visible only during drag
FR10: Epic 1 — Three fixed columns (To Do / In Progress / Done)
FR11: Epic 1 — Column names fixed, not user-configurable
FR12: Epic 1 — Full board visible ≥1024px wide without horizontal scroll
FR13: Epic 1 — Columns scroll vertically when cards overflow
FR14: Epic 3 — Drag card cross-column
FR15: Epic 3 — Drag card within-column to reorder
FR16: Epic 3 — Card tilt animation during drag
FR17: Epic 3 — Trash zone appears at consistent location on drag start
FR18: Epic 3 — Card placed at drop position in target column
FR19: Epic 3 — Soft drop sound on valid column drop
FR20: Epic 3 — Done column cards faded/muted visual state
FR21: Epic 1 — Hand-drawn sketchy board aesthetic (rough.js)
FR22: Epic 2 — Sticky-note pad peel animation
FR23: Epic 1 — Handwritten font (Caveat or Patrick Hand)
FR24: Epic 2 — Auto-save all board state to localStorage on every change
FR25: Epic 2 — Full board state restored from localStorage on page load
FR26: Epic 2 — First-time user sees empty board ready for use
FR27: Epic 2 — No board data sent to any server or external service
FR28: Epic 1 — Empty column placeholder (valid drop target indicator)
FR29: Epic 4 — Private browsing: app functions normally, shows informational notice
FR30: Epic 4 — localStorage quota exceeded: non-blocking message, no silent data loss

## Epic List

### Epic 1: Board Foundation & Visual Identity
A user can open Sticky Board in any evergreen browser and see the complete visual experience — the sketchy hand-drawn cork board, three labeled columns (To Do / In Progress / Done), warm paper background, and handwritten Caveat typography — deployed as a fully static site. The board is beautiful and structurally complete, even with no cards yet.
**FRs covered:** FR10, FR11, FR12, FR13, FR21, FR23, FR28
**NFRs covered:** NFR4 (bundle ≤ 400KB), NFR11 (zoom-safe layout)

### Epic 2: Card Lifecycle — Create, Edit & Persist
A user can create cards by clicking the sticky-note pad or [+] button, select a color as the first gesture, type a title and optional description, edit any card's content inline with a single click, and have the entire board auto-persist to localStorage — surviving browser refreshes with zero data loss.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR22, FR24, FR25, FR26, FR27
**NFRs covered:** NFR1 (TTI < 3s), NFR3 (localStorage < 10ms), NFR5 (atomic writes), NFR10 (WCAG 2.1 AA card contrast)

### Epic 3: Drag & Drop Kanban Flow
A user can pick up any card and move it to any column or reorder it within a column. The card tilts while dragging, the trash zone appears when a drag begins, a soft sound plays on valid drops, and cards in Done fade to signal completion. Deleting a card by dragging it to the trash is intuitive and discoverable.
**FRs covered:** FR8, FR9, FR14, FR15, FR16, FR17, FR18, FR19, FR20
**NFRs covered:** NFR2 (60fps drag), NFR9 (Done communicated by two signals: fade + column position)

### Epic 4: Resilience, Edge Cases & Accessibility
The app handles every failure mode gracefully — private browsing shows an honest notice, storage quota exceeded shows a non-blocking alert, corrupt localStorage recovers to an empty board without exception. Every interaction is reachable by keyboard, and the app throws zero unhandled exceptions under normal usage.
**FRs covered:** FR29, FR30
**NFRs covered:** NFR6 (corruption recovery), NFR7 (zero unhandled exceptions), NFR8 (keyboard navigation)

---

## Epic 1: Board Foundation & Visual Identity

A user can open Sticky Board in any evergreen browser and see the complete visual experience — the sketchy hand-drawn cork board, three labeled columns (To Do / In Progress / Done), warm paper background, and handwritten Caveat typography — deployed as a fully static site. The board is beautiful and structurally complete, even with no cards yet.

### Story 1.1: Project Scaffold & Development Environment

As a developer,
I want the Sticky Board project scaffolded with Vite + React + TypeScript and all approved dependencies installed,
So that the team has a consistent, runnable local development environment ready for feature implementation.

**Acceptance Criteria:**

**Given** a developer runs `npm create vite@latest sticky-board -- --template react-ts`
**When** setup completes
**Then** a working React + TypeScript SPA runs at localhost with HMR enabled

**Given** the project is scaffolded
**When** `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities roughjs` and `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom` are run
**Then** all dependencies install without errors and appear in `package.json`

**Given** the project is running
**When** `npm run build` is executed
**Then** a production-ready static `dist/` folder is generated with no TypeScript or build errors

**Given** the project structure is created
**When** reviewed
**Then** `src/components/`, `src/services/`, `src/hooks/`, `src/context/`, `src/types/`, `src/styles/`, and `src/assets/` directories exist

**Given** a Vitest test file is created
**When** `npm run test` is run
**Then** Vitest executes and reports results without configuration errors

**Given** the production build is analyzed
**When** total gzipped JS bundle size is measured
**Then** it does not exceed 400KB

---

### Story 1.2: Design Token System & Global Stylesheet

As a developer,
I want a complete CSS design token system and global stylesheet in place,
So that all components have a single source of truth for colors, spacing, typography, and animation values — with no hardcoded values in any component stylesheet.

**Acceptance Criteria:**

**Given** `src/styles/tokens.css` exists
**When** inspected
**Then** it defines CSS custom properties for: all 6 card colors (`--color-card-yellow`, `--color-card-pink`, `--color-card-blue`, `--color-card-green`, `--color-card-orange`, `--color-card-purple`), board background (`--color-board-background` — warm cream/off-white), `--spacing-base` (8px) and multiples, `--font-handwritten` (Caveat), and animation timing values

**Given** `src/styles/global.css` exists
**When** inspected
**Then** it `@import`s `tokens.css`, applies a CSS reset, sets `body` background to `var(--color-board-background)`, and establishes the base font stack

**Given** `index.html` is inspected
**When** reviewed
**Then** it contains a `<link>` to Google Fonts loading Caveat at weights 400 and 600

**Given** a browser opens the app
**When** the page loads
**Then** the background color is a warm, off-white/cream paper tone — not stark white, not grey

**Given** browser zoom is applied at any level from 50% to 200%
**When** the page is inspected
**Then** no content is clipped, overflowing, or inaccessibly obscured

---

### Story 1.3: Board Layout, Three Columns & Sketchy Visual Aesthetic

As a user,
I want to see the Sticky Board with its three columns and hand-drawn aesthetic when I open the app,
So that I immediately understand the board structure and feel the tactile, physical quality of the product.

**Acceptance Criteria:**

**Given** the app loads
**When** the board renders
**Then** exactly three columns are visible — "To Do", "In Progress", and "Done" — in that fixed left-to-right order

**Given** a desktop viewport ≥ 1024px wide
**When** the board renders
**Then** all three columns are fully visible without horizontal scrolling

**Given** the board renders
**When** the DOM and SVG output is inspected
**Then** `Board.tsx` uses rough.js to draw SVG sketchy outlines/backgrounds for the board area and column borders — not plain CSS rectangles or `border` properties

**Given** the board renders
**When** any column or board structural text is inspected
**Then** all text uses `var(--font-handwritten)` — the Caveat Google Font

**Given** a column contains no cards
**When** rendered
**Then** an empty-state placeholder element is visible inside the column indicating it is a valid drop target (e.g., a dashed outline or subtle text prompt)

**Given** a column contains cards that exceed its visible height
**When** a user scrolls within that column
**Then** the column scrolls independently without affecting the scroll position of the other columns

**Given** column name labels are inspected across the entire UI
**When** searched
**Then** no settings panel, rename button, or column customization option exists anywhere in the interface

---

## Epic 2: Card Lifecycle — Create, Edit & Persist

A user can create cards by clicking the sticky-note pad or [+] button, select a color as the first gesture, type a title and optional description, edit any card's content inline with a single click, and have the entire board auto-persist to localStorage — surviving browser refreshes with zero data loss.

### Story 2.1: Board State Management & Persistence Foundation

As a user,
I want my board state to be automatically saved to my browser and fully restored when I return,
So that my tasks are never lost across page refreshes or browser restarts.

**Acceptance Criteria:**

**Given** `src/types/types.ts` exists
**When** inspected
**Then** it exports `Card`, `BoardState`, `CardColor`, `ColumnId`, `StorageError`, and `BoardContextValue` interfaces — and no component file locally redefines any of these types

**Given** `src/services/boardService.ts` exists and `boardService.load()` is called with valid localStorage data
**When** executed
**Then** it returns `{ ok: true, data: BoardState }` with the full board state — no throw

**Given** `boardService.load()` is called with no existing localStorage entry
**When** executed
**Then** it returns `{ ok: true, data: emptyBoardState }` where all three column arrays are empty

**Given** localStorage contains invalid or corrupt JSON
**When** `boardService.load()` is called
**Then** it returns `{ ok: true, data: emptyBoardState }`, logs a `console.warn`, and does not throw an exception

**Given** `boardService.save(state)` is called with a valid `BoardState`
**When** executed
**Then** the complete board state is written to localStorage as valid JSON in a single synchronous operation — no partial writes

**Given** `src/context/BoardReducer.ts` exists
**When** the reducer handles `ADD_CARD`, `MOVE_CARD`, `EDIT_CARD`, `DELETE_CARD`, `REORDER_CARD`, `SET_DRAGGING`, or `CLEAR_DRAGGING` actions
**Then** each returns a new immutable state object — the previous state object is never mutated

**Given** `src/hooks/useBoardState.ts` exists and a component calls `useBoardState()`
**When** board state changes
**Then** `boardService.save(newState)` is called via a `useEffect` watching `boardState` — no component calls `localStorage` directly

**Given** the app is loaded, used to create/modify cards, and then the page is refreshed
**When** the board renders after refresh
**Then** all cards, their column assignments, order, colors, titles, and descriptions are identical to the pre-refresh state

---

### Story 2.2: Card Creation with Color Selection

As a user,
I want to create new cards by clicking the sticky-note pad or [+] button and choosing a color before I type,
So that each card feels like placing a real post-it note — color is an intentional first gesture, not an afterthought.

**Acceptance Criteria:**

**Given** the board is visible and the user hovers over the `CardCreationPad` in the To Do column
**When** the hover state is active
**Then** a dog-ear peel animation is visible on the pad corner (CSS transition — no JavaScript-driven animation)

**Given** the user clicks the `CardCreationPad`
**When** the color picker opens
**Then** exactly 6 color swatches are displayed: yellow, pink, blue, green, orange, purple

**Given** the color picker is open
**When** the user clicks a color swatch
**Then** a new card is immediately created in the To Do column with that color applied as its background

**Given** a new card is created
**When** it appears
**Then** the card title field is automatically focused so the user can begin typing without any additional click

**Given** the [+] button is visible in the To Do column
**When** clicked
**Then** it triggers the same card creation flow as the `CardCreationPad` — the color picker opens first, then card appears on color selection with focused title

**Given** a card title is entered and the user clicks elsewhere (blur)
**When** the blur event fires
**Then** the card title is committed and persisted via `dispatch(ADD_CARD)`

**Given** a card title is left completely empty when blurred
**When** the commit fires
**Then** the card is NOT saved as an empty, unlabelled card — creation is either cancelled or a validation prevents saving with no title

**Given** a new card is created
**When** its `id` is inspected
**Then** it is a valid UUID generated by `crypto.randomUUID()` — never `Math.random()` or `Date.now()` alone

---

### Story 2.3: Card Display Component

As a user,
I want each card to display its title, optional description, and color identity clearly,
So that I can distinguish and read my tasks at a glance as if they were real sticky notes.

**Acceptance Criteria:**

**Given** a card with `color: 'yellow'`
**When** rendered
**Then** its background is `var(--color-card-yellow)` — no hardcoded hex color value appears in any component CSS file

**Given** each of the 6 card colors
**When** the card text (title and description) is evaluated against the card background
**Then** every combination meets WCAG 2.1 AA contrast ratio of 4.5:1 minimum

**Given** a card with only a title and no description
**When** rendered
**Then** only the title is displayed — no empty description area, empty placeholder text, or blank space where description would appear

**Given** a card with a description text that exceeds the card's visible height
**When** rendered
**Then** the description area is scrollable within the card boundaries

**Given** cards are displayed in any column
**When** their text is inspected
**Then** all card text (title and description) uses `var(--font-handwritten)` — the Caveat font

**Given** a card is rendered
**When** inspected
**Then** it has a subtle drop shadow applied via a CSS custom property from `tokens.css` — giving it visual depth against the column background

**Given** a card is in the Done column
**When** rendered
**Then** the CSS class `.is-done` is applied and the card displays in a visually faded/muted state (reduced opacity, desaturation, or both) — no inline `style` attribute is used for this state

---

### Story 2.4: Inline Card Editing

As a user,
I want to click a card's title or description and edit it directly inline without any modal or save button,
So that updating a task is as frictionless as writing on a real sticky note.

**Acceptance Criteria:**

**Given** a rendered card
**When** the user clicks the card title
**Then** the title immediately becomes editable (`contenteditable="true"`) with the text cursor placed in the clicked position

**Given** the title is in edit mode
**When** the user clicks elsewhere or tabs out (blur event)
**Then** the new title value is committed via `dispatch(EDIT_CARD)` and immediately reflected in the UI and persisted to localStorage

**Given** the title is in edit mode
**When** the user presses `Escape`
**Then** the title reverts to its last saved value and editing ends — no save occurs for the discarded change

**Given** the title is in edit mode
**When** the user presses `Enter`
**Then** the title is committed (equivalent to blur) and editing ends

**Given** a rendered card with a description
**When** the user clicks the description area
**Then** it becomes editable inline (`contenteditable="true"`)

**Given** the description is in edit mode
**When** blurred
**Then** the description is saved via `dispatch(EDIT_CARD)` — an empty description (clearing it) is a valid save operation

**Given** a card is in edit mode with a short activation distance configured on dnd-kit's pointer sensor
**When** the user clicks to edit (movement < 8px)
**Then** no drag is accidentally triggered — the 8px pointer sensor threshold prevents edit-click from starting a drag

**Given** the entire edit flow from click to complete
**When** observed
**Then** no save button, save icon, modal dialog, or form submission exists anywhere — editing is entirely click-to-edit, blur-to-save

---

## Epic 3: Drag & Drop Kanban Flow

A user can pick up any card and move it to any column or reorder it within a column. The card tilts while dragging, the trash zone appears when a drag begins, a soft sound plays on valid drops, and cards in Done fade to signal completion. Deleting a card by dragging it to the trash is intuitive and discoverable.

### Story 3.1: Core Drag & Drop — Cross-Column and Within-Column

As a user,
I want to pick up any card and drag it to any column or reorder it within the same column,
So that managing task status is a direct, physical gesture — not a menu selection or a button click.

**Acceptance Criteria:**

**Given** the board is rendered with at least one card
**When** the user begins dragging a card
**Then** `onDragStart` fires and dispatches `SET_DRAGGING` with the active card's ID stored in board state

**Given** a card is dragged to a different column
**When** the drag ends over a valid column drop target
**Then** `dispatch(MOVE_CARD)` moves the card from its origin column to the target column at the drop position

**Given** a card is dragged within the same column to a new position
**When** the drag ends
**Then** `dispatch(REORDER_CARD)` updates that column's card array to reflect the new order

**Given** a card is dropped on a valid column target
**When** the drop completes
**Then** the card appears at the exact position in the column determined by where it was released — not forced to top or bottom

**Given** a card drag is cancelled (Escape key pressed or pointer released outside any valid target)
**When** `onDragEnd` fires
**Then** `dispatch(CLEAR_DRAGGING)` fires and the card returns to its original column and position

**Given** `DndContext` is mounted in `Board.tsx`
**When** the codebase is inspected
**Then** all `onDragStart`, `onDragOver`, and `onDragEnd` handlers exist exclusively in `Board.tsx` — no DnD event handling in `Column.tsx` or `Card.tsx`

**Given** a pointer sensor is configured on `DndContext`
**When** inspected
**Then** the activation distance is set to 8px — preventing accidental drag triggers during click-to-edit interactions

---

### Story 3.2: Drag Visual Feedback & Animations

As a user,
I want to see the card tilt while I drag it, the drop zones highlight, and the trash zone appear during drag,
So that every drag interaction feels physical and its outcome is always visually predictable.

**Acceptance Criteria:**

**Given** a card drag begins
**When** the card is being dragged
**Then** the CSS class `.is-dragging` is applied to the card element, producing a `transform: rotate(6deg)` tilt — implemented using only compositor-thread properties (`transform` and `opacity`) with no `width`, `height`, `top`, or `left` changes

**Given** a card drag begins
**When** the `TrashZone` becomes visible
**Then** it appears at the same consistent, fixed on-screen location on every drag start — position does not shift between drags

**Given** a card is dragged and hovering over a valid column drop target
**When** the column's droppable state activates
**Then** the column displays a visual highlight state (CSS class change on the column element — not an inline `style` attribute)

**Given** a card drag ends (by any means — successful drop, trash, or cancellation)
**When** `CLEAR_DRAGGING` is dispatched
**Then** the `.is-dragging` class is removed from the card, the `TrashZone` disappears, and all column highlight states reset — all in the same render cycle

**Given** the drag animation is profiled in browser DevTools
**When** a card drag is in progress on target hardware (mid-range desktop/laptop)
**Then** no layout or paint operations are triggered — only composite layer operations occur during the drag motion

---

### Story 3.3: Card Deletion via Trash Zone

As a user,
I want to delete a card by dragging it to the trash zone that appears while I drag,
So that deletion is always discoverable through natural drag behavior — no right-click menus, no delete buttons, no confirmation dialogs.

**Acceptance Criteria:**

**Given** a card drag begins
**When** the `TrashZone` renders
**Then** `TrashZone.tsx` uses `useDroppable` from dnd-kit with a distinct droppable ID (e.g., `'trash'`)

**Given** a card is being dragged and hovers over the `TrashZone`
**When** the droppable activates
**Then** the `TrashZone` displays a visual activation state (distinct hover appearance) indicating it is a destructive target

**Given** a card is dropped onto the `TrashZone`
**When** `onDragEnd` fires
**Then** `dispatch(DELETE_CARD, { cardId })` is called and the card is immediately removed from both the `cards` record and the originating column array in board state

**Given** a card is deleted via the trash zone
**When** board state is inspected
**Then** the card's ID appears in neither `state.cards` nor any of the three column arrays (`todo`, `inProgress`, `done`)

**Given** a card is dropped onto the `TrashZone`
**When** `onDragEnd` completes
**Then** `audioService.playDrop()` is NOT called — the drop sound plays only for valid column drops, never for trash drops

**Given** a card drag is released without reaching the `TrashZone`
**When** the drag ends
**Then** no deletion occurs — the card returns to its original position if no valid column target was hit

**Given** the board is NOT in a drag state
**When** the DOM is inspected
**Then** the `TrashZone` is not visible — either absent from the DOM, or hidden via CSS (`display: none` or zero opacity via a transition)

---

### Story 3.4: Drop Sound & Done Column Visual State

As a user,
I want to hear a soft sound when I drop a card onto a column and see Done cards visually recede,
So that completing a task feels like a real, satisfying physical act.

**Acceptance Criteria:**

**Given** `src/services/audioService.ts` exists
**When** the module is first imported
**Then** it preloads `public/drop-sound.mp3` using Web Audio API (`AudioContext` + `fetch` + `decodeAudioData`) — preloading happens at import time, not at first play

**Given** `audioService.playDrop()` is called
**When** executed after a prior user interaction with the page
**Then** the drop sound file plays once at a natural volume — brief and non-intrusive

**Given** `AudioContext` is unavailable in the current browser environment OR the user has not yet interacted with the page
**When** `audioService.playDrop()` is called
**Then** it silently no-ops — no error is thrown, no console error is logged

**Given** a card is dropped onto any valid column (To Do, In Progress, or Done)
**When** `onDragEnd` completes the MOVE or REORDER action in `Board.tsx`
**Then** `audioService.playDrop()` is called once from `Board.tsx` — not from any Column or Card component

**Given** a card is dropped onto the `TrashZone`
**When** `onDragEnd` completes the DELETE action
**Then** `audioService.playDrop()` is NOT called

**Given** a card is moved to the Done column
**When** rendered
**Then** the CSS class `.is-done` is applied to the `Card` component and the card renders in a visually faded/muted state defined in `Card.css` (reduced opacity, desaturation, or both)

**Given** the Done card fade state
**When** the `Card.tsx` and `Card.css` files are inspected
**Then** the faded appearance is achieved via a CSS class toggle only — no inline `style={{ opacity: ... }}` or JavaScript-driven style mutation

**Given** a card previously in the Done column is dragged to To Do or In Progress
**When** the move completes and the card renders in the new column
**Then** the `.is-done` class is removed and the card displays at full visual fidelity — color, opacity, and contrast fully restored

---

## Epic 4: Resilience, Edge Cases & Accessibility

The app handles every failure mode gracefully — private browsing shows an honest notice, storage quota exceeded shows a non-blocking alert, corrupt localStorage recovers to an empty board without exception. Every interaction is reachable by keyboard, and the app throws zero unhandled exceptions under normal usage.

### Story 4.1: Storage Error Handling and Recovery

As a user,
I want the app to handle storage failures gracefully and inform me honestly when data won't be saved,
So that I always understand the state of my data and the app never silently loses my work.

**Acceptance Criteria:**

**Given** the browser is in private/incognito mode (localStorage unavailable)
**When** the app loads and `boardService.load()` is called
**Then** it returns `{ ok: false, error: 'UNAVAILABLE' }`, the app renders with an empty board, and `StorageNotice.tsx` displays an informational (non-blocking) message explaining data will not be saved in this session

**Given** a `boardService.save(state)` call fails because storage quota is exceeded
**When** the write is attempted
**Then** it returns `{ ok: false, error: 'QUOTA_EXCEEDED' }`, updates `storageError` in `BoardContext`, and `StorageNotice.tsx` renders a non-blocking quota error message — the board remains fully interactive

**Given** localStorage contains corrupt data (invalid JSON, missing required `cards` or `columns` keys)
**When** `boardService.load()` is called
**Then** it returns `{ ok: true, data: emptyBoardState }`, outputs a `console.warn` describing the recovery, and the app starts with an empty board — no `throw`, no unhandled exception

**Given** any `boardService` function encounters any error condition
**When** inspected
**Then** the function returns a typed result object (`{ ok: false, error: 'UNAVAILABLE' | 'QUOTA_EXCEEDED' | 'CORRUPT' }`) — it never throws under any circumstance

**Given** `StorageNotice.tsx` is rendered for any error condition
**When** observed
**Then** it is a non-modal, non-overlay notice — it does not block any board interaction and the full board UI remains operable behind it

**Given** normal localStorage operation with no errors
**When** the board is used normally
**Then** `StorageNotice` is not rendered — it is either absent from the DOM or conditionally omitted based on `storageError === null`

**Given** all storage error scenarios are exercised (unavailable, quota exceeded, corrupt)
**When** the browser console is inspected during each scenario
**Then** no uncaught JavaScript exceptions appear — NFR7 (zero unhandled exceptions) is satisfied

---

### Story 4.2: Keyboard Navigation & Accessibility

As a user who relies on keyboard navigation,
I want every board interaction to be reachable and operable via keyboard,
So that the app is fully accessible without requiring a mouse.

**Acceptance Criteria:**

**Given** the board is loaded
**When** the user presses `Tab` repeatedly
**Then** keyboard focus moves through all interactive elements in a logical, left-to-right, top-to-bottom order: [+] button(s), cards within each column (in display order), and any visible action elements

**Given** a card has keyboard focus
**When** the user presses `Enter` or `Space`
**Then** the card's title enters inline edit mode — identical behavior to a mouse click on the title

**Given** the `CardCreationPad` or `[+]` button has keyboard focus
**When** the user presses `Enter` or `Space`
**Then** the card creation flow starts — the color picker opens and receives focus

**Given** the color picker is open via keyboard navigation
**When** the user navigates among swatches with `Tab` or arrow keys and presses `Enter` or `Space` on a color
**Then** the card is created with that color and the title field receives focus

**Given** a card title or description is in inline edit mode
**When** the user presses `Escape`
**Then** editing is cancelled, the original value is restored, and focus returns to the card element

**Given** the Done column's faded card state
**When** evaluated by accessibility tooling or manual review
**Then** task completion is communicated by at least two distinct visual signals: the faded appearance AND the column position — color alone is never the sole indicator of state (NFR9 satisfied)

**Given** all 6 card color backgrounds
**When** card title text is evaluated against each background using a contrast checker
**Then** every combination meets WCAG 2.1 AA minimum contrast ratio of 4.5:1 (NFR10 satisfied)

**Given** browser zoom is set to 200%
**When** the board is inspected
**Then** all content remains readable, no interactive elements are clipped or obscured, and the layout remains functional — columns, cards, and controls are all accessible (NFR11 satisfied)
