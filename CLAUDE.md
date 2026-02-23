# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Remilama is a realtime document review tool. A **Reviewee** (presenter) creates a review, uploads PDFs, and navigates pages. **Reviewers** (participants) join via Review ID and post comments on documents. All communication is peer-to-peer via WebRTC (PeerJS).

## Commands

```bash
npm run dev          # Start Vite dev server (port 3000) with PeerJS server
npm run build        # Production build to dist/
npm run start        # Production server (Express + PeerJS, port 9000)
npm run test         # Run tests (vitest)
npm run test:watch   # Run tests in watch mode
```

The `predev`/`prebuild` scripts automatically copy pdfjs-dist assets (cmaps, standard_fonts) to `public/pdfjs/`.

## Architecture

### Frontend (React 18 + Vite)

- **State**: Zustand store (`src/store/index.js`) with localStorage persistence. Slices: `review` (metadata, comments, custom fields), `reviewer` (current user), `pdf` (page/scale). The `file` property on `reviewer` contains an ArrayBuffer and is excluded from persistence.
- **Routing** (`src/components/App.jsx`): `/` Home, `/review/new` create, `/review/:id` RevieweePage, `/review/:id/reviewer` ReviewerPage.
- **PDF rendering**: `PdfDocument.jsx` wraps pdfjs-dist. Comments are positioned absolutely over the PDF canvas using x/y coordinates scaled by zoom level.
- **UI**: Tailwind CSS v4 (`@import "tailwindcss"` in index.css), shadcn/ui-style components in `src/components/ui/`, Lucide icons.
- **Drag and drop**: react-dnd for repositioning comments on the PDF.

### Real-time Collaboration (PeerJS 1.x)

RevieweePage creates a Peer with the review ID. ReviewerPage connects to it. Messages flow as JSON with a `type` field:
- `REVIEW_INFO`, `REVIEWER` — handshake
- `FILE_REQUEST`, `FILE_CHUNK` — PDF transfer in 8KB Base64 chunks (limit due to PeerJS 1.x JSON chunkedMTU of 16300 bytes)
- `REVIEW/ADD_COMMENT`, `REVIEW/UPDATE_COMMENT`, `REVIEW/REMOVE_COMMENT` — comment CRUD
- `REVIEW/UPDATE_COMMENTS` — full comment list broadcast from reviewee
- `NAVIGATE` — page/file navigation sync (Follow mode)

ReviewerPage has auto-reconnection with exponential backoff (2s → 30s max) and automatic file recovery.

### Backend (Express)

`app.js` serves the built frontend and mounts the PeerJS signaling server at `/peerjs` using the `peer` npm package.

### AI Reviewer (`ai-reviewer/`)

A standalone Node.js client that joins a review session as a Reviewer via PeerJS + `@roamhq/wrtc` (WebRTC for Node.js). Receives PDF files, extracts text with pdfjs-dist, sends pages to Claude API for review, and posts comments back via the PeerJS data channel.

```bash
cd ai-reviewer && npm install

# Anthropic Claude (default)
ANTHROPIC_API_KEY=sk-xxx node index.js --server http://localhost:3000 --review-id <id> --name "AI Reviewer"

# LM Studio / OpenAI-compatible
OPENAI_BASE_URL=http://localhost:1234/v1 node index.js --server http://localhost:3000 --review-id <id> --provider openai --model <model-name>
```

### Comment Categories

Defined in `src/lib/comment-categories.js`. Seven types (bug, missing, inconsistency, unclear, risk, maintainability, question) each with a distinct pin color. Category is validated against the allowed list in the store.

### Excel Export

`src/lib/xlsx-writer.js` generates .xlsx files with zero dependencies (builds ZIP + XML directly). No external xlsx library is used.

## Key Conventions

- Store actions validate all inputs (type checks, bounds, category allowlist, string length limits). This is the primary defense against malformed PeerJS messages.
- `updateComment` uses a whitelist of allowed fields (`description`, `category`, `x`, `y`) — arbitrary field spreading is blocked.
- The `@` alias resolves to `src/` (configured in vite.config.js).
- The Vite dev server config patches PeerJS's WebSocket upgrade listener to avoid breaking Vite HMR.
