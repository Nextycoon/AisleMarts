from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class Variant(BaseModel):
    id: str
    name: str
    sku: Optional[str] = None
    priceDelta: Optional[float] = 0.0
    stock: Optional[int] = 0

class ProductIn(BaseModel):
    title: str
    price: float
    stock: int
    sku: Optional[str] = None
    desc: Optional[str] = None
    images: List[str] = []
    variants: List[Variant] = []
    active: bool = True

class Product(ProductIn):
    id: str

# In-memory store (replace with MongoDB)
DB = {
    "products":[
        {"id":"p1","title":"Wireless Earbuds X","price":39.99,"stock":120,"sku":"WX-100","desc":"", "images":[], "variants":[], "active":True},
        {"id":"p2","title":"Noise Cancelling Headphones","price":99.0,"stock":45,"sku":"NC-200","desc":"", "images":[], "variants":[], "active":True}
    ]
}

@router.get("", response_model=List[Product])
def list_products():
    return DB["products"]

@router.post("", response_model=Product, status_code=201)
def create_product(p: ProductIn):
    new = {"id": f"p{len(DB['products'])+1}", **p.dict()}
    DB["products"].append(new)
    return new

@router.get("/{id}", response_model=Product)
def get_product(id: str):
    return next(x for x in DB["products"] if x["id"]==id)

@router.put("/{id}", response_model=Product)
def update_product(id: str, p: ProductIn):
    for i, x in enumerate(DB["products"]):
        if x["id"]==id:
            DB["products"][i] = {"id": id, **p.dict()}
            return DB["products"][i]
    raise RuntimeError("Not found")

@router.delete("/{id}", status_code=204)
def delete_product(id: str):
    DB["products"] = [x for x in DB["products"] if x["id"]!=id]
    return

@router.post("/{id}/toggle", response_model=Product)
def toggle_product(id: str):
    for i, x in enumerate(DB["products"]):
        if x["id"]==id:
            x["active"] = not x.get("active", True)
            DB["products"][i] = x
            return x
    raise RuntimeError("Not found")
