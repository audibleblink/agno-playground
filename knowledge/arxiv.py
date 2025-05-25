from agno.document.chunking.semantic import SemanticChunking
from agno.knowledge.arxiv import ArxivKnowledgeBase
from . import vector_db, chunk_embedder

# Arxiv Knowledge Base
arxiv_knowledge_base = ArxivKnowledgeBase(
    vector_db=vector_db,
    chunking_strategy=SemanticChunking(embedder=chunk_embedder),
    num_documents=10,
    queries=[
        "Machine Learning",
        "Technology",
        "AI",
        "Research Methodology",
        "Pedagogy",
        "Computer Science"
    ],
)
