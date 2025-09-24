import { Asset } from 'expo-asset';
import { MediaCacheLRU } from './MediaCacheLRU';
import type { Story } from './types';

export class PreloadCoordinator {
  private cache: MediaCacheLRU;
  constructor(cache: MediaCacheLRU) { this.cache = cache; }

  async preloadStory(story: Story) {
    if (!story?.mediaUrl) return;
    if (this.cache.get(story.mediaUrl)) return; // already cached
    try {
      const asset = Asset.fromURI(story.mediaUrl);
      await asset.downloadAsync();
      const bytes = (asset as any).downloaded ? (asset as any).filesize ?? 1_000_000 : 1_000_000;
      this.cache.set(story.mediaUrl, asset.localUri ?? story.mediaUrl, bytes);
    } catch {
      // ignore preload failures
    }
  }

  async preloadNext(currentIndex: number, stories: Story[], nextCreatorFirst?: Story) {
    const next = stories[currentIndex + 1];
    if (next) await this.preloadStory(next);
    if (nextCreatorFirst) await this.preloadStory(nextCreatorFirst);
  }
}
