import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Modal, SafeAreaView, StatusBar, Alert, StyleSheet } from 'react-native';
import { fetchCreators } from '../src/stories/api';
import type { Creator, Story } from '../src/stories/types';
import { VirtualizedRings } from '../src/stories/VirtualizedRings';
import { StoryViewer } from '../src/stories/StoryViewer';
import { useStoriesCursor } from '../src/stories/useStoriesCursor';
import { MediaCacheLRU } from '../src/stories/MediaCacheLRU';
import { PreloadCoordinator } from '../src/stories/PreloadCoordinator';

export default function InfinityStoriesScreen() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [open, setOpen] = useState(false);
  const [currentCreator, setCurrentCreator] = useState<Creator | null>(null);
  const [viewedMap, setViewedMap] = useState<Record<string, boolean>>({});
  const [creatorStories, setCreatorStories] = useState<Record<string, Story[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { stories, loadMore } = useStoriesCursor(null, 24);
  const cache = useMemo(() => new MediaCacheLRU(75 * 1024 * 1024), []);
  const preloader = useMemo(() => new PreloadCoordinator(cache), [cache]);

  useEffect(() => {
    fetchCreators()
      .then((data) => {
        setCreators(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
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
    Alert.alert('Product Navigation', `Navigate to /product/${pid}`, [
      { text: 'OK', onPress: () => console.log(`Product ${pid} navigation`) }
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading Infinity Stories...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🌊⚡ Infinity Stories</Text>
        <Text style={styles.subtitle}>Phase 2: Virtual Scrolling & Performance</Text>
      </View>

      {/* Virtualized Story Rings */}
      <VirtualizedRings creators={creators} viewedMap={viewedMap} onPressCreator={onPressCreator} />
      
      {/* Stats */}
      <View style={styles.stats}>
        <Text style={styles.statText}>
          {creators.length} Creators • {stories.length} Stories • {Object.keys(viewedMap).length} Viewed
        </Text>
        <Text style={styles.cacheText}>
          Cache: {Math.round(cache.sizeBytes / (1024 * 1024))}MB / 75MB
        </Text>
      </View>

      {/* Story Viewer Modal */}
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  stats: {
    padding: 16,
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: '#ccc',
  },
  cacheText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    padding: 20,
  },
});