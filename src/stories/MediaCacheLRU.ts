type Entry = { key: string; uri: string; bytes: number; ts: number };

export class MediaCacheLRU {
  private map = new Map<string, Entry>();
  private total = 0;
  constructor(private maxBytes = 75 * 1024 * 1024) {}

  get sizeBytes() { return this.total; }

  get(key: string) {
    const e = this.map.get(key);
    if (!e) return null;
    e.ts = Date.now();
    return e.uri;
  }

  set(key: string, uri: string, bytes = 1_000_000) { // default 1MB if unknown
    const existed = this.map.get(key);
    if (existed) {
      this.total -= existed.bytes;
      this.map.delete(key);
    }
    const e: Entry = { key, uri, bytes, ts: Date.now() };
    this.map.set(key, e);
    this.total += e.bytes;
    this.evict();
  }

  evict() {
    if (this.total <= this.maxBytes) return;
    const arr = Array.from(this.map.values()).sort((a, b) => a.ts - b.ts); // oldest first
    for (const e of arr) {
      this.map.delete(e.key);
      this.total -= e.bytes;
      if (this.total <= this.maxBytes) break;
    }
  }
}
