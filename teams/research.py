from agno.team import Team
from agno.tools.reasoning import ReasoningTools
from models import team_model
from storage.config import get_storage, get_memory
from agents import WebSearcher, RedditResearcher, AcademicResearcher


ResearchTeam = Team(
    name="Research Team",
    team_id="research_team",
    mode="collaborate",
    model=team_model,
    members=[WebSearcher, RedditResearcher, AcademicResearcher],
    add_member_tools_to_system_message=False,
    debug_mode=True,
    # enable_agentic_context=True,
    # enable_team_history=True,
    markdown=True,
    memory=get_memory(),
    show_members_responses=True,
    show_tool_calls=True,
    storage=get_storage("research_team"),
    # telemetry=False,
    # monitoring=False,
    # tools=[ReasoningTools(add_instructions=True)],
)
