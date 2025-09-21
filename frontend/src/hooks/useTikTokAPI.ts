import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface APIResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  loading: boolean;
}

interface ForYouFeedParams {
  user_id: string;
  cursor?: string;
  limit?: number;
  family_safe_only?: boolean;
}

interface FollowingFeedParams {
  user_id: string;
  cursor?: string;
  limit?: number;
}

interface ContentInteraction {
  content_id: string;
  user_id: string;
  interaction_type: 'like' | 'comment' | 'share' | 'save' | 'follow';
  metadata?: any;
}

interface LiveStreamParams {
  creator_id: string;
  title: string;
  family_safe?: boolean;
  age_rating?: 'all_ages' | '13+' | '18+';
}

interface ProductPin {
  product_id: string;
  title: string;
  price: number;
  currency: string;
  family_approval_required?: boolean;
}

export const useTikTokAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('TikTok API error:', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Health Check
  const checkHealth = async () => {
    return makeRequest('/api/social/health');
  };

  // Feed APIs
  const getForYouFeed = async (params: ForYouFeedParams) => {
    const queryParams = new URLSearchParams({
      user_id: params.user_id,
      limit: (params.limit || 10).toString(),
      family_safe_only: (params.family_safe_only !== false).toString(),
      ...(params.cursor && { cursor: params.cursor }),
    });

    return makeRequest(`/api/social/feed/for-you?${queryParams}`);
  };

  const getFollowingFeed = async (params: FollowingFeedParams) => {
    const queryParams = new URLSearchParams({
      user_id: params.user_id,
      limit: (params.limit || 10).toString(),
      ...(params.cursor && { cursor: params.cursor }),
    });

    return makeRequest(`/api/social/feed/following?${queryParams}`);
  };

  // Content Interaction
  const interactWithContent = async (interaction: ContentInteraction) => {
    return makeRequest(`/api/social/content/${interaction.content_id}/interact`, {
      method: 'POST',
      body: JSON.stringify(interaction),
    });
  };

  // Comments
  const getComments = async (contentId: string, cursor?: string, limit: number = 20) => {
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      ...(cursor && { cursor }),
    });

    return makeRequest(`/api/social/content/${contentId}/comments?${queryParams}`);
  };

  const addComment = async (contentId: string, userId: string, text: string, parentCommentId?: string) => {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('text', text);
    if (parentCommentId) {
      formData.append('parent_comment_id', parentCommentId);
    }

    return makeRequest(`/api/social/content/${contentId}/comment`, {
      method: 'POST',
      body: formData,
      headers: {}, // Don't set Content-Type for FormData
    });
  };

  // Live Commerce
  const startLiveStream = async (params: LiveStreamParams) => {
    const queryParams = new URLSearchParams({
      creator_id: params.creator_id,
      title: params.title,
      family_safe: (params.family_safe !== false).toString(),
      age_rating: params.age_rating || 'all_ages',
    });

    return makeRequest(`/api/social/live/start?${queryParams}`, {
      method: 'POST',
    });
  };

  const pinProductToLive = async (liveId: string, product: ProductPin) => {
    return makeRequest(`/api/social/live/${liveId}/pin-product`, {
      method: 'POST',
      body: JSON.stringify(product),
    });
  };

  const getLiveStats = async (liveId: string) => {
    return makeRequest(`/api/social/live/${liveId}/stats`);
  };

  // Discovery
  const getTrendingContent = async (category?: string, familySafeOnly: boolean = true, limit: number = 20) => {
    const queryParams = new URLSearchParams({
      family_safe_only: familySafeOnly.toString(),
      limit: limit.toString(),
      ...(category && { category }),
    });

    return makeRequest(`/api/social/explore/trending?${queryParams}`);
  };

  const searchContent = async (
    query: string,
    type: string = 'all',
    familySafeOnly: boolean = true,
    limit: number = 20
  ) => {
    const queryParams = new URLSearchParams({
      query,
      type,
      family_safe_only: familySafeOnly.toString(),
      limit: limit.toString(),
    });

    return makeRequest(`/api/social/search?${queryParams}`);
  };

  // Family Safety & Moderation
  const reportContent = async (contentId: string, userId: string, reason: string, description?: string) => {
    return makeRequest('/api/social/content/report', {
      method: 'POST',
      body: JSON.stringify({
        content_id: contentId,
        user_id: userId,
        reason,
        description,
      }),
    });
  };

  const getFamilyControls = async (userId: string) => {
    return makeRequest(`/api/social/moderation/family-controls/${userId}`);
  };

  return {
    loading,
    error,
    // Health
    checkHealth,
    // Feed
    getForYouFeed,
    getFollowingFeed,
    // Interaction
    interactWithContent,
    // Comments
    getComments,
    addComment,
    // Live Commerce
    startLiveStream,
    pinProductToLive,
    getLiveStats,
    // Discovery
    getTrendingContent,
    searchContent,
    // Safety
    reportContent,
    getFamilyControls,
  };
};

// Hook for For You Feed with automatic loading
export const useForYouFeed = (userId: string, familySafeOnly: boolean = true) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const api = useTikTokAPI();

  const loadFeed = async (resetCursor: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.getForYouFeed({
        user_id: userId,
        cursor: resetCursor ? undefined : cursor || undefined,
        limit: 10,
        family_safe_only: familySafeOnly,
      });

      if (response) {
        if (resetCursor) {
          setData(response);
        } else {
          setData((prev: any) => ({
            ...response,
            content: prev ? [...prev.content, ...response.content] : response.content,
          }));
        }
        setCursor(response.next_cursor);
        setHasMore(response.has_more);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    setCursor(null);
    setHasMore(true);
    loadFeed(true);
  };

  const loadMore = () => {
    if (!loading && hasMore && cursor) {
      loadFeed(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadFeed(true);
    }
  }, [userId, familySafeOnly]);

  return {
    data,
    loading,
    error,
    hasMore,
    refresh,
    loadMore,
  };
};

// Hook for Following Feed
export const useFollowingFeed = (userId: string) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const api = useTikTokAPI();

  const loadFeed = async (resetCursor: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.getFollowingFeed({
        user_id: userId,
        cursor: resetCursor ? undefined : cursor || undefined,
        limit: 10,
      });

      if (response) {
        if (resetCursor) {
          setData(response);
        } else {
          setData((prev: any) => ({
            ...response,
            content: prev ? [...prev.content, ...response.content] : response.content,
          }));
        }
        setCursor(response.next_cursor);
        setHasMore(response.has_more);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load following feed');
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    setCursor(null);
    setHasMore(true);
    loadFeed(true);
  };

  const loadMore = () => {
    if (!loading && hasMore && cursor) {
      loadFeed(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadFeed(true);
    }
  }, [userId]);

  return {
    data,
    loading,
    error,
    hasMore,
    refresh,
    loadMore,
  };
};

// Hook for Live Stream Management
export const useLiveStream = () => {
  const [isLive, setIsLive] = useState(false);
  const [liveData, setLiveData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const api = useTikTokAPI();

  const startStream = async (params: LiveStreamParams) => {
    try {
      const response = await api.startLiveStream(params);
      if (response && response.success) {
        setIsLive(true);
        setLiveData(response.live_stream);
        return response;
      }
      return null;
    } catch (error) {
      console.error('Failed to start live stream:', error);
      return null;
    }
  };

  const pinProduct = async (productPin: ProductPin) => {
    if (!liveData?.id) return null;
    
    try {
      const response = await api.pinProductToLive(liveData.id, productPin);
      return response;
    } catch (error) {
      console.error('Failed to pin product:', error);
      return null;
    }
  };

  const updateStats = async () => {
    if (!liveData?.id) return;
    
    try {
      const response = await api.getLiveStats(liveData.id);
      if (response && response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Failed to update live stats:', error);
    }
  };

  const endStream = () => {
    setIsLive(false);
    setLiveData(null);
    setStats(null);
  };

  return {
    isLive,
    liveData,
    stats,
    startStream,
    pinProduct,
    updateStats,
    endStream,
    loading: api.loading,
    error: api.error,
  };
};