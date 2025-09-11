import asyncio
from datetime import datetime
import uuid
from passlib.hash import bcrypt
from db import db

async def create_text_indexes():
    """Create text indexes for search functionality"""
    try:
        await db().products.create_index([
            ("title", "text"), 
            ("description", "text"), 
            ("brand", "text")
        ])
        print("✅ Text indexes created")
    except Exception as e:
        print(f"ℹ️  Text indexes might already exist: {e}")

async def seed_users():
    """Create demo users"""
    users = [
        {
            "_id": str(uuid.uuid4()),
            "email": "admin@aislemarts.com",
            "name": "Admin User",
            "password_hash": bcrypt.hash("password123"),
            "roles": ["user", "admin"],
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "email": "vendor@aislemarts.com", 
            "name": "Vendor User",
            "password_hash": bcrypt.hash("password123"),
            "roles": ["user", "vendor"],
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "email": "buyer@aislemarts.com",
            "name": "Buyer User", 
            "password_hash": bcrypt.hash("password123"),
            "roles": ["user"],
            "created_at": datetime.utcnow()
        }
    ]
    
    for user in users:
        existing = await db().users.find_one({"email": user["email"]})
        if not existing:
            await db().users.insert_one(user)
            print(f"✅ Created user: {user['email']}")
        else:
            print(f"ℹ️  User already exists: {user['email']}")

async def seed_categories():
    """Create demo categories"""
    categories = [
        {
            "_id": str(uuid.uuid4()),
            "name": "Electronics",
            "slug": "electronics",
            "description": "Electronic devices and gadgets",
            "parent_id": None,
            "active": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": "Fashion",
            "slug": "fashion", 
            "description": "Clothing and accessories",
            "parent_id": None,
            "active": True,
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": "Home & Garden",
            "slug": "home-garden",
            "description": "Home and garden products",
            "parent_id": None,
            "active": True,
            "created_at": datetime.utcnow()
        }
    ]
    
    for category in categories:
        existing = await db().categories.find_one({"slug": category["slug"]})
        if not existing:
            await db().categories.insert_one(category)
            print(f"✅ Created category: {category['name']}")
        else:
            print(f"ℹ️  Category already exists: {category['name']}")

async def seed_products():
    """Create demo products"""
    # Get category IDs
    electronics = await db().categories.find_one({"slug": "electronics"})
    fashion = await db().categories.find_one({"slug": "fashion"})
    home = await db().categories.find_one({"slug": "home-garden"})
    
    products = [
        {
            "_id": str(uuid.uuid4()),
            "title": "Wireless Bluetooth Headphones",
            "slug": "wireless-bluetooth-headphones",
            "description": "High-quality wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.",
            "price": 129.99,
            "currency": "USD",
            "images": ["data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjBmMGYwIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNDAiIGZpbGw9IiMzMzMiLz4KPHRLEHUGEQ9InQgaWQ9InRleHQiIGZpbGw9IiM2NjYiPgogIDx0c3BhbiB4PSIxMDAiIHk9IjEwNSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+OudCGPC90c3Bhbj4KPC90ZXh0Pgo8L3N2Zz4K"],
            "category_id": electronics["_id"] if electronics else None,
            "brand": "AudioTech",
            "attributes": {"color": "Black", "wireless": "Yes", "battery": "30 hours"},
            "stock": 50,
            "active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "title": "Organic Cotton T-Shirt",
            "slug": "organic-cotton-tshirt",
            "description": "Comfortable and sustainable organic cotton t-shirt. Available in multiple colors and sizes.",
            "price": 24.99,
            "currency": "USD", 
            "images": ["data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjBmMGYwIi8+CjxyZWN0IHg9IjYwIiB5PSI0MCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iIzMzNyIvPgo8dGV4dCBpZD0idGV4dCIgZmlsbD0iIzY2NiI+CiAgPHRzcGFuIHg9IjEwMCIgeT0iMTA1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5SWPC90c3Bhbj4KPC90ZXh0Pgo8L3N2Zz4K"],
            "category_id": fashion["_id"] if fashion else None,
            "brand": "EcoWear",
            "attributes": {"material": "Organic Cotton", "color": "Blue", "size": "M"},
            "stock": 100,
            "active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "title": "Smart Home LED Bulb Set",
            "slug": "smart-home-led-bulb-set",
            "description": "WiFi-enabled smart LED bulbs with 16 million colors. Control with your smartphone or voice commands.",
            "price": 79.99,
            "currency": "USD",
            "images": ["data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjBmMGYwIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSIzMCIgZmlsbD0iI2ZmZjIwMCIvPgo8cmVjdCB4PSI5NSIgeT0iMTEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMzAiIGZpbGw9IiM2NjYiLz4KPHRLEHUGEQ9InQgaWQ9InRleHQiIGZpbGw9IiM2NjYiPgogIDx0c3BhbiB4PSIxMDAiIHk9IjE2NSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+klTA8L3RzcGFuPgo8L3RleHQ+Cjwvc3ZnPgo="],
            "category_id": home["_id"] if home else None,
            "brand": "SmartHome",
            "attributes": {"connectivity": "WiFi", "colors": "16 million", "pack": "4 bulbs"},
            "stock": 30,
            "active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "title": "Leather Laptop Bag",
            "slug": "leather-laptop-bag",
            "description": "Premium leather laptop bag with multiple compartments. Fits laptops up to 15 inches.",
            "price": 89.99,
            "currency": "USD",
            "images": ["data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjBmMGYwIi8+CjxyZWN0IHg9IjQwIiB5PSI2MCIgd2lkdGg9IjEyMCIgaGVpZ2h0PSI4MCIgZmlsbD0iIzhhNGEyYyIvPgo8Y2lyY2xlIGN4PSI1MCIgY3k9IjEwMCIgcj0iNiIgZmlsbD0iIzMzMyIvPgo8dGV4dCBpZD0idGV4dCIgZmlsbD0iIzY2NiI+CiAgPHRzcGFuIHg9IjEwMCIgeT0iMTY1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5SCPC90c3Bhbj4KPC90ZXh0Pgo8L3N2Zz4K"],
            "category_id": fashion["_id"] if fashion else None,
            "brand": "Crafted",
            "attributes": {"material": "Genuine Leather", "color": "Brown", "size": "15 inch"},
            "stock": 25,
            "active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "title": "Ceramic Coffee Mug Set",
            "slug": "ceramic-coffee-mug-set",
            "description": "Set of 4 handcrafted ceramic coffee mugs. Perfect for your morning coffee ritual.",
            "price": 39.99,
            "currency": "USD",
            "images": ["data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjBmMGYwIi8+CjxyZWN0IHg9IjcwIiB5PSI4MCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjQwIiByeD0iNSIgZmlsbD0iI2VlZSIvPgo8cmVjdCB4PSIxMjAiIHk9IjkwIiB3aWR0aD0iMTUiIGhlaWdodD0iMjAiIHJ4PSI1IiBmaWxsPSIjZGRkIi8+Cjx0ZXh0IGlkPSJ0ZXh0IiBmaWxsPSIjNjY2Ij4KICA8dHNwYW4geD0iMTAwIiB5PSIxNjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuKYlTwvdHNwYW4+CjwvdGV4dD4KPC9zdmc+Cg=="],
            "category_id": home["_id"] if home else None,
            "brand": "HomeEssentials",
            "attributes": {"material": "Ceramic", "set": "4 mugs", "dishwasher_safe": "Yes"},
            "stock": 40,
            "active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    for product in products:
        existing = await db().products.find_one({"slug": product["slug"]})
        if not existing:
            await db().products.insert_one(product)
            print(f"✅ Created product: {product['title']}")
        else:
            print(f"ℹ️  Product already exists: {product['title']}")

async def main():
    print("🌱 Seeding AisleMarts database...")
    
    await create_text_indexes()
    await seed_users()
    await seed_categories()
    await seed_products()
    
    print("\n✅ Database seeded successfully!")
    print("\n📝 Demo credentials:")
    print("Admin: admin@aislemarts.com / password123")
    print("Vendor: vendor@aislemarts.com / password123") 
    print("Buyer: buyer@aislemarts.com / password123")

if __name__ == "__main__":
    asyncio.run(main())