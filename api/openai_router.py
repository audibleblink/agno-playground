"""OpenAI-compatible chat completions endpoint backed by Agno teams."""

from __future__ import annotations

import time

from agno.team import Team
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from teams import HackerNewsTeam, ResearchTeam

router = APIRouter()

TEAM_REGISTRY: dict[str, Team] = {
    "hackernews": HackerNewsTeam,
    "hn": HackerNewsTeam,
    "research": ResearchTeam,
}
DEFAULT_TEAM = ResearchTeam


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------


class ChatMessage(BaseModel):
    """A single message in a chat conversation."""

    role: str = Field(..., description="Message role (system, user, or assistant)")
    content: str = Field(..., description="Message content")


class ChatCompletionRequest(BaseModel):
    """OpenAI-compatible chat completion request."""

    model: str = Field(..., description="Model or team identifier")
    messages: list[ChatMessage] = Field(..., description="Conversation messages")
    stream: bool = Field(default=False, description="Whether to stream the response")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _select_team(model: str) -> Team:
    """Resolve a model string to an Agno Team instance."""
    model_lower = model.lower()
    for keyword, team in TEAM_REGISTRY.items():
        if keyword in model_lower:
            return team
    return DEFAULT_TEAM


def _extract_user_prompt(messages: list[ChatMessage]) -> str:
    """Concatenate all user messages into a single prompt string."""
    return "\n".join(m.content for m in messages if m.role == "user")


def _run_team(team: Team, prompt: str, stream: bool) -> str:
    """Execute a team run and return the response content as a string."""
    try:
        resp = team.run(message=prompt, stream=stream)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

    if stream:
        return "".join(chunk.content for chunk in resp if chunk.content)

    return getattr(resp, "content", None) or str(resp)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


def _build_response(model: str, content: str) -> dict:
    """Build an OpenAI-compatible chat completion response."""
    timestamp = int(time.time())
    return {
        "id": f"chatcmpl-{timestamp * 1000}",
        "object": "chat.completion",
        "created": timestamp,
        "model": model,
        "choices": [
            {
                "index": 0,
                "message": {"role": "assistant", "content": content},
                "finish_reason": "stop",
            }
        ],
    }


@router.post("/v1/chat/completions")
async def chat_completions(req: ChatCompletionRequest) -> dict:
    """Return an OpenAI-compatible chat completion response."""
    team = _select_team(req.model)
    prompt = _extract_user_prompt(req.messages)
    content = _run_team(team, prompt, req.stream)
    return _build_response(req.model, content)
