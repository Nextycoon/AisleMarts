from fastapi import APIRouter, Depends, HTTPException
from ..deps import get_db
router = APIRouter(prefix="/api/orders", tags=["orders"])

@router.post("/{order_id}/cancel")
async def cancel(order_id:str, db=Depends(get_db), user_id:str=""):
    order = await db.orders.find_one({"_id":order_id, "user_id":user_id})
    if not order: raise HTTPException(404,"order not found")
    if order.get("status") not in ("processing","created"):
        return {"ok":True, "status":order.get("status")}
    await db.orders.update_one({"_id":order_id},{"$set":{"status":"canceled"}})
    return {"ok":True, "status":"canceled"}