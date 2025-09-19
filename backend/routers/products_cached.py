import json, asyncio
from fastapi import APIRouter
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from db import db

router = APIRouter(prefix="/api/products", tags=["products"])

@router.get("/collection/{name}")
async def by_collection(name:str):
    # Note: Redis would be used here when available, falling back to direct DB query
    docs = [d async for d in db().products.find({"collection":name}).limit(24)]
    out = [{"id":str(d["_id"]),"title":d["title"],"price":d["price"]} for d in docs]
    return out