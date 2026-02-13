# GPU Cloud Service Platform

A simplified AI PaaS demonstrating API key management, model deployment, and OpenAI-compatible inference with simulated distributed GPU workers.

**Live demo (deployed):** [https://tether-test.vercel.app/](https://tether-test.vercel.app/)

## Architecture Overview

- **Backend**: Node.js (Express) with API key management, inference routing, and an in-memory task queue distributing work across simulated worker nodes.
- **Frontend**: React dashboard for API keys, usage monitoring, and model deployment.
- **Distributed**: Task queue with multiple simulated workers; architecture documented for production scaling.

## Prerequisites

- Node.js 20+
- Docker & Docker Compose (for containerized run)
- npm or pnpm

## Quick Start (Local)

```bash
# Clone and enter project
cd Task

# Install dependencies (from repo root)
npm run install:all
# Or manually: cd backend && npm install && cd ../frontend && npm install

# Copy environment
cp .env.example .env

# Start backend and workers
cd backend && npm run dev

# In another terminal: start frontend
cd frontend && npm run dev
```

Backend: http://localhost:3001  
Frontend: http://localhost:5173

## Quick Start (Docker)

```bash
docker-compose up --build
```

- API: http://localhost:3001  
- Dashboard: http://localhost:5173 (if frontend is served via backend or separate port in compose)

## Project Structure

```
Task/
├── backend/           # Node.js API & worker simulation
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── workers/
│   │   └── middleware/
│   └── package.json
├── frontend/          # React dashboard
│   ├── src/
│   └── package.json
├── docs/
│   ├── api-openapi.yaml   # OpenAPI 3.0 spec
│   └── ARCHITECTURE.md    # Architecture document
├── docker-compose.yml
├── .env.example
└── .github/workflows/     # CI/CD
```

## Environment Variables

See `.env.example`. Key variables:

| Variable | Description |
|----------|-------------|
| `PORT` | Backend server port (default: 3001) |
| `NODE_ENV` | `development` or `production` |
| `WORKER_COUNT` | Number of simulated GPU workers |
| `RATE_LIMIT_RPM` | Requests per minute per API key |

## API Overview

- **Auth**: All inference and management endpoints use `Authorization: Bearer <api_key>`.
- **Inference**: OpenAI-compatible `POST /v1/chat/completions` (streaming and non-streaming).
- **Management**: `GET/POST/DELETE /api/keys`, `GET /api/usage`, `GET /api/models`, `POST /api/deployments`.

Full API: see `docs/api-openapi.yaml`.

## Testing

```bash
cd backend && npm test
```

## Documentation

- **Live demo (deployed):** [https://tether-test.vercel.app/](https://tether-test.vercel.app/)
- **API documentation (OpenAPI):** `docs/api-openapi.yaml`
- **Architecture document (2–3 pages):** `docs/ARCHITECTURE.md` — for a 2–3 page PDF, open the Markdown in an editor or use a tool (e.g. Pandoc, VS Code “Markdown PDF” extension) to export to PDF.

## First-time dashboard login

Set `ADMIN_KEY` in `.env` (e.g. `ADMIN_KEY=your-secret`) and use that value as the API key on the login page. Then create a normal API key from the dashboard and use it for API calls.

## Deployment (optional, for live demo)

To get a live demo URL (extra points):

- **Backend**: Deploy the `backend/` app to any Node 20 host (e.g. [Render](https://render.com), [Railway](https://railway.app), [Fly.io](https://fly.io)). Set env vars from `.env.example` and expose the chosen `PORT`.
- **Frontend**: Build with `VITE_API_BASE=<your-backend-url>`, then serve the `frontend/dist` folder as static files (e.g. same platforms, or Vercel/Netlify).
- **CORS**: Set `CORS_ORIGINS` to your frontend origin (e.g. `https://your-app.vercel.app`).

No database or Redis is required for the simplified version; state is in-memory and resets on restart.

## License

MIT
