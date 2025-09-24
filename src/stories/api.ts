import { getApiBaseUrl } from '../utils/smartBaseUrl';
import type { Paged, Story, Creator } from './types';

export async function fetchCreators(): Promise<Creator[]> {
  const base = await getApiBaseUrl();
  const res = await fetch(`${base}/api/creators`);
  if (!res.ok) throw new Error('creators fetch failed');
  return res.json();
}

export async function fetchStories(cursor?: string | null, limit = 24): Promise<Paged<Story>> {
  const base = await getApiBaseUrl();
  const url = new URL(`${base}/api/stories`);
  if (cursor) url.searchParams.set('cursor', cursor);
  url.searchParams.set('limit', String(limit));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('stories fetch failed');
  return res.json();
}
