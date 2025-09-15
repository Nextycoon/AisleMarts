from fastapi import APIRouter
from typing import List, Literal

router = APIRouter()

ORDERS = [
    {"id":"O-10023","createdAt":"2025-09-10","total":128.5,"status":"paid","customer":"A. Njeri"},
    {"id":"O-10024","createdAt":"2025-09-11","total":39.99,"status":"shipped","customer":"B. Otieno"},
    {"id":"O-10025","createdAt":"2025-09-12","total":229.00,"status":"pending","customer":"C. Kamau"}
]

@router.get("")
def list_orders():
    return ORDERS

@router.get("/{id}")
def get_order(id: str):
    return next(x for x in ORDERS if x["id"]==id)

@router.post("/{id}")
def update_status(id: str, status: Literal["pending","paid","shipped","delivered","cancelled"]="pending"):
    for o in ORDERS:
        if o["id"]==id:
            o["status"] = status
            return o
    return {"error":"not_found"}
