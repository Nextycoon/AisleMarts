import { detectProvider } from './runtimeProviders';

export type Token = {
  provider: 'ios' | 'gms' | 'hms' | 'none';
  token?: string;
};

export async function initPush(): Promise<Token> {
  const provider = await detectProvider();
  
  try {
    if (provider === 'ios') {
      try {
        const Notifications = (await import('expo-notifications')).default;
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') return { provider };
        const token = (await Notifications.getDevicePushTokenAsync()).data;
        return { provider, token };
      } catch {
        console.log('[push] expo-notifications not available');
        return { provider };
      }
    }
    
    if (provider === 'gms') {
      try {
        const messaging = (await import('@react-native-firebase/messaging')).default;
        await messaging().requestPermission();
        const token = await messaging().getToken();
        return { provider, token };
      } catch {
        console.log('[push] @react-native-firebase/messaging not available');
        return { provider };
      }
    }
    
    if (provider === 'hms') {
      try {
        const Hms: any = await import('@hmscore/react-native-hms-push');
        const res = await Hms.HmsPushInstanceId.getToken();
        const token = res?.result || res?.token;
        return { provider, token };
      } catch {
        console.log('[push] @hmscore/react-native-hms-push not available');
        return { provider };
      }
    }
  } catch (error) {
    console.log('[push] init error:', error);
  }
  
  return { provider: provider ?? 'none' };
}
