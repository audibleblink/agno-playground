from agno.agent import Agent
from agno.tools.duckduckgo import DuckDuckGoTools
from models import worker_model
from storage.config import get_storage, get_memory

WebSearcher = Agent(
    name="Web Searcher",
    model=worker_model,
    role="Searches the web for enrichment of a topic",
    instructions="Search the web for more information.",
    tools=[DuckDuckGoTools(cache_results=True)],
    add_datetime_to_instructions=True,
    agent_id="web_searcher",
    add_state_in_messages=True,
    storage=get_storage("web_searcher"),
    memory=get_memory(),
    add_history_to_messages=True,
)
