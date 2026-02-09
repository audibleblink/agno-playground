from agno.agent import Agent
from agno.tools.newspaper4k import Newspaper4kTools
from models import worker_model
from storage.config import get_db, get_memory_manager
from pydantic import BaseModel, Field


class Article(BaseModel):
    title: str = Field(..., description="The Article's Title")
    summary: str = Field(..., description="A summary of the article")
    reference_links: list[str] = Field(..., description="A list of links")


ArticleReader = Agent(
    name="Article Reader",
    model=worker_model,
    role="Reads and summarizes articles from URLs.",
    tools=[Newspaper4kTools(cache_results=True)],
    id="article_reader",
    db=get_db(),
    memory_manager=get_memory_manager(),
    add_history_to_context=True,
    debug_mode=True,
    stream=True,
    # output_model=Article,
)
