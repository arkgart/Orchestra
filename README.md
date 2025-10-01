# MEGAMIND ULTRA — Super-Orchestrator

MEGAMIND ULTRA is a production-grade, multi-agent, multi-tool orchestrator designed to solve complex software, data, math, and research tasks with quality-first execution. The system combines a Next.js (App Router) front-end with a Python-based orchestration engine that explores up to 100 competing solution variants using tournament search, policy-aware tool routing, and comprehensive quality gates.

## Table of Contents
1. [Architecture](#architecture)
2. [Quick Start](#quick-start)
3. [Environment Variables](#environment-variables)
4. [One-Click Deploy (Vercel)](#one-click-deploy-vercel)
5. [Local Development](#local-development)
6. [Backend Orchestrator](#backend-orchestrator)
7. [Policy Modes](#policy-modes)
8. [Demo Workflows](#demo-workflows)
9. [Quality & Observability](#quality--observability)
10. [CI & Security Gates](#ci--security-gates)
11. [Troubleshooting](#troubleshooting)

## Architecture

### Frontend (Vercel / Next.js)
- **Tech:** Next.js 14 (App Router, TypeScript), Tailwind, shadcn/ui patterns
- **Graph Visualization:** React Flow with live SSE updates
- **Editors & Terminals:** Monaco diff/editor, xterm.js log console
- **State Management:** Zustand, TanStack Query
- **Exports:** Buttons for best-version JSON and scoreboard CSV

### Backend (Next.js API Routes)
- **Session Orchestration:** API routes spawn Python orchestrator subprocesses and stream JSON events via SSE
- **Live Streaming:** `/api/stream` keeps the UI synchronized with graph, logs, and metrics
- **Exports:** `/api/export/best` and `/api/export/scoreboard`
- **Policy Guard:** `/api/policy` enforces SAFE/GUARDED/POWER behaviours client-side

### Python Orchestrator
- **Agents:** Planner, Architects, Coders, Testers, Security, Documentation
- **Tournament Runner:** Produces variants, logs, metrics, and leaderboard events
- **Tools:** Stubs for OpenAI GPT-5 Codex, Modal, Wolfram, Pinecone, Supabase, Redis, Search, Security scanners
- **Policy Guard:** Mirrors mode controls to allow/deny tool usage
- **Scoring:** Composite scoring based on correctness, coverage, security, and performance proxies

### Storage & Artifacts
- Supabase Postgres schema (`infra/supabase_schema.sql`) for sessions and events
- Pinecone setup instructions (`infra/pinecone_setup.md`)
- Langfuse project bootstrap (`infra/langfuse_project.json`)
- Export endpoints deliver CSV/JSON bundles

## Quick Start

```bash
pnpm install
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt pytest
pnpm dev
```

Navigate to `http://localhost:3000` and trigger a mission by selecting a demo prompt or providing your own task.

## Environment Variables

Copy `.env.example` to `.env.local` and provide the following:

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | GPT-5 Codex access |
| `MODAL_TOKEN` | Modal serverless execution |
| `WOLFRAM_APP_ID` | Advanced math queries |
| `PINECONE_*` | Vector memory storage |
| `SUPABASE_*` | Session persistence & artifacts |
| `BROWSERLESS_TOKEN` | Headless browser automation |
| `UPSTASH_REDIS_*` | Caching & rate limiting |
| `LANGFUSE_*` | Tracing & evaluations |
| `SNYK_TOKEN`, `SEMGREP_APP_TOKEN` | Security scans |
| `SNOWFLAKE_ACCOUNT`, `BIGQUERY_PROJECT_ID` | Optional warehouses |

## One-Click Deploy (Vercel)

1. Fork the repository and connect it to Vercel.
2. `vercel.json` already sets `pnpm install && pip install -r requirements.txt` for installation and `pnpm build` for builds.
3. Define all environment variables in the Vercel dashboard.
4. Deploy — serverless functions will spawn the Python orchestrator and stream updates to the UI.

## Local Development

```bash
pnpm dev        # start Next.js dev server
pnpm lint       # eslint
pnpm typecheck  # tsc --noEmit
pnpm build      # production build check
pytest orchestrator_py/tests
```

## Backend Orchestrator

The Python package `orchestrator_py` includes:

- `session_runner.py`: CLI entrypoint emitting JSON event streams
- `runners/tournament.py`: orchestrates planner → architects → coders → testers → docs
- `runners/policy_guard.py`: SAFE/GUARDED/POWER enforcement
- `runners/scoring.py`: composite scoring for leaderboard
- `tools/`: adapters for OpenAI, Modal, Wolfram, Pinecone, Supabase, Redis, Search, Security
- `tests/`: pytest suite validating policy guard and scoring ordering

Run the orchestrator standalone:

```bash
python -m orchestrator_py.session_runner <<'JSON'
{
  "task": "Build a resilient data pipeline",
  "mode": "GUARDED",
  "variantCount": 5,
  "maxDepth": 5,
  "temperature": 0.6,
  "tournamentSize": 4
}
JSON
```

## Policy Modes

| Mode | Capabilities |
| --- | --- |
| **SAFE** | Read-mostly, denies browser automation & high-risk tools, human confirmation required |
| **GUARDED** | Default. Allows curated tool list with warnings for Modal/Browserless |
| **POWER** | Full autonomy, high concurrency, GPU access (documented for production use) |

Mode changes are validated both on the client and within the Python orchestrator before execution.

## Demo Workflows

The UI ships with five end-to-end demos (load them from the “Demo Flows” panel):

1. **Build web app + deploy:** Generate a SaaS analytics dashboard, integrate testing, produce deployment notes.
2. **Debug failing repo:** Pull failing pytest suite, diagnose, patch, and confirm green builds.
3. **Natural language to SQL:** Translate English analytics requests to SQL/DuckDB with visual plots.
4. **Nonlinear physics simulation:** Compare SymPy vs JAX solvers for double pendulum energy drift.
5. **GitHub PR automation:** Parse issue context, branch, apply fix + tests, draft PR summary with risk notes.

Each run produces a version graph, logs, metrics, and exports (best version + scoreboard).

## Quality & Observability

- **Langfuse:** Ingests traces & evaluation metrics (see `infra/langfuse_project.json`).
- **Quality Report:** Example report in `demo-assets/quality-report.md` summarises evaluations, security gates, and performance profile.
- **Metrics Streaming:** Composite scores, latency budgets, coverage, and flake rate pushed via SSE.

## CI & Security Gates

GitHub Actions workflow (`.github/workflows/ci.yml`) runs:
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pytest orchestrator_py/tests`
- `semgrep` security scan (auto ruleset)

Integrate Snyk, Dependabot, and GitLeaks as optional follow-up actions.

## Troubleshooting

| Issue | Fix |
| --- | --- |
| SSE stream closes immediately | Ensure Python is available on serverless runtime (set `ORCHESTRATOR_PYTHON` if needed) |
| Policy guard denies POWER mode | Confirm Browserless, Modal, and other sensitive tools are configured |
| Pinecone errors | Verify `PINECONE_INDEX` exists and matches dimension (default 1536) |
| Langfuse not receiving traces | Set `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`, `LANGFUSE_HOST` environment variables |
| Exports fail locally | Start an orchestration so `sessionStorage` captures the session ID |

## Additional Resources

- Supabase schema: [`infra/supabase_schema.sql`](infra/supabase_schema.sql)
- Pinecone provisioning guide: [`infra/pinecone_setup.md`](infra/pinecone_setup.md)
- Langfuse project scaffold: [`infra/langfuse_project.json`](infra/langfuse_project.json)
- Quality report sample: [`demo-assets/quality-report.md`](demo-assets/quality-report.md)
- Scoreboard sample: [`demo-assets/sample-scoreboard.csv`](demo-assets/sample-scoreboard.csv)
- Doc ingestion script: [`scripts/ingest_docs.py`](scripts/ingest_docs.py)
