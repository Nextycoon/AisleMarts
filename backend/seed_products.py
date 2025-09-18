# seed_products.py
"""
Usage:
  export MONGO_URI="mongodb://localhost:27017"
  export MONGO_DB="aislemarts"
  python seed_products.py
"""
import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

CATALOG = [
    # LUXURY (4)
    {"id":"lm001","title":"Aurum Chrono S (24k Bezel)","brand":"Aurum","price":12999.0,"badges":"Luxury",
     "thumb":"https://images.unsplash.com/photo-1518546305927-5a555bb7020d"},
    {"id":"lm002","title":"Velour Atelier Tote","brand":"Velour","price":2490.0,"badges":"Luxury",
     "thumb":"https://images.unsplash.com/photo-1540575467063-178a50c2df87"},
    {"id":"lm003","title":"Monarch Silk Scarf","brand":"Monarch","price":620.0,"badges":"Luxury",
     "thumb":"https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb"},
    {"id":"lm004","title":"Crown Oxford Leather Loafers","brand":"Crown","price":980.0,"badges":"Luxury",
     "thumb":"https://images.unsplash.com/photo-1543322748-33df6d3db806"},

    # TRENDING (4)
    {"id":"tr101","title":"Nova Street Runner V2","brand":"Nova","price":189.0,"badges":"Trending",
     "thumb":"https://images.unsplash.com/photo-1542293787938-c9e299b88054"},
    {"id":"tr102","title":"Halo Active Hoodie","brand":"Halo","price":129.0,"badges":"Trending",
     "thumb":"https://images.unsplash.com/photo-1520975922219-3b2c6a4b3ec0"},
    {"id":"tr103","title":"Pulse Smart Shades","brand":"Pulse","price":229.0,"badges":"Trending",
     "thumb":"https://images.unsplash.com/photo-1511497584788-876760111969"},
    {"id":"tr104","title":"Echo Mini Sling Bag","brand":"Echo","price":89.0,"badges":"Trending",
     "thumb":"https://images.unsplash.com/photo-1547949003-9792a18a2601"},

    # DEALS (4)
    {"id":"dl201","title":"Cascade Insulated Bottle (2-pack)","brand":"Cascade","price":34.0,"badges":"Deal",
     "thumb":"https://images.unsplash.com/photo-1517705008128-361805f42e86"},
    {"id":"dl202","title":"Drift Wireless Buds","brand":"Drift","price":49.0,"badges":"Deal",
     "thumb":"https://images.unsplash.com/photo-1518441982127-9e9b7a4a3b38"},
    {"id":"dl203","title":"Orbit Travel Pouch","brand":"Orbit","price":19.0,"badges":"Deal",
     "thumb":"https://images.unsplash.com/photo-1582582429416-60263f9e2f98"},
    {"id":"dl204","title":"Glow Dopp Kit","brand":"Glow","price":24.0,"badges":"Deal",
     "thumb":"https://images.unsplash.com/photo-1609741192231-8f2d9d1ed1a1"},
]

async def main():
    uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    dbname = os.getenv("MONGO_DB", "aislemarts")
    client = AsyncIOMotorClient(uri, uuidRepresentation="standard")
    db = client[dbname]

    # Indexes for speed & search
    await db.products.create_index("id", unique=True)
    await db.products.create_index([("title", 1)])
    await db.products.create_index([("brand", 1)])
    await db.products.create_index([("badges", 1)])
    await db.products.create_index([("price", 1)])

    # Upsert catalog
    for p in CATALOG:
        await db.products.update_one({"id": p["id"]}, {"$set": p}, upsert=True)

    # Simple collections cache (by badge)
    luxury = [p for p in CATALOG if p["badges"] == "Luxury"]
    trending = [p for p in CATALOG if p["badges"] == "Trending"]
    deal = [p for p in CATALOG if p["badges"] == "Deal"]

    await db.meta.update_one({"_id":"collections"},
                             {"$set":{"Luxury":luxury,"Trending":trending,"Deal":deal}},
                             upsert=True)

    print(f"Seed complete → {len(CATALOG)} products into {dbname}.")
    client.close()

if __name__ == "__main__":
    asyncio.run(main())