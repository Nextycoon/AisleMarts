// 🚀💎 COMPLETE API INTERFACES & TYPESCRIPT DEFINITIONS
// BlueWave AisleMarts - TikTok-Grade Family-Safe Commerce Platform
// Generated from validated backend implementation

// =============================================================================
// SHARED TYPES & INTERFACES
// =============================================================================

export interface BaseResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = any> extends BaseResponse<T> {
  cursor?: string;
  next_cursor?: string;
  has_more: boolean;
  total_count?: number;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  exchange_rate: number;
}

export interface Price {
  amount: number;
  currency: string;
  display: string;
  dual_display?: {
    primary: string;
    secondary: string;
  };
}

export interface FamilySafetyInfo {
  family_safe: boolean;
  age_rating: 'all_ages' | '13+' | '18+';
  safety_score: number;
  policy_flags: string[];
  moderation_status: 'approved' | 'pending' | 'rejected';
}

export interface CreatorInfo {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  verified: boolean;
  follower_count: number;
  following_count: number;
  trust_score: number;
}

export interface ProductInfo {
  id: string;
  title: string;
  description: string;
  price: Price;
  images: string[];
  variants?: ProductVariant[];
  stock_count: number;
  seller: CreatorInfo;
  safety: FamilySafetyInfo;
}

export interface ProductVariant {
  id: string;
  name: string;
  values: string[];
  price_adjustment?: number;
  stock_count: number;
}

// =============================================================================
// MODULE 1: EXPLORE & DISCOVERY INTERFACES
// =============================================================================

export namespace ExploreAPI {
  // Grid Content Item
  export interface ExploreItem {
    id: string;
    type: 'product' | 'creator' | 'hashtag' | 'live_stream';
    title: string;
    subtitle?: string;
    media_url: string;
    thumbnail_url?: string;
    creator: CreatorInfo;
    price?: Price;
    stats: {
      views: number;
      likes: number;
      saves: number;
      shares: number;
    };
    safety: FamilySafetyInfo;
    badges: string[];
    trending_score?: number;
  }

  // Grid Response
  export interface ExploreGridResponse extends PaginatedResponse<ExploreItem[]> {
    recommendation_signals: {
      personalization_strength: number;
      location_influence: number;
      trending_weight: number;
      safety_filtering_active: boolean;
    };
    filters_applied: ExploreFilters;
  }

  // Search Filters
  export interface ExploreFilters {
    category?: string[];
    price_range?: {
      min: number;
      max: number;
      currency: string;
    };
    location?: {
      lat: number;
      lng: number;
      radius_km: number;
    };
    rating_min?: number;
    family_safe_only?: boolean;
    age_rating?: 'all_ages' | '13+' | '18+';
    sort_by?: 'relevance' | 'trending' | 'price_low' | 'price_high' | 'newest' | 'rating';
  }

  // Trending Items
  export interface TrendingItem {
    id: string;
    type: 'hashtag' | 'sound' | 'creator' | 'product';
    title: string;
    usage_count: number;
    growth_rate: number;
    time_period: '1h' | '24h' | '7d' | '30d';
    momentum_score: number;
    safety: FamilySafetyInfo;
  }

  export interface TrendingResponse extends BaseResponse<TrendingItem[]> {
    trending_algorithm: {
      signals: string[];
      time_decay_factor: number;
      safety_boost: number;
    };
  }

  // Search Response
  export interface SearchResponse extends PaginatedResponse<ExploreItem[]> {
    query: string;
    search_time_ms: number;
    total_results: number;
    spell_correction?: string;
    filters_applied: ExploreFilters;
    search_suggestions: string[];
  }

  // API Endpoints
  export interface ExploreEndpoints {
    getGrid: (params: {
      cursor?: string;
      limit?: number;
      filters?: ExploreFilters;
      user_id?: string;
      locale?: string;
      currency?: string;
    }) => Promise<ExploreGridResponse>;

    getTrending: (params: {
      category?: string;
      time_period?: '1h' | '24h' | '7d' | '30d';
      family_safe_only?: boolean;
      limit?: number;
    }) => Promise<TrendingResponse>;

    getNearby: (params: {
      lat: number;
      lng: number;
      radius_km?: number;
      limit?: number;
      category?: string;
    }) => Promise<ExploreGridResponse>;

    getDeals: (params: {
      cursor?: string;
      limit?: number;
      category?: string;
      discount_min?: number;
    }) => Promise<ExploreGridResponse>;

    search: (params: {
      query: string;
      filters?: ExploreFilters;
      cursor?: string;
      limit?: number;
    }) => Promise<SearchResponse>;

    getTrendingHashtags: (params: {
      limit?: number;
      time_period?: '1h' | '24h' | '7d';
    }) => Promise<BaseResponse<TrendingItem[]>>;

    getTrendingCreators: (params: {
      limit?: number;
      category?: string;
      location_bias?: boolean;
    }) => Promise<BaseResponse<TrendingItem[]>>;
  }
}

// =============================================================================
// MODULE 2: LIVE COMMERCE INTERFACES
// =============================================================================

export namespace LiveAPI {
  // Live Stream Info
  export interface LiveStream {
    id: string;
    title: string;
    description: string;
    creator: CreatorInfo;
    stream_url: string;
    thumbnail_url: string;
    status: 'starting' | 'live' | 'ended' | 'paused';
    started_at: string;
    scheduled_for?: string;
    viewer_count: number;
    peak_viewers: number;
    duration_seconds: number;
    safety: FamilySafetyInfo;
    monetization: {
      tips_enabled: boolean;
      products_enabled: boolean;
      affiliate_enabled: boolean;
    };
  }

  // Pinned Product
  export interface PinnedProduct {
    id: string;
    product: ProductInfo;
    pinned_at: string;
    display_duration_seconds?: number;
    position: {
      x: number;
      y: number;
    };
    promotion?: {
      type: 'discount' | 'limited_time' | 'exclusive';
      value: number;
      expires_at: string;
    };
  }

  // Live Chat Message
  export interface LiveChatMessage {
    id: string;
    user_id: string;
    username: string;
    message: string;
    timestamp: string;
    type: 'message' | 'system' | 'tip' | 'product_mention';
    moderation: {
      approved: boolean;
      flagged: boolean;
      auto_moderated: boolean;
    };
    safety: FamilySafetyInfo;
  }

  // Live Stats
  export interface LiveStats {
    stream_id: string;
    current_viewers: number;
    peak_viewers: number;
    total_unique_viewers: number;
    average_watch_time_seconds: number;
    chat_messages: number;
    hearts_received: number;
    tips_received: {
      count: number;
      total_value: Price;
    };
    products_sold: number;
    revenue: Price;
    engagement_rate: number;
  }

  // Live Event (WebSocket)
  export interface LiveEvent {
    type: 'PIN' | 'UNPIN' | 'PROMO' | 'SOLD' | 'POLL' | 'CHAT_MOD' | 'HEART' | 'TIP' | 'VIEWER_COUNT';
    stream_id: string;
    timestamp: string;
    data: any;
    user_id?: string;
  }

  // Live Promo
  export interface LivePromo {
    id: string;
    type: 'flash_sale' | 'bundle_deal' | 'free_shipping' | 'exclusive_access';
    title: string;
    description: string;
    value: number;
    value_type: 'percentage' | 'fixed_amount' | 'buy_x_get_y';
    expires_at: string;
    usage_limit?: number;
    usage_count: number;
    applicable_products: string[];
  }

  // API Endpoints
  export interface LiveEndpoints {
    startStream: (params: {
      creator_id: string;
      title: string;
      description?: string;
      family_safe?: boolean;
      age_rating?: 'all_ages' | '13+' | '18+';
      scheduled_for?: string;
    }) => Promise<BaseResponse<LiveStream>>;

    endStream: (stream_id: string) => Promise<BaseResponse<{
      ended_at: string;
      final_stats: LiveStats;
      vod_url?: string;
    }>>;

    pinProduct: (stream_id: string, params: {
      product_id: string;
      display_duration_seconds?: number;
      position?: { x: number; y: number };
    }) => Promise<BaseResponse<PinnedProduct>>;

    unpinProduct: (stream_id: string, product_id: string) => Promise<BaseResponse<void>>;

    createPromo: (stream_id: string, promo: Omit<LivePromo, 'id' | 'usage_count'>) => Promise<BaseResponse<LivePromo>>;

    getActiveStreams: (params: {
      category?: string;
      family_safe_only?: boolean;
      limit?: number;
    }) => Promise<BaseResponse<LiveStream[]>>;

    getStreamDetails: (stream_id: string) => Promise<BaseResponse<{
      stream: LiveStream;
      pinned_products: PinnedProduct[];
      active_promos: LivePromo[];
      stats: LiveStats;
    }>>;

    getStreamStats: (stream_id: string) => Promise<BaseResponse<LiveStats>>;
  }

  // WebSocket Events
  export interface LiveWebSocketEvents {
    onMessage: (message: LiveChatMessage) => void;
    onEvent: (event: LiveEvent) => void;
    onViewerCountUpdate: (count: number) => void;
    onProductPin: (product: PinnedProduct) => void;
    onProductUnpin: (product_id: string) => void;
    onPromoStart: (promo: LivePromo) => void;
    onStreamEnd: (stats: LiveStats) => void;
  }
}

// =============================================================================
// MODULE 3: FAMILY SAFETY INTERFACES
// =============================================================================

export namespace FamilyAPI {
  // Family Pairing
  export interface FamilyPairing {
    id: string;
    parent_user_id: string;
    child_user_id?: string;
    invite_code: string;
    qr_code_data: string;
    status: 'pending' | 'accepted' | 'expired' | 'cancelled';
    role_assignments: {
      parent: string[];
      child: string[];
    };
    created_at: string;
    expires_at: string;
    accepted_at?: string;
  }

  // Family Context
  export interface FamilyContext {
    family_id: string;
    user_id: string;
    role: 'parent' | 'teen' | 'child' | 'adult';
    permissions: string[];
    restrictions: {
      budget_limits: BudgetLimit[];
      category_blocks: string[];
      time_restrictions: TimeRestriction[];
      approval_required: boolean;
    };
    supervision_level: 'none' | 'light' | 'moderate' | 'strict';
  }

  // Budget Limit
  export interface BudgetLimit {
    id: string;
    type: 'daily' | 'weekly' | 'monthly';
    amount: Price;
    category?: string;
    spent_amount: Price;
    reset_date: string;
    notifications_enabled: boolean;
  }

  // Time Restriction
  export interface TimeRestriction {
    id: string;
    type: 'screen_time' | 'quiet_hours' | 'app_access';
    start_time: string; // HH:MM format
    end_time: string;
    days_of_week: number[]; // 0-6, Sunday=0
    duration_minutes?: number;
    break_reminders: boolean;
  }

  // Purchase Approval
  export interface PurchaseApproval {
    id: string;
    child_user_id: string;
    parent_user_id: string;
    product: ProductInfo;
    quantity: number;
    total_amount: Price;
    reason?: string;
    status: 'pending' | 'approved' | 'denied';
    requested_at: string;
    responded_at?: string;
    response_reason?: string;
    auto_approved: boolean;
  }

  // Screen Time Data
  export interface ScreenTimeData {
    user_id: string;
    date: string; // YYYY-MM-DD
    total_minutes: number;
    app_usage: {
      app_name: string;
      minutes: number;
      sessions: number;
    }[];
    breaks_taken: number;
    limit_exceeded: boolean;
    notifications_sent: number;
  }

  // Wellbeing Badge
  export interface WellbeingBadge {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'sleep' | 'screen_time' | 'safety' | 'wellbeing' | 'family_trust';
    progress: {
      current: number;
      target: number;
      unit: string;
    };
    unlocked: boolean;
    unlocked_at?: string;
    streak_days?: number;
  }

  // Family Mission
  export interface FamilyMission {
    id: string;
    title: string;
    description: string;
    category: 'budgeting' | 'safety' | 'education' | 'wellbeing';
    difficulty: 'easy' | 'medium' | 'hard';
    points_reward: number;
    badge_reward?: string;
    requirements: {
      type: string;
      target: number;
      current: number;
    }[];
    completed: boolean;
    completed_at?: string;
    expires_at?: string;
  }

  // API Endpoints
  export interface FamilyEndpoints {
    // Pairing
    initiatePairing: (params: {
      parent_user_id: string;
      child_email?: string;
      role_preset: 'teen' | 'child';
    }) => Promise<BaseResponse<FamilyPairing>>;

    acceptPairing: (params: {
      invite_code: string;
      child_user_id: string;
    }) => Promise<BaseResponse<FamilyContext>>;

    getFamilyStatus: (family_id: string) => Promise<BaseResponse<{
      family: FamilyContext[];
      active_restrictions: number;
      pending_approvals: number;
      recent_activity: any[];
    }>>;

    // Approvals
    requestApproval: (params: {
      child_user_id: string;
      product_id: string;
      quantity: number;
      reason?: string;
    }) => Promise<BaseResponse<PurchaseApproval>>;

    respondToApproval: (approval_id: string, params: {
      approved: boolean;
      reason?: string;
    }) => Promise<BaseResponse<PurchaseApproval>>;

    getSpendingData: (family_id: string, params: {
      period: 'week' | 'month' | 'year';
      user_id?: string;
    }) => Promise<BaseResponse<{
      total_spent: Price;
      by_category: { category: string; amount: Price }[];
      by_member: { user_id: string; amount: Price }[];
      budget_status: BudgetLimit[];
    }>>;

    // Budget & Restrictions
    setBudgetLimit: (family_id: string, limit: Omit<BudgetLimit, 'id' | 'spent_amount'>) => Promise<BaseResponse<BudgetLimit>>;

    updateRestrictions: (family_id: string, user_id: string, restrictions: Partial<FamilyContext['restrictions']>) => Promise<BaseResponse<FamilyContext>>;

    // Screen Time
    getScreenTime: (user_id: string, params: {
      date_from: string;
      date_to: string;
    }) => Promise<BaseResponse<ScreenTimeData[]>>;

    updateScreenTime: (user_id: string, data: Partial<ScreenTimeData>) => Promise<BaseResponse<ScreenTimeData>>;

    // Badges & Missions
    getBadges: (user_id: string) => Promise<BaseResponse<WellbeingBadge[]>>;

    getMissions: (user_id: string, params: {
      status?: 'active' | 'completed' | 'expired';
    }) => Promise<BaseResponse<FamilyMission[]>>;

    completeMission: (user_id: string, mission_id: string) => Promise<BaseResponse<{
      mission: FamilyMission;
      rewards: {
        points: number;
        badges: WellbeingBadge[];
      };
    }>>;
  }
}

// =============================================================================
// MODULE 4: BUSINESS CONSOLE INTERFACES
// =============================================================================

export namespace BusinessAPI {
  // Business KPIs
  export interface BusinessKPIs {
    period: {
      start: string;
      end: string;
    };
    metrics: {
      views: number;
      watch_time_minutes: number;
      click_through_rate: number;
      followers: number;
      saves: number;
      shares: number;
      conversion_rate: number;
      gross_merchandise_value: Price;
      average_order_value: Price;
      refund_rate: number;
      customer_satisfaction: number;
      safety_violations: number;
    };
    trends: {
      [key: string]: {
        current: number;
        previous: number;
        change_percent: number;
      };
    };
  }

  // Business Catalog Item
  export interface CatalogItem extends ProductInfo {
    sku: string;
    category: string;
    tags: string[];
    seo: {
      title: string;
      description: string;
      keywords: string[];
    };
    inventory: {
      stock_count: number;
      low_stock_threshold: number;
      out_of_stock_actions: string[];
    };
    pricing: {
      cost_price: Price;
      markup_percent: number;
      dynamic_pricing_enabled: boolean;
      competitor_tracking: boolean;
    };
    performance: {
      views: number;
      conversions: number;
      revenue: Price;
      rating_average: number;
      review_count: number;
    };
  }

  // Business Order
  export interface BusinessOrder {
    id: string;
    order_number: string;
    customer: {
      id: string;
      username: string;
      email: string;
      tier: 'bronze' | 'silver' | 'gold' | 'vip';
    };
    items: {
      product: CatalogItem;
      quantity: number;
      price_paid: Price;
      variant?: string;
    }[];
    totals: {
      subtotal: Price;
      shipping: Price;
      tax: Price;
      total: Price;
    };
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
    timestamps: {
      placed_at: string;
      confirmed_at?: string;
      shipped_at?: string;
      delivered_at?: string;
    };
    shipping: {
      address: any;
      method: string;
      tracking_number?: string;
      estimated_delivery: string;
    };
    family_approval?: {
      required: boolean;
      approved: boolean;
      approved_by?: string;
      approved_at?: string;
    };
  }

  // Business Campaign
  export interface BusinessCampaign {
    id: string;
    name: string;
    type: 'sponsored_content' | 'affiliate_partnership' | 'discount_code' | 'influencer_collab';
    status: 'draft' | 'active' | 'paused' | 'completed';
    budget: {
      total: Price;
      spent: Price;
      daily_limit?: Price;
    };
    targeting: {
      age_groups: string[];
      interests: string[];
      locations: string[];
      family_safe_only: boolean;
    };
    content: {
      creative_assets: string[];
      headline: string;
      description: string;
      call_to_action: string;
    };
    performance: {
      impressions: number;
      clicks: number;
      conversions: number;
      cost_per_click: Price;
      return_on_ad_spend: number;
    };
    schedule: {
      start_date: string;
      end_date?: string;
      active_hours?: string[];
    };
  }

  // Customer Segment
  export interface CustomerSegment {
    id: string;
    name: string;
    description: string;
    criteria: {
      purchase_history: {
        min_orders?: number;
        min_value?: Price;
        categories?: string[];
      };
      demographics: {
        age_range?: [number, number];
        family_status?: string[];
      };
      engagement: {
        min_follows?: boolean;
        interaction_level?: 'low' | 'medium' | 'high';
      };
    };
    customer_count: number;
    avg_lifetime_value: Price;
    retention_rate: number;
  }

  // Trust & KYB Status
  export interface TrustStatus {
    business_id: string;
    verification_level: 'unverified' | 'basic' | 'enhanced' | 'premium';
    trust_score: number;
    verification_badges: string[];
    kyb_status: {
      business_documents: 'pending' | 'approved' | 'rejected';
      identity_verification: 'pending' | 'approved' | 'rejected';
      address_verification: 'pending' | 'approved' | 'rejected';
      bank_verification: 'pending' | 'approved' | 'rejected';
    };
    compliance: {
      tax_registration: boolean;
      data_protection: boolean;
      consumer_rights: boolean;
      family_safety_certified: boolean;
    };
    risk_flags: string[];
    next_review_date: string;
  }

  // API Endpoints
  export interface BusinessEndpoints {
    // Analytics
    getKPIs: (params: {
      business_id: string;
      period: 'day' | 'week' | 'month' | 'quarter' | 'year';
      start_date?: string;
      end_date?: string;
    }) => Promise<BaseResponse<BusinessKPIs>>;

    // Catalog Management
    getCatalog: (business_id: string, params: {
      cursor?: string;
      limit?: number;
      category?: string;
      status?: 'active' | 'inactive' | 'out_of_stock';
    }) => Promise<PaginatedResponse<CatalogItem[]>>;

    createProduct: (business_id: string, product: Omit<CatalogItem, 'id' | 'performance'>) => Promise<BaseResponse<CatalogItem>>;

    updateProduct: (business_id: string, product_id: string, updates: Partial<CatalogItem>) => Promise<BaseResponse<CatalogItem>>;

    deleteProduct: (business_id: string, product_id: string) => Promise<BaseResponse<void>>;

    // Order Management
    getOrders: (business_id: string, params: {
      cursor?: string;
      limit?: number;
      status?: BusinessOrder['status'];
      date_from?: string;
      date_to?: string;
    }) => Promise<PaginatedResponse<BusinessOrder[]>>;

    updateOrderStatus: (business_id: string, order_id: string, params: {
      status: BusinessOrder['status'];
      tracking_number?: string;
      notes?: string;
    }) => Promise<BaseResponse<BusinessOrder>>;

    // Campaigns
    getCampaigns: (business_id: string, params: {
      status?: BusinessCampaign['status'];
      type?: BusinessCampaign['type'];
    }) => Promise<BaseResponse<BusinessCampaign[]>>;

    createCampaign: (business_id: string, campaign: Omit<BusinessCampaign, 'id' | 'performance'>) => Promise<BaseResponse<BusinessCampaign>>;

    updateCampaign: (business_id: string, campaign_id: string, updates: Partial<BusinessCampaign>) => Promise<BaseResponse<BusinessCampaign>>;

    // Customer Management
    getCustomers: (business_id: string, params: {
      segment?: string;
      tier?: 'bronze' | 'silver' | 'gold' | 'vip';
      cursor?: string;
      limit?: number;
    }) => Promise<PaginatedResponse<any[]>>;

    getCustomerSegments: (business_id: string) => Promise<BaseResponse<CustomerSegment[]>>;

    // Trust & Verification
    submitKYB: (business_id: string, documents: {
      business_registration: File;
      tax_certificate: File;
      bank_statement: File;
      identity_document: File;
    }) => Promise<BaseResponse<TrustStatus>>;

    getKYBStatus: (business_id: string) => Promise<BaseResponse<TrustStatus>>;
  }
}

// =============================================================================
// WEBSOCKET EVENT SCHEMAS
// =============================================================================

export namespace WebSocketEvents {
  // Live Stream Events
  export interface LiveStreamEvent {
    type: 'stream_started' | 'stream_ended' | 'product_pinned' | 'product_unpinned' | 'promo_started' | 'viewer_joined' | 'viewer_left';
    stream_id: string;
    timestamp: string;
    data: any;
  }

  // Chat Events
  export interface ChatEvent {
    type: 'message' | 'system_message' | 'user_joined' | 'user_left' | 'message_deleted' | 'user_muted';
    chat_id: string;
    user_id?: string;
    message?: LiveAPI.LiveChatMessage;
    timestamp: string;
  }

  // Family Events
  export interface FamilyEvent {
    type: 'approval_requested' | 'approval_responded' | 'budget_exceeded' | 'screen_time_warning' | 'mission_completed';
    family_id: string;
    user_id: string;
    data: any;
    timestamp: string;
  }

  // Business Events
  export interface BusinessEvent {
    type: 'order_placed' | 'order_shipped' | 'review_received' | 'campaign_milestone' | 'inventory_low';
    business_id: string;
    data: any;
    timestamp: string;
  }
}

// =============================================================================
// ERROR TYPES
// =============================================================================

export interface APIError {
  code: string;
  message: string;
  details?: any;
  field?: string;
  suggestion?: string;
}

export class BlueWaveAPIError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any,
    public field?: string
  ) {
    super(message);
    this.name = 'BlueWaveAPIError';
  }
}

// =============================================================================
// API CLIENT CONFIGURATION
// =============================================================================

export interface APIClientConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  defaultHeaders: Record<string, string>;
  authentication: {
    type: 'jwt' | 'oauth' | 'api_key';
    credentials: any;
  };
  family_context?: {
    family_id: string;
    user_role: 'parent' | 'teen' | 'child' | 'adult';
    restrictions_active: boolean;
  };
  localization: {
    locale: string;
    currency: string;
    timezone: string;
  };
}

// =============================================================================
// REACT NATIVE COMPONENT INTERFACES
// =============================================================================

export namespace ComponentProps {
  // Explore Grid Component
  export interface ExploreGridProps {
    items: ExploreAPI.ExploreItem[];
    loading: boolean;
    error?: string;
    onItemPress: (item: ExploreAPI.ExploreItem) => void;
    onLoadMore: () => void;
    onRefresh: () => void;
    refreshing: boolean;
    numColumns?: number;
    showFamilySafeBadges?: boolean;
  }

  // Live Stream Player Component
  export interface LiveStreamPlayerProps {
    stream: LiveAPI.LiveStream;
    pinnedProducts: LiveAPI.PinnedProduct[];
    onProductPress: (product: ProductInfo) => void;
    onFollowCreator: (creator: CreatorInfo) => void;
    onShareStream: () => void;
    onReportStream: () => void;
    familyContext?: FamilyAPI.FamilyContext;
  }

  // Family Approval Component
  export interface FamilyApprovalProps {
    approval: FamilyAPI.PurchaseApproval;
    onApprove: (reason?: string) => void;
    onDeny: (reason: string) => void;
    userRole: 'parent' | 'teen' | 'child';
    loading: boolean;
  }

  // Business KPI Dashboard Component
  export interface BusinessKPIDashboardProps {
    kpis: BusinessAPI.BusinessKPIs;
    loading: boolean;
    dateRange: { start: string; end: string };
    onDateRangeChange: (range: { start: string; end: string }) => void;
    onMetricPress: (metric: string) => void;
  }

  // Product Detail Drawer Component
  export interface ProductDetailDrawerProps {
    product: ProductInfo;
    visible: boolean;
    onClose: () => void;
    onAddToCart: (quantity: number, variant?: string) => void;
    onBuyNow: (quantity: number, variant?: string) => void;
    onSave: () => void;
    onShare: () => void;
    familyContext?: FamilyAPI.FamilyContext;
    requiresApproval?: boolean;
  }
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type APIEndpointMethods = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF' | 'CNY' | 'INR' | 'BRL' | string;

export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'zh' | 'ja' | 'ko' | 'ar' | string;

// =============================================================================
// VALIDATION SCHEMAS (Zod-style)
// =============================================================================

export const ValidationSchemas = {
  Price: {
    amount: { type: 'number', min: 0, required: true },
    currency: { type: 'string', pattern: /^[A-Z]{3}$/, required: true },
  },
  
  ExploreFilters: {
    category: { type: 'array', items: { type: 'string' } },
    price_range: {
      type: 'object',
      properties: {
        min: { type: 'number', min: 0 },
        max: { type: 'number', min: 0 },
        currency: { type: 'string', pattern: /^[A-Z]{3}$/ }
      }
    },
    family_safe_only: { type: 'boolean', default: true },
    age_rating: { type: 'string', enum: ['all_ages', '13+', '18+'], default: 'all_ages' }
  },
  
  LiveStreamStart: {
    creator_id: { type: 'string', required: true },
    title: { type: 'string', minLength: 5, maxLength: 100, required: true },
    family_safe: { type: 'boolean', default: true },
    age_rating: { type: 'string', enum: ['all_ages', '13+', '18+'], default: 'all_ages' }
  },
  
  FamilyPairingRequest: {
    parent_user_id: { type: 'string', required: true },
    child_email: { type: 'string', format: 'email' },
    role_preset: { type: 'string', enum: ['teen', 'child'], required: true }
  }
} as const;

export default {
  ExploreAPI,
  LiveAPI,
  FamilyAPI,
  BusinessAPI,
  WebSocketEvents,
  ComponentProps,
  APIError,
  BlueWaveAPIError,
  ValidationSchemas
};