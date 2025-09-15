from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import Any

router = APIRouter()

class STKCallback(BaseModel):
    MerchantRequestID: str
    CheckoutRequestID: str
    ResultCode: int
    ResultDesc: str
    CallbackMetadata: dict | None = None

@router.post("/stk/callback")
async def stk_callback(payload: STKCallback):
    # TODO: verify signature if applicable
    # Map CheckoutRequestID -> orderId, then set status to 'paid' on success (ResultCode == 0)
    success = payload.ResultCode == 0
    # persist event for audit; enqueue notification
    return {"received": True, "success": success}
