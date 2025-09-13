import asyncio
from datetime import datetime
import uuid
from geographic_service import geographic_service
from db import db

async def seed_geographic_data():
    """Seed geographic data and create sample visibility settings"""
    print("🌍 Seeding Geographic Data...")
    
    try:
        # Initialize countries and cities
        print("📍 Initializing world cities and countries...")
        result = await geographic_service.initialize_geographic_data()
        print(f"✅ Geographic initialization: {result}")
        
        # First, create some sample vendors if they don't exist
        print("🏢 Creating sample vendors...")
        
        # Get admin user
        admin_user = await db().users.find_one({"email": "admin@aislemarts.com"})
        if not admin_user:
            print("❌ Admin user not found, creating one...")
            admin_user_id = str(uuid.uuid4())
            admin_user = {
                "_id": admin_user_id,
                "email": "admin@aislemarts.com",
                "name": "Admin User",
                "roles": ["user", "admin"],
                "created_at": datetime.utcnow()
            }
            await db().users.insert_one(admin_user)
        
        # Create sample vendors
        sample_vendors = [
            {
                "_id": str(uuid.uuid4()),
                "userIdOwner": str(admin_user["_id"]),
                "legalName": "AudioTech Global Inc.",
                "kycDocs": [],
                "verifiedAt": datetime.utcnow(),
                "badge": "verified",
                "warehouses": [],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "_id": str(uuid.uuid4()),
                "userIdOwner": str(admin_user["_id"]),
                "legalName": "EcoWear Fashion Co.",
                "kycDocs": [],
                "verifiedAt": datetime.utcnow(),
                "badge": "eco_friendly",
                "warehouses": [],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "_id": str(uuid.uuid4()),
                "userIdOwner": str(admin_user["_id"]),
                "legalName": "SmartHome Solutions LLC",
                "kycDocs": [],
                "verifiedAt": datetime.utcnow(),
                "badge": "tech_innovator",
                "warehouses": [],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "_id": str(uuid.uuid4()),
                "userIdOwner": str(admin_user["_id"]),
                "legalName": "Global Crafters Ltd.",
                "kycDocs": [],
                "verifiedAt": datetime.utcnow(),
                "badge": "artisan",
                "warehouses": [],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        ]
        
        for vendor_data in sample_vendors:
            existing = await db().vendors.find_one({"legalName": vendor_data["legalName"]})
            if not existing:
                await db().vendors.insert_one(vendor_data)
                print(f"✅ Created vendor: {vendor_data['legalName']}")
        
        # Create some sample products for these vendors
        print("📦 Creating sample products for vendors...")
        vendors_cursor = db().vendors.find({})
        vendors = await vendors_cursor.to_list(length=10)
        
        for vendor in vendors:
            vendor_id = str(vendor["_id"])
            
            # Create 2-3 products per vendor
            sample_products = []
            if "AudioTech" in vendor.get("legalName", ""):
                sample_products = [
                    {
                        "_id": str(uuid.uuid4()),
                        "vendorId": vendor_id,
                        "title": "Professional Noise-Cancelling Headphones",
                        "slug": "professional-headphones-audiotech",
                        "description": "Premium wireless headphones with advanced noise cancellation",
                        "price": 299.99,
                        "currency": "USD",
                        "images": ["data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjBmMGYwIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNDAiIGZpbGw9IiMzMzMiLz4KPHRLEHUGEQ9InQgaWQ9InRleHQiIGZpbGw9IiM2NjYiPgogIDx0c3BhbiB4PSIxMDAiIHk9IjEwNSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+OuTwvdHNwYW4+CjwvdGV4dD4KPC9zdmc+Cg=="],
                        "brand": "AudioTech",
                        "attributes": {"type": "headphones", "wireless": "true", "noise_cancelling": "true"},
                        "stock": 50,
                        "active": True,
                        "created_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow()
                    }
                ]
            elif "EcoWear" in vendor.get("legalName", ""):
                sample_products = [
                    {
                        "_id": str(uuid.uuid4()),
                        "vendorId": vendor_id,
                        "title": "Sustainable Organic Cotton T-Shirt",
                        "slug": "organic-tshirt-ecowear",
                        "description": "100% organic cotton t-shirt made with sustainable practices",
                        "price": 34.99,
                        "currency": "USD",
                        "images": ["data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjBmMGYwIi8+CjxyZWN0IHg9IjYwIiB5PSI0MCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iIzMzNyIvPgo8dGV4dCBpZD0idGV4dCIgZmlsbD0iIzY2NiI+CiAgPHRzcGFuIHg9IjEwMCIgeT0iMTA1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5SWPC90c3Bhbj4KPC90ZXh0Pgo8L3N2Zz4K"],
                        "brand": "EcoWear",
                        "attributes": {"material": "organic_cotton", "sustainability": "eco_friendly"},
                        "stock": 100,
                        "active": True,
                        "created_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow()
                    }
                ]
            
            for product in sample_products:
                existing = await db().products.find_one({"slug": product["slug"]})
                if not existing:
                    await db().products.insert_one(product)
        
        # Create sample seller visibility settings for existing vendors
        print("🎯 Creating sample seller visibility settings...")
        
        vendors_cursor = db().vendors.find({})
        vendors = await vendors_cursor.to_list(length=10)
        
        for vendor in vendors:
            vendor_id = str(vendor["_id"])
            
            # Create different visibility types for different vendors
            if "AudioTech" in vendor.get("legalName", ""):
                # Global tech company - global visibility
                visibility_config = {
                    "visibility_type": "global_strategic",
                    "target_countries": ["US", "GB", "JP", "DE", "AU", "CA"],
                    "target_cities": [
                        "city_new_york_US",
                        "city_london_GB", 
                        "city_tokyo_JP",
                        "city_sydney_AU"
                    ],
                    "auto_expand": True,
                    "budget_daily_usd": 500.0,
                    "performance_threshold": 0.03
                }
                print(f"✅ Created global strategic visibility for {vendor.get('legalName')}")
                
            elif "EcoWear" in vendor.get("legalName", ""):
                # Fashion brand - national + select international
                visibility_config = {
                    "visibility_type": "national",
                    "target_countries": ["US", "CA"],
                    "auto_expand": True,
                    "budget_daily_usd": 200.0,
                    "performance_threshold": 0.025
                }
                print(f"✅ Created national visibility for {vendor.get('legalName')}")
                
            elif "SmartHome" in vendor.get("legalName", ""):
                # Local smart home company expanding
                visibility_config = {
                    "visibility_type": "local",
                    "local_center_city_id": "city_new_york_US",
                    "local_radius_km": 100.0,
                    "auto_expand": True,
                    "budget_daily_usd": 100.0,
                    "performance_threshold": 0.02
                }
                print(f"✅ Created local visibility for {vendor.get('legalName')}")
                
            else:
                # Default: national visibility
                visibility_config = {
                    "visibility_type": "national",
                    "target_countries": ["US"],
                    "auto_expand": False,
                    "budget_daily_usd": 50.0,
                    "performance_threshold": 0.02
                }
                print(f"✅ Created default national visibility for {vendor_id}")
            
            # Create visibility settings
            await geographic_service.create_seller_visibility(vendor_id, visibility_config)
        
        # Create sample performance data
        print("📊 Creating sample geographic performance data...")
        
        sample_countries = ["US", "GB", "JP", "CA", "AU", "DE", "FR"]
        sample_cities = [
            "city_new_york_US",
            "city_london_GB",
            "city_tokyo_JP",
            "city_paris_FR",
            "city_sydney_AU"
        ]
        
        # Generate performance data for the last 30 days
        import random
        
        for vendor in vendors[:3]:  # Only for first 3 vendors
            vendor_id = str(vendor["_id"])
            
            # Get vendor's products
            products_cursor = db().products.find({"vendorId": vendor_id})
            products = await products_cursor.to_list(length=5)
            
            for product in products:
                product_id = str(product["_id"])
                
                # Create performance data for different countries
                for country in sample_countries[:4]:  # Limit to 4 countries
                    for day_offset in range(0, 30, 3):  # Every 3 days
                        # Generate realistic performance metrics
                        impressions = random.randint(50, 500)
                        clicks = random.randint(1, impressions // 10)
                        conversions = random.randint(0, clicks // 20)
                        revenue = conversions * random.uniform(10, 200)
                        
                        await geographic_service.track_geographic_performance(
                            vendor_id,
                            product_id,
                            country,
                            random.choice(sample_cities) if random.random() > 0.5 else None,
                            "view",
                            0
                        )
                        
                        # Add some clicks and conversions
                        for _ in range(clicks):
                            await geographic_service.track_geographic_performance(
                                vendor_id,
                                product_id,
                                country,
                                None,
                                "click",
                                0
                            )
                        
                        for _ in range(conversions):
                            await geographic_service.track_geographic_performance(
                                vendor_id,
                                product_id,
                                country,
                                None,
                                "conversion",
                                revenue / conversions if conversions > 0 else 0
                            )
        
        print("✅ Sample performance data created")
        
        # Test AI recommendations
        print("🤖 Testing AI geographic recommendations...")
        for vendor in vendors[:2]:  # Test for first 2 vendors
            vendor_id = str(vendor["_id"])
            products_cursor = db().products.find({"vendorId": vendor_id})
            products = await products_cursor.to_list(length=3)
            
            recommendations = await geographic_service.get_ai_targeting_recommendations(
                vendor_id, 
                products
            )
            print(f"✅ Generated {len(recommendations)} AI recommendations for vendor {vendor_id}")
        
        print("\n🎉 Geographic data seeding completed successfully!")
        print("\n📊 Summary:")
        
        # Print summary stats
        countries_count = await db().countries.count_documents({"active": True})
        cities_count = await db().cities.count_documents({})
        visibility_count = await db().seller_visibility.count_documents({"active": True})
        performance_count = await db().geographic_performance.count_documents({})
        
        print(f"   📍 Countries: {countries_count}")
        print(f"   🏙️  Cities: {cities_count}")
        print(f"   🎯 Seller Visibility Settings: {visibility_count}")
        print(f"   📈 Performance Records: {performance_count}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error seeding geographic data: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    asyncio.run(seed_geographic_data())