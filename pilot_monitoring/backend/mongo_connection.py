import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/aislemarts")
MONGODB_DB = os.getenv("MONGODB_DB", "aislemarts")

COLLECTIONS = {
    "orders": os.getenv("ORDERS_COLLECTION", "orders"),
    "products": os.getenv("PRODUCTS_COLLECTION", "seller_products"),
    "users": os.getenv("USERS_COLLECTION", "users"),
    "events": os.getenv("EVENTS_COLLECTION", "order_events"),
    "payments": os.getenv("PAYMENTS_COLLECTION", "payments")
}

client = AsyncIOMotorClient(MONGODB_URL)
db = client[MONGODB_DB]
