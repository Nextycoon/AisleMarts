// Phase 3: Nearby/Onsite Commerce - Nairobi Sample Data
// This script seeds sample locations and inventory for testing in Nairobi, Kenya

db = db.getSiblingDB(process.env.MONGO_DB || "aislemarts");

print("🇰🇪 Seeding Nairobi sample data for Phase 3...");

// Clear existing data (for development)
print("🧹 Clearing existing nearby data...");
db.locations.deleteMany({});
db.inventory_snapshots.deleteMany({});
db.reservations.deleteMany({});
db.scans.deleteMany({});

// Insert Nairobi sample locations
print("📍 Creating sample locations in Nairobi...");

const westlands = {
    _id: "LOC-WESTLANDS-001",
    merchant_id: "MRC-0001",
    name: "AisleMarts Express - Westlands",
    type: "retail",
    geo: { type: "Point", coordinates: [36.8065, -1.2685] }, // Westlands, Nairobi
    address: { 
        line1: "Waiyaki Way, ABC Place",
        city: "Nairobi", 
        region: "Nairobi", 
        country: "KE",
        postal_code: "00800"
    },
    opening_hours: [
        { dow: 1, open: "08:00", close: "20:00" }, // Monday
        { dow: 2, open: "08:00", close: "20:00" }, // Tuesday
        { dow: 3, open: "08:00", close: "20:00" }, // Wednesday
        { dow: 4, open: "08:00", close: "20:00" }, // Thursday
        { dow: 5, open: "08:00", close: "20:00" }, // Friday
        { dow: 6, open: "09:00", close: "18:00" }, // Saturday
        { dow: 0, open: "10:00", close: "16:00" }  // Sunday
    ],
    services: ["pickup", "scan", "onsite_payment"],
    capabilities: { rfq_counter: true, cash_pickup: true, mpesa_payment: true },
    status: "active",
    updated_at: new Date().toISOString()
};

const kilimani = {
    _id: "LOC-KILIMANI-001", 
    merchant_id: "MRC-0002",
    name: "TechHub Kilimani",
    type: "wholesale",
    geo: { type: "Point", coordinates: [36.7817, -1.2941] }, // Kilimani, Nairobi
    address: {
        line1: "Argwings Kodhek Road",
        city: "Nairobi",
        region: "Nairobi", 
        country: "KE",
        postal_code: "00100"
    },
    opening_hours: [
        { dow: 1, open: "07:30", close: "19:00" },
        { dow: 2, open: "07:30", close: "19:00" },
        { dow: 3, open: "07:30", close: "19:00" },
        { dow: 4, open: "07:30", close: "19:00" },
        { dow: 5, open: "07:30", close: "19:00" },
        { dow: 6, open: "08:00", close: "17:00" }
    ],
    services: ["pickup", "scan", "rfq_counter"],
    capabilities: { rfq_counter: true, bulk_orders: true, b2b_pricing: true },
    status: "active",
    updated_at: new Date().toISOString()
};

const karen = {
    _id: "LOC-KAREN-001",
    merchant_id: "MRC-0003", 
    name: "Karen Shopping Centre - AisleMarts",
    type: "retail",
    geo: { type: "Point", coordinates: [36.6844, -1.3194] }, // Karen, Nairobi
    address: {
        line1: "Karen Road, Karen Shopping Centre",
        city: "Nairobi",
        region: "Nairobi",
        country: "KE", 
        postal_code: "00502"
    },
    opening_hours: [
        { dow: 1, open: "09:00", close: "21:00" },
        { dow: 2, open: "09:00", close: "21:00" },
        { dow: 3, open: "09:00", close: "21:00" },
        { dow: 4, open: "09:00", close: "21:00" },
        { dow: 5, open: "09:00", close: "21:00" },
        { dow: 6, open: "09:00", close: "21:00" },
        { dow: 0, open: "10:00", close: "20:00" }
    ],
    services: ["pickup", "scan", "onsite_payment"],
    capabilities: { rfq_counter: false, cash_pickup: true, mpesa_payment: true },
    status: "active",
    updated_at: new Date().toISOString()
};

db.locations.insertMany([westlands, kilimani, karen]);

// Insert sample inventory for these locations
print("📦 Creating sample inventory...");

const inventory = [
    // Westlands inventory
    {
        _id: "INV-WEST-001",
        merchant_id: "MRC-0001",
        location_id: "LOC-WESTLANDS-001",
        sku: "SKU-PIXEL7-128",
        gtin: "0840244706610",
        qty: 7,
        price: { amount: 84999, currency: "KES" },
        attributes: { color: "black", storage: "128GB", condition: "new" },
        updated_at: new Date().toISOString(),
        source: "pos"
    },
    {
        _id: "INV-WEST-002",
        merchant_id: "MRC-0001", 
        location_id: "LOC-WESTLANDS-001",
        sku: "SKU-AIRPODS-PRO",
        gtin: "0194252721087",
        qty: 12,
        price: { amount: 32999, currency: "KES" },
        attributes: { color: "white", type: "wireless", condition: "new" },
        updated_at: new Date().toISOString(),
        source: "pos"
    },
    {
        _id: "INV-WEST-003",
        merchant_id: "MRC-0001",
        location_id: "LOC-WESTLANDS-001", 
        sku: "SKU-SAMSUNG-S23",
        gtin: "8806094759853",
        qty: 4,
        price: { amount: 79999, currency: "KES" },
        attributes: { color: "phantom black", storage: "256GB", condition: "new" },
        updated_at: new Date().toISOString(),
        source: "pos"
    },
    
    // Kilimani (wholesale) inventory
    {
        _id: "INV-KILI-001",
        merchant_id: "MRC-0002",
        location_id: "LOC-KILIMANI-001",
        sku: "SKU-PIXEL7-128-BULK",
        gtin: "0840244706610",
        qty: 50,
        price: { amount: 78999, currency: "KES" }, // Wholesale price
        attributes: { color: "black", storage: "128GB", condition: "new", min_order: 5 },
        updated_at: new Date().toISOString(),
        source: "erp"
    },
    {
        _id: "INV-KILI-002",
        merchant_id: "MRC-0002",
        location_id: "LOC-KILIMANI-001",
        sku: "SKU-LAPTOP-DELL-BULK", 
        gtin: "0884116317890",
        qty: 25,
        price: { amount: 65999, currency: "KES" },
        attributes: { brand: "Dell", model: "Inspiron 15", ram: "8GB", condition: "new", min_order: 2 },
        updated_at: new Date().toISOString(),
        source: "erp"
    },
    
    // Karen inventory
    {
        _id: "INV-KAREN-001",
        merchant_id: "MRC-0003",
        location_id: "LOC-KAREN-001",
        sku: "SKU-IPHONE-14",
        gtin: "0194253397751", 
        qty: 8,
        price: { amount: 119999, currency: "KES" },
        attributes: { color: "blue", storage: "128GB", condition: "new" },
        updated_at: new Date().toISOString(),
        source: "pos"
    },
    {
        _id: "INV-KAREN-002",
        merchant_id: "MRC-0003", 
        location_id: "LOC-KAREN-001",
        sku: "SKU-COFFEE-BEANS-KE",
        gtin: "2540001234567",
        qty: 20,
        price: { amount: 1299, currency: "KES" },
        attributes: { origin: "Kenya AA", weight: "250g", roast: "medium", condition: "new" },
        updated_at: new Date().toISOString(),
        source: "manual"
    }
];

db.inventory_snapshots.insertMany(inventory);

print("✅ Nairobi sample data seeded successfully!");
print(`📍 Created ${westlands ? 3 : 0} locations: Westlands, Kilimani, Karen`); 
print(`📦 Created ${inventory.length} inventory items across all locations`);
print("🏪 Ready for nearby search, reserve & pickup testing in Nairobi!");