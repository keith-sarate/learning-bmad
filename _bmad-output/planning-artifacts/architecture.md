---
stepsCompleted: [step-01-init, step-02-context, step-03-starter, step-04-decisions, step-05-patterns, step-06-structure, step-07-validation, step-08-complete]
status: 'complete'
completedAt: '2026-03-11'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - _bmad-output/planning-artifacts/product-brief-learning-bmad-2026-03-11.md
workflowType: 'architecture'
project_name: 'learning-bmad'
user_name: 'Keith'
date: '2026-03-11'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements (30 FRs across 6 categories):**

- **Card Management (FR1–FR9):** Full CRUD via inline editing and drag-to-trash deletion. Color selection at creation time. No modals — all editing is contenteditable in-place.
- **Board & Column Structure (FR10–FR13):** Three fixed columns (To Do / In Progress / Done), non-configurable in MVP. Full board visible ≥ 1024px wide. Columns scroll independently.
- **Drag & Drop (FR14–FR18):** Full cross-column and within-column drag-and-drop. Tilt animation during drag. Trash zone appears on drag start. Ghost card shows insertion point.
- **Visual Feedback & Microinteractions (FR19–FR23):** Drop sound on card placement, Done-column fade state, rough.js sketchy board aesthetic, creation pad peel animation, Caveat/Patrick Hand handwritten font.
- **Data Persistence (FR24–FR27):** Auto-save to localStorage on every change. Full board restore on load. Empty board for first-time users. No data ever reaches a server.
- **Edge & Error States (FR28–FR30):** Empty column placeholder, private-browsing notice when localStorage unavailable, non-blocking message on storage quota exceeded.

**Non-Functional Requirements (architecture-driving):**

- **Performance:** TTI < 3s; drag at 60fps sustained; localStorage ops < 10ms; JS bundle ≤ 400KB gzipped
- **Reliability:** Atomic localStorage writes (no partial saves); graceful corruption recovery to empty board; zero unhandled exceptions in normal usage
- **Accessibility:** WCAG 2.1 AA contrast on all card colors; keyboard navigation for all interactions; Done state communicated via two signals (fade + column position, not color alone)
- **Browser support:** Evergreen browsers only (Chrome, Firefox, Safari, Edge — latest 2 major versions). No IE11.

**Scale & Complexity:**

- Primary domain: Frontend SPA (React)
- Complexity level: Low — deliberately constrained, single-user, single-browser-tab
- No backend, no auth, no real-time, no multi-tenancy, no regulatory compliance
- Estimated architectural components: ~8–10 React components, 1 persistence service, 1 audio service, 1 state management layer

### Technical Constraints & Dependencies

- **React SPA only** — no SSR, no hydration concerns
- **Static deployment** — no build-time env vars that differ across environments; Netlify/Vercel/GitHub Pages
- **Approved dependencies:** rough.js (sketchy SVG), Google Fonts (Caveat/Patrick Hand), dnd-kit (headless DnD)
- **Forbidden dependencies:** MUI, Chakra, Ant Design, or any UI component library with visual opinions
- **localStorage only** — no IndexedDB, no sessionStorage, no network calls
- **No IE11** — modern JS and CSS features (custom properties, grid, CSS transforms) are available

### Cross-Cutting Concerns Identified

1. **State Management** — all card data (id, title, description, color, column, order) must flow consistently through the component tree; single source of truth required
2. **localStorage Persistence Layer** — atomic serialization/deserialization, corruption detection, quota error handling, and private-browsing detection must be centralized in one service
3. **Drag-and-Drop Coordination** — DnD events must coordinate card visual state, trash zone visibility, ghost card rendering, column highlight states, and sound trigger simultaneously
4. **Design Token System** — CSS custom properties must be the single source of truth for all colors, spacing, typography, and animation timing across every component
5. **Animation & Performance Budget** — all drag animations must use `transform` and `opacity` only (compositor-thread-only properties); no layout-triggering properties during drag
6. **Accessibility Layer** — keyboard navigation, ARIA roles, and focus management are cross-cutting concerns that must be designed in, not retrofitted

---

## Starter Template Evaluation

### Primary Technology Domain

React SPA (single-page application) with TypeScript, static deployment, no backend.

### Starter Options Considered

| Option | Notes | Decision |
|---|---|---|
| `create vite@latest` (react-ts) | Minimal, fast, static-first, active maintenance | ✅ Selected |
| Create React App | Deprecated (2023) | ❌ Skip |
| Next.js | SSR/backend-capable — adds unwanted complexity | ❌ Skip |
| Remix | Backend-oriented framework | ❌ Skip |

### Selected Starter: Vite + React + TypeScript

**Rationale for Selection:**

Vite is the current standard for React SPA development. It is minimal by design — it makes no decisions about CSS, component libraries, routing, or state management. This is exactly right for Sticky Board, which requires a fully custom design system and has zero backend concerns. CRA is deprecated; Next.js and Remix both carry server-side complexity that is explicitly out of scope.

**Initialization Command:**

```bash
npm create vite@latest sticky-board -- --template react-ts
cd sticky-board
npm install
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
TypeScript 5.x with strict mode — all components, services, and utilities typed. Provides AI agent implementation consistency and catches the category of bugs that matter most in localStorage serialization and state management.

**Build Tooling:**
Vite 6.x — ES module native dev server (< 300ms cold starts), Rollup-based production builds with automatic code splitting and tree-shaking. Produces a fully static `dist/` folder suitable for Netlify, Vercel, or GitHub Pages with no configuration.

**Styling Solution:**
Plain CSS + CSS custom properties (no Tailwind, no CSS Modules enforced, no Styled Components). Design tokens live in a single `tokens.css` file as CSS custom properties. Component styles co-located as `Component.css` files alongside their React counterparts.

**Testing Framework:**
Vitest (Vite-native test runner, Jest-compatible API) — added as first post-scaffold step. React Testing Library for component tests.

**Code Organization:**
```
src/
  components/       # React components
  services/         # localStorage, audio
  hooks/            # custom React hooks (useBoardState, useDnD)
  types/            # TypeScript interfaces and types
  styles/           # tokens.css, global.css
  assets/           # audio files, SVG assets
```

**Development Experience:**
HMR (hot module replacement) — component changes reflect instantly without page reload or state loss. ESLint pre-configured. TypeScript compilation errors surfaced in terminal and browser overlay.

**Note:** Project initialization using this command should be the first implementation story.

---

## Core Architectural Decisions

### Decision Priority Analysis

**Critical (Block Implementation):**
- Data model shape and localStorage persistence contract
- State management approach and component data flow
- Dependency list (locked per PRD)

**Important (Shape Architecture):**
- Audio service API design
- rough.js integration point (board-level, not card-level)
- Design token system structure

**Deferred (Post-MVP):**
- CI/CD pipeline
- PWA / service worker
- Multi-board support

### Data Architecture

**Decision: Normalized board state with ID-keyed card map + ordered column arrays**

- Cards stored as `Record<string, Card>` — O(1) lookup by ID
- Column state is three ordered `string[]` arrays of card IDs (`todo`, `inProgress`, `done`)
- Column membership determined by which array contains the card ID — not a field on Card itself
- This is the canonical structure for dnd-kit and avoids nested mutation

```typescript
type CardColor = 'yellow' | 'pink' | 'blue' | 'green' | 'orange' | 'purple';

interface Card {
  id: string;
  title: string;
  description: string;
  color: CardColor;
  createdAt: number;
}

interface BoardState {
  cards: Record<string, Card>;
  columns: {
    todo: string[];
    inProgress: string[];
    done: string[];
  };
}
```

**Decision: Centralized `boardService.ts` owns all localStorage I/O**

- Single module serializes/deserializes BoardState to/from JSON
- Detects corrupt data (invalid JSON, missing required keys) → returns empty board, logs warning
- Detects private browsing / localStorage unavailable → returns empty board, sets `persistenceAvailable: false` flag for UI notice
- Detects quota exceeded on write → surfaces error to UI, does not silently discard data
- No React component or hook touches `localStorage` directly — only `boardService`

### Authentication & Security

N/A — no authentication, no backend, no user accounts. All data is browser-local. No data ever transmitted to any server (FR27).

### API & Communication Patterns

N/A — no API, no network calls, no external services. App is fully offline-capable by design.

### Frontend Architecture

**Decision: `useReducer` + React Context for state management**

- Single `BoardReducer` handles all board mutations: `ADD_CARD`, `MOVE_CARD`, `EDIT_CARD`, `DELETE_CARD`, `REORDER_CARD`
- `BoardContext` provides state + dispatch to the component tree
- `useBoardState()` custom hook encapsulates context consumption + localStorage sync side-effect
- Rationale: Zero additional dependencies; appropriate for single-screen, single-state-tree app; reducer pattern maps cleanly to discrete user actions

**Decision: No routing**

Single screen, single view. React Router adds zero value. The entire app is rendered from one root component.

**Decision: Component hierarchy**
```
App
└── BoardContext.Provider
    └── Board
        ├── DndContext (dnd-kit)
        │   ├── Column (×3: todo, inProgress, done)
        │   │   ├── CardCreationPad (todo column only)
        │   │   └── Card (×n)
        │   └── TrashZone
        └── StorageNotice (conditionally rendered)
```

**Decision: dnd-kit for drag-and-drop**

- Headless — zero visual opinions, no CSS conflicts with custom design system
- Supports both cross-column moves and within-column reorder in one library
- Provides pointer sensor with configurable drag activation distance (prevents accidental drags during inline edit)
- Exposes `onDragStart` (show trash zone), `onDragOver` (column highlight, ghost), `onDragEnd` (commit move, play sound, hide trash zone)

### Infrastructure & Deployment

**Decision: Netlify / Vercel / GitHub Pages (static)**

Vite `npm run build` produces a `dist/` folder of static HTML/CSS/JS. Any static host works with zero configuration. No server, no environment variables, no build-time secrets.

**Decision: No CI/CD for MVP**

Out of scope per PRD. Manual deploy for the learning project is appropriate.

### Decision Impact Analysis

**Implementation Sequence:**
1. Scaffold with Vite react-ts template
2. Install dnd-kit, rough.js, Google Fonts
3. Implement `boardService.ts` (persistence layer — foundation everything else depends on)
4. Implement `BoardReducer` + `BoardContext` (state layer)
5. Implement static Board + Column layout with rough.js
6. Implement Card component with design tokens
7. Implement drag-and-drop with dnd-kit
8. Implement card creation flow (pad → color picker → title)
9. Implement inline editing
10. Implement trash zone + audio service

**Cross-Component Dependencies:**
- `boardService` has no React dependencies — testable in isolation
- `BoardReducer` depends on `BoardState` types only — testable in isolation
- All React components consume `BoardContext` — no prop-drilling chains
- `dnd-kit DndContext` must wrap the entire Board including TrashZone
- rough.js renders to SVG elements owned by Board and Column components only

---

## Implementation Patterns & Consistency Rules

### Critical Conflict Points Identified

8 areas where AI agents could make incompatible choices without explicit rules.

### Naming Patterns

**File & Component Naming:**
- React components: `PascalCase.tsx` — e.g., `Card.tsx`, `CardCreationPad.tsx`, `TrashZone.tsx`
- Component CSS files: co-located, same name — e.g., `Card.css` alongside `Card.tsx`
- Hooks: `camelCase`, `use` prefix — e.g., `useBoardState.ts`, `useDragState.ts`
- Services: `camelCase`, `Service` suffix — e.g., `boardService.ts`, `audioService.ts`
- Types file: `types.ts` in `src/types/` — all shared interfaces and types in one file
- Test files: co-located, `.test.ts` / `.test.tsx` suffix — e.g., `boardService.test.ts`

**TypeScript Naming:**
- Interfaces: `PascalCase`, no `I` prefix — `Card`, `BoardState`, not `ICard`
- Type aliases: `PascalCase` — `CardColor`, `ColumnId`
- React props interfaces: `ComponentNameProps` — `CardProps`, `ColumnProps`
- Action type union: defined in `BoardReducer.ts` as `BoardAction` discriminated union

**CSS Variable Naming:**
- All design tokens: `--color-category-variant` — e.g., `--color-card-yellow`, `--spacing-base`, `--font-handwritten`
- Component-scoped vars (if needed): `--ComponentName-property` — e.g., `--Card-shadow`

**Reducer Action Naming:**
- All caps, underscore-separated, verb-noun — `ADD_CARD`, `MOVE_CARD`, `EDIT_CARD`, `DELETE_CARD`, `REORDER_CARD`, `SET_DRAGGING`, `CLEAR_DRAGGING`

### Structure Patterns

**Project Organization:**
```
src/
  components/         # One folder per component: ComponentName/Component.tsx + Component.css
  services/           # boardService.ts, audioService.ts
  hooks/              # useBoardState.ts (and others as needed)
  context/            # BoardContext.ts, BoardReducer.ts
  types/              # types.ts — all shared types
  styles/             # tokens.css, global.css (reset + base styles)
  assets/             # drop-sound.mp3, any SVG assets
  main.tsx            # Vite entry point — only mounts App
  App.tsx             # Root: mounts BoardContext.Provider + Board + StorageNotice
```

**Component file structure (every component follows this order):**
```typescript
// 1. Imports (React first, then libraries, then local — grouped with blank lines)
// 2. Types/interfaces for this component only (if any)
// 3. Component function
// 4. export default ComponentName
```

**No barrel files (`index.ts` re-exports)** — import directly from the source file. Barrel files create circular dependency risks and obscure where things live.

### Format Patterns

**TypeScript Strictness:**
- `strict: true` in `tsconfig.json` — no exceptions
- No `any` types — use `unknown` if the type is truly unknown, then narrow with type guards
- All function parameters and return values typed explicitly

**State Update Patterns:**
- All state mutations go through `dispatch(action)` — never mutate state directly
- Reducer returns new object references for changed state — use spread operator for immutable updates
- localStorage sync happens in a `useEffect` watching `boardState` — not inside the reducer
- Reducer is a pure function — no side-effects, no service calls inside the reducer

**CSS Patterns:**
- All color values via CSS custom property — never hardcode `#FFE135` in a component stylesheet
- All spacing via multiples of `--spacing-base` (8px) — no arbitrary pixel values
- Animations during drag: `transform` and `opacity` only — no `width`, `height`, `top`, `left`
- Card tilt: CSS class toggle (`.is-dragging`) applies `transform: rotate(6deg)` — not inline style

**ID Generation:**
- All card IDs: `crypto.randomUUID()` — never `Math.random()`, never `Date.now()` alone

### Communication Patterns

**DnD Event → Action Mapping:**
- `onDragStart` → dispatch `SET_DRAGGING` (stores active card ID, shows TrashZone via boolean in state)
- `onDragEnd` over valid column → dispatch `MOVE_CARD` or `REORDER_CARD` → `audioService.playDrop()` → dispatch `CLEAR_DRAGGING`
- `onDragEnd` over TrashZone → dispatch `DELETE_CARD` → dispatch `CLEAR_DRAGGING` (no sound)
- `onDragEnd` cancelled (no valid target) → dispatch `CLEAR_DRAGGING` (no sound, card returns)

**Error Propagation:**
- `boardService` functions return result objects — never throw:
  - Success: `{ ok: true, data: BoardState }`
  - Failure: `{ ok: false, error: 'QUOTA_EXCEEDED' | 'UNAVAILABLE' | 'CORRUPT' }`
- Error state stored in `BoardContext` as `storageError: StorageError | null`
- `StorageNotice` component renders conditionally based on `storageError` type
- No `console.error` in components — errors surface through UI state only

### Process Patterns

**Inline Editing:**
- `contenteditable="true"` on card title and description spans
- `onBlur` saves the value via `dispatch(EDIT_CARD)` — no save button, no Enter key required
- `onKeyDown` intercepts `Escape` → revert to last saved value; `Enter` (on title) → blur
- dnd-kit pointer sensor activation distance set to **8px** — prevents drag firing when user clicks to edit

**localStorage Persistence:**
- `boardService.save(state)` called in `useEffect` after every state change: `useEffect(() => { boardService.save(boardState) }, [boardState])`
- `boardService.load()` called once on mount as the `useReducer` initial state
- Writes are synchronous JSON — no debouncing needed for ≤50 cards

**Audio:**
- `audioService.ts` preloads the drop sound on module import using Web Audio API `AudioContext` + `fetch` + `decodeAudioData`
- Exposes single function: `audioService.playDrop()` — called in `onDragEnd` handler inside `Board.tsx`
- Silently no-ops if `AudioContext` is unavailable or if user has not interacted with the page yet

### Enforcement Guidelines

**All AI Agents MUST:**
- Import shared types from `src/types/types.ts` — never redefine `Card`, `BoardState`, or `CardColor` locally in a component
- Use `boardService` for any localStorage operation — zero direct `localStorage` calls anywhere except `boardService.ts`
- Use CSS custom properties from `tokens.css` for all visual values — no hardcoded hex colors or raw px values in component CSS
- Call `crypto.randomUUID()` for new card ID generation — no other ID strategy
- Return result objects from service functions — never `throw` from `boardService` or `audioService`
- Use CSS class toggles for animation state — never inline `style={{ transform: ... }}` for drag tilt

**Anti-Patterns — Never Do:**
- `localStorage.setItem(...)` or `localStorage.getItem(...)` outside `boardService.ts`
- `Math.random()` or `Date.now()` as a card ID
- Hardcoded color hex values in component CSS — always `var(--color-*)`
- Side-effects or service calls inside the `BoardReducer` function
- Nested `useContext` calls in multiple components — always consume via `useBoardState()` hook
- Creating a local `useState` for data that belongs in `BoardContext`

---

## Project Structure & Boundaries

### Complete Project Directory Structure

```
sticky-board/
├── README.md
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── index.html                          # Vite HTML entry — links Google Fonts (Caveat)
├── .eslintrc.cjs
├── .gitignore
├── public/
│   └── drop-sound.mp3                  # Pre-loaded by audioService on import
└── src/
    ├── main.tsx                         # Vite entry — renders <App /> into #root
    ├── App.tsx                          # Root: BoardContext.Provider > Board + StorageNotice
    ├── App.css                          # App-level layout only (min-height, background)
    ├── components/
    │   ├── Board/
    │   │   ├── Board.tsx                # rough.js SVG background, DndContext, onDragStart/Over/End
    │   │   └── Board.css
    │   ├── Column/
    │   │   ├── Column.tsx               # SortableContext, column header, card list, empty placeholder
    │   │   └── Column.css
    │   ├── Card/
    │   │   ├── Card.tsx                 # useDraggable, tilt class, contenteditable title+description
    │   │   └── Card.css                 # Includes .is-dragging tilt, .is-done fade, drop shadow
    │   ├── CardCreationPad/
    │   │   ├── CardCreationPad.tsx      # Sticky pad, dog-ear peel on hover, opens ColorPicker
    │   │   └── CardCreationPad.css
    │   ├── ColorPicker/
    │   │   ├── ColorPicker.tsx          # 6 color swatches, selects color → triggers card creation
    │   │   └── ColorPicker.css
    │   ├── TrashZone/
    │   │   ├── TrashZone.tsx            # useDroppable, visible only when dragging, activates on hover
    │   │   └── TrashZone.css
    │   └── StorageNotice/
    │       ├── StorageNotice.tsx        # Conditional non-blocking notice for storage errors
    │       └── StorageNotice.css
    ├── context/
    │   ├── BoardContext.ts              # createContext<BoardContextValue>, BoardContextValue type
    │   └── BoardReducer.ts             # BoardAction union type, boardReducer function, INITIAL_STATE
    ├── hooks/
    │   └── useBoardState.ts            # Consumes BoardContext, exposes {state, dispatch}, syncs localStorage
    ├── services/
    │   ├── boardService.ts             # load(), save(): all localStorage I/O with error handling
    │   └── audioService.ts            # preloads drop-sound.mp3, exposes playDrop()
    ├── types/
    │   └── types.ts                    # Card, BoardState, CardColor, ColumnId, StorageError, BoardContextValue
    └── styles/
        ├── tokens.css                   # All CSS custom properties: colors, spacing, typography, animation
        └── global.css                   # @import tokens.css, CSS reset, body background, font-face
```

### Architectural Boundaries

**State Boundary:** All board data lives exclusively in `BoardContext`. No component stores card data in local React `useState`. The only local state a component may hold is transient UI state (e.g., whether the color picker is open, the in-progress edit value before blur).

**Persistence Boundary:** `boardService.ts` is the only module that reads or writes `localStorage`. All other code interacts with persistence exclusively through `useBoardState()` which calls `boardService.load()` on mount and `boardService.save(state)` in a `useEffect`.

**DnD Boundary:** `DndContext` (dnd-kit) is mounted in `Board.tsx` and wraps all three Column components and the TrashZone. All draggable items (`Card` via `useDraggable`) and droppable targets (`Column` and `TrashZone` via `useDroppable`) must be descendants of this context. DnD event handlers (`onDragStart`, `onDragOver`, `onDragEnd`) live exclusively in `Board.tsx`.

**Audio Boundary:** `audioService.ts` is the only code that touches the Web Audio API. `playDrop()` is called once per valid drop by `Board.tsx` in `onDragEnd`. No other component triggers audio.

**Design Token Boundary:** `tokens.css` is the single source of truth for all visual values. It is imported once at the root via `global.css`. No hex codes, unitless raw pixel values, or magic numbers in any component CSS file.

### Requirements to Structure Mapping

| FR Category | Primary Implementation Location |
|---|---|
| Card Management (FR1–FR9) | `Card.tsx`, `CardCreationPad.tsx`, `ColorPicker.tsx`, `BoardReducer.ts` |
| Board & Column Structure (FR10–FR13) | `Board.tsx`, `Column.tsx`, `tokens.css` (layout values) |
| Drag & Drop (FR14–FR18) | `Board.tsx` (DndContext + event handlers), `Card.tsx` (useDraggable), `Column.tsx` (useDroppable), `TrashZone.tsx` |
| Visual Feedback & Microinteractions (FR19–FR23) | `Card.css` (tilt, done-fade), `audioService.ts` (drop sound), `Board.tsx` (rough.js), `CardCreationPad.css` (peel), `tokens.css` (Caveat font) |
| Data Persistence (FR24–FR27) | `boardService.ts`, `useBoardState.ts` |
| Edge & Error States (FR28–FR30) | `StorageNotice.tsx`, `boardService.ts` (quota/unavailable detection), `Column.tsx` (empty placeholder) |

### Integration Points & Data Flow

**Startup data flow:**
1. `main.tsx` renders `App`
2. `App` renders `BoardContext.Provider` — initial state from `boardService.load()`
3. `boardService.load()` reads `localStorage`, validates JSON, returns `BoardState` or empty board
4. If `boardService.load()` returns `{ ok: false }`, `storageError` is set in context → `StorageNotice` renders

**User interaction data flow:**
1. User action in component → `dispatch(BoardAction)` via `useBoardState()`
2. `BoardReducer` returns new immutable state
3. React re-renders affected components
4. `useEffect` in `useBoardState` detects state change → calls `boardService.save(newState)`
5. `boardService.save` serializes to JSON → writes to `localStorage` → returns result
6. If write fails (quota), updates `storageError` in context → `StorageNotice` renders

**Drag interaction flow:**
1. `onDragStart` → `dispatch(SET_DRAGGING, { cardId })` → `TrashZone` becomes visible (reads `dragging` from state)
2. `onDragOver` → dnd-kit manages column highlight and ghost card position
3. `onDragEnd` over a Column → `dispatch(MOVE_CARD | REORDER_CARD)` → `audioService.playDrop()` → `dispatch(CLEAR_DRAGGING)`
4. `onDragEnd` over TrashZone → `dispatch(DELETE_CARD)` → `dispatch(CLEAR_DRAGGING)`
5. `onDragEnd` cancelled → `dispatch(CLEAR_DRAGGING)` only

---

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices are mutually compatible. Vite 6.x + React 18 + TypeScript 5.x is a well-established combination with no known conflicts. dnd-kit is headless and imposes no CSS — fully compatible with the custom design system. rough.js renders to SVG and has no React or DnD dependencies. Google Fonts are loaded via `<link>` in `index.html` — no JavaScript dependency. No circular dependencies introduced by the structure.

**Pattern Consistency:**
Implementation patterns are consistent with and reinforce the architectural decisions. The `useReducer` + Context decision is directly supported by the naming patterns (action naming conventions), the structural patterns (context/ directory), and the communication patterns (dispatch flow). The persistence boundary rules directly enforce the `boardService` architectural decision.

**Structure Alignment:**
The project structure maps 1:1 to the architectural decisions. Every decision has a concrete home: `boardService.ts` owns persistence, `BoardReducer.ts` owns state logic, `tokens.css` owns design values, `audioService.ts` owns audio. No architectural decision is structurally homeless.

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**
All 30 FRs are covered by the architecture. Each FR category maps to specific files in the project structure. FR27 (no data ever sent to server) is enforced by the absence of any network layer — there is literally nothing to violate it.

**Non-Functional Requirements Coverage:**

| NFR | Architectural Coverage |
|---|---|
| TTI < 3s | Vite's static bundle, no server round-trip, Google Fonts preloaded via `<link rel="preconnect">` |
| 60fps drag | transform/opacity-only animation rule; dnd-kit's pointer sensor is RAF-synced |
| localStorage < 10ms | Synchronous localStorage + JSON.stringify for ≤50 cards is well within budget |
| Bundle ≤ 400KB gzipped | Approved deps are all lightweight: dnd-kit (~15KB), rough.js (~20KB), React (~45KB) — well within budget |
| Atomic localStorage writes | `boardService.save()` writes the full serialized state in one `setItem` call — atomicity guaranteed by the browser's single-threaded execution model |
| Corruption recovery | `boardService.load()` validates structure before returning — falls back to empty board |
| WCAG 2.1 AA | Design tokens specify tested contrast ratios; `tokens.css` is the enforcement point |
| Keyboard navigation | Cross-cutting concern noted in patterns — each component implements ARIA roles and keyboard handlers |
| Browser support | Vite targets `es2015` by default; all chosen libraries support evergreen browsers |

### Implementation Readiness Validation ✅

**Decision Completeness:** All critical decisions are documented with rationale. TypeScript types are defined ahead of implementation. Dependency list is explicit and locked.

**Structure Completeness:** Every file in the project tree has a documented purpose. No file exists without an architectural reason. No architectural responsibility is without a file.

**Pattern Completeness:** All 8 identified conflict points have explicit rules. Naming, structure, CSS, TypeScript, state, persistence, audio, and DnD patterns are all specified.

### Gap Analysis Results

**Critical Gaps:** None. The architecture is complete for its scope.

**Minor observations (non-blocking, noted for implementation):**
- `rough.js` `RoughCanvas`/`RoughSVG` instances should be recreated on viewport resize (use `ResizeObserver`) — implementation detail, not an architectural gap
- The color picker visibility (open/closed) is appropriate as local `useState` in `CardCreationPad` — this is the one sanctioned exception to the "no local state for card data" rule
- Sound file format: provide both `.mp3` and `.ogg` in `public/` for maximum browser compatibility — `audioService` selects based on `canPlayType()`

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**
- [x] Critical decisions documented with rationale
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented
- [x] Anti-patterns explicitly listed

**✅ Project Structure**
- [x] Complete directory structure defined with every file named
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** ✅ READY FOR IMPLEMENTATION

**Confidence Level:** High — the project is deliberately constrained and well-specified. Every decision has one right answer given the PRD constraints, and those answers are documented here.

**Key Strengths:**
- The persistence and state layers are fully decoupled — `boardService` can be tested with zero React dependency
- The design token system makes the custom aesthetic maintainable by any agent without visual guesswork
- The DnD + audio pattern is fully specified including the edge cases (cancelled drag, trash drop) that are most likely to be implemented inconsistently
- The TypeScript types defined in `types.ts` give every story a shared language before a single component is written

**Areas for Future Enhancement (post-MVP):**
- Add a `usePrevious` hook or command pattern to enable undo/redo
- Consider `useOptimistic` (React 19) for snappier card creation feel
- Keyboard DnD (dnd-kit supports it) for full accessibility of drag operations

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented — this document is the single source of truth
- Use `src/types/types.ts` as the shared contract before implementing any component
- Implement `boardService.ts` and `BoardReducer.ts` first — all components depend on them
- Use CSS custom properties from `tokens.css` for all visual values — no exceptions
- Refer to the Communication Patterns section when implementing any DnD interaction

**First Implementation Command:**
```bash
npm create vite@latest sticky-board -- --template react-ts
cd sticky-board
npm install
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install roughjs
npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom
```
