from pydantic import BaseModel
from typing import Literal, List, Optional

IntentType = Literal["SHOW_COLLECTION","SEARCH_QUERY","ADD_TO_CART","CHECKOUT","REPEAT","HELP","UNKNOWN"]

class IntentCandidate(BaseModel):
    label: IntentType
    confidence: float
    args: dict = {}

class NLUResult(BaseModel):
    top: IntentCandidate
    ranked: List[IntentCandidate]
    lang: str
    mood: Optional[str] = None