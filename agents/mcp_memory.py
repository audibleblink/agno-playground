"""
Memory MCP Agent - Persistent knowledge graph memory via MCP.
"""

from agno.agent import Agent

from models import worker_model
from storage.config import get_db, get_memory_manager
from tools import memory_tools

MemoryAgent = Agent(
    name="Memory Agent",
    model=worker_model,
    role="Knowledge graph memory manager",
    instructions=[
        "You maintain a persistent knowledge graph for storing information.",
        "Create entities for people, places, concepts, and things discussed.",
        "Establish relations between entities to build contextual knowledge.",
        "Retrieve relevant memories to provide context-aware responses.",
        "Proactively store important information the user shares.",
    ],
    tools=[memory_tools],
    add_datetime_to_context=True,
    id="mcp_memory",
    db=get_db(),
    memory_manager=get_memory_manager(),
    add_history_to_context=True,
    debug_mode=True,
    stream=True,
)
