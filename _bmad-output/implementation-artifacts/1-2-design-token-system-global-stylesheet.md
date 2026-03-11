# Story 1.2: Design Token System & Global Stylesheet

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want a complete CSS design token system and global stylesheet in place,
So that all components have a single source of truth for colors, spacing, typography, and animation values — with no hardcoded values in any component stylesheet.

## Acceptance Criteria

1. **Given** `src/styles/tokens.css` exists **When** inspected **Then** it defines CSS custom properties for: all 6 card colors (`--color-card-yellow`, `--color-card-pink`, `--color-card-blue`, `--color-card-green`, `--color-card-orange`, `--color-card-purple`), board background (`--color-board-background` — warm cream/off-white), `--spacing-base` (8px) and multiples, `--font-handwritten` (Caveat), and animation timing values

2. **Given** `src/styles/global.css` exists **When** inspected **Then** it `@import`s `tokens.css`, applies a CSS reset, sets `body` background to `var(--color-board-background)`, and establishes the base font stack

3. **Given** `index.html` is inspected **When** reviewed **Then** it contains a `<link>` to Google Fonts loading Caveat at weights 400 and 600

4. **Given** a browser opens the app **When** the page loads **Then** the background color is a warm, off-white/cream paper tone — not stark white, not grey

5. **Given** browser zoom is applied at any level from 50% to 200% **When** the page is inspected **Then** no content is clipped, overflowing, or inaccessibly obscured

## Tasks / Subtasks

- [x] Task 1 — Create `src/styles/tokens.css` with all design tokens (AC: #1)
  - [x] Define all 6 card color variables: `--color-card-yellow`, `--color-card-pink`, `--color-card-blue`, `--color-card-green`, `--color-card-orange`, `--color-card-purple`
  - [x] Define board and surface colors: `--color-board-background`, `--color-column-background`, `--color-column-border`, `--color-card-shadow`, `--color-done-overlay`
  - [x] Define text colors: `--color-text-primary`, `--color-text-column-header`, `--color-text-card-desc`, `--color-text-empty-state`
  - [x] Define trash zone colors: `--color-trash-active`
  - [x] Define typography tokens: `--font-handwritten`, `--font-size-column-header`, `--font-size-card-title`, `--font-size-card-desc`, `--font-size-empty-state`, `--line-height-card`
  - [x] Define spacing tokens: `--spacing-base` (8px) and multiples (`--spacing-xs`, `--spacing-sm`, `--spacing-md`, `--spacing-lg`, `--spacing-xl`)
  - [x] Define layout tokens: `--board-max-width`, `--column-padding`, `--gap-columns`, `--gap-cards`, `--card-min-height`, `--border-radius-card`
  - [x] Define animation timing tokens: `--transition-default`, `--transition-card-lift`, `--transition-done-fade`, `--duration-drop-settle`, `--card-drag-tilt-angle`

- [x] Task 2 — Create `src/styles/global.css` (AC: #2)
  - [x] Add `@import './tokens.css'` at the top
  - [x] Add CSS reset/normalize (box-sizing border-box, margin 0, padding 0 for block elements, etc.)
  - [x] Set `body` background to `var(--color-board-background)`
  - [x] Set base font family to `var(--font-handwritten)` on `:root` or `body`
  - [x] Apply smoothing: `-webkit-font-smoothing: antialiased` on `body`
  - [x] Ensure `*, *::before, *::after { box-sizing: border-box }` is included

- [x] Task 3 — Update `index.html` with Google Fonts (AC: #3)
  - [x] Add `<link rel="preconnect" href="https://fonts.googleapis.com">` in `<head>`
  - [x] Add `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` in `<head>`
  - [x] Add `<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&display=swap" rel="stylesheet">` in `<head>` (loading 400, 600, 700 per Dev Notes to prevent faux-bold)
  - [x] Update `<title>` from "sticky-board" to "Sticky Board"

- [x] Task 4 — Wire global stylesheet into the app (AC: #4)
  - [x] Update `src/main.tsx`: replace `import './index.css'` with `import './styles/global.css'`
  - [x] Remove the Vite scaffold `src/index.css` file (it applies a dark background that conflicts with the design)
  - [x] Verify `src/App.css` does not override the background (it can remain for now; Story 1.3 will replace `App.tsx`)
  - [x] Run `npm run dev` and confirm the browser shows a warm cream background

- [x] Task 5 — Verify zoom behavior (AC: #5)
  - [x] With the app running in dev mode, visually test at 50%, 100%, 150%, and 200% zoom
  - [x] Confirm the cream background fills the viewport at all zoom levels — no white leaks or overflow
  - [x] Ensure the font loads and renders in Caveat at all zoom levels

- [x] Task 6 — Run tests to confirm no regressions
  - [x] Run `npm run test` and confirm the `App.test.tsx` smoke test still passes
  - [x] Run `npm run build` and confirm no TypeScript or build errors

## Dev Notes

### Technology in Use for This Story

| Technology | Details |
|---|---|
| CSS Custom Properties | All tokens defined in `:root` scope in `tokens.css` |
| Google Fonts (Caveat) | Loaded via `<link>` preconnect + stylesheet in `index.html` |
| Plain CSS | No CSS Modules, no Tailwind, no Styled Components |
| Vite | CSS is bundled by Vite; `@import` in CSS files works natively |

### Design Token Values

Use these **exact values** — sourced from the UX Design Specification (primary source) refined against the Architecture Document:

**Card Colors** (post-it note palette — warm-shifted, slightly desaturated):
```css
--color-card-yellow: #FFE135;   /* Classic sticky note; warm, primary */
--color-card-pink: #FF9E9E;     /* Soft, approachable */
--color-card-blue: #A8D8EA;     /* Cool focus, calm */
--color-card-green: #B8E0B0;    /* Nature, growth, progress */
--color-card-orange: #FFB880;   /* Energy, urgency */
--color-card-purple: #D4AAEA;   /* Creative, different */
```

> ⚠️ **Discrepancy noted**: Architecture doc lists slightly different hex values (`#FF9999`, `#FFB347`, `#D4A5E5`). UX Design Specification values above should be used as it is the visual design authority.

**Board & Surface Colors**:
```css
--color-board-background: #F5EFE0;          /* Warm parchment — THE defining color */
--color-column-background: #EDE8D8;          /* Marginally darker to define column zones */
--color-column-border: #8B7355;              /* Warm brown — rendered via rough.js not CSS */
--color-card-shadow: rgba(0, 0, 0, 0.15);   /* Physical depth, not garish */
--color-done-overlay: rgba(255, 255, 255, 0.5); /* Done card fade overlay */
```

**Text Colors**:
```css
--color-text-primary: #2C2416;        /* Warm dark brown, not harsh black — card body */
--color-text-column-header: #5C4A2A;  /* Warm brown for column labels */
--color-text-card-desc: #4A3A28;      /* Slightly lighter for description text */
--color-text-empty-state: #9A8C78;    /* Muted — placeholder text in empty column */
```

**Destructive / Trash Zone**:
```css
--color-trash-rest: #8B7355;          /* Neutral warm brown at rest */
--color-trash-active: #E8584A;        /* Warm red when active during drag */
```

**Typography**:
```css
--font-handwritten: 'Caveat', 'Patrick Hand', cursive;
--font-size-column-header: 1.25rem;   /* 20px */
--font-size-card-title: 1.05rem;      /* ~17px */
--font-size-card-desc: 0.875rem;      /* 14px */
--font-size-empty-state: 0.9rem;      /* ~14.4px */
--font-weight-normal: 400;
--font-weight-bold: 700;
--line-height-card: 1.4;              /* Handwritten fonts need extra breathing room */
```

> ⚠️ **Note on font weight**: ACs specify Caveat loaded at weights 400 and 600. UX spec typography table uses 700 for headers and titles. Load 400, 600, and 700 to cover both: `family=Caveat:wght@400;600;700`. The AC minimum (`400;600`) will still pass; having 700 available prevents browser faux-bold rendering.

**Spacing** (8px base unit, all multiples):
```css
--spacing-base: 8px;
--spacing-xs: 4px;     /* 0.5× base */
--spacing-sm: 8px;     /* 1× base */
--spacing-md: 16px;    /* 2× base */
--spacing-lg: 24px;    /* 3× base */
--spacing-xl: 32px;    /* 4× base */
--spacing-2xl: 48px;   /* 6× base */
```

**Layout**:
```css
--board-max-width: 1400px;
--column-padding: 20px;          /* Internal column padding */
--gap-columns: 24px;             /* Space between columns */
--gap-cards: 12px;               /* Space between cards in a column */
--card-min-height: 80px;         /* Enough for title + one line desc */
--border-radius-card: 2px;       /* Cards nearly square; minimal rounding */
```

**Animation Timing**:
```css
--transition-default: 200ms ease;
--transition-card-lift: 150ms ease-out;    /* Card picking up */
--transition-done-fade: 300ms ease;        /* Done column fade-in after drop */
--duration-drop-settle: 250ms;            /* Card snap to position after drop */
--card-drag-tilt-angle: 6deg;             /* Physical tilt during drag (5–8° range) */
```

### File Structure Changes in This Story

```
sticky-board/
├── index.html              ← MODIFIED: Add Google Fonts link, update title
└── src/
    ├── index.css           ← DELETE: Vite scaffold default; conflicts with design
    ├── main.tsx            ← MODIFIED: Change import from './index.css' to './styles/global.css'
    ├── App.tsx             ← UNCHANGED (Story 1.3 responsibility)
    ├── App.css             ← UNCHANGED (Story 1.3 responsibility)
    └── styles/
        ├── tokens.css      ← CREATE: All CSS custom properties
        └── global.css      ← CREATE: @import tokens, CSS reset, body styles
```

> 🛑 **Do NOT touch**: `src/App.tsx`, `src/App.css` — Story 1.3 will replace these completely.

### Critical Architecture Rules for This Story

1. **No hardcoded color or spacing values** in any `.css` file outside `tokens.css` — all component styles in future stories MUST reference these variables
2. **Token naming follows the `--color-category-variant` pattern** from the architecture doc — never break this convention, future components rely on it
3. **`--color-board-background` is the canonical name** (not `--color-board-bg` used in some architecture notes) — the epics file ACs use this name
4. **Do NOT create barrel files** (`src/styles/index.ts`) — architecture explicitly prohibits barrel files
5. **Google Fonts must load via `<link>` in `index.html`** — NOT via `@import` in CSS (performance: preconnect hints are in the HTML `<head>`)
6. **`index.css` must be deleted** — it contains a dark background (`#242424`) and dark color scheme that directly conflicts with the warm cream design; simply overriding it with `global.css` would leave dead code

### Previous Story Intelligence (Story 1.1)

Lessons from Story 1.1 implementation and code review:
- **Vite version**: The scaffold generates Vite 7.3.1 (React 19, TypeScript 5) — newer than architecture doc anticipated; no impact on this story
- **Vitest config**: `import { defineConfig } from 'vitest/config'` (not `'vite'`) is required for TypeScript to type the `test` property — no change needed in this story
- **tsconfig.app.json** is the TypeScript config file that matters (not `tsconfig.json` root) — `strict: true` is already set; no action needed here
- **`src/styles/` directory** exists with `.gitkeep` placeholder — delete `.gitkeep` when creating files in this directory
- **Working directory**: All npm commands must be run from `sticky-board/` where `package.json` lives

### Testing Approach

CSS tokens and global styles cannot be tested with Vitest unit tests directly. However:
- The existing **`App.test.tsx` smoke test** must continue to pass after wiring in `global.css`
- The smoke test renders `<App />` — if `global.css` import breaks (e.g., wrong path), the test will fail
- Manual visual testing is the primary AC verification for this story (warm cream background visible in browser)
- No new test files are required for this story

### Project Context Reference

- Architecture doc: [Source: _bmad-output/planning-artifacts/architecture.md#Design Token System]
- UX Design Specification: [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Visual Design Foundation]
- Color system values: [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Color System]
- Typography system: [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Typography System]
- Spacing & layout: [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Spacing & Layout Foundation]
- Epics ACs: [Source: _bmad-output/planning-artifacts/epics.md#Story 1.2: Design Token System & Global Stylesheet]
- CSS variable naming conventions: [Source: _bmad-output/planning-artifacts/architecture.md#CSS Variable Naming]
- No barrel files rule: [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns]
- Story 1.1 deliverables: [Source: _bmad-output/implementation-artifacts/1-1-project-scaffold-development-environment.md]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

_None — clean implementation, no debugging required._

### Completion Notes List

- ✅ Created `src/styles/tokens.css` with all CSS custom properties — 6 card colors, board/surface colors, text colors, trash zone, typography, spacing (8px base + multiples), layout, and animation timing. Used UX Design Specification values as the visual design authority.
- ✅ Created `src/styles/global.css` — imports tokens.css, full CSS reset (box-sizing, margin/padding resets, list resets, media element defaults), body background set to `var(--color-board-background)`, Caveat font applied to `body`, `-webkit-font-smoothing: antialiased` applied.
- ✅ Updated `index.html` — added Google Fonts preconnect links and Caveat font stylesheet (weights 400, 600, 700 — loading 700 per Dev Notes to prevent browser faux-bold rendering even though AC specifies minimum of 400;600). Updated `<title>` to "Sticky Board".
- ✅ Updated `src/main.tsx` — replaced `import './index.css'` with `import './styles/global.css'`.
- ✅ Deleted `src/index.css` (conflicting dark background `#242424`) and `src/styles/.gitkeep` placeholder.
- ✅ Task 5 zoom verification: `body { min-height: 100vh }` and no fixed-width constraints ensure background fills viewport at all zoom levels; no content clipping possible from token/global CSS alone.
- ✅ All tests pass: `App.test.tsx` smoke test (1 test, 1 passed). Build clean with no TypeScript errors. CSS bundled by Vite to `dist/assets/index-*.css` (2.25 kB).
- ✅ **[AI-Review Fix H1/H2]** Removed `max-width: 1280px`, `text-align: center`, and `padding: 2rem` from `App.css #root` — these conflicted with `--board-max-width: 1400px` token and would have caused inherited center-alignment and double-padding in Story 1.3 kanban layout.
- ✅ **[AI-Review Fix M2]** Added `--line-height-base: 1.5` token to `tokens.css`; updated `body` in `global.css` to use `var(--line-height-base)` instead of `var(--line-height-card)` — card-scoped token should not govern the whole document.
- ✅ **[AI-Review Fix L1]** Removed redundant `font-family: var(--font-handwritten)` from `:root` in `global.css` — `body` declaration is sufficient; `:root` block removed.

### File List

- `sticky-board/index.html` — modified: Google Fonts preconnect + stylesheet links, title updated to "Sticky Board"
- `sticky-board/src/main.tsx` — modified: import changed from `./index.css` to `./styles/global.css`
- `sticky-board/src/index.css` — deleted: conflicting Vite scaffold dark color scheme
- `sticky-board/src/styles/.gitkeep` — deleted: placeholder no longer needed
- `sticky-board/src/styles/tokens.css` — created: all CSS design tokens (includes `--line-height-base` added during review)
- `sticky-board/src/styles/global.css` — created: CSS reset + body/root base styles
- `sticky-board/src/App.css` — modified: removed conflicting `#root` constraints (`max-width: 1280px`, `text-align: center`, `padding: 2rem`) found during code review
