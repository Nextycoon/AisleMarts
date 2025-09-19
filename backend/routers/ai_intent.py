from fastapi import APIRouter
from ..db import db
from ..ai.intent import IntentCandidate, NLUResult
import re

router = APIRouter(prefix="/api/ai", tags=["ai"])

KEYS = {
  "luxury": ["aurum","velour","crown","gold","luxury","premium"],
  "deals": ["deal","discount","budget","cheap","offer"],
  "trending": ["trend","hot","popular","buzz"],
}

def rank_intents(q:str)->NLUResult:
    ql = q.lower().strip()
    ranked = []
    if re.search(r"\b(luxury|premium|gold|crown|aurum|velour)\b", ql):
        ranked.append(IntentCandidate(label="SHOW_COLLECTION", confidence=0.92, args={"collection":"luxury"}))
    if re.search(r"\b(trend|popular|buzz)\b", ql):
        ranked.append(IntentCandidate(label="SHOW_COLLECTION", confidence=0.81, args={"collection":"trending"}))
    if re.search(r"\b(deal|discount|cheap|offer)\b", ql):
        ranked.append(IntentCandidate(label="SHOW_COLLECTION", confidence=0.78, args={"collection":"deals"}))
    if ql.startswith("add ") or "add to cart" in ql:
        ranked.append(IntentCandidate(label="ADD_TO_CART", confidence=0.76, args={}))
    if ql in ("checkout","buy now","pay"):
        ranked.append(IntentCandidate(label="CHECKOUT", confidence=0.7, args={}))
    if not ranked:
        ranked.append(IntentCandidate(label="SEARCH_QUERY", confidence=0.55, args={"q":ql}))
    return NLUResult(top=ranked[0], ranked=ranked, lang="auto")

@router.post("/parse", response_model=NLUResult)
async def parse_intent(payload: dict):
    result = rank_intents(payload.get("q",""))
    # Track KPI
    try:
        from ..metrics.business import kpi_on_intent
        kpi_on_intent(result.top.label)
    except ImportError:
        pass
    return result