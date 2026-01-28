# Agent Development Guide

This file contains instructions for AI coding agents working in the agno-playground repository.

## Project Overview

Multi-agent AI system built with the [Agno](https://github.com/agno-ai/agno) framework for research and content analysis. The project consists of a Python FastAPI backend and a Next.js TypeScript frontend.

## Build, Lint, and Test Commands

### Python Backend (Root Directory)

**Package Manager:** `uv` (modern Python package manager)

```bash
# Install dependencies
uv sync

# Run the application
uv run main.py

# Run a single Python file
uv run python path/to/file.py

# Setup Agno playground
uv run ag setup
```

**Note:** There is currently no pytest configuration or test suite. When adding tests:
- Create `tests/` directory at project root
- Use `pytest` as the testing framework
- Run tests with: `uv run pytest`
- Run a single test: `uv run pytest tests/test_file.py::test_function_name`

### TypeScript Frontend (agent-ui/)

**Package Manager:** `npm` (or `pnpm`)

```bash
# Install dependencies
cd agent-ui && npm install

# Development server (port 3000)
npm run dev

# Production build
npm run build

# Linting
npm run lint              # Check for issues
npm run lint:fix          # Auto-fix issues

# Formatting (Prettier)
npm run format            # Check formatting
npm run format:fix        # Auto-fix formatting

# Type checking
npm run typecheck         # Run TypeScript compiler checks

# Validate all (lint + format + typecheck)
npm run validate

# Production server
npm run start
```

**Run a single test:** Currently no test suite configured. When adding tests with Jest or Vitest:
```bash
npm test path/to/file.test.tsx
```

## Code Style Guidelines

### Python Backend

**Import Organization:**
```python
# 1. Standard library imports
from typing import Optional

# 2. Third-party imports
from agno.agent import Agent
from agno.team import Team
from fastapi import FastAPI
from pydantic import BaseModel, Field

# 3. Local imports
from models import worker_model, team_model
from storage.config import get_storage, get_memory
from agents import HackerNewsResearcher, ArticleReader
```

**Naming Conventions:**
- **Classes:** PascalCase (e.g., `HackerNewsTeam`, `ArticleReader`)
- **Functions:** snake_case (e.g., `get_storage`, `get_memory`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `STORAGE_DB`)
- **Variables:** snake_case (e.g., `worker_model`, `memory_db`)
- **Agent/Team IDs:** snake_case strings (e.g., `"hn_researcher"`, `"article_reader"`)

**Type Hints:**
- Use type hints for all function signatures
- Use Pydantic models for structured data
```python
def get_storage(table_name: str) -> SqliteStorage:
    """Get storage instance for a specific table."""
    return SqliteStorage(table_name=table_name, db_file=STORAGE_DB)

class Article(BaseModel):
    title: str = Field(..., description="The Article's Title")
    summary: str = Field(..., description="A summary of the article")
    reference_links: list[str] = Field(..., description="A list of links")
```

**Docstrings:**
- Use triple-quoted docstrings for functions
- Keep them concise and descriptive

**Error Handling:**
- Let exceptions propagate naturally in most cases
- Use try/except only when you can meaningfully handle the error
- Avoid bare `except:` clauses

### TypeScript Frontend

**Import Organization:**
```typescript
// 1. React and Next.js imports
'use client'
import { useState } from 'react'

// 2. Third-party library imports
import { toast } from 'sonner'

// 3. UI component imports
import { TextArea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

// 4. Store/state imports
import { usePlaygroundStore } from '@/store'

// 5. Hook imports
import useAIChatStreamHandler from '@/hooks/useAIStreamHandler'
```

**Naming Conventions:**
- **Components:** PascalCase (e.g., `ChatInput`, `TeamSelector`)
- **Hooks:** camelCase with `use` prefix (e.g., `useAIStreamHandler`)
- **Functions:** camelCase (e.g., `handleSubmit`, `handleStreamResponse`)
- **Constants:** UPPER_SNAKE_CASE or camelCase
- **Types/Interfaces:** PascalCase (e.g., `MessageType`, `AgentConfig`)

**TypeScript:**
- Use strict mode (`strict: true` in tsconfig.json)
- Avoid `any` types - use proper typing
- Prefer `interface` for object shapes, `type` for unions/intersections
- Use type inference when obvious

**Formatting (Prettier config):**
- Single quotes for strings
- No semicolons
- No trailing commas
- Tailwind classes sorted automatically via plugin

**Component Structure:**
```typescript
'use client' // If using client-side features

import statements...

const ComponentName = () => {
  // Hooks first
  const [state, setState] = useState('')
  
  // Event handlers
  const handleSubmit = async () => {
    // Implementation
  }
  
  // Render
  return (
    <div className="...">
      {/* JSX */}
    </div>
  )
}

export default ComponentName
```

**Error Handling:**
```typescript
try {
  await handleStreamResponse(currentMessage, streamingEnabled)
} catch (error) {
  toast.error(
    `Error in handleSubmit: ${
      error instanceof Error ? error.message : String(error)
    }`
  )
}
```

## Project Structure

```
agno-playground/
├── agents/              # Individual AI agents (Python)
├── teams/               # Agent team configurations (Python)
├── models/              # AI model configurations (Python)
├── config/              # Environment and config (Python)
├── storage/             # Data persistence (SQLite, LanceDB)
├── knowledge/           # Knowledge base management (Python)
├── api/                 # FastAPI routes (Python)
├── agent-ui/            # Next.js React frontend
│   ├── src/
│   │   ├── app/         # Next.js app router pages
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom React hooks
│   │   └── store/       # Zustand state management
│   └── public/          # Static assets
└── main.py              # FastAPI application entry point
```

## Development Guidelines

### When Working with Agents

- Always specify `agent_id` for persistent storage
- Use `get_storage()` and `get_memory()` from `storage.config`
- Enable streaming with `stream=True` and `stream_intermediate_steps=True`
- Import models from `models` module (e.g., `worker_model`, `team_model`)

### When Working with Teams

- Teams should have a unique `team_id`
- Use `mode="coordinate"` for multi-agent coordination
- Provide clear `instructions` as a list of steps
- Define `success_criteria` to guide team output format

### File Naming

- Python: snake_case (e.g., `article_reader.py`, `hackernews.py`)
- TypeScript: PascalCase for components (e.g., `ChatInput.tsx`)
- TypeScript: camelCase for utilities (e.g., `useAIStreamHandler.tsx`)

### Adding New Dependencies

**Python:**
```bash
uv add package-name
```

**TypeScript:**
```bash
cd agent-ui && npm install package-name
```

## Common Patterns

### Creating a New Agent

```python
from agno.agent import Agent
from models import worker_model
from storage.config import get_storage, get_memory

NewAgent = Agent(
    name="Agent Name",
    model=worker_model,
    role="Clear role description",
    tools=[SomeTools()],
    agent_id="unique_agent_id",
    storage=get_storage("unique_agent_id"),
    memory=get_memory(),
    stream_intermediate_steps=True,
    stream=True
)
```

### Creating a New Team

```python
from agno.team import Team
from models import team_model
from storage.config import get_storage, get_memory
from agents import Agent1, Agent2

NewTeam = Team(
    name="Team Name",
    mode="coordinate",
    model=team_model,
    team_id="unique_team_id",
    instructions=[
        "Step 1: Do this",
        "Step 2: Do that",
    ],
    members=[Agent1, Agent2],
    storage=get_storage("unique_team_id"),
    memory=get_memory(),
    stream=True
)
```

### Creating a New React Component

```typescript
'use client'
import { useState } from 'react'

interface ComponentNameProps {
  prop1: string
  prop2?: number
}

const ComponentName = ({ prop1, prop2 }: ComponentNameProps) => {
  const [state, setState] = useState('')

  return <div>{/* JSX */}</div>
}

export default ComponentName
```
