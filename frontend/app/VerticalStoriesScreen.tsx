import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { View, Dimensions, Pressable, FlatList, StyleSheet, StatusBar, ViewToken, Text } from "react-native";
import { Video, ResizeMode } from "expo-av";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { AVPlaybackStatus } from "expo-av";
import { selectRanker } from "./lib/rankerSelection";
import { trackRankerEvent } from "./lib/ranker";
import { PerfHUD } from "./components/PerfHUD";

// ---- Types ----
type Story = {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  productId?: string;
  // AI ranking metadata
  ctr?: number;
  commissionScore?: number;
  freshness?: number;
  engagement?: {
    impressions: number;
    ctas: number;
    purchases: number;
    views: number;
  };
  metadata?: {
    creator_tier: "gold" | "blue" | "grey" | "unverified";
    commission_rate: number;
    repetition_penalty: number;
  };
};

type RankedResponse = {
  stories: Story[];
  meta?: { source: "server" | "client"; ts: string; algorithm: string };
};

// ---- Config ----
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const PRELOAD_AHEAD = parseInt(process.env.EXPO_PUBLIC_LOOKAHEAD || "3");

// ---- Moving header inside each page ----
const CreatorHeader: React.FC<{
  creators: { id: string; name: string; avatar: string; tier?: string }[];
  currentCreatorId: string;
  onJumpToCreator?: (creatorId: string) => void;
}> = ({ creators, currentCreatorId, onJumpToCreator }) => {
  return (
    <View style={styles.headerWrap}>
      {/* Title */}
      <View style={styles.headerTitleRow}>
        <Text style={styles.headerTitle}>Following • For You • Explore • AisleMarts</Text>
      </View>

      {/* 7 creator icons; this sits INSIDE the story page (scrolls with content) */}
      <View style={styles.iconsRow}>
        {creators.slice(0, 7).map((c) => {
          const isActive = c.id === currentCreatorId;
          const tierColor = c.tier === 'gold' ? '#FFD700' : c.tier === 'blue' ? '#4A90E2' : '#ffffff55';
          
          return (
            <Pressable key={c.id} onPress={() => onJumpToCreator?.(c.id)} style={styles.iconItem}>
              <View style={[styles.avatar, isActive && styles.avatarActive, { borderColor: isActive ? 'white' : tierColor }]} />
              <Text numberOfLines={1} style={[styles.iconLabel, isActive && styles.iconLabelActive]}>
                {c.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

// ---- Single full-screen page (video + overlays) ----
// Creator-specific icon configurations
const getCreatorSpecificIcons = (story: Story) => {
  const creatorTier = story.metadata?.creator_tier || 'unverified';
  const engagement = story.engagement || { impressions: 0, ctas: 0, purchases: 0, views: 0 };
  
  // Base icons for all creators
  const baseIcons = [
    { emoji: '❤️', action: 'like' as const, count: engagement.ctas > 10 ? `${Math.floor(engagement.ctas)}` : '', isShop: false },
    { emoji: '💬', action: 'comment' as const, count: engagement.views > 20 ? `${Math.floor(engagement.views/2)}` : '', isShop: false },
    { emoji: '↗️', action: 'share' as const, count: '', isShop: false },
  ];

  // Creator tier-specific icons (4 additional icons based on creator)
  const tierSpecificIcons = {
    'gold': [
      { emoji: '👑', action: 'like' as const, count: '', isShop: false },
      { emoji: '⭐', action: 'comment' as const, count: '', isShop: false },
      { emoji: '💎', action: 'share' as const, count: '', isShop: false },
      { emoji: 'Shop', action: 'shop' as const, count: '', isShop: true }
    ],
    'blue': [
      { emoji: '🎯', action: 'like' as const, count: '', isShop: false },
      { emoji: '🔥', action: 'comment' as const, count: '', isShop: false },
      { emoji: '✨', action: 'share' as const, count: '', isShop: false },
      { emoji: 'Shop', action: 'shop' as const, count: '', isShop: true }
    ],
    'grey': [
      { emoji: '👍', action: 'like' as const, count: '', isShop: false },
      { emoji: '📢', action: 'comment' as const, count: '', isShop: false },
      { emoji: '💫', action: 'share' as const, count: '', isShop: false },
      { emoji: 'Shop', action: 'shop' as const, count: '', isShop: true }
    ],
    'unverified': [
      { emoji: '👏', action: 'like' as const, count: '', isShop: false },
      { emoji: '💭', action: 'comment' as const, count: '', isShop: false },
      { emoji: '🔄', action: 'share' as const, count: '', isShop: false },
      { emoji: 'Shop', action: 'shop' as const, count: '', isShop: true }
    ]
  };

  const specificIcons = tierSpecificIcons[creatorTier] || tierSpecificIcons['unverified'];
  
  // Combine base icons with tier-specific icons to make exactly 7
  return [...baseIcons, ...specificIcons];
};

const StoryPage: React.FC<{
  story: Story;
  isActive: boolean;
  onReady?: (id: string) => void;
  onError?: (id: string, err: unknown) => void;
  onJumpToCreator: (creatorId: string) => void;
  creatorsForHeader: { id: string; name: string; avatar: string; tier?: string }[];
  onCTA?: (storyId: string, type: 'like' | 'comment' | 'share' | 'shop') => void;
}> = ({ story, isActive, onReady, onError, onJumpToCreator, creatorsForHeader, onCTA }) => {
  const videoRef = useRef<Video | null>(null);

  // Autoplay/pause based on visibility
  useEffect(() => {
    const setPlayback = async () => {
      try {
        if (!videoRef.current) return;
        if (isActive) {
          await videoRef.current.playAsync();
        } else {
          await videoRef.current.pauseAsync();
        }
      } catch (e) {
        // swallow playback errors
      }
    };
    setPlayback();
  }, [isActive]);

  const handleStatusUpdate = useCallback(
    async (status: AVPlaybackStatus) => {
      if (!status.isLoaded) return;
      if (status.isLoaded && status.positionMillis === 0 && status.durationMillis) {
        // First frame ready - track impression
        onReady?.(story.id);
        trackRankerEvent(story.id, 'impression');
        
        // Track impression to backend
        try {
          const { trackImpression } = await import('./lib/trackingService');
          await trackImpression(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/track/impression`, {
            story_id: story.id,
            creator_id: story.creatorId,
            product_id: story.productId,
            timestamp: Date.now(),
            user_id: 'user_' + Date.now(), // In production, use actual user ID
            viewport: 'vertical_stories'
          });
        } catch (error) {
          console.warn('[impression-tracking] Failed:', error);
        }
      }
    },
    [onReady, story.id]
  );

  const handleCTA = async (type: 'like' | 'comment' | 'share' | 'shop') => {
    trackRankerEvent(story.id, 'cta');
    
    // Track CTA event to backend
    try {
      const { trackCTA } = await import('./lib/trackingService');
      await trackCTA(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/track/cta`, {
        story_id: story.id,
        creator_id: story.creatorId,
        cta_type: type,
        product_id: story.productId,
        timestamp: Date.now(),
        user_id: 'user_' + Date.now() // In production, use actual user ID
      });
    } catch (error) {
      console.warn('[cta-tracking] Failed:', error);
    }
    
    onCTA?.(story.id, type);
  };

  const handleShop = async () => {
    trackRankerEvent(story.id, 'purchase');
    
    // Track purchase event to backend
    try {
      const { trackPurchase } = await import('./lib/trackingService');
      await trackPurchase(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/track/purchase`, {
        story_id: story.id,
        creator_id: story.creatorId,
        product_id: story.productId,
        purchase_amount: 999, // Mock amount, would come from product data
        commission_rate: story.metadata?.commission_rate || 0.05,
        timestamp: Date.now(),
        user_id: 'user_' + Date.now() // In production, use actual user ID
      });
    } catch (error) {
      console.warn('[purchase-tracking] Failed:', error);
    }
    
    handleCTA('shop');
  };

  return (
    <View style={styles.page}>
      {/* Moving header (inside page, scrolls with content) */}
      <CreatorHeader
        creators={creatorsForHeader}
        currentCreatorId={story.creatorId}
        onJumpToCreator={onJumpToCreator}
      />

      {/* Full-bleed video */}
      <Video
        ref={videoRef}
        style={StyleSheet.absoluteFill}
        source={{ uri: story.videoUrl }}
        resizeMode={ResizeMode.COVER}
        shouldPlay={false}
        isLooping
        onError={(e) => onError?.(story.id, e)}
        onPlaybackStatusUpdate={handleStatusUpdate}
      />

      {/* Right-side actions - 7 creator-specific icons */}
      <View style={styles.rightActions}>
        {getCreatorSpecificIcons(story).map((icon, index) => (
          <Pressable 
            key={index}
            style={[styles.actionBtn, icon.isShop && styles.shopBtn]} 
            onPress={() => icon.isShop ? handleShop() : handleCTA(icon.action)}
          >
            <Text style={icon.isShop ? styles.shopTxt : styles.actionTxt}>{icon.emoji}</Text>
            {icon.count && <Text style={styles.actionCount}>{icon.count}</Text>}
          </Pressable>
        ))}
      </View>

      {/* Bottom meta (creator + caption + AI score debug) */}
      <View style={styles.bottomMeta}>
        <View style={styles.creatorRow}>
          <Text style={styles.creatorName}>@{story.creatorName}</Text>
          {story.metadata?.creator_tier && (
            <View style={[styles.tierBadge, { backgroundColor: story.metadata.creator_tier === 'gold' ? '#FFD700' : story.metadata.creator_tier === 'blue' ? '#4A90E2' : '#666' }]}>
              <Text style={styles.tierText}>{story.metadata.creator_tier.toUpperCase()}</Text>
            </View>
          )}
        </View>
        <Text numberOfLines={2} style={styles.caption}>
          AisleMarts • Smart AI Shopping • Content → Purchase
        </Text>
        {process.env.EXPO_PUBLIC_RANKER_DEBUG === "1" && story.ctr && (
          <Text style={styles.debugText}>
            CTR: {(story.ctr * 100).toFixed(1)}% • Commission: {((story.commissionScore || 0) * 100).toFixed(1)}%
          </Text>
        )}
      </View>
    </View>
  );
};

// ---- Main screen ----
export default function VerticalStoriesScreen() {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<Story>>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rankerMeta, setRankerMeta] = useState<{ source: string; algorithm: string } | null>(null);

  // Generate mock user ID for ranking (in production, use actual user ID)
  const userId = useMemo(() => `user_${Math.random().toString(36).substr(2, 9)}`, []);

  // Fetch ranked stories (server → client fallback with our P2 system)
  useEffect(() => {
    let cancelled = false;

    async function fetchRankedStories() {
      try {
        setLoading(true);
        
        // Mock story data (in production, fetch from your API)
        const mockStories: Story[] = [
          {
            id: 's1',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            creatorId: 'c1',
            creatorName: 'luxefashion',
            creatorAvatar: 'https://i.pravatar.cc/100?u=c1',
            productId: 'p1',
            engagement: { impressions: 150, ctas: 12, purchases: 2, views: 140 },
            metadata: { creator_tier: 'gold', commission_rate: 0.12, repetition_penalty: 0.1 }
          },
          {
            id: 's2',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            creatorId: 'c2',
            creatorName: 'techguru',
            creatorAvatar: 'https://i.pravatar.cc/100?u=c2',
            productId: 'p2',
            engagement: { impressions: 89, ctas: 8, purchases: 1, views: 82 },
            metadata: { creator_tier: 'blue', commission_rate: 0.10, repetition_penalty: 0.05 }
          },
          {
            id: 's3',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            creatorId: 'c3',
            creatorName: 'fashionista',
            creatorAvatar: 'https://i.pravatar.cc/100?u=c3',
            productId: 'p3',
            engagement: { impressions: 234, ctas: 18, purchases: 4, views: 220 },
            metadata: { creator_tier: 'gold', commission_rate: 0.13, repetition_penalty: 0.02 }
          },
          {
            id: 's4',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            creatorId: 'c4',
            creatorName: 'techreviewer',
            creatorAvatar: 'https://i.pravatar.cc/100?u=c4',
            productId: 'p4',
            engagement: { impressions: 67, ctas: 5, purchases: 1, views: 65 },
            metadata: { creator_tier: 'grey', commission_rate: 0.07, repetition_penalty: 0.08 }
          },
          {
            id: 's5',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            creatorId: 'c5',
            creatorName: 'lifestyleblogger',
            creatorAvatar: 'https://i.pravatar.cc/100?u=c5',
            engagement: { impressions: 45, ctas: 2, purchases: 0, views: 43 },
            metadata: { creator_tier: 'unverified', commission_rate: 0.05, repetition_penalty: 0.0 }
          }
        ];

        // Apply AI ranking using our P2 system
        // Convert to ranker format
        const rankerFormatStories = mockStories.map(story => ({
          ...story,
          mediaUrl: story.videoUrl,
          type: "video" as const
        }));
        
        const rankerResult = await selectRanker(rankerFormatStories, userId, {
          sessionId: `session_${Date.now()}`,
          previousStories: [],
          track: (event: string, data: any) => {
            console.log(`[analytics] ${event}:`, data);
          }
        });

        if (!cancelled) {
          // Convert back to original format
          const originalFormatStories = rankerResult.stories.map(story => ({
            ...story,
            videoUrl: story.mediaUrl
          }));
          
          setStories(originalFormatStories);
          setRankerMeta({
            source: rankerResult.source,
            algorithm: rankerResult.algorithm
          });
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch stories:', error);
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchRankedStories();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Viewability → determine active page for autoplay/pause
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
      if (viewableItems?.length) {
        const mostVisible = viewableItems.reduce((best, cur) => {
          const bestPercent = best?.isViewable ? 1 : 0;
          const curPercent = cur?.isViewable ? 1 : 0;
          return curPercent > bestPercent ? cur : best;
        }, viewableItems[0]);
        
        if (typeof mostVisible.index === "number") {
          setActiveIndex(mostVisible.index);
        }
      }
    }
  ).current;

  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: 85,
      waitForInteraction: false,
    }),
    []
  );

  // Jump by tapping a creator icon in the moving header
  const jumpToCreator = useCallback(
    (creatorId: string) => {
      const idx = stories.findIndex((s) => s.creatorId === creatorId);
      if (idx >= 0) {
        listRef.current?.scrollToIndex({ index: idx, animated: true });
      }
    },
    [stories]
  );

  // Prefetch next N videos (lightweight preloading)
  useEffect(() => {
    async function preload() {
      const next = stories.slice(activeIndex + 1, activeIndex + 1 + PRELOAD_AHEAD);
      for (const s of next) {
        try {
          // Simple preload strategy - just initiate the network request
          const response = await fetch(s.videoUrl, { method: 'HEAD' });
          console.log(`[preload] ${s.id}: ${response.status}`);
        } catch (e) {
          // Silent fail for prefetch
        }
      }
    }
    
    if (stories.length && activeIndex >= 0) {
      preload();
    }
  }, [activeIndex, stories]);

  const creatorsForHeader = useMemo(
    () =>
      Array.from(
        new Map(
          stories.map((s) => [
            s.creatorId,
            {
              id: s.creatorId,
              name: s.creatorName,
              avatar: s.creatorAvatar,
              tier: s.metadata?.creator_tier
            }
          ])
        ).values()
      ),
    [stories]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Story; index: number }) => (
      <View style={{ height: SCREEN_H }}>
        <StoryPage
          story={item}
          isActive={index === activeIndex}
          onReady={(id) => {
            console.log(`[impression] Story ${id} first frame ready`);
          }}
          onError={(id, err) => {
            console.log(`[error] Story ${id}:`, err);
          }}
          onJumpToCreator={jumpToCreator}
          creatorsForHeader={creatorsForHeader}
          onCTA={(storyId, type) => {
            console.log(`[cta] Story ${storyId}: ${type}`);
          }}
        />
      </View>
    ),
    [activeIndex, jumpToCreator, creatorsForHeader]
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<Story> | null | undefined, index: number) => ({
      length: SCREEN_H,
      offset: SCREEN_H * index,
      index,
    }),
    []
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading AI-ranked stories...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <FlatList
        ref={listRef}
        data={stories}
        keyExtractor={(s) => s.id}
        renderItem={renderItem}
        pagingEnabled
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_H}
        snapToAlignment="start"
        disableIntervalMomentum
        getItemLayout={getItemLayout}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        removeClippedSubviews
        windowSize={5}
        maxToRenderPerBatch={3}
        initialNumToRender={2}
      />
      
      {/* Performance HUD (if enabled) */}
      {process.env.EXPO_PUBLIC_SHOW_PERF_HUD === "1" && (
        <PerfHUD creators={creatorsForHeader.length} stories={stories.length} />
      )}
      
      {/* AI Ranker Debug Info */}
      {process.env.EXPO_PUBLIC_RANKER_DEBUG === "1" && rankerMeta && (
        <View style={styles.debugOverlay}>
          <Text style={styles.debugText}>
            Ranker: {rankerMeta.algorithm} ({rankerMeta.source})
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  centered: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: 'white', fontSize: 16 },
  page: { flex: 1, backgroundColor: "black" },
  headerWrap: {
    position: "absolute",
    top: 0,
    left: 0, right: 0,
    paddingTop: 12,
    paddingHorizontal: 12,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  headerTitleRow: { marginBottom: 8 },
  headerTitle: { color: "white", fontWeight: "600", fontSize: 16 },
  iconsRow: { flexDirection: "row", gap: 10 },
  iconItem: { alignItems: "center", width: 52 },
  avatar: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: "#ffffff22", 
    borderWidth: 2,
    borderColor: "#ffffff55"
  },
  avatarActive: { borderWidth: 3 },
  iconLabel: { marginTop: 4, color: "#ddd", fontSize: 11, textAlign: 'center' },
  iconLabelActive: { color: "#fff", fontWeight: "700" },
  rightActions: {
    position: "absolute",
    right: 12,
    bottom: 120,
    alignItems: "center",
    gap: 16,
  },
  actionBtn: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: "#00000075",
    alignItems: "center", justifyContent: "center",
  },
  actionTxt: { color: "white", fontSize: 20, fontWeight: "700" },
  shopBtn: { backgroundColor: "#ff2d55" },
  shopTxt: { color: "white", fontWeight: "800", fontSize: 12 },
  bottomMeta: {
    position: "absolute",
    left: 12, right: 80, bottom: 32,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 12,
    borderRadius: 8,
  },
  creatorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  creatorName: { color: "white", fontWeight: "700", fontSize: 16 },
  tierBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tierText: { color: 'white', fontSize: 10, fontWeight: '800' },
  caption: { color: "white", fontSize: 14, lineHeight: 20 },
  debugText: { color: "#ffff00", fontSize: 10, marginTop: 4 },
  debugOverlay: {
    position: 'absolute',
    top: 60,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 8,
    borderRadius: 4,
  },
});