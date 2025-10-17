# MEGAMIND ULTRA

MEGAMIND ULTRA is a production-grade, multi-agent tournament orchestrator that explores up to 100 concurrent solution variants across software, math, data, and research tasks. It ships with a Next.js (App Router) UI deployed on Vercel, a Python-based agent brain, and adapters for premium tooling including OpenAI GPT-5 Codex, Modal, Wolfram, Pinecone, Supabase, Browserless, and Langfuse.

## Repository Layout

```
app/                     # Next.js App Router UI & API routes
components/              # Reusable UI components (React Flow, Monaco, terminals)
lib/                     # Shared frontend utilities (policy guard, event bus, types)
orchestrator_py/         # Python orchestrator agents, evaluators, utilities
public/data/             # Demo task catalogue for onboarding presets
scripts/                 # Infra bootstrap scripts (Pinecone, Langfuse)
supabase/                # SQL schema for Supabase Postgres persistence
tests/                   # Playwright e2e and pytest suites
.github/workflows/       # CI pipelines (lint, test, security)
```

## Quick Start (Local)

### 1. Prerequisites

- **Node.js 20+** and **pnpm 8+**
- **Python 3.11+** with `virtualenv`
- Optional CLI tooling: `supabase`, `vercel`, `semgrep`, `snyk`

### 2. Install dependencies

```bash
pnpm install
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Configure environment

Copy `.env.example` to `.env.local` (Next.js) and `.env` (Python). Fill in the credentials listed below.

```bash
cp .env.example .env.local
cp .env.example .env
```

### 4. Start the dev servers

```bash
pnpm dev
```

The Next.js dev server automatically invokes the Python orchestrator through the `app/api/orchestrate` route. Visit `http://localhost:3000` to interact with the UI.

### 5. Run tests

```bash
pnpm test        # runs Playwright + pytest
pnpm lint        # Next.js lint rules
pnpm typecheck   # strict TypeScript
pytest           # Python unit tests
```

## One-Click Deploy (Vercel)

1. Fork or import this repository into your GitHub organization.
2. Create a new project on [Vercel](https://vercel.com) and select the repository.
3. When prompted, set the environment variables from `.env.example` (at minimum `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PINECONE_API_KEY`, `PINECONE_INDEX`, `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`).
4. Vercel automatically runs `pnpm install --frozen-lockfile && pnpm build` as configured in `vercel.json`.
5. Once deployment succeeds, navigate to the live URL and confirm orchestrations stream via SSE.

> **Tip:** If you need to run heavyweight Python tasks (Modal, Playwright, etc.), configure [Vercel Serverless Functions with Python](https://vercel.com/docs/serverless-functions/supported-languages#python) or deploy the orchestrator on Modal/AWS Lambda and call it from the Next.js API routes.

## Environment Variables Checklist

| Variable | Description |
| --- | --- |
| `OPENAI_API_KEY` | Required. Access to GPT-5 Codex + Code Interpreter. |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Required. Persists sessions, versions, and artifacts. |
| `PINECONE_API_KEY`, `PINECONE_INDEX`, `PINECONE_ENVIRONMENT` | Required. Vector memory store. |
| `MODAL_TOKEN` | Optional but recommended for heavy Python runners. |
| `WOLFRAM_APP_ID` | Optional. Advanced math queries. |
| `BROWSERLESS_TOKEN` | Optional. Deterministic browser automation. |
| `UPSTASH_REDIS_URL` | Optional. Caching, rate limiting, distributed locks. |
| `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`, `LANGFUSE_HOST` | Required for trace observability. |
| `SNOWFLAKE_*` | Optional enterprise analytics connectors. |
| `GITHUB_TOKEN` | Optional GitHub automation (PR flow). |

## Backend Architecture

- **Policy Guard:** `lib/policy.ts` enforces SAFE/GUARDED/POWER tool access. Additional fine-grained rules can be layered in `orchestrator_py/policy.py` (extend as needed).
- **Tournament Engine:** `orchestrator_py/orchestrator.py` manages variant generation, mutation, and scoring using `ScoreVector` heuristics. Real deployments should replace the mock mutation logic with GPT-5 Codex calls, Modal runners, and evaluator pipelines.
- **Event Streaming:** Python emits structured JSON lines via `EventEmitter`, consumed by Node API routes and published to clients with Server-Sent Events.
- **Storage:** Supabase schema (`supabase/schema.sql`) persists session metadata. Pinecone index bootstrap script lives in `scripts/setup_pinecone.py`.
- **Observability:** Langfuse project template (`scripts/langfuse_project.json`) defines baseline scorers for correctness and latency.

## Quality Report

- Sample Langfuse evaluation export lives in `public/data/quality_report.json`. Use it to validate dashboards or as a fixture when wiring the Quality Center in the UI.
- Extend `/api/eval` to serve live quality reports from Supabase or Langfuse REST APIs.

## UI Overview

- **Graph Explorer:** Powered by React Flow (`components/graph/VersionGraph.tsx`), showing nodes for each variant and edges for parent relationships.
- **Leaderboard & Metrics:** `Leaderboard` and `MetricsPanel` visualize evaluator results and aggregated stats.
- **Inspector:** Monaco viewer + xterm terminal surfaces code summaries, metadata, and live logs.
- **Mode Switch & Controls:** `ModeSwitch` and `GenerationControls` allow runtime policy selection, variant count, and seed control. SSE events stream into the UI via `lib/api.ts`.

## Demo Workflows

The UI ships with five curated demos (see `public/data/demo_tasks.json`). Suggested walkthroughs:

1. **Full-stack Web App (POWER mode)**
   - Generates API spec, database schema, and frontend scaffolding.
   - Deploy preview via Vercel Git integration.
2. **Python Repo Debugging (GUARDED mode)**
   - Reproduces failing pytest suite, patches code, reruns tests.
3. **English → SQL Analytics (SAFE mode)**
   - Converts natural language to SQL, executes on DuckDB/Snowflake, and renders chart via Plotly.
4. **Nonlinear Physics Simulation (POWER mode)**
   - Compares symplectic integrator vs. neural ODE on Modal GPU; renders performance plots.
5. **GitHub Issue → PR (GUARDED mode)**
   - Reads issue context, forks branch, applies fix, runs CI gates, opens PR.

These presets can be wired into a dedicated demo launcher (dataset provided in `public/data/demo_tasks.json`); today you can copy the descriptions into the task textarea and select the recommended mode manually.

## Patent Ideation Pipeline Script

The repository now includes `scripts/mega_patent_generator.py`, a standalone workflow that:

- Builds a lightweight RAG corpus from arXiv, USPTO PatentsView, and optional URL seeds.
- Explores high-temperature idea variants with novelty filtering and targeted mutations.
- Converges on structured claim drafts plus detailed descriptions aligned to §112 requirements.
- Assembles the generated packets into a Markdown specification ready for conversion via `pandoc`.

Install the optional Python dependencies listed at the bottom of `requirements.txt`, set `OPENAI_API_KEY`, and run the script directly:

```bash
pip install -r requirements.txt
python scripts/mega_patent_generator.py
```

Generated artifacts are stored under `build/prnu_hardware_attest_ial3_universal_coverage/` for further review.

## Generating 100 Variants

1. Set mode to **POWER**.
2. Increase “Variants” to `25` and seed to any integer. The orchestrator iterates for ~5 mutation rounds per variant, yielding 100+ total evaluations.
3. Watch the graph update in real time. Click any node to inspect code summaries, logs, and metrics.
4. Use the leaderboard to promote winning variants or click “Fork” (API stub provided) to spawn a new branch.

## Exporters

- **Best Version as Zip/Patch:** TODO — wire `/api/export/best` to package artifacts. (Stubs ready for extension.)
- **Tournament Scoreboard:** `Leaderboard` component accepts JSON export (UI button forthcoming).

## CI/CD & Quality Gates

A GitHub Actions workflow (see `.github/workflows/ci.yml`) performs:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pytest`
- `semgrep --config auto`
- `bandit -r orchestrator_py`
- `codeql` (optional, configure in repository settings)

## Infra Bootstrap

- **Supabase:** Run `supabase db push` or execute `supabase/schema.sql` via SQL editor.
- **Pinecone:** `python scripts/setup_pinecone.py` with `PINECONE_API_KEY` set.
- **Langfuse:** POST `scripts/langfuse_project.json` to your Langfuse instance to pre-provision scorers.

## Troubleshooting

- **SSE not streaming on Vercel:** Ensure functions run in Node runtime (see `export const runtime = 'nodejs'`). Python execution may require [Edge Functions with WebAssembly](https://vercel.com/docs/functions/edge-functions) or external orchestrator hosting.
- **Modal/Wolfram not available:** SAFE and GUARDED modes should fall back to local Python execution (`requirements.txt`).
- **Playwright dependencies:** On CI, install browsers with `npx playwright install --with-deps`.
- **High cost operations:** Policy guard rejects expensive requests in SAFE/GUARDED modes; escalate to POWER.

## Roadmap Enhancements

- Integrate real GPT-5 Codex planner/architect/implementer agents.
- Hook up Modal compute graph and GPU inference for math/data workloads.
- Implement Supabase persistence & artifact storage (S3/R2).
- Add export endpoints and GitHub PR automation with authenticated GitHub App.
- Expand policy guard to track per-tool quotas and user approvals.

## License

Proprietary — see organization policy.
