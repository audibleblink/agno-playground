# Agno Playground

An AI agent playground built with the [Agno](https://github.com/agno-ai/agno) framework for research and content analysis. This project demonstrates multi-agent coordination for gathering and synthesizing information from various sources.

## Features

- **Multi-Agent Teams**: Coordinate multiple AI agents to research and analyze content
- **Vector Storage**: Persistent memory and knowledge base using LanceDB
- **Advanced RAG**: Semantic chunking and hybrid (vector & keyword) retreival w/ reranking
- **Web UI**: Optional self-hosted React-based interface for interacting with agents

## Project Structure

```
agno-playground/
├── main.py                    # FastAPI application entry point
├── Modelfile                  # Ollama model configuration
│
├── agents/                    # AI agent implementations
│   ├── __init__.py
│   ├── article_reader.py      # Article content extraction
│   ├── hn_researcher.py       # HackerNews research agent
│   ├── reddit_researcher.py   # Reddit discussion analysis
│   └── web_searcher.py        # Web search and enrichment
│
├── teams/                     # Agent team configurations
│   ├── __init__.py
│   └── hackernews.py          # HackerNews research team
│
├── models/                    # AI model configurations
│   └── __init__.py
│
├── config/                    # Environment and configuration
│   ├── __init__.py
│   └── environment.py
│
├── storage/                   # Data persistence layer
│   ├── __init__.py
│   ├── config.py
│   └── db/                    # Database files
│       ├── agents.db          # SQLite database
│       └── lancedb/           # Vector database
│
├── knowledge/                 # Knowledge management
│   ├── __init__.py
│   └── arxiv.py              # Academic paper integration
│
└── agent-ui/                  # React/Next.js web interface
```

## Installation

This project uses [uv](https://github.com/astral-sh/uv) for dependency management.

1. **Install uv** (if not already installed):
   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```

2. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd agno-playground
   ```

3. **Install Python dependencies**:
   ```bash
   uv sync
   ```

4. **Install UI dependencies** (optional, for web interface):
   ```bash
   cd agent-ui
   npm install
   ```

## Configuration

### SSL Certificate Setup (for Burp Suite proxy)

If you're proxying through Burp Suite for debugging:

```bash
export SSL_CERT_FILE=$(python -m certifi)
# Edit the cert chain to include Burp's certificate
vim $SSL_CERT_FILE
```

## Usage

### Running the Backend

Start the FastAPI server with hot reload:

```bash
uv run main.py
```

The API will be available at `http://localhost:8000`

If you have an agno account, register the endpoint with `uv run ag setup` then follow the link 
that gets printed when you run the app. Otherwise, run the offline web ui.

### Running the Web UI

In a separate terminal, start the Next.js development server:

```bash
cd agent-ui
npm run dev
# or
pnpm dev
```

The web interface will be available at `http://localhost:3000`

