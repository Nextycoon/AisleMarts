import * as Linking from 'expo-linking';

export type DeepLink =
  | { type: 'story'; id: string }
  | { type: 'product'; id: string }
  | { type: 'unknown' };

export function parseDeepLink(url: string): DeepLink {
  try {
    const { hostname, path, queryParams } = Linking.parse(url);
    // Support both app scheme and web
    // aislemarts://story/s-123  or  https://yourdomain.com/app/story/s-123
    const parts = (path || '').split('/').filter(Boolean); // e.g., ['story','s-123']
    if (parts[0] === 'story' && parts[1]) return { type: 'story', id: parts[1] };
    if (parts[0] === 'product' && parts[1]) return { type: 'product', id: parts[1] };
    // web paths under /app/*
    if (hostname && parts[0] === 'app' && parts[1] === 'story' && parts[2]) {
      return { type: 'story', id: parts[2] };
    }
    if (hostname && parts[0] === 'app' && parts[1] === 'product' && parts[2]) {
      return { type: 'product', id: parts[2] };
    }
  } catch {}
  return { type: 'unknown' };
}
