"""
Central environment configuration for the agno-playground project.
Consolidates environment variable loading and provides shared configuration values.
"""
import os
from dotenv import load_dotenv

# Load environment variables once
_ = load_dotenv()

# Shared environment variables
OLLAMA_API_BASE = os.getenv("OLLAMA_API_BASE", "localhost:11434")
AZURE_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "2025-03-01-preview")

# Storage configuration
STORAGE_DB = "tmp/agents.db"
VECTOR_DB_URI = "tmp/lancedb"