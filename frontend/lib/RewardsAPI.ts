/**
 * 🎯 AisleMarts Rewards API Client
 * TypeScript client for BlueWave-themed rewards, gamification, and notifications
 */

export type RewardType = "aisle_coins" | "bluewave_points" | "vendor_stars" | "cashback_credits" | "percent_bonus" | "weekly_percent";
export type League = "Bronze" | "Silver" | "Gold" | "Platinum";

export interface Balances {
  aisleCoins: number;
  blueWavePoints: number;
  vendorStars: number;
  cashbackCredits: number;
  last_updated?: string;
}

export interface Mission {
  id: string;
  label: string;
  type: "per_sale" | "weekly";
  rule: string;
  progress: number;        // 0..1
  reward: { 
    type: RewardType; 
    value: number; 
    unit?: string 
  };
  completed: boolean;
}

export interface MissionsResponse {
  aggregatePercent: number;
  missions: Mission[];
  league?: League;  // Only for weekly missions
}

export interface StreakInfo {
  daily: { 
    days: number; 
    nextRewardAt: string | null 
  };
  weekly: { 
    weeks: number; 
    nextRewardAt: string | null 
  };
}

export interface LedgerEntry {
  id: string;
  ts: string;
  kind: "mission" | "streak" | "competition" | "adjustment" | "deduction";
  title: string;
  delta: { 
    type: RewardType; 
    value: number; 
    currency?: string 
  };
  meta?: Record<string, any>;
}

export interface LedgerResponse {
  items: LedgerEntry[];
  page: number;
  pageSize: number;
  total: number;
  hasNext?: boolean;
}

export interface LeaderboardRow {
  rank: number;
  vendorId: string;
  vendorName: string;
  league: League;
  score: number;
}

export interface ClaimRequest {
  mission_id?: string;
  streak_type?: "daily" | "weekly";
  campaign_id?: string;
}

export interface ClaimResponse {
  ok: boolean;
  ledgerId: string;
  type?: string;
  reward?: {
    type: RewardType;
    value: number;
  };
  message?: string;
}

export interface WithdrawRequest {
  amount: number;
  method: "wallet" | "bank";
  kyc_token: string;
}

export interface WithdrawResponse {
  ok: boolean;
  requestId: string;
  amount: number;
  method: string;
  estimatedCompletion: string;
  status: string;
}

export interface NotificationPreferences {
  ads_support: boolean;
  vendor_updates: boolean;
  publisher_plans: boolean;
  series_campaigns: boolean;
  email: boolean;
  push: boolean;
}

export interface FeedbackRequest {
  rating: number;  // 1-5
  comment?: string;
  category?: string;
}

export interface SystemStats {
  totalUsers: number;
  activeRewardsUsers: number;
  totalRewardsDistributed: Record<string, number>;
  missionsCompleted: Record<string, number>;
  currentStreaks: Record<string, number>;
  leagueDistribution: Record<string, number>;
  averageEngagement: number;
  withdrawalRequests: Record<string, number>;
}

// Base URL from environment
const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    // Browser environment
    return window.location.origin;
  }
  // React Native or server environment
  return process.env.EXPO_PUBLIC_BACKEND_URL || 'https://aislefeed.preview.emergentagent.com';
};

const BASE_URL = `${getBaseUrl()}/api/rewards`;

// HTTP helper
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'AisleMarts-Rewards-Client/1.0',
    },
  };

  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }

  return response.json();
}

// Main RewardsAPI object
export const RewardsAPI = {
  // Balances & Core Data
  async getBalances(userId: string = "current_user"): Promise<Balances> {
    return apiRequest<Balances>(`/balances?user_id=${userId}`);
  },

  async getPerSaleMissions(userId: string = "current_user"): Promise<MissionsResponse> {
    return apiRequest<MissionsResponse>(`/missions/per-sale?user_id=${userId}`);
  },

  async getWeeklyMissions(userId: string = "current_user"): Promise<MissionsResponse> {
    return apiRequest<MissionsResponse>(`/missions/weekly?user_id=${userId}`);
  },

  async getStreaks(userId: string = "current_user"): Promise<StreakInfo> {
    return apiRequest<StreakInfo>(`/streaks?user_id=${userId}`);
  },

  // Leaderboard & Social
  async getLeaderboard(league?: League, limit: number = 20): Promise<LeaderboardRow[]> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (league) params.append('league', league);
    return apiRequest<LeaderboardRow[]>(`/leaderboard?${params}`);
  },

  // Transactions & History
  async getLedger(
    userId: string = "current_user", 
    page: number = 1, 
    pageSize: number = 25
  ): Promise<LedgerResponse> {
    const params = new URLSearchParams({
      user_id: userId,
      page: page.toString(),
      page_size: pageSize.toString()
    });
    return apiRequest<LedgerResponse>(`/ledger?${params}`);
  },

  // Actions
  async claimReward(
    claimData: ClaimRequest, 
    userId: string = "current_user"
  ): Promise<ClaimResponse> {
    return apiRequest<ClaimResponse>('/claim', {
      method: 'POST',
      body: JSON.stringify({ ...claimData, user_id: userId }),
    });
  },

  async withdrawAisleCoins(
    withdrawRequest: WithdrawRequest,
    userId: string = "current_user"
  ): Promise<WithdrawResponse> {
    return apiRequest<WithdrawResponse>('/withdraw', {
      method: 'POST',
      body: JSON.stringify({ ...withdrawRequest, user_id: userId }),
    });
  },

  async enterCampaign(
    campaignId: string,
    userId: string = "current_user"
  ): Promise<{ ok: boolean; campaignId: string; entryId: string; message: string; drawDate: string }> {
    return apiRequest('/campaign/enter', {
      method: 'POST',
      body: JSON.stringify({ campaign_id: campaignId, user_id: userId }),
    });
  },

  // Notifications
  async getNotificationPreferences(userId: string = "current_user"): Promise<NotificationPreferences> {
    return apiRequest<NotificationPreferences>(`/notifications/preferences?user_id=${userId}`);
  },

  async setNotificationPreferences(
    prefs: NotificationPreferences,
    userId: string = "current_user"
  ): Promise<{ ok: boolean; updated: NotificationPreferences }> {
    return apiRequest('/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify({ ...prefs, user_id: userId }),
    });
  },

  // Analytics & Feedback
  async getSystemStats(): Promise<SystemStats> {
    return apiRequest<SystemStats>('/stats');
  },

  async submitFeedback(
    feedback: FeedbackRequest,
    userId: string = "current_user"
  ): Promise<{ ok: boolean; feedbackId: string; message: string; reward?: any }> {
    return apiRequest('/feedback', {
      method: 'POST',
      body: JSON.stringify({ ...feedback, user_id: userId }),
    });
  },

  // Health Check
  async healthCheck(): Promise<any> {
    return apiRequest('/health');
  },

  // Realtime Updates (Mock WebSocket)
  subscribe(userId: string, onMessage: (msg: any) => void): () => void {
    // Mock implementation for now - in production, use WebSocket
    console.log(`🎯 Subscribed to rewards updates for user ${userId}`);
    
    // Simulate periodic updates
    const interval = setInterval(() => {
      onMessage({
        type: 'mission_progress',
        userId,
        data: {
          missionId: 'stay_5m',
          progress: Math.random(),
          timestamp: new Date().toISOString()
        }
      });
    }, 30000); // Every 30 seconds

    // Return cleanup function
    return () => {
      clearInterval(interval);
      console.log(`🎯 Unsubscribed from rewards updates for user ${userId}`);
    };
  },
};

// React Hook for Rewards Data (if using React)
export const useRewards = (userId: string = "current_user") => {
  // This would be implemented with useState/useEffect in a React environment
  // For now, just return the API object
  return RewardsAPI;
};

export default RewardsAPI;