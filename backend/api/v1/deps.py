"""
API v1 Dependencies - centralized dependency injection for v1 routes
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from ...security import get_current_user, get_current_user_optional
from ...config import settings
from ...db import db
import asyncio
from datetime import datetime
import uuid

security = HTTPBearer(auto_error=False)

async def get_current_shopper(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[dict]:
    """Get current authenticated shopper (optional for browsing)"""
    return await get_current_user_optional(credentials)

async def require_shopper(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Require authenticated shopper"""
    return await get_current_user(credentials)

async def get_or_create_session(shopper: Optional[dict] = Depends(get_current_shopper)) -> dict:
    """Get existing session or create anonymous session"""
    if shopper:
        # Authenticated session
        session_id = f"auth_{shopper['_id']}"
        session = await db().sessions.find_one({"_id": session_id})
        if not session:
            session = {
                "_id": session_id,
                "shopperId": shopper["_id"],
                "locale": shopper.get("locale", "en"),
                "device": "mobile",
                "events": [],
                "createdAt": datetime.utcnow()
            }
            await db().sessions.insert_one(session)
        return session
    else:
        # Anonymous session - create temporary
        session_id = f"anon_{str(uuid.uuid4())}"
        session = {
            "_id": session_id,
            "shopperId": None,
            "locale": "en",
            "device": "mobile", 
            "events": [],
            "createdAt": datetime.utcnow()
        }
        await db().sessions.insert_one(session)
        return session

def validate_locale(locale: str) -> str:
    """Validate and normalize locale"""
    supported_locales = ["en", "tr", "ar"]
    if locale.lower()[:2] in supported_locales:
        return locale.lower()[:2]
    return "en"

def validate_currency(currency: str) -> str:
    """Validate and normalize currency"""
    supported_currencies = ["USD", "TRY", "EUR", "GBP"]
    if currency.upper() in supported_currencies:
        return currency.upper()
    return "USD"