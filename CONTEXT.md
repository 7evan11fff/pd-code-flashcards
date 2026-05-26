# Shared Agent Context

> **Purpose**: Shared memory across all agents working on this project. Read at the start of each session and append updates at the end.

## Project Overview
- **Product**: Static single-page flashcard web app for memorizing US police / law-enforcement radio codes (10-codes, 11-codes, signal codes, NATO phonetic alphabet).
- **Tech stack**: Vanilla HTML / CSS / JavaScript. No framework, no build step, no dependencies. `localStorage` for persistence.
- **Repo**: TBD — will be pushed to GitHub on first commit (owner `7evan11fff`).
- **Owner**: Evan Klein
- **Data source**: https://www.zipscanners.com/blogs/learn/police-codes (APCO / common-set reference).

## Key Files
| File | Purpose |
| --- | --- |
| `index.html` | Page markup, controls, flashcard structure, footer. |
| `styles.css` | Dark "dispatch" themed UI with 3D flip card, fully responsive. |
| `app.js` | Single IIFE: state machine, deck building, rendering, persistence, keyboard hotkeys. |
| `data.js` | `DATA` object: 4 decks (`10-codes`, `11-codes`, `signals`, `phonetic`) with `{code, meaning, notes}`. |
| `README.md` | Usage docs. |
| `CONTEXT.md` | This file. |

## Current State
- App is complete and functional locally.
- All ~190 cards from the source page are loaded.
- Features done: deck switcher, direction (Code↔Meaning / Mixed), order (sequential / shuffle), filter (all / still-learning), per-card known tracking, progress bar, keyboard shortcuts, mobile responsive.
- Pending: push to GitHub.

## Decisions Log
| Date | Decision | Rationale |
| --- | --- | --- |
| 2026-05-26 | Vanilla JS / no build step | Smallest possible footprint; flashcard scope doesn't justify React/Vite. Easy to host anywhere static. |
| 2026-05-26 | `localStorage` for progress | No backend required; per-device study state is fine. |
| 2026-05-26 | Deterministic shuffle (seeded LCG) | Shuffle order stays stable within a session so Prev/Next works predictably; new seed only on explicit re-shuffle. |
| 2026-05-26 | Mixed mode uses hash of card id | Per-card front/back is stable across navigations, so reviewing the same card doesn't randomly flip semantics. |
| 2026-05-26 | Single combined "All" deck | Lets users study across categories without manual merging. |

## Agent Activity Log
| Date | Agent | What Changed |
| --- | --- | --- |
| 2026-05-26 | Claude (Opus 4.7) | Initial scaffold: created `index.html`, `styles.css`, `app.js`, `data.js`, `README.md`, `CONTEXT.md`. Loaded all codes from zipscanners reference. |
