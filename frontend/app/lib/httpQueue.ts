import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "offline-queue-v1";

export async function enqueue(url: string, body: any, headers: Record<string,string>) {
  const q = JSON.parse((await AsyncStorage.getItem(KEY)) || "[]");
  q.push({ url, body, headers, ts: Date.now() });
  await AsyncStorage.setItem(KEY, JSON.stringify(q));
}

export function bootFlusher(fetcher = fetch) {
  const flush = async () => {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return;
    const q = JSON.parse(raw);
    const next = [] as typeof q;
    for (const item of q) {
      try {
        const r = await fetcher(item.url, { method:"POST", headers:item.headers, body: JSON.stringify(item.body) });
        if (r.ok || r.status === 409) continue; // delivered or replay
        next.push(item);
      } catch { next.push(item); }
    }
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  };
  NetInfo.addEventListener((s) => s.isConnected && flush());
  return { flush };
}