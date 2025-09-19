from fastapi import APIRouter, HTTPException
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from db import db
router = APIRouter(prefix="/api/orders", tags=["orders"])

@router.post("/{order_id}/cancel")
async def cancel(order_id:str, user_id:str=""):
    order = await db().orders.find_one({"_id":order_id, "user_id":user_id})
    if not order: raise HTTPException(404,"order not found")
    if order.get("status") not in ("processing","created"):
        return {"ok":True, "status":order.get("status")}
    await db().orders.update_one({"_id":order_id},{"$set":{"status":"canceled"}})
    return {"ok":True, "status":"canceled"}