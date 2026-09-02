# Next Door Library — PRD / Working Notes

## Original Problem Statement
Existing MERN app ("Next Door Library", a Nagpur community book-lending platform).
User request: modernize the UI animations and buttons with snappy, physics-based
micro-interactions — while keeping the ORIGINAL warm, book-reader color scheme
exactly as it was, and preserving all existing functionality.

## Stack (custom, non-default)
- Backend: Node.js + Express + Mongoose (MongoDB). Real API lives in `backend/server.js` on internal port 5000.
- Frontend: React + Vite (`frontend/`, served on port 3000).
- DB: local MongoDB (`mongodb://localhost:27017/next_door_library`).

## Platform integration (how it runs here)
- Supervisor `backend` program runs `uvicorn server:app` on 8001 → `backend/server.py`
  is a thin Starlette ASGI **reverse proxy** forwarding all requests to the Node app on 127.0.0.1:5000.
  Proxy strips `origin`/`referer` headers so the Node app's strict CORS passes (server-to-server).
- New supervisor program `node_backend` (`/etc/supervisor/conf.d/node_backend.conf`) runs `node server.js` on 5000.
- Frontend: `frontend/package.json` has `start` script (`vite --host 0.0.0.0 --port 3000`);
  `vite.config.js` uses `allowedHosts: true` and proxies `/uploads` → :5000.
- `backend/.env` created with MONGO_URI (local), JWT_SECRET, PORT=5000.

## What was implemented (this session)
- Date: 2026-06 (session).
- Restored original warm palette + Cormorant Garamond / DM Sans fonts (reverted an earlier
  monochrome experiment per user feedback).
- **Modernized motion (index.css, global):**
  - Snappier transition tokens (cubic-bezier, <200ms).
  - All `.btn`: press feedback `scale(0.97)`, `:focus-visible` accent ring, specific-property
    transitions (no `transition: all` on buttons).
  - `.card` specific-prop transitions; `fadeInUp` shortened; `.stagger` steps reduced to ≤50ms.
- **Spring physics (framer-motion):** BookCard entrance (stiffness 400 / damping 30) + `whileTap`;
  Home hero, feature "how" cards, and "why" items converted to spring with tighter stagger.
- Seeded DB; verified login → dashboard, catalogue, book detail end-to-end.

## Verified working
- Auth login (user + admin), catalogue browse, book detail, dashboard. Warm theme intact.

## Backlog / Next
- Optional: extend spring micro-interactions to Forum / Admin list reveals.
- Optional: accordion height springs on filter panels.
