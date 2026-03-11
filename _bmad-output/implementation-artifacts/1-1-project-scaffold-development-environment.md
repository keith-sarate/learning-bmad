# Story 1.1: Project Scaffold & Development Environment

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want the Sticky Board project scaffolded with Vite + React + TypeScript and all approved dependencies installed,
So that the team has a consistent, runnable local development environment ready for feature implementation.

## Acceptance Criteria

1. **Given** a developer runs `npm create vite@latest sticky-board -- --template react-ts` **When** setup completes **Then** a working React + TypeScript SPA runs at localhost with HMR enabled

2. **Given** the project is scaffolded **When** `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities roughjs` and `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom` are run **Then** all dependencies install without errors and appear in `package.json`

3. **Given** the project is running **When** `npm run build` is executed **Then** a production-ready static `dist/` folder is generated with no TypeScript or build errors

4. **Given** the project structure is created **When** reviewed **Then** `src/components/`, `src/services/`, `src/hooks/`, `src/context/`, `src/types/`, `src/styles/`, and `src/assets/` directories exist

5. **Given** a Vitest test file is created **When** `npm run test` is run **Then** Vitest executes and reports results without configuration errors

6. **Given** the production build is analyzed **When** total gzipped JS bundle size is measured **Then** it does not exceed 400KB

## Tasks / Subtasks

- [ ] Task 1 — Scaffold the Vite project (AC: #1)
  - [ ] Run `npm create vite@latest sticky-board -- --template react-ts` in the workspace root
  - [ ] Run `cd sticky-board && npm install` to install baseline vite dependencies
  - [ ] Verify dev server starts (`npm run dev`) and app renders at localhost with HMR
- [ ] Task 2 — Install all approved runtime dependencies (AC: #2)
  - [ ] Run `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities roughjs`
  - [ ] Verify all four packages appear in `dependencies` section of `package.json`
- [ ] Task 3 — Install all approved dev/test dependencies (AC: #2, #5)
  - [ ] Run `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`
  - [ ] Add `test` script to `package.json`: `"test": "vitest"`
  - [ ] Configure `vite.config.ts` to add Vitest configuration (`test: { environment: 'jsdom', setupFiles: ['./src/setupTests.ts'] }`)
  - [ ] Create `src/setupTests.ts` with `import '@testing-library/jest-dom'`
  - [ ] Create a smoke test `src/App.test.tsx` that renders `<App />` and verifies it mounts without error
  - [ ] Run `npm run test` and verify it executes without configuration errors
- [ ] Task 4 — Configure TypeScript strict mode (AC: #3)
  - [ ] Open `tsconfig.json` and ensure `"strict": true` is set in `compilerOptions`
  - [ ] Run `npm run build` and resolve any TypeScript strict-mode errors from the scaffold default files
  - [ ] Confirm `dist/` folder is generated successfully
- [ ] Task 5 — Create mandatory project directory structure (AC: #4)
  - [ ] Create `src/components/` directory (add `.gitkeep` placeholder)
  - [ ] Create `src/services/` directory (add `.gitkeep` placeholder)
  - [ ] Create `src/hooks/` directory (add `.gitkeep` placeholder)
  - [ ] Create `src/context/` directory (add `.gitkeep` placeholder)
  - [ ] Create `src/types/` directory (add `.gitkeep` placeholder)
  - [ ] Create `src/styles/` directory (add `.gitkeep` placeholder)
  - [ ] Create `src/assets/` directory (add `.gitkeep` placeholder)
- [ ] Task 6 — Verify bundle size constraint (AC: #6)
  - [ ] Run `npm run build`
  - [ ] Measure total gzipped JS output: `find dist/assets -name "*.js" | xargs gzip -c | wc -c`
  - [ ] Confirm total is under 400KB (409,600 bytes) — scaffold alone will be well under this limit

## Dev Notes

### Technology Stack (Locked — Do Not Deviate)

| Technology | Version | Purpose |
|---|---|---|
| Vite | 6.x (latest from `npm create vite@latest`) | Build tool, dev server, bundler |
| React | 18.x (included in vite react-ts template) | UI framework |
| TypeScript | 5.x (included in vite react-ts template) | Type safety, strict mode required |
| `@dnd-kit/core` | latest | Drag-and-drop foundation (headless) |
| `@dnd-kit/sortable` | latest | Within-column card reordering |
| `@dnd-kit/utilities` | latest | DnD helper utilities |
| `roughjs` | latest | Sketchy SVG board aesthetic |
| `vitest` | latest | Test runner (Vite-native, Jest-compatible API) |
| `@testing-library/react` | latest | React component testing utilities |
| `@testing-library/jest-dom` | latest | DOM assertion matchers |
| `jsdom` | latest | DOM environment for Vitest |

**Forbidden dependencies:** MUI, Chakra UI, Ant Design, Tailwind CSS, Create React App, Next.js, any UI component library with visual opinions.

### Project Structure (Required — Exact Layout)

The scaffolded project MUST match this structure exactly. Future stories will expect files at these paths:

```
sticky-board/                           # Project root created by Vite scaffold
├── README.md
├── package.json                        # Must contain all approved deps + test script
├── tsconfig.json                       # Must have "strict": true in compilerOptions
├── tsconfig.node.json
├── vite.config.ts                      # Must include Vitest config block
├── index.html                          # Entry HTML — Story 1.2 will add Google Fonts link
├── .eslintrc.cjs
├── .gitignore
├── public/
│   └── (empty — drop-sound.mp3 added in Epic 3)
└── src/
    ├── main.tsx                        # Vite entry — renders <App /> into #root
    ├── App.tsx                         # Default scaffold App — Story 1.3 will replace this
    ├── App.css
    ├── setupTests.ts                   # Created in this story: imports @testing-library/jest-dom
    ├── App.test.tsx                    # Created in this story: smoke test only
    ├── components/                     # Created in this story (empty — populated in later stories)
    ├── services/                       # Created in this story (empty — populated in Epic 2)
    ├── hooks/                          # Created in this story (empty — populated in Epic 2)
    ├── context/                        # Created in this story (empty — populated in Epic 2)
    ├── types/                          # Created in this story (empty — types.ts added in Epic 2)
    ├── styles/                         # Created in this story (empty — tokens.css/global.css in Story 1.2)
    └── assets/                         # Created in this story (empty — audio asset added in Epic 3)
```

### TypeScript Configuration

`tsconfig.json` MUST include these settings in `compilerOptions`:
- `"strict": true` — This is non-negotiable; all future code will assume strict mode
- Standard React SPA config from the Vite template is otherwise correct

### Vitest Configuration

Add the following `test` block to `vite.config.ts` (merging into the existing `defineConfig`):
```typescript
test: {
  environment: 'jsdom',
  setupFiles: ['./src/setupTests.ts'],
}
```
Install type declarations if Vitest globals are used: add `"types": ["vitest/globals"]` to `tsconfig.json` if needed, or use explicit imports (`import { describe, it, expect } from 'vitest'`).

### Critical Architecture Rules for This Story

1. **Scaffold command is exact:** `npm create vite@latest sticky-board -- --template react-ts` — no other scaffold method
2. **No placeholder components:** Do not create `Column.tsx`, `Card.tsx`, or any domain components — that's Epic 1 Stories 2 and 3
3. **Do not delete Vite defaults yet:** `App.tsx`, `App.css`, `index.css`, `vite.svg` etc. from the Vite scaffold may remain — they'll be replaced in Story 1.2 and 1.3
4. **No `src/index.ts` barrel file** — the architecture explicitly prohibits barrel files. Do not create one.
5. **`src/setupTests.ts` must exist** — future stories' tests depend on `@testing-library/jest-dom` matchers being globally available
6. **Empty directories:** Use `.gitkeep` files (or equivalent) so directories are committed to version control and visible to the dev agent for future stories

### Bundle Size Context

- Story 1.1 scaffold with all approved dependencies should produce a gzipped bundle of approximately 80–120KB — well under the 400KB limit (NFR4)
- The rough.js library (largest external dep at ~50KB minified) is the main contributor
- dnd-kit is tree-shakeable; only used pieces will be bundled once feature implementation begins

### Testing Approach for This Story

This story's tests are minimal by design — the scaffold itself has nothing to test behaviorally. The only test required is a smoke test:

```typescript
// src/App.test.tsx
import { render } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
  });
});
```

Unit tests for all domain logic (boardService, BoardReducer, etc.) will be written when those modules are implemented in Epic 2.

### Project Structure Notes

- The Vite scaffold generates `sticky-board/` as a subdirectory. After scaffolding, the implementation work happens inside `sticky-board/`. Confirm the working directory before running npm commands.
- Do not `cd` out of `sticky-board/` during implementation — all npm scripts must be run from the project root where `package.json` lives.
- This story establishes the foundational project structure that ALL subsequent stories depend on. Get the directory layout exactly right.

### References

- Initialization command: [Source: _bmad-output/planning-artifacts/architecture.md#Starter Template Evaluation]
- Approved dependencies list: [Source: _bmad-output/planning-artifacts/architecture.md#Technical Constraints & Dependencies]
- Project directory structure: [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- TypeScript strict mode requirement: [Source: _bmad-output/planning-artifacts/architecture.md#TypeScript Strictness]
- Vitest + RTL testing approach: [Source: _bmad-output/planning-artifacts/architecture.md#Selected Starter: Vite + React + TypeScript]
- Bundle size NFR: [Source: _bmad-output/planning-artifacts/epics.md#NFR4]
- No barrel files rule: [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns]
- Implementation sequence note: [Source: _bmad-output/planning-artifacts/architecture.md#Decision Impact Analysis]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

### Completion Notes List

### File List
