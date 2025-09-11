"""
Database initialization script
Run this to set up indexes and sample data
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.config.settings import settings

async def init_database():
    """Initialize database with indexes and sample data"""
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    
    # Create indexes
    print("Creating database indexes...")
    
    # Users collection indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("role")
    
    # Products collection indexes
    await db.products.create_index("vendor_id")
    await db.products.create_index("category")
    await db.products.create_index("status")
    await db.products.create_index([("name", "text"), ("description", "text")])
    
    # Vendors collection indexes
    await db.vendors.create_index("user_id", unique=True)
    await db.vendors.create_index("status")
    
    # Carts collection indexes
    await db.carts.create_index("user_id", unique=True)
    
    # Orders collection indexes
    await db.orders.create_index("user_id")
    await db.orders.create_index("order_number", unique=True)
    await db.orders.create_index("status")
    
    # Chat sessions collection indexes
    await db.chat_sessions.create_index("user_id")
    
    print("Database indexes created successfully!")
    
    # Create sample categories
    sample_categories = [
        "Electronics", "Clothing", "Books", "Home & Garden", 
        "Sports & Outdoors", "Beauty & Health", "Toys & Games",
        "Automotive", "Food & Beverages", "Arts & Crafts"
    ]
    
    print(f"Sample categories available: {', '.join(sample_categories)}")
    
    client.close()
    print("Database initialization complete!")

if __name__ == "__main__":
    asyncio.run(init_database())