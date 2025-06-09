from __future__ import annotations

import time
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from teams import HackerNewsTeam

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatCompletionRequest(BaseModel):
    model: str = Field(..., description="Model or team identifier")
    messages: List[ChatMessage]
    stream: Optional[bool] = False

class CompletionRequest(BaseModel):
    model: str = Field(..., description="Model or team identifier")
    prompt: str
    stream: Optional[bool] = False


def _select_team(model: str):
    # if "hackernews" in model.lower() or "hn" in model.lower():
    #     return HackerNewsTeam
    # return ResearchTeam
    return HackerNewsTeam


def _run_team(team, prompt: str, stream: bool):
    try:
        resp = team.run(prompt, stream=stream)
    except Exception as e:  # pragma: no cover - runtime errors
        raise HTTPException(status_code=500, detail=str(e))

    if stream:
        # Concatenate streamed content pieces
        content = "".join(
            r.content for r in resp if getattr(r, "content", None)
        )
    else:
        content = resp.content if hasattr(resp, "content") else str(resp)
    return content


@router.post("/v1/chat/completions")
async def chat_completions(req: ChatCompletionRequest):
    team = _select_team(req.model)
    prompt = "\n".join(m.content for m in req.messages if m.role == "user")
    content = _run_team(team, prompt, req.stream or False)
    return {
        "id": f"chatcmpl-{int(time.time()*1000)}",
        "object": "chat.completion",
        "created": int(time.time()),
        "model": req.model,
        "choices": [
            {
                "index": 0,
                "message": {"role": "assistant", "content": content},
                "finish_reason": "stop",
            }
        ],
    }

