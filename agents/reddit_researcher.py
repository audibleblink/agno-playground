from agno.agent import Agent
from agno.tools.reddit import RedditTools
from models import worker_model
from storage.config import get_db, get_memory_manager


RedditResearcher = Agent(
    name="Reddit Cross-Referencer",
    model=worker_model,
    role="Searches Reddit for discussions and opinions related to news stories",
    instructions="Search Reddit for relevant discussions about the given topics. Focus on finding community reactions, different perspectives, and additional context from Reddit discussions.",
    tools=[RedditTools(cache_results=True)],
    id="reddit_researcher",
    db=get_db(),
    memory_manager=get_memory_manager(),
    add_history_to_context=True,
    debug_mode=True,
    stream=True,
)
