import { Image } from "react-native";
import { LRUMediaCache } from "./LRUMediaCache";

type Story = { id: string; mediaUrl: string; type: "image" | "video" };

export class PrefetchCoordinator {
  private idx = 0;
  constructor(private stories: Story[], private lookahead = 3, private cache = new LRUMediaCache()) {}
  attachGlobal() { (globalThis as any).__prefetch = this; (this as any).cache = this.cache; }
  updateStories(stories: Story[]) { this.stories = stories; this.kick(); }
  focus(i: number) { this.idx = i; this.kick(); }

  private async kick() {
    for (let d = 1; d <= this.lookahead; d++) {
      const s = this.stories[this.idx + d];
      if (!s || this.cache.has(s.mediaUrl)) continue;
      try {
        await Image.prefetch(s.mediaUrl);
        this.cache.put(s.mediaUrl);
      } catch {}
    }
  }
}