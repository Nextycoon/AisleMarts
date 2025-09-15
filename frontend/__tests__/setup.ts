import '@testing-library/jest-native/extend-expect';
import {jest} from '@jest/globals';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: () => ({ granted: true }),
  launchImageLibraryAsync: () => ({
    canceled: false,
    assets: [{ base64: 'mock-base64-data' }]
  }),
  MediaTypeOptions: { Images: 'Images' }
}));

// Mock SafeAreaProvider
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 })
}));

// Silence warnings
console.warn = jest.fn();
console.error = jest.fn();
