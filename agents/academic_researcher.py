from agno.agent import Agent
from models import worker_model
from storage.config import get_storage, get_memory
from knowledge.arxiv import arxiv_knowledge_base


AcademicResearcher = Agent(
    name="Academic Researcher",
    model=worker_model,
    role="Uses it's own knowledge for enrichment of a topic",
    add_datetime_to_instructions=True,
    agent_id="academic_researcher",
    add_state_in_messages=True,
    storage=get_storage("academic_researcher"),
    memory=get_memory(),
    add_history_to_messages=True,
    knowledge=arxiv_knowledge_base,
)
