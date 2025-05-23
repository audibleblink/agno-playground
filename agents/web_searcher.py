from agno.agent import Agent
from agno.tools.duckduckgo import DuckDuckGoTools
from models import worker_model
from storage.config import get_storage, get_memory
from knowledge.arxiv import arxiv_knowledge_base as knowledge_base


web_searcher = Agent(
    name="Web Enricher",
    model=worker_model,
    role="Uses it's own knowledge and searches the web for enrichment of a topic",
    instructions="Use your own knowledge to enrich the topic and search the web for more information. Note which facts are from your own knowledge and which are from the web.",
    tools=[DuckDuckGoTools(cache_results=True)],
    add_datetime_to_instructions=True,
    agent_id="web_searcher",
    add_state_in_messages=True,
    storage=get_storage("web_searcher"),
    memory=get_memory(),
    add_history_to_messages=True,
    knowledge=knowledge_base,
)
