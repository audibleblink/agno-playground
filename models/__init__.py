from agno.models.anthropic import Claude
from agno.models.azure import AzureOpenAI
from agno.models.ollama import Ollama

from config import AZURE_API_VERSION, OLLAMA_API_BASE

# Models
ollama_options = {
    "num_ctx": 40960,
    "temperature": 0.1,
}

# ollama = Ollama(host=OLLAMA_API_BASE, id="qwen3:agno")
# devstral = Ollama(host=OLLAMA_API_BASE, id="devstral", options=ollama_options)
# azure = AzureOpenAI(id="o4-mini", api_version=AZURE_API_VERSION)
# reasoning = Ollama(host=OLLAMA_API_BASE, id="phi4-mini-reasoning:3.8b-q8_0")

sonnet = Claude(id="claude-sonnet-4-5")
opus = Claude(id="claude-opus-4-5")

# Model assignments
worker_model = sonnet
team_model = opus
