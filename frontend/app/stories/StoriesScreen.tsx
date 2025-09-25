import React, { useMemo, useRef, useCallback, useEffect } from "react";
import { FlatList, ViewToken, View, Text, Image, Dimensions } from "react-native";
import { PrefetchCoordinator } from "../lib/PrefetchCoordinator";
import { PerfHUD } from "../components/PerfHUD";

const { width, height } = Dimensions.get('window');

type Story = { id: string; mediaUrl: string; type: "image" | "video" };

interface StoryCardProps {
  story: Story;
}

// Proper React Native StoryCard component
const StoryCard: React.FC<StoryCardProps> = ({ story }) => {
  return (
    <View style={{ 
      width, 
      height, 
      backgroundColor: '#1A1A1A',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Image 
        source={{ uri: story.mediaUrl }}
        style={{ 
          width: width * 0.9,
          height: height * 0.8,
          borderRadius: 12,
          backgroundColor: '#333'
        }}
        resizeMode="cover"
      />
      <View style={{ 
        position: 'absolute', 
        bottom: 60, 
        left: 20, 
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 8
      }}>
        <Text style={{ 
          color: '#fff', 
          fontSize: 14,
          fontWeight: '500'
        }}>
          Story {story.id}
        </Text>
        <Text style={{ 
          color: '#ccc', 
          fontSize: 12,
          marginTop: 2
        }}>
          {story.type === 'video' ? '📹' : '📸'} {story.type.toUpperCase()}
        </Text>
      </View>
    </View>
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
    { length: width, offset: width * i, index: i } // horizontal paging with screen width
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