"""Knowledge base configuration and utilities."""

from agno.vectordb.lancedb import LanceDb, SearchType
from agno.reranker.cohere import CohereReranker
from agno.embedder.ollama import OllamaEmbedder
from config import OLLAMA_API_BASE, VECTOR_DB_URI

# Embedders and Reranker
embedder = OllamaEmbedder(host=OLLAMA_API_BASE, id="nomic-embed-text", dimensions=768)
chunk_embedder = OllamaEmbedder(host=OLLAMA_API_BASE, id="all-MiniLM-L6-v2")
reranker = CohereReranker()

# Vector Database
vector_db = LanceDb(
    uri=VECTOR_DB_URI,
    table_name="vectordb",
    embedder=embedder,
    reranker=reranker,
    search_type=SearchType.hybrid,
)
