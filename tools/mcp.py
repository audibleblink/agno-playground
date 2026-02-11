"""
MCP Tool instances for reuse across agents.

These tools can be shared by multiple agents. Each tool wraps an MCP server
that provides specific capabilities via the Model Context Protocol.

Requirements:
- npx (Node.js) for filesystem and memory servers
- uvx (uv) for fetch, git, and time servers
"""

from pathlib import Path

from agno.tools.mcp import MCPTools

# Project root for filesystem/git access
PROJECT_ROOT = str(Path(__file__).parent.parent.resolve())

# Filesystem - browse and read files
filesystem_tools = MCPTools(
    command=f"npx -y @modelcontextprotocol/server-filesystem {PROJECT_ROOT}",
    refresh_connection=True,
)

# Fetch - retrieve and process web content
fetch_tools = MCPTools(
    command="uvx mcp-server-fetch",
    refresh_connection=True,
)

# Memory - persistent knowledge graph
memory_tools = MCPTools(
    command="npx -y @modelcontextprotocol/server-memory",
    refresh_connection=True,
)

# Git - repository operations
git_tools = MCPTools(
    command=f"uvx mcp-server-git --repository {PROJECT_ROOT}",
    refresh_connection=True,
)

# Time - timezone operations
time_tools = MCPTools(
    command="uvx mcp-server-time",
    refresh_connection=True,
)
