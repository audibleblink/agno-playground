from agno.team import Team
from agno.tools.thinking import ThinkingTools
from models import team_model
from storage.config import get_storage, get_memory
from agents import HackerNewsResearcher, ArticleReader

# We'll use a function to get the ResearchTeam to avoid circular imports
def _get_research_team():
    from teams import ResearchTeam
    return ResearchTeam


HackerNewsTeam = Team(
    name="HackerNews Team",
    mode="coordinate",
    model=team_model,
    instructions=[
        "ALWAYS follow ALL steps:",
        "First, search hackernews for what the user is asking about.",
        "Second, tranfer the returned links to the article reader agent to read each HackerNews link for the stories to get more information.",
        "Third, transfer the returned links to the research team to enrich each story with more information",
        "Finally, provide a thoughtful and engaging summary.",
    ],
    success_criteria="""
    A report of the user's request containing a title, summary from the reader agent, additional details from the enrichment agent (with citations), Reddit community perspectives, and reference links to the original URLs. Use this template:
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
    members=[HackerNewsResearcher, ArticleReader, _get_research_team()],
    add_member_tools_to_system_message=False,
    debug_mode=True,
    enable_agentic_context=True,
    enable_team_history=True,
    markdown=True,
    memory=get_memory(),
    show_members_responses=True,
    show_tool_calls=True,
    storage=get_storage("hn_team"),
    telemetry=False,
    monitoring=False,
    tools=[ThinkingTools(add_instructions=True)],
)
