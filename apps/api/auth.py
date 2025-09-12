"""
Auth module (placeholder).
FastAPI-ready endpoints for authentication and health checks.
"""

from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "auth:ok"}
