import { Platform } from 'react-native';

export const TEST_IDS = {
  loading: 'lux-loading',
  storiesTray: 'stories-tray',
  storyCard: (i: number) => `story-card-${i}`,
  cta: 'story-cta',
  toast: 'toast',
  navigationTab: (tab: string) => `nav-tab-${tab}`,
  profileButton: 'profile-button',
  searchButton: 'search-button',
  notificationButton: 'notification-button',
  storyViewer: 'story-viewer',
  storyProgress: 'story-progress',
  storyRing: (creatorId: string) => `story-ring-${creatorId}`,
  commerceBadge: 'commerce-badge',
  shopNowButton: 'shop-now-button'
};

export const IS_E2E = !!process.env.EXPO_PUBLIC_E2E || Platform.OS === 'ios' && !!(global as any).__DET0X__;

// Helper functions for E2E testing
export const testHelpers = {
  isTestMode: () => IS_E2E,
  getTestId: (id: string) => IS_E2E ? { testID: id } : {},
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
};