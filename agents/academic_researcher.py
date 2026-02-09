from agno.agent import Agent

from knowledge.arxiv import arxiv_knowledge_base
from models import worker_model
from storage.config import get_db, get_memory_manager

AcademicResearcher = Agent(
    name="Academic Researcher",
    model=worker_model,
    role="Uses academic research papers for enrichment of a topic",
    instructions="""
    Search academic papers and provide research-backed insights to enrich the topic. Cite sources when possible.
    """,
    add_datetime_to_context=True,
    id="academic_researcher",
    db=get_db(),
    memory_manager=get_memory_manager(),
    add_history_to_context=True,
    knowledge=arxiv_knowledge_base,
    search_knowledge=True,
    debug_mode=True,
    stream=True,
)
