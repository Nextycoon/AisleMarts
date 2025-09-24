import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchStories } from '../api';
import type { Story } from '../types';

export function useStoriesCursor(initialCursor: string | null = null, pageSize = 24) {
  const [stories, setStories] = useState<Story[]>([]);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const inflight = useRef<Promise<any> | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || done) return;
    setLoading(true);
    try {
      const p = fetchStories(cursor, pageSize);
      inflight.current = p;
      const res = await p;
      setStories((prev) => [...prev, ...res.data]);
      setCursor(res.cursor ?? null);
      if (!res.cursor || res.data.length === 0) setDone(true);
    } finally {
      inflight.current = null;
      setLoading(false);
    }
  }, [cursor, done, loading, pageSize]);

  useEffect(() => { if (stories.length === 0) loadMore(); }, []); // initial

  return { stories, loadMore, loading, done };
}
