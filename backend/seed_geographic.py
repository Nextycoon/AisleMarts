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