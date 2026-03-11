---
stepsCompleted: [step-01-init, step-02-discovery, step-02b-vision, step-02c-executive-summary, step-03-success, step-04-journeys, step-05-domain-skipped, step-06-innovation, step-07-project-type, step-08-scoping, step-09-functional, step-10-nonfunctional, step-11-polish, step-12-complete]
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-learning-bmad-2026-03-11.md
workflowType: 'prd'
classification:
  projectType: web_app
  domain: general
  complexity: low
  projectContext: greenfield
---

# Product Requirements Document — Sticky Board

**Project:** learning-bmad
**Author:** Keith
**Date:** 2026-03-11

---

## Executive Summary

**Sticky Board** is a zero-friction, browser-based personal Kanban board built as a React SPA with localStorage persistence. No accounts, no backend, no installation — open a browser tab and your board is there. Three fixed columns (To Do / In Progress / Done), square post-it cards in choosable colors, drag-and-drop movement, and a hand-drawn sketchy aesthetic that makes digital task management feel tactile and physical.

Target user is the solo knowledge worker, developer, or freelancer who needs a lightweight visual task board for personal daily use — not a team collaboration platform. The app lives in a pinned browser tab and feels like the physical sticky-note board they wish was always with them.

Built as a BMAD methodology end-to-end learning project. Both the process and the product are intentional artifacts.

### What Makes This Special

Personal task management has been colonized by tools built for teams. Solo users are forced to choose between bloated collaboration platforms that demand accounts and onboarding, and raw notes apps that lack visual status flow. Sticky Board occupies the gap: a tool that is deliberately, defiantly personal.

**Constraint is the design principle.** What's not in Sticky Board is as important as what is. No accounts, no multi-board support, no labels, no assignees — each omission is intentional. The product's power comes from its refusal to grow.

**Aesthetic is the identity.** The hand-drawn board and post-it card look aren't decoration — they create the tactile satisfaction that makes task completion feel like something. The first time a user drags a card to Done and hears the soft drop sound, it feels like crossing something off a physical list.

**Zero friction is the value proposition.** Not "fast to set up" — *no* setup. Open it, use it.

### Project Classification

| Attribute | Value |
|---|---|
| Project Type | Web App (React SPA) |
| Domain | General / Personal Productivity |
| Complexity | Low |
| Project Context | Greenfield |
| Deployment | Static site, no backend |

---

## Success Criteria

### User Success

- A new user creates their first card within **30 seconds** of opening the app, with zero instruction
- Board state persists reliably across browser sessions and page refreshes — no data loss under any normal usage pattern
- The visual design is immediately recognizable as distinct: identified as "a sticky-note board" by first-time users without prompting
- Users can drag a card from any column to any other in a single smooth gesture
- The "aha moment" — hearing the drop sound when a card moves to Done — is experienced in the first session

### Business and Learning Success

- All 6 BMAD phases completed end-to-end: brief → PRD → UX → architecture → stories → dev
- Each story is independently deliverable, covering a single cohesive slice of functionality
- Final implementation matches PRD scope — no unplanned features, no missing core features
- Process artifacts (brief, PRD, architecture, stories) are coherent, thorough, and reusable as a BMAD methodology reference

### Technical Success

- App loads and is interactive in under 3 seconds on a standard broadband connection
- No runtime errors or crashes during normal usage (create, move, edit, delete cards)
- All board state writes to localStorage atomically — partial writes never leave the board in a corrupt state
- App is deployable as a fully static site with no server-side dependencies

### Measurable Outcomes

| Outcome | Target |
|---|---|
| Time to first card created | < 30 seconds from app open |
| localStorage persistence reliability | 100% — no data loss on reload |
| App load time (TTI) | < 3 seconds on broadband |
| BMAD phases completed | All 6 |
| Scope adherence | Final app matches PRD — no unplanned features |
| Runtime errors in normal usage | Zero |

---

## Product Scope

### MVP — Minimum Viable Product

The MVP is the complete Sticky Board experience. There is no partial MVP — the product only makes sense as a cohesive whole. The MVP is complete when:

- All core features are implemented and working
- A new user can create, move, and delete a card in under 30 seconds with no instruction
- Board state survives a browser refresh with no data loss
- The visual aesthetic is immediately recognizable as distinct

**Core MVP Features:**

| Feature | Notes |
|---|---|
| 3 fixed columns: To Do / In Progress / Done | No customization |
| Square post-it cards with choosable color | Color palette on creation |
| Card fields: title + description | Description optional, scrollable |
| Click-to-edit inline (title and description) | No modal, contenteditable |
| Drag-and-drop between columns | Full card draggable, tilt animation |
| Drag-to-trash deletion | Trash zone appears on drag start |
| Post-it pad peel + [+] button creation | Two entry points |
| Soft sound on card drop | Brief, non-intrusive |
| Faded appearance for Done cards | CSS only |
| Hand-drawn/sketchy board aesthetic | rough.js or equivalent |
| Warm paper background | Cream/off-white, subtle texture |
| Handwritten font (Caveat or Patrick Hand) | Google Fonts |
| localStorage persistence | Full board state, auto-save |
| React SPA, static deployment, no backend | |

**Explicitly Out of Scope for MVP:**
Authentication, user accounts, backend/API, due dates, assignees, labels/tags, filters, search, priority markers, activity log, WIP limits, column customization, dark mode, multi-board support, cross-device sync.

### Growth Features (Post-MVP)

- Column renaming and custom column count
- Multiple named boards
- Card re-ordering within a column
- Keyboard shortcuts for power users
- Card labels or secondary color coding

### Vision (Future)

- Export board to image or PDF
- PWA installability (add to home screen)
- Optional dark / chalkboard theme
- Undo/redo
- Shared board via URL (requires backend — fundamentally changes the product)

---

## User Journeys

### Journey 1 — Alex: First-Time Discovery and Immediate Use

**Persona:** Alex, 32, freelance developer. Works independently, manages multiple small client projects. Has a pack of physical sticky notes on their desk that rarely get used because they get lost. Current system is a flat-list notes app with no visual status flow.

**Opening Scene:** Alex sees a link to Sticky Board shared in a developer community. Clicks it without reading any description. The app opens directly to an empty board — no sign-up wall, no onboarding wizard, no tutorial overlay. Three clean columns on what looks like a real cork board. A small sticky-note pad in the corner catches their eye.

**Rising Action:** Alex hovers over the pad. A gentle peel animation suggests it's interactive. They click — a color picker slides out. They pick yellow, start typing "Fix auth bug." The card appears under their cursor as if they're placing a real post-it. They repeat: "Review PR," "Write tests," "Deploy staging." Four cards on the board in under two minutes.

**Climax:** An hour later, Alex finishes writing the tests. They grab the card and drag it toward "Done." The card tilts as they drag. They release it into the Done column. A soft, satisfying sound plays — like paper landing on a desk. The card becomes slightly faded, visually completed.

**Resolution:** Alex pins the tab. From that day on, Sticky Board is the first thing that opens in the morning. The physical sticky notes stay in the drawer.

---

### Journey 2 — Alex: Cleanup and Reorganization

**Situation:** Two weeks in. The To Do column has 14 cards — backlog built up over a sprint. Some are stale; some need to be promoted.

**Opening Scene:** Alex opens the board on a Monday morning. To Do column is overflowing. Needs to clear the noise before the week starts.

**Rising Action:** Scans the cards. Drags 3 stale cards to the trash zone that appears during drag — they vanish. Promotes 2 cards from To Do to In Progress to signal today's focus.

**Climax:** Clicks a card to edit — changes the title from "Research OAuth" to "Choose OAuth library (Clerk vs Auth0)." The edit is immediate and inline, no modal, no save button.

**Resolution:** Board is clean, focused, accurate. The entire cleanup took under 5 minutes. Alex gets to work.

---

### Journey 3 — Alex: New Browser Context

**Situation:** Alex is using a borrowed laptop for a day. Their usual machine is being repaired.

**Opening Scene:** They open Sticky Board in an unfamiliar browser. The board loads — empty. Different browser, different localStorage. The usual board doesn't exist here.

**Rising Action:** Alex re-creates the day's active tasks from memory: 3 cards in 5 minutes. Works through the day, moving cards as tasks progress.

**Resolution:** That evening, back on the main machine, the full board is exactly where they left it. The borrowed-laptop board is gone — expected, understood, not a problem. The localStorage scoping is an honest constraint, not a failure.

*This journey surfaces a product truth: localStorage is intentionally browser-scoped. The product never promises cross-device sync. The constraint is a feature.*

---

### Journey Requirements Summary

| Journey | Capabilities Revealed |
|---|---|
| First-time use | Card creation, color picker, drag-and-drop, sound feedback, Done visual state, auto-persistence |
| Board cleanup | Drag-to-trash, inline edit, multi-card manipulation, column overflow handling |
| New browser context | Empty-state UX, localStorage scope transparency, resilient re-creation flow |

---

## Web App Technical Requirements

### Browser and Platform Support

- **Target:** Evergreen browsers — Chrome, Firefox, Safari, Edge (latest 2 major versions)
- **Primary use context:** Desktop, pinned browser tab, keyboard and mouse
- **Mobile:** Responsive layout required; touch-optimized interactions are a bonus, not a requirement for MVP
- **No IE11 support**

### Architecture

- React SPA (single-page application), no server-side rendering
- Static site deployment: Netlify, GitHub Pages, Vercel, or equivalent
- No build-time environment variables that differ across environments
- No backend, no API, no authentication layer

### Dependency Philosophy

- Minimize third-party dependencies; every dependency must earn its place
- **Acceptable:** rough.js (sketchy aesthetic), Google Fonts (Caveat/Patrick Hand), minimal DnD library (e.g., dnd-kit)
- **Not acceptable:** Heavy UI component libraries (MUI, Chakra, Ant Design)
- **Performance budget:** Total JS bundle ≤ 400KB gzipped

### Accessibility Baseline

- All interactive elements keyboard-accessible (tab navigation, Enter/Space to activate)
- Color is not the sole indicator of card state — Done state communicated by fading + column position, not color alone
- Text on cards meets WCAG 2.1 AA contrast ratio (4.5:1) against card background colors in the default palette
- Browser zoom does not break layout

### SEO

- Not required — utility app with no discoverability objective
- Basic Open Graph meta tags acceptable for link sharing

---

## Functional Requirements

### Card Management

- **FR1:** User can create a new card by clicking the sticky-note pad in the corner of the board
- **FR2:** User can create a new card by clicking the [+] button
- **FR3:** User selects a card color from a predefined palette at the time of creation
- **FR4:** User enters a card title (required; displayed on the card face)
- **FR5:** User can enter an optional card description (scrollable; accessible via edit mode)
- **FR6:** User can edit a card's title inline by clicking on it — no modal, no separate edit screen
- **FR7:** User can edit a card's description inline by clicking on it
- **FR8:** User can delete a card by dragging it to the trash zone
- **FR9:** The trash zone is only visible while a card drag is in progress

### Board and Column Structure

- **FR10:** The board always displays exactly three columns: To Do, In Progress, Done
- **FR11:** Column names are fixed and not user-configurable in the MVP
- **FR12:** The full board is visible without horizontal scrolling on desktop viewports ≥ 1024px wide
- **FR13:** Columns scroll vertically when they contain more cards than fit in the visible area

### Drag and Drop

- **FR14:** User can drag a card from any column to any other column
- **FR15:** User can drag a card within the same column to reorder it
- **FR16:** A dragged card displays a tilt animation while in motion
- **FR17:** The trash zone appears in a consistent on-screen location when any card drag begins
- **FR18:** Releasing a card on a valid column target places the card at the drop position in that column

### Visual Feedback and Microinteractions

- **FR19:** A soft sound plays when a card is dropped onto a column
- **FR20:** Cards in the Done column display in a faded/muted visual state to signal completion
- **FR21:** The board background and column borders render with a hand-drawn sketchy aesthetic (rough.js or equivalent)
- **FR22:** The card creation entry point (sticky-note pad) uses a peel animation to suggest interactivity
- **FR23:** All card text uses a handwritten-style font (Caveat or Patrick Hand via Google Fonts)

### Data Persistence

- **FR24:** All board state — cards, column assignments, card order, card colors, card content — is automatically saved to localStorage after every change
- **FR25:** Board state is fully restored from localStorage on page load
- **FR26:** A first-time user with no localStorage data sees an empty board ready for use
- **FR27:** No board data is ever sent to any server or external service

### Edge and Error States

- **FR28:** Empty columns display a placeholder visual confirming they are valid drop targets
- **FR29:** If localStorage is unavailable (e.g., private browsing mode), the app functions normally but does not attempt to persist — the user sees an informational notice that data will not be saved
- **FR30:** If a localStorage write fails due to storage quota exceeded, the app surfaces a clear, non-blocking message and does not silently lose data

---

## Non-Functional Requirements

### Performance

- App is interactive (all gestures responsive) within **3 seconds** of page load on standard broadband
- Drag interactions are smooth at **60fps** — no jank or stutter during card movement on target hardware (mid-range desktop/laptop)
- localStorage reads and writes complete in **< 10ms** for a typical board (up to 50 cards)
- Total JavaScript bundle does not exceed **400KB gzipped**

### Reliability

- Board state is written to localStorage atomically — a failed or interrupted write never leaves a partially-saved or corrupt board state
- On detecting a corrupt localStorage entry, the app recovers gracefully by defaulting to an empty board state rather than throwing an unhandled error
- Zero unhandled JavaScript exceptions during normal usage (create, edit, move, delete cards)

### Accessibility

- All interactive controls are reachable and operable via keyboard navigation
- Completion state (Done) is communicated through at least two visual signals (fading + column position), not color alone
- Card text meets WCAG 2.1 AA contrast against all colors in the default card color palette
- Pinch-to-zoom and browser zoom do not break the layout or make content inaccessible
