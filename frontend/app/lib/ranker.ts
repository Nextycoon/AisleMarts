/**
 * P2 AI Recommendations: Ranker Hook System
 * 
 * This provides a clean interface for story ranking algorithms.
 * P1: Returns identity function (no ranking)  
 * P2: Ready for UCB1 bandit integration with business constraints
 */

export type Story = {
  id: string;
  creatorId: string;
  mediaUrl: string;
  type: "image" | "video";
  engagement?: {
    impressions: number;
    ctas: number;
    purchases: number;
    views?: number;
    shares?: number;
  };
  metadata?: {
    freshness: number;        // timestamp
    commission_rate: number;  // 0.05-0.15 typical
    repetition_penalty: number; // 0-1 based on recent views
    creator_tier: "gold" | "blue" | "grey" | "unverified";
    product_category?: string;
    price_range?: string;
  };
  business?: {
    boost_priority?: number;  // manual boost 0-1
    sponsored?: boolean;
    campaign_id?: string;
  };
};

export type RankerContext = {
  userId?: string;
  sessionId?: string;
  previousStories: string[];
  timestamp?: number;
  businessConstraints?: {
    minCommissionRate?: number;    // e.g. 0.07
    maxRepetition?: number;        // e.g. 3 times per session
    freshnessBoost?: number;       // e.g. 0.1
    diversityWeight?: number;      // e.g. 0.2 (category diversity)
    creatorTierWeights?: Record<string, number>;
  };
  userPreferences?: {
    categories: string[];
    priceRanges: string[];
    engagement_history: Record<string, number>;
  };
};

// P1 Implementation: Identity function (preserves existing order)
export type Ranker = (
  stories: Story[], 
  context?: RankerContext
) => Story[];

// P1: Identity ranker - no reordering  
export const ranker: Ranker = (stories: Story[], context?: RankerContext) => {
  // For P1: return stories as-is (preserve existing backend order)
  return stories;
};

// P2 Preview: UCB1 Bandit Algorithm (ready for activation)
export const ucb1Ranker: Ranker = (stories: Story[], context?: RankerContext) => {
  if (!context || stories.length <= 1) return stories;
  
  const now = context.timestamp ?? Date.now();
  const constraints = context.businessConstraints || {};
  const totalViews = stories.reduce((sum, s) => sum + (s.engagement?.views ?? 0), 0);
  
  return stories
    .map(story => {
      const engagement = story.engagement || { impressions: 1, ctas: 0, purchases: 0, views: 0 };
      const metadata = story.metadata || { freshness: now, commission_rate: 0.05, repetition_penalty: 0, creator_tier: "unverified" };
      const business = story.business || {};
      
      // UCB1 Core: CTR + exploration bonus
      const views = Math.max(engagement.views ?? engagement.impressions, 1);
      const clicks = engagement.ctas;
      const clickRate = clicks / views;
      const exploration = Math.sqrt(2 * Math.log(Math.max(totalViews, 1)) / views);
      const ucbScore = clickRate + (1.414 * exploration); // C = sqrt(2)
      
      // Business Constraints & Boosts
      const commissionBoost = metadata.commission_rate * (constraints.minCommissionRate || 1);
      const freshnessBoost = Math.max(0, 1 - (now - metadata.freshness) / (24 * 60 * 60 * 1000)) * (constraints.freshnessBoost || 0.1);
      const repetitionPenalty = metadata.repetition_penalty * (constraints.maxRepetition || 0.2);
      const businessBoost = business.boost_priority || 0;
      const sponsoredBoost = business.sponsored ? 0.05 : 0;
      
      // Creator tier weights
      const tierWeights = constraints.creatorTierWeights || { gold: 0.1, blue: 0.05, grey: 0.02, unverified: 0 };
      const tierBoost = tierWeights[metadata.creator_tier] || 0;
      
      // Final Score: UCB + λ*commission + β*freshness - γ*repetition + business
      const finalScore = ucbScore + commissionBoost + freshnessBoost - repetitionPenalty + businessBoost + sponsoredBoost + tierBoost;
      
      return { ...story, _score: finalScore, _debug: { ucbScore, commissionBoost, freshnessBoost, repetitionPenalty } };
    })
    .sort((a, b) => (b._score || 0) - (a._score || 0))
    .map(({ _score, _debug, ...story }) => story);
};

// Utility: Apply active ranker to story feed
export function applyRanking(stories: Story[], context?: RankerContext): Story[] {
  // P1: Use identity ranker
  // P2: Switch to ucb1Ranker or server-side ranking
  return ranker(stories, context);
}

// Utility: Create ranker context from user session
export function createRankerContext(
  userId: string,
  sessionId: string,
  previousStories: string[] = [],
  businessConstraints = {},
  userPreferences = {}
): RankerContext {
  return {
    userId,
    sessionId,
    previousStories,
    timestamp: Date.now(),
    businessConstraints,
    userPreferences
  };
}

// Utility: Track engagement for ranker feedback
export function trackRankerEvent(
  storyId: string, 
  eventType: 'impression' | 'cta' | 'purchase' | 'share',
  context?: RankerContext
) {
  // This will feed back into the UCB1 algorithm for online learning
  // P2: Send to analytics backend for stats update
  console.log(`[ranker:${eventType}] story=${storyId} session=${context?.sessionId}`);
}

// P2 Feature Flags (ready for gradual rollout)
export const RANKER_CONFIG = {
  enabled: process.env.EXPO_PUBLIC_RANKER_ENABLED === "1",
  algorithm: process.env.EXPO_PUBLIC_RANKER_ALGORITHM || "identity", // "identity", "ucb1", "server"
  lookahead: parseInt(process.env.EXPO_PUBLIC_LOOKAHEAD || "3"),
  debugMode: process.env.EXPO_PUBLIC_RANKER_DEBUG === "1"
};