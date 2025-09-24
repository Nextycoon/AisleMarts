import { Platform } from 'react-native';

const CANDIDATES: (string | undefined)[] = [
  process.env.EXPO_PUBLIC_API_URL,
  'https://YOUR-RAILWAY-SUBDOMAIN.up.railway.app',
  'http://192.168.1.100:3000',
  'http://10.0.2.2:3000',
];

async function isHealthy(url?: string) {
  if (!url) return false;
  try {
    const u = url.replace(/\/$/, '') + '/health';
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 1500);
    const res = await fetch(u, { signal: ctl.signal, method: 'GET' });
    clearTimeout(t);
    return res.ok;
  } catch { return false; }
}

let memo: string | null = null;
export async function getApiBaseUrl(): Promise<string> {
  if (memo) return memo;
  for (const url of CANDIDATES) {
    if (!url) continue;
    if (Platform.OS === 'android' && url.startsWith('http://')) continue;
    if (await isHealthy(url)) { memo = url; break; }
  }
  if (!memo) throw new Error('No healthy API base URL found');
  return memo;
}
