from agno.team import Team
from agno.tools.reasoning import ReasoningTools
from models import team_model
from storage.config import get_db, get_memory_manager
from agents import (
    HackerNewsResearcher,
    ArticleReader,
    WebSearcher,
    RedditResearcher,
    AcademicResearcher,
)


# Create a dedicated Research Team instance for use as a sub-team.
# This avoids sharing the same object with the standalone ResearchTeam,
# which causes AgentOS to set parent_team_id on it and break the
# standalone /teams/research_team endpoint.
_ResearchSubTeam = Team(
    name="Research Team",
    id="research_team_sub",
    model=team_model,
    members=[WebSearcher, RedditResearcher, AcademicResearcher],
    delegate_to_all_members=True,
    share_member_interactions=True,
    markdown=True,
    memory_manager=get_memory_manager(),
    db=get_db(),
    debug_mode=True,
    show_members_responses=True,
    tools=[ReasoningTools(add_instructions=True)],
)


HackerNewsTeam = Team(
    name="HackerNews Team",
    model=team_model,
    id="hn_team",
    instructions=[
        "ALWAYS follow ALL steps:",
        "1. search hackernews for what the user is asking about.",
        "2. tranfer the returned links to the article reader agent to read each HackerNews link for the stories to get more information.",
        "3. transfer the returned links to the research team to enrich each story with more information",
        "4. provide a thoughtful and engaging summary.",
        "Do not reply until all agents have responded",
    ],
    expected_output="""
    A report of the user's request containing a title, summary from the reader agent, additional details from the enrichment agent (with citations), Reddit community perspectives, and reference links to the original URLs. This requires all agents be  consulted. Use this template:
    # Report
    ## {{Article 1 Title}}
    ### Summary
    {{hackernews summary}}
    ### The Research Team says:
    {{enriched data from the research team cited by source}}
    ### References
    {{links}}
    ## {{Article 2 Title}}
    ...
    """,
    members=[HackerNewsResearcher, ArticleReader, _ResearchSubTeam],
    delegate_to_all_members=False,
    share_member_interactions=True,  # Allow members to see each other's responses
    enable_agentic_memory=True,
    add_history_to_context=True,
    markdown=True,
    memory_manager=get_memory_manager(),
    db=get_db(),
    debug_mode=True,
    show_members_responses=True,
    reasoning=True,
)
