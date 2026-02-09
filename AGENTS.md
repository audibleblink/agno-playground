# AGENTS.md

## Project Overview

Multi-agent AI playground: **Agno** (Python/FastAPI backend) + **Next.js** (React/TypeScript frontend). Backend orchestrates AI agent teams; frontend (`agent-ui/`) provides the chat interface.

## Project Structure

```
agno-playground/
├── main.py                  # FastAPI entry point (uvicorn, port 7777)
├── agents/                  # Individual Agno Agent definitions
├── teams/                   # Team compositions (HackerNewsTeam, ResearchTeam)
├── models/                  # AI model configuration (Ollama, Claude, Azure)
├── config/                  # Environment variables and shared config
├── storage/                 # SQLite + LanceDB persistence layer
├── knowledge/               # Vector DB, embedders, and knowledge bases
├── api/                     # Additional FastAPI routers
├── pyproject.toml           # Python deps (uv)
├── mise.toml                # Task runner
└── agent-ui/                # Next.js 16 + React 19 frontend
    ├── src/app/             # App Router pages
    ├── src/components/      # React components (playground/, ui/)
    ├── src/hooks/           # Custom React hooks
    ├── src/api/             # API client functions
    ├── src/lib/             # Utilities (cn, url validation)
    ├── src/types/           # TypeScript type definitions
    └── src/store.ts         # Zustand global state
```

## Build / Lint / Test Commands

### Backend (Python)

```bash
uv sync                      # Install dependencies
uv run main.py               # Start server (port 7777, hot reload)

# Testing (if tests exist)
uv run pytest                              # All tests
uv run pytest tests/test_foo.py            # Single file
uv run pytest tests/test_foo.py::test_bar  # Single test
uv run pytest -k "test_name"               # Match by name
```

### Frontend (agent-ui/)

Commands run from `agent-ui/`. Uses **pnpm**.

```bash
pnpm install                 # Install dependencies
pnpm dev                     # Dev server (port 3000)
pnpm build                   # Production build
pnpm lint                    # ESLint check
pnpm lint:fix                # ESLint auto-fix
pnpm format                  # Prettier check
pnpm format:fix              # Prettier auto-format
pnpm typecheck               # TypeScript check (tsc --noEmit)
pnpm validate                # lint + format + typecheck (run before commits)
```

### Task Runner (mise)

Run in tmux to monitor output:
```bash
mise run ui                  # Frontend dev server
mise run backend             # Backend server
mise run dev                 # Both frontend and backend
```

## Code Style Guidelines

### Python (Backend)

**Imports**: Standard library > third-party (`agno`, `fastapi`, `pydantic`) > local modules. Local imports use bare paths (`from models import worker_model`), relative imports only within packages (`from .hackernews import HackerNewsTeam`).

**Naming**:
- `PascalCase`: Agent/Team instances (singletons: `HackerNewsResearcher`, `ResearchTeam`)
- `snake_case`: functions, variables, module names
- `UPPER_SNAKE_CASE`: module-level constants

**Type hints**: Required on function signatures. Use modern syntax (`list[str]` not `List[str]`). Use `from __future__ import annotations` for forward references.

**Data models**: Pydantic `BaseModel` with `Field(description="...")` for API schemas.

**Agent/Team definitions**: Module-level instances with `id`, `name`, `db`, `memory_manager`:
```python
HackerNewsResearcher = Agent(
    id="hn_researcher",
    name="HackerNews Researcher",
    model=worker_model,
    db=get_db(),
    memory_manager=get_memory_manager(),
)
```

**Configuration**: Centralize in `config/environment.py`. Use `os.getenv()` with defaults. Never hardcode secrets.

**Error handling**: `HTTPException` for API errors. Wrap external calls in try/except.

**Module exports**: Use `__all__` with single quotes in `__init__.py`.

### TypeScript / React (Frontend)

**Formatting** (Prettier): Single quotes, no semicolons, no trailing commas.

**Imports**: External packages first, then `@/` aliased imports (separate with blank line). Use `type` keyword for type-only imports:
```typescript
import { toast } from 'sonner'

import type { Agent, Team } from '@/types/playground'
```

**Path aliases**: Use `@/` for `src/` (e.g., `@/components/ui/button`).

**Components**: Arrow functions with `const`. Default export at end. Use `'use client'` only when needed.

**Naming**:
- `PascalCase`: components, interfaces, types
- `camelCase`: variables, functions, hooks (prefix with `use`)

**Types**: Define in `src/types/`. Use `interface` for objects, `type` for unions. Avoid `any`.

**State**: Zustand in `src/store.ts`. Pattern: `value` + `setValue` pairs.

**UI**: shadcn/ui components in `src/components/ui/`. Use `cn()` for class merging.

**Styling**: Tailwind CSS only. No inline styles or CSS modules. Dark mode via `class` strategy.

**Error handling**: try/catch in async functions. Show errors via `toast.error()`. Return safe defaults (empty arrays, null) on failure.

**API layer**: Functions in `src/api/playground.ts`. Use native `fetch`, not axios.

## Architecture Notes

### Backend

- `config/`: Re-exports from `environment.py`. Import as `from config import OLLAMA_API_BASE`.
- `storage/config.py`: Singleton factories `get_db()` and `get_memory_manager()`. All Agents/Teams must use these.
- `models/__init__.py`: Model instances and `worker_model`/`team_model` assignments.
- `agents/`, `teams/`: Expose singletons via `__all__`. Add new agents/teams to these lists.
- FastAPI app created via `AgentOS` in `main.py`, auto-registers `/v1/playground/*` endpoints.

### Frontend

- `src/store.ts`: Global state (endpoint, agent/team selection, messages, streaming status)
- `src/hooks/useChatActions.ts`: Orchestrates initialization
- `src/hooks/useAIStreamHandler.tsx`: Handles SSE streaming
- `src/api/playground.ts`: All fetch calls; `routes.ts` builds URLs
- URL params (`?agent=`, `?team=`, `?session=`) via `nuqs`

## Key Dependencies

| Layer | Packages |
|-------|----------|
| Backend | agno, fastapi, pydantic, lancedb, sqlalchemy, uvicorn |
| Frontend | next 16, react 19, zustand, nuqs, radix-ui, tailwindcss |
| AI Models | ollama, anthropic, azure-ai-inference, openai |
| Tools | duckduckgo-search, newspaper4k, praw, arxiv |
