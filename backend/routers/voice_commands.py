# /app/backend/routers/voice_commands.py
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from .deps import get_db

router = APIRouter(prefix="/api/ai", tags=["ai"])

class VoiceIn(BaseModel):
  text: str

@router.post("/voice-command")
async def voice_command(body: VoiceIn, db=Depends(get_db)):
    q = body.text.lower().strip()

    # Simple intent rules (v1)
    if any(k in q for k in ["trending", "hot", "popular"]):
        return {"intent": "SHOW_COLLECTION", "collection": "trending"}

    if any(k in q for k in ["deals", "discount", "sale"]):
        return {"intent": "SHOW_COLLECTION", "collection": "deals"}

    if any(k in q for k in ["luxury", "premium", "designer"]):
        return {"intent": "SHOW_COLLECTION", "collection": "luxury"}

    # product search
    return {"intent": "SEARCH", "query": q}