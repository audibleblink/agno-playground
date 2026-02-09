from agno.team import Team
from agno.tools.reasoning import ReasoningTools
from models import team_model
from storage.config import get_db, get_memory_manager
from agents import WebSearcher, RedditResearcher, AcademicResearcher


ResearchTeam = Team(
    name="Research Team",
    id="research_team",
    model=team_model,
    members=[WebSearcher, RedditResearcher, AcademicResearcher],
    delegate_to_all_members=True,  # Replaced mode="collaborate"
    share_member_interactions=True,  # Allow members to see each other's responses
    markdown=True,
    memory_manager=get_memory_manager(),
    db=get_db(),
    debug_mode=True,
    show_members_responses=True,
    tools=[ReasoningTools(add_instructions=True)],
)
