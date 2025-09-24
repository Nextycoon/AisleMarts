import { Image } from 'react-native';

type Story = {
  id: string;
  type: 'image' | 'video' | 'mixed';
  mediaUrl: string;
  thumbUrl?: string;
};

const inflight = new Set<string>();
const done = new Set<string>();

async function prefetchImage(url: string) {
  if (!url || done.has(url) || inflight.has(url)) return;
  inflight.add(url);
  try { await Image.prefetch(url); } finally {
    inflight.delete(url);
    done.add(url);
  }
}

// Lazy import for video so no hard dep if you don't use it
async function prefetchVideo(url: string) {
  try {
    const { Video } = await import('expo-av');
    // @ts-ignore - loadAsync returns promise; we immediately unload to warm cache
    const video = new Video({});
    await video.loadAsync({ uri: url }, { shouldPlay: false }, false);
    await video.unloadAsync();
  } catch { /* ignore */ }
}

export async function preloadStories(stories: Story[], currentIndex: number, window = 3) {
  const targets = stories.slice(currentIndex + 1, currentIndex + 1 + window);
  for (const s of targets) {
    if (s.thumbUrl) prefetchImage(s.thumbUrl);
    if (s.type === 'image' || s.type === 'mixed') prefetchImage(s.mediaUrl);
    if (s.type === 'video' || s.type === 'mixed') prefetchVideo(s.mediaUrl);
  }
}

// Helper to use with FlatList onViewableItemsChanged
export function makeViewabilityPreloader(getStories: ()=>Story[], window = 3) {
  return ({ viewableItems }: { viewableItems: Array<{index?: number}> }) => {
    const idx = viewableItems?.[0]?.index ?? 0;
    const stories = getStories();
    preloadStories(stories, idx, window);
  };
}
