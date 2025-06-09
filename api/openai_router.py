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
        # Use the correct method signature for team.run()
        resp = team.run(
            message=prompt,
            stream=stream,
            session_id=None,  # Could generate a session ID if needed
            user_id=None,
        )
    except Exception as e:  # pragma: no cover - runtime errors
        raise HTTPException(status_code=500, detail=str(e))

    if stream:
        # For streaming responses, need to handle differently
        # The playground uses team_chat_response_streamer
        content = "".join(
            r.content for r in resp if getattr(r, "content", None)
        )
    else:
        # Non-streaming responses return a RunResponse object
        if hasattr(resp, 'content'):
            content = resp.content
        elif hasattr(resp, 'to_dict'):
            # RunResponse object - extract content
            resp_dict = resp.to_dict()
            content = resp_dict.get('content', str(resp_dict))
        else:
            content = str(resp)
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

