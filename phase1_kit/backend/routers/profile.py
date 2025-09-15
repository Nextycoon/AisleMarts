from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()

class StoreProfile(BaseModel):
    storeName: str
    contactEmail: Optional[str] = None
    contactPhone: Optional[str] = None
    mpesaPaybill: Optional[str] = None
    logo: List[str] = []

PROFILE = StoreProfile(storeName="My Store")

@router.get("", response_model=StoreProfile)
def get_profile():
    return PROFILE

@router.put("", response_model=StoreProfile)
def update_profile(p: StoreProfile):
    global PROFILE
    PROFILE = p
    return PROFILE
