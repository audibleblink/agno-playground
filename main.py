from agno.os.app import AgentOS
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from agents import MemoryAgent
from api import router as openai_router
from storage.config import get_db
from teams import HackerNewsTeam, ResearchTeam

# Create base FastAPI app with permissive CORS for control plane
base_app = FastAPI()
base_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create AgentOS app with teams and standalone MCP agents
# This automatically registers the /v1/playground/* endpoints
agent_os = AgentOS(
    id="agno_playground",
    name="Agno Playground",
    description="Multi-agent AI system for research and content analysis",
    version="2.0.0",
    agents=[
        MemoryAgent,
    ],
    teams=[HackerNewsTeam, ResearchTeam],
    db=get_db(),
    base_app=base_app,
)

# Get the FastAPI app instance and mount additional routers
app = agent_os.get_app()
app.include_router(openai_router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=7777, reload=True)
