#!/usr/bin/env python3
"""
AisleMarts Production Database Setup Script
Run this script after deploying to production to initialize the database with required indexes and sample data.
"""

import os
import sys
import logging
from datetime import datetime, timezone
from pymongo import MongoClient, ASCENDING, DESCENDING, TEXT
from pymongo.errors import DuplicateKeyError, OperationFailure

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def get_database_connection():
    """Establish connection to MongoDB"""
    try:
        mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
        db_name = os.environ.get('DB_NAME', 'aislemarts')
        
        client = MongoClient(mongo_url)
        # Test connection
        client.admin.command('ping')
        
        db = client[db_name]
        logger.info(f"✅ Connected to MongoDB: {db_name}")
        return db
    except Exception as e:
        logger.error(f"❌ Failed to connect to MongoDB: {e}")
        sys.exit(1)

def create_indexes(db):
    """Create database indexes for optimal performance"""
    logger.info("Creating database indexes...")
    
    try:
        # Users collection indexes
        db.users.create_index([("email", ASCENDING)], unique=True, background=True)
        db.users.create_index([("username", ASCENDING)], unique=True, background=True)
        db.users.create_index([("created_at", DESCENDING)], background=True)
        
        # Products collection indexes
        db.products.create_index([("slug", ASCENDING)], unique=True, background=True)
        db.products.create_index([("category", ASCENDING)], background=True)
        db.products.create_index([("price", ASCENDING)], background=True)
        db.products.create_index([("created_at", DESCENDING)], background=True)
        db.products.create_index([("title", TEXT), ("description", TEXT)], background=True)
        
        # Orders collection indexes
        db.orders.create_index([("user_id", ASCENDING)], background=True)
        db.orders.create_index([("status", ASCENDING)], background=True)
        db.orders.create_index([("created_at", DESCENDING)], background=True)
        db.orders.create_index([("order_number", ASCENDING)], unique=True, background=True)
        
        # RFQ collection indexes
        db.rfqs.create_index([("user_id", ASCENDING)], background=True)
        db.rfqs.create_index([("status", ASCENDING)], background=True)
        db.rfqs.create_index([("category", ASCENDING)], background=True)
        db.rfqs.create_index([("created_at", DESCENDING)], background=True)
        
        # Affiliate collection indexes
        db.affiliates.create_index([("user_id", ASCENDING)], background=True)
        db.affiliates.create_index([("status", ASCENDING)], background=True)
        db.affiliates.create_index([("created_at", DESCENDING)], background=True)
        
        # Analytics/Events collection indexes
        db.events.create_index([("user_id", ASCENDING)], background=True)
        db.events.create_index([("event_type", ASCENDING)], background=True)
        db.events.create_index([("timestamp", DESCENDING)], background=True)
        db.events.create_index([("timestamp", DESCENDING), ("user_id", ASCENDING)], background=True)
        
        # Session/Auth collection indexes
        db.sessions.create_index([("user_id", ASCENDING)], background=True)
        db.sessions.create_index([("expires_at", ASCENDING)], expireAfterSeconds=0, background=True)
        
        logger.info("✅ Database indexes created successfully")
    
    except Exception as e:
        logger.error(f"❌ Failed to create indexes: {e}")
        raise

def initialize_settings(db):
    """Initialize application settings"""
    logger.info("Initializing application settings...")
    
    try:
        settings = {
            "_id": "core",
            "app_name": "AisleMarts",
            "version": "1.0.0",
            "status": "active",
            "features": {
                "shop_enabled": True,
                "live_shopping_enabled": True,
                "b2b_rfq_enabled": True,
                "affiliate_enabled": True,
                "zero_commission_mode": True
            },
            "limits": {
                "max_products_per_user": 1000,
                "max_rfqs_per_user": 100,
                "max_affiliate_links_per_user": 50
            },
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        
        db.settings.replace_one({"_id": "core"}, settings, upsert=True)
        logger.info("✅ Application settings initialized")
    
    except Exception as e:
        logger.error(f"❌ Failed to initialize settings: {e}")
        raise

def create_sample_categories(db):
    """Create product categories"""
    logger.info("Creating product categories...")
    
    categories = [
        {"_id": "electronics", "name": "Electronics", "description": "Tech gadgets and devices", "active": True},
        {"_id": "fashion", "name": "Fashion & Apparel", "description": "Clothing and accessories", "active": True},
        {"_id": "home", "name": "Home & Garden", "description": "Home improvement and decor", "active": True},
        {"_id": "beauty", "name": "Beauty & Personal Care", "description": "Cosmetics and personal care", "active": True},
        {"_id": "sports", "name": "Sports & Outdoors", "description": "Sports equipment and outdoor gear", "active": True},
        {"_id": "books", "name": "Books & Media", "description": "Books, movies, and music", "active": True}
    ]
    
    try:
        for category in categories:
            db.categories.replace_one({"_id": category["_id"]}, category, upsert=True)
        
        logger.info(f"✅ Created {len(categories)} product categories")
    
    except Exception as e:
        logger.error(f"❌ Failed to create categories: {e}")
        raise

def verify_setup(db):
    """Verify the database setup"""
    logger.info("Verifying database setup...")
    
    try:
        # Check collections
        collections = db.list_collection_names()
        expected_collections = ['users', 'products', 'orders', 'categories', 'settings']
        
        for collection in expected_collections:
            if collection in collections:
                count = db[collection].estimated_document_count()
                logger.info(f"✅ Collection '{collection}': {count} documents")
            else:
                logger.warning(f"⚠️ Collection '{collection}' not found")
        
        # Check indexes
        user_indexes = list(db.users.list_indexes())
        product_indexes = list(db.products.list_indexes())
        
        logger.info(f"✅ Users collection has {len(user_indexes)} indexes")
        logger.info(f"✅ Products collection has {len(product_indexes)} indexes")
        
        # Test settings
        settings = db.settings.find_one({"_id": "core"})
        if settings:
            logger.info(f"✅ Settings initialized: {settings['app_name']} v{settings['version']}")
        else:
            logger.warning("⚠️ Settings not found")
    
    except Exception as e:
        logger.error(f"❌ Verification failed: {e}")
        raise

def main():
    """Main setup function"""
    logger.info("🚀 Starting AisleMarts production database setup...")
    
    try:
        # Connect to database
        db = get_database_connection()
        
        # Create indexes
        create_indexes(db)
        
        # Initialize settings
        initialize_settings(db)
        
        # Create categories
        create_sample_categories(db)
        
        # Verify setup
        verify_setup(db)
        
        logger.info("🎉 Production database setup completed successfully!")
        
    except Exception as e:
        logger.error(f"💥 Setup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()