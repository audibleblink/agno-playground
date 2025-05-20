from agno.agent import Agent
from agno.team import Team
from agno.models.ollama import Ollama
from agno.playground import Playground, serve_playground_app
from agno.storage.sqlite import SqliteStorage
from agno.tools.duckduckgo import DuckDuckGoTools
from agno.tools.yfinance import YFinanceTools
from agno.tools.hackernews import HackerNewsTools
from agno.tools.newspaper4k import Newspaper4kTools
from agno.tools.thinking import ThinkingTools

from pydantic import BaseModel, Field
from typing import List

agent_storage: str = "tmp/agents.db"

model = Ollama(host="http://woody.hyrule.link:11434", id="qwen3:agno")

##################################

# web_agent = Agent(
#     name="Web Agent",
#     model=model,
#     tools=[DuckDuckGoTools()],
#     instructions=["Always include sources"],
#     # Store the agent sessions in a sqlite database
#     storage=SqliteStorage(table_name="web_agent", db_file=agent_storage),
#     # Adds the current date and time to the instructions
#     add_datetime_to_instructions=True,
#     # Adds the history of the conversation to the messages
#     add_history_to_messages=True,
#     # Number of history responses to add to the messages
#     num_history_responses=5,
#     # Adds markdown formatting to the messages
#     markdown=True,
# )
#
# finance_agent = Agent(
#     name="Finance Agent",
#     model=model,
#     tools=[
#         YFinanceTools(
#             stock_price=True,
#             analyst_recommendations=True,
#             company_info=True,
#             company_news=True,
#         )
#     ],
#     instructions=["Always use tables to display data"],
#     storage=SqliteStorage(table_name="finance_agent", db_file=agent_storage),
#     add_datetime_to_instructions=True,
#     add_history_to_messages=True,
#     num_history_responses=5,
#     markdown=True,
# )

##################################

class Article(BaseModel):
    title: str = Field(..., description="The Article's Title")
    summary: str = Field(..., description="A summary of the article")
    reference_links: list[str]


hn_researcher = Agent(
    name="HackerNews Researcher",
    model=model,
    role="Gets top stories from hackernews.",
    tools=[HackerNewsTools(cache_results=True)],
    agent_id="hn_researcher",
    storage=SqliteStorage(table_name="hn_researcher", db_file=agent_storage),
    expected_output="a list of articles"
)

article_reader = Agent(
    name="Article Reader",
    model=model,
    role="Reads and summarizes articles from URLs.",
    tools=[Newspaper4kTools(cache_results=True)],
    # response_model=Article,
    agent_id="article_reader",
    storage=SqliteStorage(table_name="article_reader", db_file=agent_storage),
    add_state_in_messages=True,
    add_history_to_messages=True,
)

web_searcher = Agent(
    name="Web Enricher",
    model=model,
    role="Searches the web for enrichment of a topic",
    tools=[DuckDuckGoTools(cache_results=True)],
    add_datetime_to_instructions=True,
    agent_id="web_searcher",
    add_state_in_messages=True,
    storage=SqliteStorage(table_name="web_searcher", db_file=agent_storage),
    add_history_to_messages=True,
)

hackernews_team = Team(
    name="HackerNews Team",
    mode="coordinate",
    model=model,
    members=[hn_researcher, article_reader, web_searcher],
    instructions=[
        "ALWAYS follow ALL steps:",
        "First, search hackernews for what the user is asking about.",
        "Second, tranfer the returned links to the article reader agent to read each HackerNews link for the stories to get more information.",
        "Third, transfer the returned links to the web searcher agent to enrich each story with more information.",
        "Finally, provide a thoughtful and engaging summary.",
    ],
    # response_model=Article,
    # use_json_mode=True,
    show_tool_calls=True,
    markdown=True,
    debug_mode=True,
    show_members_responses=True,
    success_criteria="""
    A report of the user's request containing a title, summary from the reader agent, additional details from the enrichment agent (with citations), , and reference links to the original URLs. Use this template:
    # Report
    ## {{Article 1 Title}}
    ### Summary 
    {{hackernews summary}}
    ### Additional Details
    {{enriched data}}
    {{web_searcher citations}}
    ### References
    {{links}}
    ## {{Article 2 Title}}
    ...
    """,

    storage=SqliteStorage(table_name="hn_team", db_file=agent_storage),
    add_member_tools_to_system_message=False,
    # reasoning=True,
    tools=[ThinkingTools(add_instructions=True)],
    # enable_team_history=True,
    enable_agentic_context=True,
)

##################################

app = Playground(teams=[hackernews_team]).get_app()
# app = Playground(agents=[web_agent, finance_agent]).get_app()
# app = Playground(teams=[hackernews_team], agents=[web_agent, finance_agent]).get_app()

if __name__ == "__main__":
    serve_playground_app("playground:app", reload=True)

