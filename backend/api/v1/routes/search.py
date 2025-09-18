"""
Search and catalog routes for v1 API
"""
from fastapi import APIRouter, Query, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from ...db import db
from ..deps import get_current_shopper, get_or_create_session

router = APIRouter(prefix="/v1", tags=["search"])

class ProductResult(BaseModel):
    id: str
    title: str
    brand: str
    price: float
    currency: str
    images: List[str]
    tags: List[str]
    rating: float = 0.0
    rating_count: int = 0

class SearchResponse(BaseModel):
    items: List[ProductResult]
    total: int
    page: int
    per_page: int
    facets: Dict[str, Any]

@router.get("/search", response_model=SearchResponse)
async def search_products(
    q: Optional[str] = Query(None, description="Search query"),
    lang: Optional[str] = Query("en", description="Language preference"),
    country: Optional[str] = Query(None, description="Country filter"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    brand: Optional[str] = Query(None, description="Brand filter"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price"),
    tags: Optional[str] = Query(None, description="Comma-separated tags"),
    sort: Optional[str] = Query("relevance", description="Sort by: relevance, price, rating"),
    shopper=Depends(get_current_shopper),
    session=Depends(get_or_create_session)
):
    """Search products with advanced filtering and faceting"""
    
    # Build MongoDB query
    filter_dict = {"active": True}
    
    # Text search
    if q:
        filter_dict["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
            {"brand": {"$regex": q, "$options": "i"}},
            {"tags": {"$in": [q.lower()]}}
        ]
    
    # Brand filter
    if brand:
        filter_dict["brand"] = {"$regex": brand, "$options": "i"}
    
    # Price range
    if min_price is not None or max_price is not None:
        price_filter = {}
        if min_price is not None:
            price_filter["$gte"] = min_price
        if max_price is not None:
            price_filter["$lte"] = max_price
        filter_dict["price"] = price_filter
    
    # Tags filter
    if tags:
        tag_list = [tag.strip().lower() for tag in tags.split(",")]
        filter_dict["tags"] = {"$in": tag_list}
    
    # Sorting
    sort_options = {
        "relevance": {"score": -1, "rating": -1},
        "price": {"price": 1},
        "price_desc": {"price": -1},
        "rating": {"rating": -1, "rating_count": -1},
        "newest": {"created_at": -1}
    }
    sort_by = sort_options.get(sort, sort_options["relevance"])
    
    # Calculate skip
    skip = (page - 1) * per_page
    
    # Execute search
    cursor = db().products.find(filter_dict).sort(list(sort_by.items())).skip(skip).limit(per_page)
    products = await cursor.to_list(length=per_page)
    
    # Get total count
    total = await db().products.count_documents(filter_dict)
    
    # Convert to response format
    items = []
    for product in products:
        items.append(ProductResult(
            id=product["_id"],
            title=product["title"],
            brand=product["brand"],
            price=float(product["price"]),
            currency=product.get("currency", "USD"),
            images=product.get("images", []),
            tags=product.get("tags", []),
            rating=float(product.get("rating", 0)),
            rating_count=int(product.get("rating_count", 0))
        ))
    
    # Build facets (aggregation for filters)
    facets = await build_facets(filter_dict)
    
    # Log search event
    if session:
        await log_search_event(session["_id"], q, len(items))
    
    return SearchResponse(
        items=items,
        total=total,
        page=page,
        per_page=per_page,
        facets=facets
    )

@router.get("/products/{product_id}")
async def get_product_detail(
    product_id: str,
    shopper=Depends(get_current_shopper),
    session=Depends(get_or_create_session)
):
    """Get detailed product information"""
    product = await db().products.find_one({"_id": product_id, "active": True})
    if not product:
        raise HTTPException(404, "Product not found")
    
    # Get reviews
    reviews_cursor = db().reviews.find({"product_id": product_id}).sort("created_at", -1).limit(10)
    reviews = await reviews_cursor.to_list(length=10)
    
    # Log view event
    if session:
        await log_view_event(session["_id"], product_id)
    
    return {
        "id": product["_id"],
        "title": product["title"],
        "brand": product["brand"],
        "description": product.get("description", ""),
        "price": float(product["price"]),
        "currency": product.get("currency", "USD"),
        "images": product.get("images", []),
        "tags": product.get("tags", []),
        "colors": product.get("colors", []),
        "sizes": product.get("sizes", []),
        "rating": float(product.get("rating", 0)),
        "rating_count": int(product.get("rating_count", 0)),
        "stock": product.get("stock", 0),
        "reviews": reviews,
        "created_at": product.get("created_at"),
        "updated_at": product.get("updated_at")
    }

@router.get("/trending")
async def get_trending_products(
    segment: Optional[str] = Query("luxury", description="Segment: luxury, hot, deals"),
    limit: int = Query(20, ge=1, le=50),
    shopper=Depends(get_current_shopper)
):
    """Get trending products by segment"""
    
    # Define segment filters
    segment_filters = {
        "luxury": {"tags": {"$in": ["luxury", "premium"]}, "price": {"$gte": 100}},
        "hot": {"rating": {"$gte": 4.0}, "rating_count": {"$gte": 10}},
        "deals": {"tags": {"$in": ["sale", "deal", "discount"]}}
    }
    
    filter_dict = {"active": True}
    if segment in segment_filters:
        filter_dict.update(segment_filters[segment])
    
    # Sort by rating and recent activity
    cursor = db().products.find(filter_dict).sort([
        ("rating", -1),
        ("rating_count", -1),
        ("created_at", -1)
    ]).limit(limit)
    
    products = await cursor.to_list(length=limit)
    
    items = []
    for product in products:
        items.append({
            "id": product["_id"],
            "title": product["title"],
            "brand": product["brand"],
            "price": float(product["price"]),
            "currency": product.get("currency", "USD"),
            "images": product.get("images", [])[:1],  # Just first image for trending
            "rating": float(product.get("rating", 0)),
            "tags": product.get("tags", [])
        })
    
    return {
        "segment": segment,
        "items": items,
        "count": len(items)
    }

async def build_facets(base_filter: dict) -> dict:
    """Build search facets using aggregation"""
    pipeline = [
        {"$match": base_filter},
        {"$facet": {
            "brands": [
                {"$group": {"_id": "$brand", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}},
                {"$limit": 20}
            ],
            "price_ranges": [
                {"$bucket": {
                    "groupBy": "$price",
                    "boundaries": [0, 50, 100, 200, 500, 1000],
                    "default": "1000+",
                    "output": {"count": {"$sum": 1}}
                }}
            ],
            "tags": [
                {"$unwind": "$tags"},
                {"$group": {"_id": "$tags", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}},
                {"$limit": 20}
            ]
        }}
    ]
    
    try:
        result = await db().products.aggregate(pipeline).to_list(length=1)
        if result:
            return result[0]
    except Exception as e:
        print(f"Facet aggregation error: {e}")
    
    return {"brands": [], "price_ranges": [], "tags": []}

async def log_search_event(session_id: str, query: str, result_count: int):
    """Log search event for analytics"""
    event = {
        "type": "search",
        "query": query,
        "result_count": result_count,
        "timestamp": datetime.utcnow()
    }
    
    await db().sessions.update_one(
        {"_id": session_id},
        {"$push": {"events": event}}
    )

async def log_view_event(session_id: str, product_id: str):
    """Log product view event"""
    event = {
        "type": "view_product",
        "product_id": product_id,
        "timestamp": datetime.utcnow()
    }
    
    await db().sessions.update_one(
        {"_id": session_id},
        {"$push": {"events": event}}
    )

from fastapi import HTTPException