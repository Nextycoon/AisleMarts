from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
from bson import ObjectId
from routers.deps import get_db
from motor.motor_asyncio import AsyncIOMotorDatabase
from enum import Enum
import asyncio

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

class AnalyticsPeriod(str, Enum):
    LAST_24H = "24h"
    LAST_7D = "7d"
    LAST_30D = "30d"
    LAST_90D = "90d"
    LAST_YEAR = "1y"

class AnalyticsResponse(BaseModel):
    period: str
    start_date: datetime
    end_date: datetime
    data: Dict[str, Any]
    generated_at: datetime

class DashboardMetrics(BaseModel):
    total_revenue: float
    total_orders: int
    total_users: int
    total_products: int
    total_vendors: int
    active_users_24h: int
    conversion_rate: float
    average_order_value: float
    top_selling_products: List[Dict[str, Any]]
    revenue_trend: List[Dict[str, Any]]

# Helper Functions
def get_date_range(period: AnalyticsPeriod) -> tuple[datetime, datetime]:
    """Get start and end dates for analytics period"""
    end_date = datetime.utcnow()
    
    if period == AnalyticsPeriod.LAST_24H:
        start_date = end_date - timedelta(hours=24)
    elif period == AnalyticsPeriod.LAST_7D:
        start_date = end_date - timedelta(days=7)
    elif period == AnalyticsPeriod.LAST_30D:
        start_date = end_date - timedelta(days=30)
    elif period == AnalyticsPeriod.LAST_90D:
        start_date = end_date - timedelta(days=90)
    elif period == AnalyticsPeriod.LAST_YEAR:
        start_date = end_date - timedelta(days=365)
    else:
        start_date = end_date - timedelta(days=30)
    
    return start_date, end_date

async def get_revenue_analytics(db: AsyncIOMotorDatabase, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
    """Calculate revenue analytics"""
    pipeline = [
        {
            "$match": {
                "status": {"$in": ["paid", "completed"]},
                "createdAt": {"$gte": start_date, "$lte": end_date}
            }
        },
        {
            "$group": {
                "_id": None,
                "total_revenue": {"$sum": "$amount"},
                "total_orders": {"$sum": 1},
                "average_order_value": {"$avg": "$amount"}
            }
        }
    ]
    
    result = await db.orders.aggregate(pipeline).to_list(1)
    if result:
        data = result[0]
        data.pop("_id", None)
        # Convert from cents to dollars
        data["total_revenue"] = data["total_revenue"] / 100
        data["average_order_value"] = data["average_order_value"] / 100
        return data
    
    return {"total_revenue": 0.0, "total_orders": 0, "average_order_value": 0.0}

async def get_user_analytics(db: AsyncIOMotorDatabase, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
    """Calculate user analytics"""
    # Total users
    total_users = await db.users.count_documents({})
    
    # Active users in period
    active_users = await db.users.count_documents({
        "lastLoginAt": {"$gte": start_date, "$lte": end_date}
    })
    
    # New users in period
    new_users = await db.users.count_documents({
        "createdAt": {"$gte": start_date, "$lte": end_date}
    })
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "new_users": new_users
    }

async def get_product_analytics(db: AsyncIOMotorDatabase, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
    """Calculate product analytics"""
    # Total products
    total_products = await db.products.count_documents({})
    
    # Top selling products (based on order items)
    pipeline = [
        {
            "$match": {
                "status": {"$in": ["paid", "completed"]},
                "createdAt": {"$gte": start_date, "$lte": end_date}
            }
        },
        {"$unwind": "$items"},
        {
            "$group": {
                "_id": "$items.productId",
                "product_name": {"$first": "$items.name"},
                "total_qty": {"$sum": "$items.qty"},
                "total_revenue": {"$sum": {"$multiply": ["$items.price", "$items.qty"]}}
            }
        },
        {"$sort": {"total_qty": -1}},
        {"$limit": 10}
    ]
    
    top_products = await db.orders.aggregate(pipeline).to_list(10)
    
    # Convert revenue from cents to dollars
    for product in top_products:
        product["total_revenue"] = product["total_revenue"] / 100
        product["product_id"] = product.pop("_id")
    
    return {
        "total_products": total_products,
        "top_selling_products": top_products
    }

async def get_vendor_analytics(db: AsyncIOMotorDatabase) -> Dict[str, Any]:
    """Calculate vendor analytics"""
    pipeline = [
        {
            "$group": {
                "_id": "$status",
                "count": {"$sum": 1}
            }
        }
    ]
    
    status_counts = await db.vendors.aggregate(pipeline).to_list(10)
    
    vendor_stats = {"total_vendors": 0, "active_vendors": 0, "pending_vendors": 0}
    
    for stat in status_counts:
        status = stat["_id"]
        count = stat["count"]
        vendor_stats["total_vendors"] += count
        
        if status == "active":
            vendor_stats["active_vendors"] = count
        elif status == "pending":
            vendor_stats["pending_vendors"] = count
    
    return vendor_stats

async def get_revenue_trend(db: AsyncIOMotorDatabase, start_date: datetime, end_date: datetime, period: AnalyticsPeriod) -> List[Dict[str, Any]]:
    """Get revenue trend over time"""
    # Determine grouping format based on period
    if period in [AnalyticsPeriod.LAST_24H]:
        date_format = "%Y-%m-%d %H:00"
        group_format = {
            "year": {"$year": "$createdAt"},
            "month": {"$month": "$createdAt"},
            "day": {"$dayOfMonth": "$createdAt"},
            "hour": {"$hour": "$createdAt"}
        }
    elif period in [AnalyticsPeriod.LAST_7D, AnalyticsPeriod.LAST_30D]:
        date_format = "%Y-%m-%d"
        group_format = {
            "year": {"$year": "$createdAt"},
            "month": {"$month": "$createdAt"},
            "day": {"$dayOfMonth": "$createdAt"}
        }
    else:
        date_format = "%Y-%m"
        group_format = {
            "year": {"$year": "$createdAt"},
            "month": {"$month": "$createdAt"}
        }
    
    pipeline = [
        {
            "$match": {
                "status": {"$in": ["paid", "completed"]},
                "createdAt": {"$gte": start_date, "$lte": end_date}
            }
        },
        {
            "$group": {
                "_id": group_format,
                "revenue": {"$sum": "$amount"},
                "orders": {"$sum": 1},
                "date": {"$first": "$createdAt"}
            }
        },
        {"$sort": {"_id": 1}}
    ]
    
    results = await db.orders.aggregate(pipeline).to_list(100)
    
    trend_data = []
    for result in results:
        # Convert revenue from cents to dollars
        trend_data.append({
            "date": result["date"].strftime(date_format),
            "revenue": result["revenue"] / 100,
            "orders": result["orders"]
        })
    
    return trend_data

# API Endpoints
@router.get("/health")
async def analytics_health():
    """Health check for analytics system"""
    return {
        "status": "healthy",
        "service": "analytics_api",
        "features": [
            "revenue_analytics",
            "user_analytics", 
            "product_analytics",
            "vendor_analytics",
            "conversion_tracking",
            "trend_analysis"
        ],
        "supported_periods": ["24h", "7d", "30d", "90d", "1y"],
        "timestamp": datetime.utcnow()
    }

@router.get("/dashboard", response_model=DashboardMetrics)
async def get_dashboard_metrics(
    period: AnalyticsPeriod = AnalyticsPeriod.LAST_30D,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get comprehensive dashboard metrics"""
    start_date, end_date = get_date_range(period)
    
    # Run analytics queries in parallel
    revenue_task = get_revenue_analytics(db, start_date, end_date)
    user_task = get_user_analytics(db, start_date, end_date)
    product_task = get_product_analytics(db, start_date, end_date)
    vendor_task = get_vendor_analytics(db)
    trend_task = get_revenue_trend(db, start_date, end_date, period)
    
    revenue_data, user_data, product_data, vendor_data, trend_data = await asyncio.gather(
        revenue_task, user_task, product_task, vendor_task, trend_task
    )
    
    # Calculate conversion rate
    conversion_rate = 0.0
    if user_data["active_users"] > 0:
        conversion_rate = (revenue_data["total_orders"] / user_data["active_users"]) * 100
    
    # Get active users in last 24h
    yesterday = datetime.utcnow() - timedelta(hours=24)
    active_users_24h = await db.users.count_documents({
        "lastLoginAt": {"$gte": yesterday}
    })
    
    return DashboardMetrics(
        total_revenue=revenue_data["total_revenue"],
        total_orders=revenue_data["total_orders"],
        total_users=user_data["total_users"],
        total_products=product_data["total_products"],
        total_vendors=vendor_data["total_vendors"],
        active_users_24h=active_users_24h,
        conversion_rate=conversion_rate,
        average_order_value=revenue_data["average_order_value"],
        top_selling_products=product_data["top_selling_products"],
        revenue_trend=trend_data
    )

@router.get("/revenue", response_model=AnalyticsResponse)
async def get_revenue_analytics_endpoint(
    period: AnalyticsPeriod = AnalyticsPeriod.LAST_30D,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get detailed revenue analytics"""
    start_date, end_date = get_date_range(period)
    
    # Get revenue data
    revenue_data = await get_revenue_analytics(db, start_date, end_date)
    
    # Get revenue by payment method
    payment_method_pipeline = [
        {
            "$match": {
                "status": {"$in": ["paid", "completed"]},
                "createdAt": {"$gte": start_date, "$lte": end_date}
            }
        },
        {
            "$group": {
                "_id": "$provider",
                "revenue": {"$sum": "$amount"},
                "orders": {"$sum": 1}
            }
        }
    ]
    
    payment_methods = await db.orders.aggregate(payment_method_pipeline).to_list(10)
    for method in payment_methods:
        method["revenue"] = method["revenue"] / 100
        method["provider"] = method.pop("_id")
    
    # Get revenue trend
    trend_data = await get_revenue_trend(db, start_date, end_date, period)
    
    return AnalyticsResponse(
        period=period.value,
        start_date=start_date,
        end_date=end_date,
        data={
            **revenue_data,
            "revenue_by_payment_method": payment_methods,
            "revenue_trend": trend_data
        },
        generated_at=datetime.utcnow()
    )

@router.get("/users", response_model=AnalyticsResponse)
async def get_user_analytics_endpoint(
    period: AnalyticsPeriod = AnalyticsPeriod.LAST_30D,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get detailed user analytics"""
    start_date, end_date = get_date_range(period)
    
    user_data = await get_user_analytics(db, start_date, end_date)
    
    # User registration trend
    registration_pipeline = [
        {
            "$match": {
                "createdAt": {"$gte": start_date, "$lte": end_date}
            }
        },
        {
            "$group": {
                "_id": {
                    "year": {"$year": "$createdAt"},
                    "month": {"$month": "$createdAt"},
                    "day": {"$dayOfMonth": "$createdAt"}
                },
                "new_users": {"$sum": 1},
                "date": {"$first": "$createdAt"}
            }
        },
        {"$sort": {"_id": 1}}
    ]
    
    registration_trend = await db.users.aggregate(registration_pipeline).to_list(100)
    for item in registration_trend:
        item["date"] = item["date"].strftime("%Y-%m-%d")
        item.pop("_id")
    
    return AnalyticsResponse(
        period=period.value,
        start_date=start_date,
        end_date=end_date,
        data={
            **user_data,
            "registration_trend": registration_trend
        },
        generated_at=datetime.utcnow()
    )

@router.get("/products", response_model=AnalyticsResponse)
async def get_product_analytics_endpoint(
    period: AnalyticsPeriod = AnalyticsPeriod.LAST_30D,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get detailed product analytics"""
    start_date, end_date = get_date_range(period)
    
    product_data = await get_product_analytics(db, start_date, end_date)
    
    # Product performance by category
    category_pipeline = [
        {
            "$match": {
                "status": {"$in": ["paid", "completed"]},
                "createdAt": {"$gte": start_date, "$lte": end_date}
            }
        },
        {"$unwind": "$items"},
        {
            "$lookup": {
                "from": "products",
                "localField": "items.productId",
                "foreignField": "_id",
                "as": "product"
            }
        },
        {"$unwind": {"path": "$product", "preserveNullAndEmptyArrays": True}},
        {
            "$group": {
                "_id": "$product.category",
                "total_qty": {"$sum": "$items.qty"},
                "total_revenue": {"$sum": {"$multiply": ["$items.price", "$items.qty"]}},
                "orders": {"$sum": 1}
            }
        },
        {"$sort": {"total_revenue": -1}}
    ]
    
    category_performance = await db.orders.aggregate(category_pipeline).to_list(20)
    for category in category_performance:
        category["total_revenue"] = category["total_revenue"] / 100
        category["category"] = category.pop("_id") or "Uncategorized"
    
    return AnalyticsResponse(
        period=period.value,
        start_date=start_date,
        end_date=end_date,
        data={
            **product_data,
            "category_performance": category_performance
        },
        generated_at=datetime.utcnow()
    )

@router.get("/conversion", response_model=AnalyticsResponse)
async def get_conversion_analytics(
    period: AnalyticsPeriod = AnalyticsPeriod.LAST_30D,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get conversion funnel analytics"""
    start_date, end_date = get_date_range(period)
    
    # Basic conversion metrics
    total_users = await db.users.count_documents({
        "createdAt": {"$lte": end_date}
    })
    
    active_users = await db.users.count_documents({
        "lastLoginAt": {"$gte": start_date, "$lte": end_date}
    })
    
    total_orders = await db.orders.count_documents({
        "createdAt": {"$gte": start_date, "$lte": end_date}
    })
    
    paid_orders = await db.orders.count_documents({
        "status": {"$in": ["paid", "completed"]},
        "createdAt": {"$gte": start_date, "$lte": end_date}
    })
    
    # Calculate conversion rates
    user_to_order_rate = (total_orders / active_users * 100) if active_users > 0 else 0
    order_to_payment_rate = (paid_orders / total_orders * 100) if total_orders > 0 else 0
    user_to_payment_rate = (paid_orders / active_users * 100) if active_users > 0 else 0
    
    return AnalyticsResponse(
        period=period.value,
        start_date=start_date,
        end_date=end_date,
        data={
            "funnel_metrics": {
                "total_users": total_users,
                "active_users": active_users,
                "total_orders": total_orders,
                "paid_orders": paid_orders
            },
            "conversion_rates": {
                "user_to_order": round(user_to_order_rate, 2),
                "order_to_payment": round(order_to_payment_rate, 2),
                "user_to_payment": round(user_to_payment_rate, 2)
            }
        },
        generated_at=datetime.utcnow()
    )

@router.get("/performance")
async def get_performance_metrics(db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get system performance metrics"""
    # Database collection sizes
    collections = ["users", "products", "orders", "vendors"]
    collection_stats = {}
    
    for collection in collections:
        count = await getattr(db, collection).count_documents({})
        collection_stats[collection] = count
    
    # Recent activity (last 24 hours)
    yesterday = datetime.utcnow() - timedelta(hours=24)
    
    recent_activity = {
        "new_users_24h": await db.users.count_documents({"createdAt": {"$gte": yesterday}}),
        "new_orders_24h": await db.orders.count_documents({"createdAt": {"$gte": yesterday}}),
        "active_sessions_24h": await db.users.count_documents({"lastLoginAt": {"$gte": yesterday}})
    }
    
    return {
        "system_status": "healthy",
        "collection_counts": collection_stats,
        "recent_activity": recent_activity,
        "generated_at": datetime.utcnow()
    }