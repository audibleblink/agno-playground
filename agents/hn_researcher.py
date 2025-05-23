from agno.agent import Agent
from agno.tools.hackernews import HackerNewsTools
from models import worker_model
from storage.config import get_storage, get_memory


hn_researcher = Agent(
    name="HackerNews Researcher",
    model=worker_model,
    role="Gets top stories from hackernews.",
    tools=[HackerNewsTools(cache_results=True)],
    agent_id="hn_researcher",
    storage=get_storage("hn_researcher"),
    memory=get_memory(),
    expected_output="a list of articles",
)
