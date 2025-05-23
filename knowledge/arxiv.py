from agno.document.chunking.semantic import SemanticChunking
from agno.knowledge.arxiv import ArxivKnowledgeBase
from agno.embedder.ollama import OllamaEmbedder
from . import vector_db, chunk_embedder
from config import OLLAMA_API_BASE

# Arxiv Knowledge Base
arxiv_knowledge_base = ArxivKnowledgeBase(
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
