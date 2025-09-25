# Server-Side Ranker Implementation - FastAPI (MongoDB Compatible)

from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import math, os, time, random

router = APIRouter()
C = float(os.getenv("UCB_C", "1.5"))            # exploration constant
MIN_EXPOSURE = float(os.getenv("MIN_EXPOSURE", "0.02"))  # 2% creator floor
MAX_CANDIDATES = int(os.getenv("MAX_CANDIDATES", "300"))
CACHE_TTL = int(os.getenv("RANKER_CACHE_TTL", "60"))     # seconds

# Simple in-process cache (swap for Redis in prod)
_cache: Dict[str, Any] = {}

class RankRequest(BaseModel):
  user_id: str
  limit: int = 20
  # Optional business context
  country: str | None = None
  currency: str | None = None

class RankedItem(BaseModel):
  story_id: str
  score: float
  creator_id: str

class RankResponse(BaseModel):
  algo: str
  items: List[RankedItem]
  ttl: int

# Mock story data for ranking (in production this would come from MongoDB)
MOCK_STORIES = [
    {"story_id": "luxefashion_story_0", "creator_id": "luxefashion", "views": 1250, "clicks": 89, "purchases": 12},
    {"story_id": "techguru_story_0", "creator_id": "techguru", "views": 980, "clicks": 67, "purchases": 8},
    {"story_id": "homedecor_story_0", "creator_id": "homedecor", "views": 750, "clicks": 45, "purchases": 5},
    {"story_id": "fitness_story_0", "creator_id": "fitness", "views": 1100, "clicks": 78, "purchases": 9},
    {"story_id": "beauty_story_0", "creator_id": "beauty", "views": 890, "clicks": 56, "purchases": 7},
    {"story_id": "travel_story_0", "creator_id": "travel", "views": 650, "clicks": 34, "purchases": 3},
    {"story_id": "food_story_0", "creator_id": "food", "views": 1350, "clicks": 95, "purchases": 14},
    {"story_id": "books_story_0", "creator_id": "books", "views": 420, "clicks": 28, "purchases": 2},
]

def _hash_bucket(user_id: str) -> int:
  h = 2166136261
  for ch in user_id:
    h ^= ord(ch); h = (h * 16777619) & 0xffffffff
  return h % 10000

def _in_canary(user_id: str, pct: float) -> bool:
  return _hash_bucket(user_id) < int(pct * 100)

def _ucb1_score(views, clicks, t, prior_ctr=0.02, commission_bonus=0.0, fresh=0.0):
  v = max(1, views)
  c = clicks
  ctr = c / v if v > 0 else prior_ctr
  ucb = C * math.sqrt(max(0.0, math.log(max(t,1))) / v)
  # Business shaping: commission/freshness bonuses are small nudges
  return ctr + ucb + 0.2 * commission_bonus + 0.1 * fresh

def _enforce_min_exposure(items: List[RankedItem], creator_floor=MIN_EXPOSURE):
  if not items: return items
  n = len(items); floor = max(1, int(n * creator_floor))
  seen = {}
  head, tail = [], []
  for it in items:
    cnt = seen.get(it.creator_id, 0)
    if cnt < floor:
      head.append(it); seen[it.creator_id] = cnt + 1
    else:
      tail.append(it)
  return head + tail  # ensures each creator gets minimum early exposure

@router.post("/api/rank", response_model=RankResponse)
async def rank(req: RankRequest):
  # Flags
  ranker_enabled = os.getenv("RANKER_ENABLED", "1") == "1"
  canary_pct = float(os.getenv("RANKER_CANARY", "0.05"))

  algo = "identity"
  if ranker_enabled and _in_canary(req.user_id, canary_pct):
    algo = "ucb1"

  # Cache key + TTL
  key = f"{algo}:{req.user_id}:{req.limit}"
  entry = _cache.get(key)
  now = int(time.time())
  if entry and now - entry["ts"] <= CACHE_TTL:
    return RankResponse(algo=algo, items=entry["items"], ttl=CACHE_TTL - (now - entry["ts"]))

  # Use mock data for now (in production this would query MongoDB)
  rows = MOCK_STORIES[:MAX_CANDIDATES]
  
  if not rows:
    return RankResponse(algo="identity", items=[], ttl=CACHE_TTL)

  t = sum(r["views"] for r in rows) or 1
  ranked: List[RankedItem] = []

  if algo == "ucb1":
    for r in rows:
      # Example business nudges
      commission_bonus = 0.0   # e.g., from a lookup by story_id or creator tier
      freshness = random.uniform(0.5, 1.0)  # Mock freshness
      score = _ucb1_score(r["views"], r["clicks"], t, prior_ctr=0.02,
                          commission_bonus=commission_bonus, fresh=freshness)
      ranked.append(RankedItem(story_id=r["story_id"], score=score, creator_id=r["creator_id"]))
    ranked.sort(key=lambda x: x.score, reverse=True)
    ranked = _enforce_min_exposure(ranked)
  else:
    # identity: recency-based
    for r in rows:
      score = float(now) + random.uniform(-1000, 1000)  # Mock timestamp-based score
      ranked.append(RankedItem(story_id=r["story_id"], score=score, creator_id=r["creator_id"]))

  items = ranked[:req.limit]
  _cache[key] = {"items": items, "ts": now}
  return RankResponse(algo=algo, items=items, ttl=CACHE_TTL)