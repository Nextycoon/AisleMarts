import React, { useMemo, useRef, useCallback, useEffect } from "react";
import { FlatList, ViewToken } from "react-native";
import { PrefetchCoordinator } from "../lib/PrefetchCoordinator";
import { PerfHUD } from "../components/PerfHUD";

type Story = { id: string; mediaUrl: string; type: "image" | "video" };

interface StoryCardProps {
  story: Story;
}

// Simple StoryCard component for now - can be enhanced later
const StoryCard: React.FC<StoryCardProps> = ({ story }) => {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      backgroundImage: `url(${story.mediaUrl})`, 
      backgroundSize: 'cover', 
      backgroundPosition: 'center' 
    }}>
      <div style={{ 
        position: 'absolute', 
        bottom: '20px', 
        left: '20px', 
        color: 'white', 
        fontSize: '18px' 
      }}>
        Story ID: {story.id}
      </div>
    </div>
  );
};

export default function StoriesScreen({ stories }: { stories: Story[] }) {
  // --- Prefetcher (3-item lookahead)
  const prefetchRef = useRef(new PrefetchCoordinator(stories, 3)).current;
  useEffect(() => { prefetchRef.attachGlobal(); prefetchRef.updateStories(stories); }, [stories]);

  // --- Viewability → inform prefetch focus
  const viewabilityConfig = useMemo(() => ({ itemVisiblePercentThreshold: 80 }), []);
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const idx = viewableItems[0]?.index ?? 0;
      prefetchRef.focus(idx);
    }
  ).current;

  const renderItem = useCallback(({ item }: { item: Story }) => (
    <StoryCard story={item} />
  ), []);

  const getItemLayout = useCallback((_: any, i: number) => (
    { length: 1, offset: i, index: i } // full-screen paging; avoids re-measure
  ), []);

  const onEndReached = useCallback(() => {
    // trigger pagination; backend already supports cursor
    // fetchMore();
  }, []);

  return (
    <>
      <FlatList
        data={stories}
        renderItem={renderItem}
        keyExtractor={(s) => s.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        windowSize={5}
        initialNumToRender={3}
        maxToRenderPerBatch={4}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        getItemLayout={getItemLayout}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.7}
      />
      {/* Opt-in during testing */}
      {process.env.EXPO_PUBLIC_SHOW_PERF_HUD === "1" && (
        <PerfHUD creators={1} stories={stories.length} />
      )}
    </>
  );
}