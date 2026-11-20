# TOOLHUB

A responsive, browser-first utility hub prototype. This repository turns the agreed TOOLHUB direction into a working Next.js application with 12 starter tools.

## What's implemented

- Home page and responsive navigation
- Tool directory with keyword search and category filters
- 12 tool workspaces:
  - Word Counter
  - Text Formatter
  - JSON Formatter
  - Base64 Encoder / Decoder
  - UUID Generator
  - QR Code Generator
  - Image Compressor
  - PDF Merger
  - Percentage Calculator
  - Date Calculator
  - Pomodoro Timer
  - Invoice Generator
- Browser-local favorites and recently-used list
- Dashboard that reads local favorites and recents
- Demo profile screen (not production authentication)
- `GET /api/v1/tools` catalog endpoint
- Initial Prisma/PostgreSQL schema for the real account and workspace backend

## Requirements

- Node.js 24 LTS recommended (Node.js 22.12+ also supports the Prisma 7 setup)
- npm

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Quality checks

```bash
npm run typecheck   # TypeScript type check only (tsc --noEmit). This is NOT a linter.
npm test            # automated tests (node:test via tsx)
npm run check       # typecheck + test
npm run build       # production build
```

A real linter (ESLint) is not set up yet; see `docs/TECHNICAL_DECISIONS.md` (D-008).

## Project documentation

- `docs/DEVELOPMENT_LOG.md` — chronological work log with verification results
- `docs/TECHNICAL_DECISIONS.md` — technical decisions and their status
- `docs/ROADMAP.md` — roadmap and backlog
- `docs/TESTING_GUIDE.md` — how to run and write tests, coverage, manual QA checklist

## Important prototype boundaries

This is a working frontend prototype, not yet a production multi-user application.

- Favorites and recent tools are stored in the current browser's `localStorage`.
- The profile screen creates a local demo identity only. It is not secure registration/login.
- The Prisma schema is prepared for the next backend phase, but the live pages do not yet read/write PostgreSQL.
- Tool execution is local in the browser. No user content is sent to TOOLHUB servers by the included tools.
- Saved Results, multi-workspace CRUD, real authentication, server-side history, deployment secrets, rate limiting, and production security hardening are not connected yet.

## Project structure

```text
prisma/                  PostgreSQL schema
src/app/                 Next.js pages and API routes
src/components/          Reusable UI and tool workspaces
src/lib/tools.ts         Tool catalog and categories
src/lib/tool-logic/      Pure, unit-tested tool logic (no React/DOM)
src/lib/client-storage.ts Browser-local favorites and recents
docs/                    Project documentation
```

## Next development milestone

Connect the prepared Prisma 7 schema to PostgreSQL using the PostgreSQL driver adapter, add real authentication and session handling, and move favorites/workspaces/history from browser storage to user-owned database records. Keep local-only tools in the browser and store only non-sensitive usage metadata.
