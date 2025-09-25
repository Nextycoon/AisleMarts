/**
 * User Bucketing System for Canary Rollouts
 * Provides stable hash-based user assignment for A/B testing
 */

export function hash32(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
  }
  return h >>> 0;
}

export function inBucket(userId: string, pct: number): boolean {
  return (hash32(userId) % 10000) < Math.floor(pct * 100); // e.g. 0.05 => 5%
}

export interface BucketConfig {
  canaryPct: number;      // 0.05 for 5%
  feature: string;        // "ranker", "video_prefetch", etc.
  rolloutId: string;      // "ranker_v1_ucb1" for tracking
}

export function assignBucket(userId: string, config: BucketConfig): {
  treatment: string;
  inCanary: boolean;
} {
  const inCanary = inBucket(userId, config.canaryPct);
  return {
    treatment: inCanary ? 'treatment' : 'control',
    inCanary
  };
}

// Helper for ranker-specific bucketing
export function assignRankerTreatment(userId: string): {
  algorithm: 'identity' | 'ucb1';
  inCanary: boolean;
} {
  const canaryPct = parseFloat(process.env.EXPO_PUBLIC_RANKER_CANARY_PCT || '0.05');
  const inCanary = inBucket(userId, canaryPct);
  
  return {
    algorithm: inCanary ? 'ucb1' : 'identity',
    inCanary
  };
}