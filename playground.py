import os
from agno.agent import Agent
from agno.team import Team
from agno.models.ollama import Ollama
from agno.models.anthropic import Claude
from agno.models.azure import AzureOpenAI
from agno.storage.sqlite import SqliteStorage
from agno.tools.duckduckgo import DuckDuckGoTools
from agno.tools.hackernews import HackerNewsTools
from agno.tools.newspaper4k import Newspaper4kTools
from agno.tools.reddit import RedditTools
from agno.tools.thinking import ThinkingTools
from agno import playground
from agno.memory.v2.db.sqlite import SqliteMemoryDb
from agno.memory.v2.memory import Memory
from agno.tools import FunctionCall, tool, Function

from agno.document.chunking.semantic import SemanticChunking

# from agno.knowledge import AgentKnowledge
from agno.knowledge.arxiv import ArxivKnowledgeBase
from agno.vectordb.lancedb import LanceDb, SearchType
from agno.reranker.cohere import CohereReranker
from agno.embedder.ollama import OllamaEmbedder

from pydantic import BaseModel, Field
from dotenv import load_dotenv

_ = load_dotenv()

o_api = os.getenv("OLLAMA_API_BASE", "localhost:11434")
a_ver = os.getenv("AZURE_OPENAI_API_VERSION", "2025-03-01-preview")
storage_db: str = "tmp/agents.db"

ollama = Ollama(host=o_api, id="qwen3:agno")
embedder = OllamaEmbedder(host=o_api, id="nomic-embed-text", dimensions=768)
reranker = CohereReranker()
# rereanker.api_key = os.getenv("COHERE_API_KEY")

worker_model = ollama

claude = Claude()
azure = AzureOpenAI(id="o4-mini", api_version=a_ver)

team_model = claude

# Create a memory instance with persistent storage
memory_db = SqliteMemoryDb(table_name="memory", db_file=storage_db)

vector_db = LanceDb(
    uri="tmp/lancedb",
    table_name="vectordb",
    embedder=embedder,
    reranker=reranker,
    search_type=SearchType.hybrid,
)

chunk_embedder = OllamaEmbedder(host=o_api, id="all-MiniLM-L6-v2")
knowledge_base = ArxivKnowledgeBase(
    vector_db=vector_db,
    chunking_strategy=SemanticChunking(embedder=chunk_embedder),
    queries=[
        "Machine Learning",
        "Technology",
        "AI",
        "Research Methodology",
        "Pedagogy",
    ],
)

# knowledge_base.load(recreate=False)  # Comment out after first run


class Article(BaseModel):
    title: str = Field(..., description="The Article's Title")
    summary: str = Field(..., description="A summary of the article")
    reference_links: list[str] = Field(..., description="A list of links")


##################################

hn_researcher = Agent(
    name="HackerNews Researcher",
    model=worker_model,
    role="Gets top stories from hackernews.",
    tools=[HackerNewsTools(cache_results=True)],
    agent_id="hn_researcher",
    storage=SqliteStorage(table_name="hn_researcher", db_file=storage_db),
    memory=Memory(db=memory_db),
    expected_output="a list of articles",
)

article_reader = Agent(
    name="Article Reader",
    model=worker_model,
    role="Reads and summarizes articles from URLs.",
    tools=[Newspaper4kTools(cache_results=True)],
    agent_id="article_reader",
    storage=SqliteStorage(table_name="article_reader", db_file=storage_db),
    memory=Memory(db=memory_db),
    add_state_in_messages=True,
    add_history_to_messages=True,
    # response_model=Article,
)

web_searcher = Agent(
    name="Web Enricher",
    model=worker_model,
    role="Uses it's own knowledge and searches the web for enrichment of a topic",
    instructions="Use your own knowledge to enrich the topic and search the web for more information. Note which facts are from your own knowledge and which are from the web.",
    tools=[DuckDuckGoTools(cache_results=True)],
    add_datetime_to_instructions=True,
    agent_id="web_searcher",
    add_state_in_messages=True,
    storage=SqliteStorage(table_name="web_searcher", db_file=storage_db),
    memory=Memory(db=memory_db),
    add_history_to_messages=True,
    knowledge=knowledge_base,
)

reddit_researcher = Agent(
    name="Reddit Cross-Referencer",
    model=worker_model,
    role="Searches Reddit for discussions and opinions related to news stories",
    instructions="Search Reddit for relevant discussions about the given topics. Focus on finding community reactions, different perspectives, and additional context from Reddit discussions.",
    tools=[RedditTools(cache_results=True)],
    agent_id="reddit_researcher",
    storage=SqliteStorage(table_name="reddit_researcher", db_file=storage_db),
    memory=Memory(db=memory_db),
    add_state_in_messages=True,
    add_history_to_messages=True,
)

hackernews_team = Team(
    name="HackerNews Team",
    mode="coordinate",
    model=team_model,
    instructions=[
        "ALWAYS follow ALL steps:",
        "First, search hackernews for what the user is asking about.",
        "Second, tranfer the returned links to the article reader agent to read each HackerNews link for the stories to get more information.",
        "Third, transfer the returned links to the web searcher agent to enrich each story with more information",
        "Fourth, transfer the topics to the reddit researcher agent to find related Reddit discussions and community perspectives",
        "Finally, provide a thoughtful and engaging summary.",
    ],
    success_criteria="""
    A report of the user's request containing a title, summary from the reader agent, additional details from the enrichment agent (with citations), Reddit community perspectives, and reference links to the original URLs. Use this template:
    # Report
    ## {{Article 1 Title}}
    ### Summary 
    {{hackernews summary}}
    ### Additional Details
    {{enriched data}}
    {{web_searcher citations}}
    ### Reddit Community Perspectives
    {{reddit discussions and reactions}}
    ### References
    {{links}}
    ## {{Article 2 Title}}
    ...
    """,
    members=[hn_researcher, article_reader, web_searcher, reddit_researcher],
    add_member_tools_to_system_message=False,
    debug_mode=True,
    enable_agentic_context=True,  # send previous replies to agents
    enable_team_history=True,  # for things like 'pick the second choice' after being given options
    markdown=True,
    memory=Memory(db=memory_db),
    show_members_responses=True,
    show_tool_calls=True,
    storage=SqliteStorage(table_name="hn_team", db_file=storage_db),
    telemetry=False,
    monitoring=False,
    tools=[ThinkingTools(add_instructions=True)],
    # enable_agentic_memory=True,   # user memories
    # reasoning=True,
    # response_model=Article,
    # use_json_mode=True,
)

##################################

app = playground.Playground(teams=[hackernews_team]).get_app()
if __name__ == "__main__":
    playground.serve_playground_app("playground:app", reload=True)
