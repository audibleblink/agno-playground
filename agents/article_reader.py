from agno.agent import Agent
from agno.tools.newspaper4k import Newspaper4kTools
from models import worker_model
from storage.config import get_storage, get_memory
from pydantic import BaseModel, Field

class Article(BaseModel):
    title: str = Field(..., description="The Article's Title")
    summary: str = Field(..., description="A summary of the article")
    reference_links: list[str] = Field(..., description="A list of links")

article_reader = Agent(
    name="Article Reader",
    model=worker_model,
    role="Reads and summarizes articles from URLs.",
    tools=[Newspaper4kTools(cache_results=True)],
    agent_id="article_reader",
    storage=get_storage("article_reader"),
    memory=get_memory(),
    add_state_in_messages=True,
    add_history_to_messages=True,
    # response_model=Article,
)
