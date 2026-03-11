---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments:
  - _bmad-output/brainstorming/brainstorming-session-2026-03-11-001.md
date: 2026-03-11
author: Keith
---

# Product Brief: learning-bmad

<!-- Content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

**Sticky Board** is a minimal, single-user, browser-based Kanban board that brings the tactile warmth of a physical sticky-note board to the digital world. No accounts, no backend, no setup — just open it and start moving tasks. Cards look and feel like real post-it notes on a hand-drawn sketch board, making task management feel natural, immediate, and even a little delightful.

Built as a learning project to explore the BMAD methodology end-to-end, it deliberately avoids the feature bloat that plagues modern task tools. Its constraints are its strengths.

---

## Core Vision

### Problem Statement

Digital Kanban tools are powerful but over-engineered for personal, everyday use. They demand accounts, databases, onboarding flows, and mental models that get in the way when all someone needs is a simple, visual way to track what they're doing.

### Problem Impact

Users who want a lightweight personal task board are forced to either use bloated tools designed for teams, or resort to literal sticky notes on a physical wall — neither of which is portable, persistent, and pleasantly simple at the same time.

### Why Existing Solutions Fall Short

- **Trello, Jira, Linear** — powerful but heavy; require accounts, backends, onboarding
- **Physical sticky notes** — tactile and satisfying, but not persistent or portable
- **Simple to-do apps** — miss the visual status-flow that makes Kanban valuable
- None combine the **physical board aesthetic** with **zero-friction digital convenience**

### Proposed Solution

A React single-page app that persists to `localStorage` — no backend, no auth, no install. Three fixed columns (To Do, In Progress, Done). Tasks are square, colorful post-it notes on a hand-drawn sketchy board. Everything can be created, edited, moved, and deleted through direct, physical-feeling gestures.

### Key Differentiators

- **Physical-first design:** Board looks hand-drawn; cards look like real post-its
- **Zero friction:** No login, no setup — works immediately in any browser
- **Constraint as quality:** Deliberately minimal feature set; what's not there is as important as what is
- **Tactile interactions:** Tilt on drag, soft drop sounds, trash-zone deletion, color-first creation

---

## Target Users

### Primary User — "The Pragmatic Solo Doer"

**Persona: Alex, 28-40, developer / freelancer / knowledge worker**

Alex works independently and manages their own daily workload. They're comfortable with technology but frustrated by tools that require setup, accounts, or onboarding just to write down what they need to do today. They appreciate well-crafted design — the kind of app that feels like it was made with care. They have a pack of physical sticky notes somewhere on their desk but rarely use them because they lose them.

**Daily context:**
- Tracks personal daily tasks, errands, side project to-dos, and work items
- Switches between a few browser tabs throughout the day
- Wants to glance at their board and immediately know what's happening

**Current workarounds:**
- Notes app (no visual status flow)
- Sticky notes on a desk (not portable, get lost)
- Nothing at all (relies on memory)
- Over-featured tools like Trello that feel heavy for personal use

**Success moment:**
Opens a browser tab, sees their tasks laid out like a physical board, drags one card from "In Progress" to "Done" — and feels a small, satisfying sense of progress.

---

### Secondary Users

Not a design target for this version, but plausible future audience:
- **Students** managing assignments and study tasks
- **Designers / creatives** who are drawn to the aesthetic and share it with others
- **Anyone who just stumbles on it** and keeps it as their daily tab

---

### User Journey

**Discovery:** Finds the app via a shared link, a GitHub repo, or a recommendation. No sign-up page — they land directly on the board.

**Onboarding (zero friction):** The board is already there with empty columns. They see a `+` button or notice the sticky-note pad in the corner. They click, pick a color, type a task. Done — they're using the app.

**Core usage:** Opens the tab each morning. Glances at the columns. Drags cards as work progresses. Adds new cards as tasks come up. Trashes completed or cancelled items.

**Aha moment:** The first time they drag a card to "Done" and hear the soft drop sound — it feels like crossing something off a physical list.

**Long-term:** The board lives in a pinned browser tab. `localStorage` means it's always there, exactly as they left it.

---

## Success Metrics

### User Success

- A user can create, move, and delete a card in under **30 seconds** with zero instruction
- Board state persists reliably across browser sessions (localStorage)
- The visual design is immediately recognizable as distinct — "this looks like a real board"
- Zero data loss or crashes during normal use

### Learning / Project Success

- All BMAD phases completed end-to-end: brief → PRD → architecture → stories → dev
- Stories are small, focused, and independently deliverable
- Final app matches intended design and scope without drift
- The process itself is the artifact — understanding how each BMAD phase connects is the primary outcome

### Key Performance Indicators

| KPI | Target |
|---|---|
| Time to first card created | < 30 seconds from app open |
| localStorage persistence reliability | 100% — no data loss on reload |
| BMAD phases completed | All 6 phases (brief, PRD, UX, arch, stories, dev) |
| Scope adherence | Final app matches brief — no unplanned features |

---

## MVP Scope

### Core Features

| Feature | Notes |
|---|---|
| 3 fixed columns: To Do / In Progress / Done | No customization needed |
| Square post-it cards with choosable color | Color palette on creation |
| Card fields: title + description | Description optional, scrollable |
| Click-to-edit inline (title & description) | No modal, contenteditable |
| Drag-and-drop between columns | Full card is draggable, tilt animation |
| Drag-to-trash deletion | Trash zone appears on drag start |
| Post-it pad peel + [+] button creation | Two entry points |
| Soft sound on card drop | Brief, non-intrusive |
| Faded appearance for Done cards | CSS only |
| Hand-drawn/sketchy board aesthetic | Column borders, rough.js or similar |
| Warm paper background | Cream/off-white, dot or grain texture |
| Handwritten font (e.g. Caveat / Patrick Hand) | Single Google Font |
| localStorage persistence | Full board state saved automatically |
| React SPA, static, no backend | Deployable as static site |

### Out of Scope for MVP

Authentication, user accounts, backend/API, due dates, assignees, labels/tags, filters, search, priority markers, activity log, WIP limits, column customization, dark mode, multi-board support.

### MVP Success Criteria

The MVP is complete and successful when:
- All core features listed above are implemented and working
- A new user can create, move, and delete a card in under 30 seconds with no instruction
- Board state survives a browser refresh with no data loss
- The visual aesthetic is immediately recognizable as distinct from generic Kanban tools

### Future Vision

Potential v2+ enhancements (not planned, not committed):
- Column renaming and custom column count
- Multiple named boards
- Export board to image or PDF
- Optional dark / chalkboard mode
- PWA installability (add to home screen)
