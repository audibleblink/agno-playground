from agno.agent import Agent
from agno.tools.hackernews import HackerNewsTools
from models import worker_model
from storage.config import get_db, get_memory_manager


HackerNewsResearcher = Agent(
    name="HackerNews Researcher",
    model=worker_model,
    role="Gets top stories from hackernews.",
    tools=[HackerNewsTools(cache_results=True)],
    id="hn_researcher",
    db=get_db(),
    memory_manager=get_memory_manager(),
    expected_output="a list of articles",
    debug_mode=True,
    stream=True,
)
