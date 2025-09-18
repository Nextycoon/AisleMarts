# routers/health.py
from fastapi import APIRouter
import os

router = APIRouter(prefix="/health", tags=["health"])

@router.get("")
def health():
    return {
        "ok": True,
        "service": "aislemarts-api",
        "env": os.getenv("ENV", "dev"),
        "version": os.getenv("API_VERSION", "v1")
    }