"""
Seed data for AisleMarts v1 development
"""
import asyncio
from datetime import datetime
import uuid
from db import db

# Sample luxury products for seeding
SAMPLE_PRODUCTS = [
    {
        "_id": "prod-luxury-bag-001",
        "title": "Luxury Leather Handbag",
        "brand": "Aisle Atelier",
        "description": "Premium Italian leather handbag with gold hardware",
        "price": 899.99,
        "currency": "USD",
        "images": [
            "https://picsum.photos/seed/bag1/800/800",
            "https://picsum.photos/seed/bag1b/800/800"
        ],
        "tags": ["luxury", "handbag", "leather", "premium"],
        "colors": ["Black", "Brown", "Navy"],
        "sizes": ["Small", "Medium", "Large"],
        "rating": 4.8,
        "rating_count": 127,
        "stock": 15,
        "active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "_id": "prod-luxury-shoes-001",
        "title": "Luxury Black Leather Loafers",
        "brand": "Aisle Atelier",
        "description": "Hand-crafted Italian leather loafers for sophisticated style",
        "price": 549.99,
        "currency": "USD",
        "images": [
            "https://picsum.photos/seed/loafer1/800/800",
            "https://picsum.photos/seed/loafer1b/800/800"
        ],
        "tags": ["luxury", "shoes", "leather", "loafers"],
        "colors": ["Black", "Brown"],
        "sizes": ["39", "40", "41", "42", "43", "44"],
        "rating": 4.7,
        "rating_count": 89,
        "stock": 25,
        "active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "_id": "prod-trending-watch-001",
        "title": "Smart Luxury Watch",
        "brand": "TechLux",
        "description": "Premium smartwatch with luxury design and advanced features",
        "price": 1299.99,
        "currency": "USD",
        "images": [
            "https://picsum.photos/seed/watch1/800/800",
            "https://picsum.photos/seed/watch1b/800/800"
        ],
        "tags": ["trending", "luxury", "smartwatch", "tech"],
        "colors": ["Silver", "Gold", "Black"],
        "sizes": ["42mm", "46mm"],
        "rating": 4.6,
        "rating_count": 234,
        "stock": 10,
        "active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "_id": "prod-deal-jacket-001",
        "title": "Premium Leather Jacket - Sale",
        "brand": "UrbanStyle",
        "description": "High-quality leather jacket at a special price",
        "price": 299.99,
        "currency": "USD",
        "images": [
            "https://picsum.photos/seed/jacket1/800/800",
            "https://picsum.photos/seed/jacket1b/800/800"
        ],
        "tags": ["deal", "sale", "leather", "jacket"],
        "colors": ["Black", "Brown"],
        "sizes": ["S", "M", "L", "XL"],
        "rating": 4.4,
        "rating_count": 156,
        "stock": 30,
        "active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "_id": "prod-luxury-dress-001",
        "title": "Designer Evening Dress",
        "brand": "Elegance Co",
        "description": "Stunning evening dress for special occasions",
        "price": 750.00,
        "currency": "USD",
        "images": [
            "https://picsum.photos/seed/dress1/800/800",
            "https://picsum.photos/seed/dress1b/800/800"
        ],
        "tags": ["luxury", "dress", "evening", "designer"],
        "colors": ["Black", "Navy", "Burgundy"],
        "sizes": ["XS", "S", "M", "L", "XL"],
        "rating": 4.9,
        "rating_count": 67,
        "stock": 8,
        "active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
]

# Sample reviews
SAMPLE_REVIEWS = [
    {
        "_id": "review-001",
        "product_id": "prod-luxury-bag-001",
        "author": "Sarah M.",
        "rating": 5,
        "body": "Absolutely stunning bag! The leather quality is exceptional and the craftsmanship is perfect.",
        "created_at": datetime.utcnow()
    },
    {
        "_id": "review-002",
        "product_id": "prod-luxury-bag-001",
        "author": "Emma K.",
        "rating": 5,
        "body": "Love this bag! It's the perfect size and goes with everything. Highly recommended!",
        "created_at": datetime.utcnow()
    },
    {
        "_id": "review-003",
        "product_id": "prod-luxury-shoes-001",
        "author": "Michael R.",
        "rating": 5,
        "body": "These loafers are incredibly comfortable and look amazing. Great quality for the price.",
        "created_at": datetime.utcnow()
    }
]

async def seed_database():
    """Seed the database with initial data"""
    try:
        # Clear existing data
        await db().products.delete_many({})
        await db().reviews.delete_many({})
        
        # Insert products
        await db().products.insert_many(SAMPLE_PRODUCTS)
        print(f"✅ Seeded {len(SAMPLE_PRODUCTS)} products")
        
        # Insert reviews
        await db().reviews.insert_many(SAMPLE_REVIEWS)
        print(f"✅ Seeded {len(SAMPLE_REVIEWS)} reviews")
        
        # Create indexes
        await db().products.create_index([("title", "text"), ("brand", "text"), ("tags", "text")])
        await db().products.create_index([("rating", -1)])
        await db().products.create_index([("created_at", -1)])
        await db().reviews.create_index([("product_id", 1)])
        
        print("✅ Database indexes created")
        print("🚀 Database seeding completed successfully!")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")

if __name__ == "__main__":
    asyncio.run(seed_database())