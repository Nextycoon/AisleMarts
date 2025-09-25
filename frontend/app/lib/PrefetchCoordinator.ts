import { Image } from "react-native";
import { Asset } from "expo-asset";
import { LRUMediaCache } from "./LRUMediaCache";

type Story = { id: string; mediaUrl: string; type: "image" | "video" };

export class PrefetchCoordinator {
  private idx = 0;
  constructor(private stories: Story[], private lookahead = 3, private cache = new LRUMediaCache()) {}
  attachGlobal() { (globalThis as any).__prefetch = this; (this as any).cache = this.cache; }
  updateStories(stories: Story[]) { this.stories = stories; this.kick(); }
  focus(i: number) { this.idx = i; this.kick(); }

  private async prefetch(url: string, type: Story["type"]) {
    if (this.cache.has(url)) return;
    try {
      if (type === "image") {
        await Image.prefetch(url);
        this.cache.put(url);
      } else if (type === "video") {
        // Video preloading with expo-asset (file system cache)
        const asset = Asset.fromURI(url);
        await asset.downloadAsync();
        this.cache.put(url, asset.downloaded ? asset.filesize ?? 1_500_000 : 1_500_000);
      }
    } catch (error) {
      // Silent fail for prefetch - don't block user experience
      console.warn(`Prefetch failed for ${type} ${url}:`, error);
    }
  }

  private async kick() {
    for (let d = 1; d <= this.lookahead; d++) {
      const s = this.stories[this.idx + d];
      if (!s) continue;
      await this.prefetch(s.mediaUrl, s.type);
    }
  }

  // P1b: Get prefetch statistics for performance monitoring
  getStats() {
    const usage = this.cache.usageMB();
    return {
      cacheUsageMB: usage,
      lookahead: this.lookahead,
      currentIndex: this.idx,
      totalStories: this.stories.length
    };
  }

  // P1b: Dynamic lookahead adjustment based on performance
  adjustLookahead(newLookahead: number) {
    this.lookahead = Math.max(1, Math.min(5, newLookahead));
  }
}