import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, SafeAreaView } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import type { Story } from './types';
import { PreloadCoordinator } from './PreloadCoordinator';

type Props = {
  stories: Story[];
  initialIndex?: number;
  nextCreatorFirst?: Story;
  onClose: () => void;
  onExitCreator: () => void;
  onProduct: (productId: string) => void;
  preload: PreloadCoordinator;
};

export const StoryViewer: React.FC<Props> = ({
  stories, initialIndex = 0, nextCreatorFirst, onClose, onExitCreator, onProduct, preload
}) => {
  const [index, setIndex] = useState(initialIndex);
  const [paused, setPaused] = useState(false);
  const videoRef = useRef<Video | null>(null);

  const story = stories[index];

  useEffect(() => {
    let mounted = true;
    const t = setTimeout(() => {
      if (!mounted) return;
      preload.preloadNext(index, stories, nextCreatorFirst);
    }, 0);
    return () => { mounted = false; clearTimeout(t); };
  }, [index, stories, nextCreatorFirst]);

  const goNext = () => { if (index < stories.length - 1) setIndex(index + 1); else onExitCreator(); };
  const goPrev = () => { if (index > 0) setIndex(index - 1); };

  const onLongPress = (down: boolean) => setPaused(down);

  if (!story) return null;

  const isVideo = story.mediaUrl.match(/\.(mp4|mov|m4v|webm)(\?.*)?$/i);

  return (
    <SafeAreaView style={s.wrap} testID="story-viewer">
      {/* Progress bars */}
      <View style={s.progressContainer}>
        {stories.map((_, i) => (
          <View key={i} style={[s.progressBar, { backgroundColor: i <= index ? '#fff' : '#fff3' }]} />
        ))}
      </View>

      <PanGestureHandler onHandlerStateChange={(e) => {
        if ((e.nativeEvent as any).state === State.END) {
          const dx = (e.nativeEvent as any).translationX;
          if (dx < -30) goNext();
          if (dx > 30) goPrev();
        }
      }}>
        <View style={s.surface} testID="story-surface">
          {isVideo ? (
            <Video
              ref={(r) => (videoRef.current = r)}
              source={{ uri: story.mediaUrl }}
              style={s.media}
              resizeMode={ResizeMode.COVER}
              shouldPlay={!paused}
              isLooping
            />
          ) : (
            <Image source={{ uri: story.mediaUrl }} style={s.media} />
          )}
        </View>
      </PanGestureHandler>

      {paused && <View style={s.paused} testID="playback-state-paused"><Text style={{ color: '#fff' }}>⏸️ Paused</Text></View>}

      <View style={s.header}>
        <Text style={s.creatorHandle} testID="creator-handle">@{story.creatorId}</Text>
        <Text style={s.storyType}>{story.type.toUpperCase()}</Text>
      </View>

      <View style={s.actions}>
        <TouchableOpacity onPress={goPrev} style={s.tapLeft} />
        <TouchableOpacity onPress={goNext} style={s.tapRight} testID="story-tap-right" />
      </View>

      {story.type === 'product' && story.productId && (
        <TouchableOpacity onPress={() => onProduct(story.productId)} style={s.cta} testID="cta-buy-now">
          <Text style={s.ctaText}>🛍️ Buy Now</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={onClose} style={s.close} testID="close-stories">
        <Text style={s.closeText}>✕</Text>
      </TouchableOpacity>
      
      <View testID="preload-ready" style={{ position:'absolute', width:1, height:1, opacity:0 }} />
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#000' },
  progressContainer: { 
    position: 'absolute', 
    top: 50, 
    left: 12, 
    right: 12, 
    height: 2, 
    flexDirection: 'row', 
    zIndex: 10,
    gap: 4
  },
  progressBar: { 
    flex: 1, 
    height: 2, 
    backgroundColor: '#fff3', 
    borderRadius: 1 
  },
  surface: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  media: { width: '100%', height: '100%' },
  paused: { 
    position: 'absolute', 
    top: '45%', 
    alignSelf: 'center', 
    backgroundColor: '#0008', 
    padding: 16, 
    borderRadius: 8,
    alignItems: 'center'
  },
  header: { position: 'absolute', top: 70, left: 16 },
  creatorHandle: { fontSize: 16, color: '#fff', fontWeight: 'bold' },
  storyType: { fontSize: 12, color: '#ccc', marginTop: 4 },
  actions: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, flexDirection: 'row' },
  tapLeft: { flex: 1 },
  tapRight: { flex: 1 },
  cta: { 
    position: 'absolute', 
    bottom: 100, 
    left: 16, 
    right: 16, 
    backgroundColor: '#D4AF37', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  ctaText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  close: { position: 'absolute', top: 50, right: 16, padding: 8 },
  closeText: { color: '#fff', fontSize: 20, fontWeight: 'bold' }
});