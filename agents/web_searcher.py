from agno.agent import Agent
from agno.tools.duckduckgo import DuckDuckGoTools
from models import worker_model
from storage.config import get_db, get_memory_manager

WebSearcher = Agent(
    name="Web Searcher",
    model=worker_model,
    role="Searches the web for enrichment of a topic",
    instructions="Search the web for more information.",
    tools=[DuckDuckGoTools(cache_results=True)],
    add_datetime_to_context=True,
    id="web_searcher",
    db=get_db(),
    memory_manager=get_memory_manager(),
    add_history_to_context=True,
    debug_mode=True,
    stream=True,
)
