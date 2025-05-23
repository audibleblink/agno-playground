from agno.agent import Agent
from agno.tools.reddit import RedditTools
from models import worker_model
from storage.config import get_storage, get_memory


RedditResearcher = Agent(
    name="Reddit Cross-Referencer",
    model=worker_model,
    role="Searches Reddit for discussions and opinions related to news stories",
    instructions="Search Reddit for relevant discussions about the given topics. Focus on finding community reactions, different perspectives, and additional context from Reddit discussions.",
    tools=[RedditTools(cache_results=True)],
    agent_id="reddit_researcher",
    storage=get_storage("reddit_researcher"),
    memory=get_memory(),
    add_state_in_messages=True,
    add_history_to_messages=True,
)
