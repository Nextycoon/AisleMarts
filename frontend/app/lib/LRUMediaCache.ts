export class LRUMediaCache {
  private map = new Map<string, { size: number }>();
  private bytes = 0;
  constructor(private maxBytes = 75 * 1024 * 1024) {}
  has(k: string) { return this.map.has(k); }
  put(k: string, size = 1_000_000) {
    if (this.map.has(k)) { const v = this.map.get(k)!; this.bytes -= v.size; this.map.delete(k); }
    this.map.set(k, { size }); this.bytes += size;
    while (this.bytes > this.maxBytes && this.map.size) {
      const [oldK, v] = this.map.entries().next().value;
      this.map.delete(oldK); this.bytes -= v.size;
    }
  }
  usageMB() { return Math.round(this.bytes / 1024 / 1024); }
}