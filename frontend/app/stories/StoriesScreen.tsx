import React, { useMemo, useRef, useCallback, useEffect, useState } from "react";
import { FlatList, ViewToken, View, Dimensions } from "react-native";
import { PrefetchCoordinator } from "../lib/PrefetchCoordinator";
import { PerfHUD } from "../components/PerfHUD";
import { StoryCard } from "../components/StoryCard";

const { width } = Dimensions.get('window');

type Story = { id: string; mediaUrl: string; type: "image" | "video" };

export default function StoriesScreen({ stories }: { stories: Story[] }) {
  const [visibleIndex, setVisibleIndex] = useState(0);
  
  // --- Prefetcher (3-item lookahead with video support)
  const prefetchRef = useRef(new PrefetchCoordinator(stories, 3)).current;
  useEffect(() => { 
    prefetchRef.attachGlobal(); 
    prefetchRef.updateStories(stories); 
  }, [stories]);

  // --- Viewability → inform prefetch focus & track visible videos
  const viewabilityConfig = useMemo(() => ({ itemVisiblePercentThreshold: 80 }), []);
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const idx = viewableItems[0]?.index ?? 0;
      setVisibleIndex(idx);
      prefetchRef.focus(idx);
      (globalThis as any).__visibleIndex = idx;
    }
  ).current;

  const renderItem = useCallback(({ item, index }: { item: Story; index: number }) => (
    <StoryCard story={{ ...item, __visible: index === visibleIndex }} />
  ), [visibleIndex]);

  const getItemLayout = useCallback((_: any, i: number) => (
    { length: width, offset: width * i, index: i }
  ), []);

  const onEndReached = useCallback(() => {
    // trigger pagination; backend already supports cursor
    // fetchMore();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#1A1A1A' }}>
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
        overScrollMode="never"
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
    </View>
  );
}