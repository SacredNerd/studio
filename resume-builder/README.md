# Resume Builder

Resume builder with a React/Vite frontend and a FastAPI/ReportLab backend.

## Architecture

This repository is a monorepo:

```
frontend/   React + Vite + TypeScript editor and live preview
backend/    FastAPI service: persistence (SQLite) and PDF generation (ReportLab)
```

The frontend uses the backend for **both** persistence and PDF export — no
browser localStorage and no client-side PDF rendering. Resume data is
transmitted to the backend over `/api/...` and stored in a local SQLite
database. The browser never persists resume data itself.

## Running locally

Two terminals:

```bash
# Terminal 1 — backend
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
uvicorn app.main:app --reload --port 8000

# Terminal 2 — frontend
cd frontend
npm install
npm run dev    # http://localhost:5173, /api proxies to :8000
```

## Privacy note

An earlier version of this app kept all data in the browser's localStorage and
generated PDFs entirely client-side; nothing left the browser. The current
version stores data and renders PDFs on the backend, so the privacy model now
depends on where you deploy that backend. If running locally only (the default),
data still never leaves your machine.

## Layout fidelity

The HTML preview and the PDF use independent renderers (the preview is
React/Tailwind; the PDF is programmatic ReportLab). They aim for the same
visual contract — section order, colors, fonts, rich-text formatting,
templates — but pixel-level parity is not a goal.
