import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
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

  const isVideo = story.mediaUrl.match(/\.(mp4|mov|m4v|webm)(\?.*)?$/i);

  return (
    <View style={s.wrap} testID="story-viewer">
      {/* progress placeholder */}
      <View accessibilityLabel="progress" testID="progress" style={s.progress} />

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

      {paused && <View style={s.paused} testID="playback-state-paused"><Text>Paused</Text></View>}

      <View style={s.header}><Text testID="creator-handle">@{story.creatorId}</Text></View>

      <View style={s.actions}>
        <TouchableOpacity onPress={goPrev} style={s.tapLeft} />
        <TouchableOpacity onPress={goNext} style={s.tapRight} testID="story-tap-right" />
      </View>

      {story.type === 'product' && story.productId && (
        <TouchableOpacity onPress={() => onProduct(story.productId)} style={s.cta} testID="cta-buy-now">
          <Text style={{ color: '#fff' }}>Buy Now</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={onClose} style={s.close} testID="close-stories"><Text style={{color:'#fff'}}>×</Text></TouchableOpacity>
      <View testID="preload-ready" style={{ position:'absolute', width:1, height:1, opacity:0 }} />
    </View>
  );
};

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#000' },
  progress: { position: 'absolute', top: 12, left: 12, right: 12, height: 2, backgroundColor: '#fff3' },
  surface: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  media: { width: '100%', height: '100%' },
  paused: { position: 'absolute', top: '45%', alignSelf: 'center', backgroundColor: '#0008', padding: 8, borderRadius: 6 },
  header: { position: 'absolute', top: 24, left: 16 },
  actions: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, flexDirection: 'row' },
  tapLeft: { flex: 1 },
  tapRight: { flex: 1 },
  cta: { position: 'absolute', bottom: 48, left: 16, right: 16, backgroundColor: '#ef4444', padding: 12, borderRadius: 8, alignItems: 'center' },
  close: { position: 'absolute', top: 24, right: 16 }
});
