from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Literal, Optional

router = APIRouter()

class OrderItem(BaseModel):
    title: str
    sku: Optional[str] = None
    qty: int
    price: int  # in KES

class Order(BaseModel):
    id: str
    createdAt: str
    total: int
    status: Literal['pending','paid','shipped','delivered','cancelled']
    customer: str
    address: Optional[str] = None
    items: List[OrderItem] = []

ORDERS: List[Order] = [
    Order(id="O-10023", createdAt="2025-09-10", total=12850, status="paid", customer="A. Njeri", items=[OrderItem(title="Wireless Earbuds X", qty=1, price=3999)]),
    Order(id="O-10024", createdAt="2025-09-11", total=3999, status="shipped", customer="B. Otieno", items=[OrderItem(title="Travel Charger 65W", qty=1, price=2900)]),
    Order(id="O-10025", createdAt="2025-09-12", total=22900, status="pending", customer="C. Kamau", items=[OrderItem(title="Headphones", qty=1, price=22900)]),
]

@router.get("", response_model=List[Order])
def list_orders():
    return ORDERS

@router.get("/{id}", response_model=Order)
def get_order(id: str):
    for o in ORDERS:
        if o.id == id:
            return o
    raise HTTPException(status_code=404, detail="not_found")

class StatusUpdate(BaseModel):
    status: Literal['pending','paid','shipped','delivered','cancelled']

@router.post("/{id}", response_model=Order)
def update_status(id: str, body: StatusUpdate):
    for i, o in enumerate(ORDERS):
        if o.id == id:
            ORDERS[i].status = body.status
            return ORDERS[i]
    raise HTTPException(status_code=404, detail="not_found")
