from agno.models.ollama import Ollama
from agno.models.anthropic import Claude
from agno.models.azure import AzureOpenAI
from config import OLLAMA_API_BASE, AZURE_API_VERSION

# Models
ollama_options = {
    "num_ctx": 40960,
    "temperature": 0.1,
}
ollama = Ollama(host=OLLAMA_API_BASE, id="qwen3:agno")
devstral = Ollama(host=OLLAMA_API_BASE, id="devstral", options=ollama_options)
sonnet = Claude(id="claude-sonnet-4-20250514")
opus = Claude(id="claude-opus-4-20250514")
azure = AzureOpenAI(id="o4-mini", api_version=AZURE_API_VERSION)

# Model assignments
worker_model = devstral
team_model = opus
