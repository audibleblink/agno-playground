from agno.knowledge.knowledge import Knowledge
from agno.knowledge.reader.arxiv_reader import ArxivReader
from . import vector_db

# Arxiv Knowledge Base
arxiv_knowledge_base = Knowledge(
    name="Arxiv Research Papers",
    description="Academic research papers from Arxiv on AI, ML, and Computer Science",
    vector_db=vector_db,
)

# Pre-populate with some research topics
arxiv_reader = ArxivReader(max_results=5)

# These queries will be loaded on first use
arxiv_topics = [
    "machine learning artificial intelligence",
    "large language models transformers",
    "multi agent systems",
    "reinforcement learning",
    "computer vision deep learning",
]

# Optional: Pre-load papers (can be done lazily instead)
# for topic in arxiv_topics:
#     arxiv_knowledge_base.insert(topic=topic, reader=arxiv_reader)
