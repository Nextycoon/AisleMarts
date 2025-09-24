import Constants from 'expo-constants';
import type { Paged, Story, Creator } from './types';

// Use the backend URL from environment
const getBaseUrl = () => {
  const backendUrl = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';
  return backendUrl;
};

export async function fetchCreators(): Promise<Creator[]> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/creators`);
  if (!res.ok) throw new Error('creators fetch failed');
  return res.json();
}

export async function fetchStories(cursor?: string | null, limit = 24): Promise<Paged<Story>> {
  const base = getBaseUrl();
  const url = new URL(`${base}/api/stories`);
  if (cursor) url.searchParams.set('cursor', cursor);
  url.searchParams.set('limit', String(limit));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('stories fetch failed');
  return res.json();
}