from agno.models.ollama import Ollama
from agno.models.anthropic import Claude
from agno.models.azure import AzureOpenAI
from config import OLLAMA_API_BASE, AZURE_API_VERSION

# Models
ollama = Ollama(host=OLLAMA_API_BASE, id="qwen3:agno")
claude = Claude()
azure = AzureOpenAI(id="o4-mini", api_version=AZURE_API_VERSION)

# Model assignments
worker_model = ollama
team_model = claude
