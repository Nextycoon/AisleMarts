// Phase 3: Nearby/Onsite Commerce - MongoDB Indices Setup
// This script creates all required indices for the nearby commerce functionality

db = db.getSiblingDB(process.env.MONGO_DB || "aislemarts");

print("🏢 Creating indices for Phase 3: Nearby/Onsite Commerce...");

// locations collection - for geospatial queries and merchant filtering
print("📍 Creating locations indices...");
db.locations.createIndex({ geo: "2dsphere" });
db.locations.createIndex({ merchant_id: 1, status: 1 });
db.locations.createIndex({ type: 1, status: 1 });
db.locations.createIndex({ services: 1 });

// inventory_snapshots collection - for real-time inventory lookup
print("📦 Creating inventory_snapshots indices...");
db.inventory_snapshots.createIndex({ location_id: 1, sku: 1 });
db.inventory_snapshots.createIndex({ merchant_id: 1, gtin: 1 });
db.inventory_snapshots.createIndex({ updated_at: -1 });
db.inventory_snapshots.createIndex({ location_id: 1, qty: 1 });
db.inventory_snapshots.createIndex({ gtin: 1 }); // For barcode scanning

// reservations collection - for reserve & pickup functionality
print("🎟️ Creating reservations indices...");
db.reservations.createIndex({ user_id: 1, status: 1 });
db.reservations.createIndex({ hold_expires_at: 1 }, { expireAfterSeconds: 0 }); // TTL index
db.reservations.createIndex({ reference: 1 }, { unique: true });
db.reservations.createIndex({ status: 1, created_at: -1 });

// scans collection - for barcode/QR scanning analytics
print("📱 Creating scans indices...");
db.scans.createIndex({ barcode: 1 });
db.scans.createIndex({ created_at: -1 });
db.scans.createIndex({ user_id: 1, created_at: -1 });
db.scans.createIndex({ "context.location_id": 1 });

print("✅ Phase 3 indices created successfully!");
print("🔍 Collections ready for: location-based search, inventory tracking, reservations, and scanning");