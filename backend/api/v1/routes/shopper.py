"""
Shopper profile and preferences routes
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from ...db import db
from ..deps import require_shopper, validate_locale, validate_currency

router = APIRouter(prefix="/v1/shopper", tags=["shopper"])

class ShopperUpdate(BaseModel):
    locale: Optional[str] = None
    currency: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None

@router.get("/me")
async def get_profile(shopper=Depends(require_shopper)):
    """Get current shopper profile"""
    return {
        "id": shopper["_id"],
        "email": shopper.get("email"),
        "phone": shopper.get("phone"),
        "locale": shopper.get("locale", "en"),
        "currency": shopper.get("currency", "USD"),
        "preferences": shopper.get("preferences", {}),
        "created_at": shopper.get("created_at"),
        "updated_at": shopper.get("updated_at")
    }

@router.put("/me")
async def update_profile(updates: ShopperUpdate, shopper=Depends(require_shopper)):
    """Update shopper profile"""
    update_doc = {"updated_at": datetime.utcnow()}
    
    if updates.locale:
        update_doc["locale"] = validate_locale(updates.locale)
    
    if updates.currency:
        update_doc["currency"] = validate_currency(updates.currency)
    
    if updates.preferences:
        # Merge with existing preferences
        existing_prefs = shopper.get("preferences", {})
        existing_prefs.update(updates.preferences)
        update_doc["preferences"] = existing_prefs
    
    await db().shoppers.update_one(
        {"_id": shopper["_id"]},
        {"$set": update_doc}
    )
    
    # Return updated profile
    updated_shopper = await db().shoppers.find_one({"_id": shopper["_id"]})
    return {
        "id": updated_shopper["_id"],
        "email": updated_shopper.get("email"),
        "phone": updated_shopper.get("phone"),
        "locale": updated_shopper.get("locale", "en"),
        "currency": updated_shopper.get("currency", "USD"),
        "preferences": updated_shopper.get("preferences", {}),
        "updated_at": updated_shopper.get("updated_at")
    }