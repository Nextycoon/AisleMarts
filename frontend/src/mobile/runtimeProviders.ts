import { Platform } from 'react-native';
export async function detectProvider(): Promise<'ios'|'gms'|'hms'|'none'> {
  if (Platform.OS === 'ios') return 'ios';
  try { const ua=(global as any)?.navigator?.userAgent||''; if(/huawei|honor|hms/i.test(ua)) return 'hms'; } catch {}
  return Platform.OS === 'android' ? 'gms' : 'none';
}
