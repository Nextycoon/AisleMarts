import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Modal, SafeAreaView, StatusBar, Alert } from 'react-native';
import { fetchCreators } from './api';
import type { Creator, Story } from './types';
import { VirtualizedRings } from './VirtualizedRings';
import { StoryViewer } from './StoryViewer';
import { useStoriesCursor } from './hooks/useStoriesCursor';
import { MediaCacheLRU } from './MediaCacheLRU';
import { PreloadCoordinator } from './PreloadCoordinator';

export const InfinityStoriesScreen: React.FC = () => {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [open, setOpen] = useState(false);
  const [currentCreator, setCurrentCreator] = useState<Creator | null>(null);
  const [viewedMap, setViewedMap] = useState<Record<string, boolean>>({});
  const [creatorStories, setCreatorStories] = useState<Record<string, Story[]>>({});

  const { stories, loadMore } = useStoriesCursor(null, 24);
  const cache = useMemo(() => new MediaCacheLRU(75 * 1024 * 1024), []);
  const preloader = useMemo(() => new PreloadCoordinator(cache), [cache]);

  useEffect(() => {
    fetchCreators().then(setCreators).catch(() => setCreators([]));
  }, []);

  useEffect(() => {
    // Group stories per creator
    const grouped: Record<string, Story[]> = {};
    for (const s of stories) {
      if (!grouped[s.creatorId]) grouped[s.creatorId] = [];
      // filter expired
      if (Date.now() < s.expiresAt) grouped[s.creatorId].push(s);
    }
    setCreatorStories(grouped);
  }, [stories]);

  const onPressCreator = (creator: Creator, index: number) => {
    setCurrentCreator(creator);
    setOpen(true);
  };

  const onClose = () => setOpen(false);
  const onExitCreator = () => {
    if (currentCreator) setViewedMap((v) => ({ ...v, [currentCreator.id]: true }));
    setOpen(false);
  };
  const onProduct = (pid: string) => {
    Alert.alert('Product', `Navigate to /product/${pid}`);
  };

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:'#000' }}>
      <StatusBar barStyle="light-content" />
      <VirtualizedRings creators={creators} viewedMap={viewedMap} onPressCreator={onPressCreator} />
      <View style={{ height: 1 }} />
      {/* trigger more on end user scroll; for demo call loadMore once */}
      <View><Text style={{color:'#999', textAlign:'center', margin:8}}>Infinity Stories</Text></View>

      <Modal visible={open} animationType="fade" onRequestClose={onClose}>
        {currentCreator && (
          <StoryViewer
            stories={creatorStories[currentCreator.id] || []}
            onClose={onClose}
            onExitCreator={onExitCreator}
            onProduct={onProduct}
            preload={preloader}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
};

export default InfinityStoriesScreen;
