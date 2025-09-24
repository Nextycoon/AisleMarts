/**
 * Unified push bridge for iOS (APNS via Expo/Notifications), Android-GMS (FCM), Android-HMS (Push Kit).
 * All imports are dynamic so your project builds even if a provider package is missing.
 */
import { Platform } from 'react-native';
import { detectProvider } from './runtimeProviders';

type Token = { provider: 'ios'|'gms'|'hms'|'none', token?: string };

export async function initPush(): Promise<Token> {
  const provider = await detectProvider();

  if (provider === 'ios') {
    try {
      const Notifications = (await import('expo-notifications')).default;
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return { provider: 'ios' };
      const token = (await Notifications.getDevicePushTokenAsync()).data;
      return { provider, token };
    } catch { return { provider }; }
  }

  if (provider === 'gms') {
    try {
      const messaging = (await import('@react-native-firebase/messaging')).default;
      await messaging().requestPermission();
      const token = await messaging().getToken();
      return { provider, token };
    } catch { return { provider }; }
  }

  if (provider === 'hms') {
    try {
      // @ts-ignore
      const HmsPush = (await import('@hmscore/react-native-hms-push')) as any;
      const res = await HmsPush.HmsPushInstanceId.getToken();
      const token = res?.result || res?.token;
      return { provider, token };
    } catch { return { provider }; }
  }

  return { provider: 'none' };
}
