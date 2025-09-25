import { ranker, ucb1Ranker, Story, RankerContext, RANKER_CONFIG } from "./ranker";
import { assignRankerTreatment } from "./bucketing";

/**
 * Ranker Selection System with Canary Rollout
 * Handles stable user assignment and algorithm selection
 */

export interface RankerSelection {
  stories: Story[];
  algorithm: 'identity' | 'ucb1';
  inCanary: boolean;
  userId?: string;
}

export function selectRanker(stories: Story[], userId: string, context?: RankerContext): RankerSelection {
  // Feature flag check
  if (!RANKER_CONFIG.enabled) {
    return {
      stories,
      algorithm: 'identity',
      inCanary: false,
      userId
    };
  }

  // Get user assignment (stable hash-based bucketing)
  const assignment = assignRankerTreatment(userId);
  
  // Apply selected ranker
  let rankedStories: Story[];
  const rankerContext = {
    ...context,
    userId,
    timestamp: Date.now(),
    businessConstraints: {
      minCommissionRate: 0.07,
      maxRepetition: 3,
      freshnessBoost: 0.1,
      diversityWeight: 0.2,
      creatorTierWeights: {
        gold: 0.1,
        blue: 0.05,
        grey: 0.02,
        unverified: 0
      }
    }
  };

  switch (assignment.algorithm) {
    case 'ucb1':
      rankedStories = ucb1Ranker(stories, rankerContext);
      break;
    case 'identity':
    default:
      rankedStories = ranker(stories, rankerContext);
      break;
  }

  // Apply minimum exposure protection
  rankedStories = enforceMinExposure(rankedStories, 0.02);

  // Emit assignment for analytics (if tracking available)
  if (context?.track) {
    context.track('ranker_assignment', {
      userId,
      algorithm: assignment.algorithm,
      inCanary: assignment.inCanary,
      storyCount: stories.length,
      timestamp: Date.now()
    });
  }

  return {
    stories: rankedStories,
    algorithm: assignment.algorithm,
    inCanary: assignment.inCanary,
    userId
  };
}

// Minimum exposure enforcement (anti-starvation)
function enforceMinExposure(stories: Story[], minPct = 0.02): Story[] {
  if (stories.length <= 10) return stories; // Skip for small sets
  
  const totalStories = stories.length;
  const minExposure = Math.max(1, Math.floor(totalStories * minPct));
  
  // Group by creator
  const creatorGroups = new Map<string, Story[]>();
  stories.forEach(story => {
    const creatorId = story.creatorId;
    if (!creatorGroups.has(creatorId)) {
      creatorGroups.set(creatorId, []);
    }
    creatorGroups.get(creatorId)!.push(story);
  });
  
  // Ensure minimum representation for each creator
  const balanced: Story[] = [];
  const remaining: Story[] = [];
  
  creatorGroups.forEach((creatorStories, creatorId) => {
    const guaranteed = creatorStories.slice(0, Math.min(minExposure, creatorStories.length));
    const excess = creatorStories.slice(guaranteed.length);
    
    balanced.push(...guaranteed);
    remaining.push(...excess);
  });
  
  // Add remaining stories by original rank
  balanced.push(...remaining);
  
  return balanced;
}

// Cold start handling for new stories
export function applyColdStartBoost(stories: Story[]): Story[] {
  return stories.map(story => {
    const engagement = story.engagement || { impressions: 0, ctas: 0, purchases: 0, views: 0 };
    
    // Apply cold start prior if no engagement data
    if (engagement.views === 0 && engagement.impressions === 0) {
      return {
        ...story,
        metadata: {
          ...story.metadata,
          cold_start_prior: 0.02, // 2% prior CTR
          freshness_boost: 0.05   // Extra freshness for new content
        }
      };
    }
    
    return story;
  });
}