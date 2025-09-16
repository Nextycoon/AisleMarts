/**
 * Features Registry - Single Source of Truth
 * Every new capability auto-appears on Command Center without hunting code
 */

export type FeatureStatus = "working" | "new" | "enhanced";
export type UserRole = "user" | "merchant" | "admin";

export interface FeatureItem {
  key: string;
  label: string;
  icon: string;            // emoji or icon name
  route: string;           // expo-router route
  description: string;     // short description for tiles
  roles?: UserRole[];      // visibility control
  status?: FeatureStatus;  // visual status indicator
  enabled?: boolean;       // kill switch
  priority?: number;       // sort order (lower = higher priority)
  tags?: string[];         // e.g., ["phase3", "merchant", "b2b"] for segmentation
  experimentKey?: string;  // e.g., "home_cta_layout_v2" for A/B testing
}

export const FEATURES_REGISTRY: FeatureItem[] = [
  // Phase 1: Enhanced AI Search/Discovery
  { 
    key: "discover", 
    label: "Discover", 
    icon: "🔎", 
    route: "/discover", 
    description: "AI-powered search",
    status: "working", 
    enabled: true,
    priority: 1,
    tags: ["phase1", "core", "ai", "search"],
    experimentKey: "discover_ui_v3"
  },
  
  // Phase 3: Nearby/Onsite Commerce
  { 
    key: "nearby", 
    label: "Nearby", 
    icon: "📍", 
    route: "/nearby", 
    description: "Local commerce",
    status: "working", 
    enabled: true,
    priority: 2,
    tags: ["phase3", "core", "location", "pickup"],
    experimentKey: "nearby_map_ui_v2"
  },
  
  // Phase 2: B2B/RFQ Workflows
  { 
    key: "rfqs", 
    label: "RFQs", 
    icon: "📑", 
    route: "/b2b", 
    description: "Request quotes",
    status: "working", 
    enabled: true,
    priority: 3,
    tags: ["phase2", "b2b", "procurement", "core"],
    experimentKey: "rfq_flow_v3"
  },
  { 
    key: "quotes", 
    label: "Quotes", 
    icon: "💬", 
    route: "/b2b", 
    description: "Manage offers",
    status: "new", 
    enabled: true,
    priority: 4,
    tags: ["phase2", "b2b", "procurement", "new_feature"]
  },
  { 
    key: "purchase_orders", 
    label: "Purchase Orders", 
    icon: "🧾", 
    route: "/b2b", 
    description: "Track orders",
    status: "new", 
    enabled: true,
    priority: 5
  },
  
  // Core Commerce Features
  { 
    key: "reservations", 
    label: "Reservations", 
    icon: "🎟️", 
    route: "/nearby", 
    description: "Pickup bookings",
    status: "working", 
    enabled: true,
    priority: 6
  },
  { 
    key: "orders", 
    label: "Orders", 
    icon: "📦", 
    route: "/orders", 
    description: "Order history",
    status: "working", 
    enabled: true,
    priority: 7
  },
  { 
    key: "wallet", 
    label: "Wallet", 
    icon: "💳", 
    route: "/wallet", 
    description: "Payments & KES",
    status: "enhanced", 
    enabled: true,
    priority: 8
  },
  { 
    key: "messages", 
    label: "Messages", 
    icon: "✉️", 
    route: "/messages", 
    description: "Communications",
    status: "new", 
    enabled: true,
    priority: 9
  },
  
  // Merchant Tools (Role-restricted)
  { 
    key: "inventory_sync", 
    label: "Inventory Sync", 
    icon: "📈", 
    route: "/merchant/inventory/upload", 
    description: "Merchant tools",
    roles: ["merchant", "admin"], 
    status: "working", 
    enabled: true,
    priority: 10
  },
  { 
    key: "pickup_windows", 
    label: "Pickup Windows", 
    icon: "🗓️", 
    route: "/merchant/pickup", 
    description: "Staff management",
    roles: ["merchant", "admin"], 
    status: "working", 
    enabled: true,
    priority: 11
  },
  
  // Account & System Features
  { 
    key: "addresses", 
    label: "Addresses", 
    icon: "🏠", 
    route: "/profile", 
    description: "Delivery locations",
    status: "enhanced", 
    enabled: true,
    priority: 12
  },
  { 
    key: "language", 
    label: "Language", 
    icon: "🌍", 
    route: "/profile", 
    description: "EN / Swahili",
    status: "working", 
    enabled: true,
    priority: 13
  },
  { 
    key: "support", 
    label: "Support", 
    icon: "🛟", 
    route: "/profile", 
    description: "Help & assistance",
    status: "working", 
    enabled: true,
    priority: 14
  },
  { 
    key: "settings", 
    label: "Settings", 
    icon: "⚙️", 
    route: "/profile", 
    description: "Preferences",
    status: "working", 
    enabled: true,
    priority: 15
  }
];

// Quick Actions for Command Center Header
export const QUICK_ACTIONS = [
  { 
    key: "scan", 
    label: "Scan", 
    icon: "📷", 
    route: "/nearby/scan", 
    color: "#22d3ee" 
  },
  { 
    key: "new_rfq", 
    label: "New RFQ", 
    icon: "➕", 
    route: "/b2b", 
    color: "#a855f7" 
  },
  { 
    key: "pay", 
    label: "Pay", 
    icon: "💸", 
    route: "/wallet", 
    color: "#34c759" 
  },
];

// Utility functions
export const getVisibleFeatures = (userRoles: UserRole[] = ["user"]): FeatureItem[] => {
  return FEATURES_REGISTRY
    .filter(feature => feature.enabled !== false)
    .filter(feature => {
      if (!feature.roles) return true; // Available to all users
      return feature.roles.some(role => userRoles.includes(role));
    })
    .sort((a, b) => (a.priority || 999) - (b.priority || 999));
};

export const getFeatureByKey = (key: string): FeatureItem | undefined => {
  return FEATURES_REGISTRY.find(feature => feature.key === key);
};

export const getStatusColor = (status?: FeatureStatus): string => {
  switch (status) {
    case "working": return "#34c759";   // Green
    case "new": return "#ff9500";       // Orange  
    case "enhanced": return "#22d3ee";  // Cyan
    default: return "#9CA3AF";          // Gray
  }
};

export const getStatusText = (status?: FeatureStatus): string => {
  switch (status) {
    case "working": return "✅";
    case "new": return "NEW";
    case "enhanced": return "⚡";
    default: return "";
  }
};