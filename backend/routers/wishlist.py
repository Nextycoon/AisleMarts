from fastapi import APIRouter
from ..db import db
from bson import ObjectId

router = APIRouter(prefix="/api/wishlist", tags=["wishlist"])

@router.post("/add")
async def add(db=Depends(get_db), user_id:str="", product_id:str=""):
    await db.wishlist.update_one(
        {"user_id": user_id},
        {"$addToSet": {"items": ObjectId(product_id)}},
        upsert=True
    ); return {"ok":True}

@router.get("/")
async def list_(db=Depends(get_db), user_id:str=""):
    doc = await db.wishlist.find_one({"user_id":user_id}) or {"items":[]}
    return {"items":[str(i) for i in doc.get("items",[])]}