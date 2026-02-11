from agno.os.app import AgentOS

from agents import FetchAgent, FilesystemAgent, GitAgent, MemoryAgent, TimeAgent
from api import router as openai_router
from storage.config import get_db
from teams import HackerNewsTeam, ResearchTeam

# Create AgentOS app with teams and standalone MCP agents
# This automatically registers the /v1/playground/* endpoints
agent_os = AgentOS(
    id="agno_playground",
    name="Agno Playground",
    description="Multi-agent AI system for research and content analysis",
    version="2.0.0",
    agents=[
        # MCP-powered agents (demo servers)
        FetchAgent,
        FilesystemAgent,
        GitAgent,
        MemoryAgent,
        TimeAgent,
    ],
    teams=[HackerNewsTeam, ResearchTeam],
    db=get_db(),
    cors_allowed_origins=["http://localhost:3000"],  # Frontend dev server
)

# Get the FastAPI app instance and mount additional routers
app = agent_os.get_app()
app.include_router(openai_router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=7777, reload=True)
