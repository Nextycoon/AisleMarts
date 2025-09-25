/**
 * P2 Preparation: Ranker Hook for AI Recommendations
 * 
 * This provides a clean interface for story ranking algorithms.
 * Currently returns identity function - ready for P2 UCB1 bandit integration.
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
  };
  metadata?: {
    freshness: number;
    commission_rate: number;
    repetition_penalty: number;
  };
};

export type RankerContext = {
  userId?: string;
  sessionId?: string;
  previousStories: string[];
  businessConstraints?: {
    minCommissionRate?: number;
    maxRepetition?: number;
    freshnessBoost?: number;
  };
};

// P2 Interface: UCB1 Bandit Ranking Function
export type Ranker = (
  stories: Story[], 
  context?: RankerContext
) => Story[];

// P1 Implementation: Identity function (no ranking)
// P2 will replace with: UCB(click_rate, views) + λ * commission_rate + β * freshness - γ * repetition
export const ranker: Ranker = (stories: Story[], context?: RankerContext) => {
  // For P1: return stories as-is (preserve existing order)
  return stories;
};

// P2 Preview: UCB1 Bandit Algorithm (commented out for P1)
/*
export const ucb1Ranker: Ranker = (stories: Story[], context?: RankerContext) => {
  const now = Date.now();
  const constraints = context?.businessConstraints || {};
  
  return stories
    .map(story => {
      const engagement = story.engagement || { impressions: 1, ctas: 0, purchases: 0 };
      const metadata = story.metadata || { freshness: now, commission_rate: 0.05, repetition_penalty: 0 };
      
      // UCB1 Score Calculation
      const clickRate = engagement.ctas / Math.max(engagement.impressions, 1);
      const confidence = Math.sqrt(2 * Math.log(engagement.impressions) / Math.max(engagement.ctas, 1));
      const ucbScore = clickRate + confidence;
      
      // Business Constraints
      const commissionBoost = metadata.commission_rate * (constraints.minCommissionRate || 1);
      const freshnessBoost = Math.max(0, 1 - (now - metadata.freshness) / (24 * 60 * 60 * 1000)) * (constraints.freshnessBoost || 0.1);
      const repetitionPenalty = metadata.repetition_penalty * (constraints.maxRepetition || 0.1);
      
      // Final Score: UCB + λ*commission + β*freshness - γ*repetition
      const finalScore = ucbScore + commissionBoost + freshnessBoost - repetitionPenalty;
      
      return { ...story, _score: finalScore };
    })
    .sort((a, b) => (b._score || 0) - (a._score || 0))
    .map(({ _score, ...story }) => story);
};
*/

// Utility: Apply ranker to story feed
export function applyRanking(stories: Story[], context?: RankerContext): Story[] {
  return ranker(stories, context);
}

// Utility: Create ranker context from user session
export function createRankerContext(
  userId: string,
  sessionId: string,
  previousStories: string[] = [],
  businessConstraints = {}
): RankerContext {
  return {
    userId,
    sessionId,
    previousStories,
    businessConstraints
  };
}