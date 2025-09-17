import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// User Roles & Tiers System for AisleMarts 2.0
export type UserRole = 'shopper' | 'seller' | 'hybrid';
export type MembershipTier = 'regular' | 'premium' | 'pro' | 'business' | 'first-class' | 'world-class';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  tier: MembershipTier;
  avatar?: string;
  preferredLanguage: string;
  timezone: string;
  joinedAt: Date;
  // Tier-specific features
  features: string[];
  // Personalization data
  preferences: {
    greetingStyle: 'formal' | 'casual' | 'friendly';
    voiceEnabled: boolean;
    theme: 'default' | 'premium' | 'dark' | 'light';
  };
}

interface UserRolesContextType {
  profile?: UserProfile;
  loading: boolean;
  // Role Management
  setUserRole: (role: UserRole) => Promise<void>;
  upgradeUserTier: (tier: MembershipTier) => Promise<void>;
  // Feature Access
  hasFeature: (feature: string) => boolean;
  canAccessFeature: (feature: string) => boolean;
  // UI Customization
  getRoleColors: () => { primary: string; secondary: string; accent: string };
  getTierFeatures: () => string[];
  // Personalization
  updatePreferences: (preferences: Partial<UserProfile['preferences']>) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  // Time-aware greetings
  getPersonalizedGreeting: () => string;
  getTimeBasedGreeting: () => string;
}

const UserRolesContext = createContext<UserRolesContextType>({} as UserRolesContextType);

export const useUserRoles = () => useContext(UserRolesContext);

// Default features by tier
const TIER_FEATURES: Record<MembershipTier, string[]> = {
  regular: ['basic_search', 'product_view', 'simple_chat'],
  premium: ['advanced_search', 'priority_support', 'deal_alerts', 'voice_commands'],
  pro: ['analytics_dashboard', 'bulk_operations', 'api_access', 'custom_integrations'],
  business: ['team_management', 'enterprise_features', 'dedicated_support', 'white_label'],
  'first-class': ['vip_concierge', 'exclusive_deals', 'priority_fulfillment', 'personal_shopper'],
  'world-class': ['global_privileges', 'unlimited_access', 'premium_concierge', 'exclusive_events'],
};

// Role color schemes
const ROLE_COLORS: Record<UserRole, { primary: string; secondary: string; accent: string }> = {
  shopper: {
    primary: '#4facfe',
    secondary: '#00f2fe', 
    accent: '#667eea'
  },
  seller: {
    primary: '#43e97b',
    secondary: '#38f9d7',
    accent: '#4facfe'
  },
  hybrid: {
    primary: '#667eea',
    secondary: '#764ba2',
    accent: '#f093fb'
  }
};

export const UserRolesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      console.log('🔄 Loading user profile...');
      
      // Load from AsyncStorage
      const storedProfile = await AsyncStorage.getItem('userProfile');
      const storedRole = await AsyncStorage.getItem('userRole');
      
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        setProfile({
          ...parsedProfile,
          joinedAt: new Date(parsedProfile.joinedAt)
        });
      } else if (storedRole) {
        // Create default profile from legacy role data
        const defaultProfile: UserProfile = {
          id: `user_${Date.now()}`,
          name: 'AisleMarts User',
          role: storedRole as UserRole,
          tier: 'regular',
          preferredLanguage: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          joinedAt: new Date(),
          features: TIER_FEATURES.regular,
          preferences: {
            greetingStyle: 'friendly',
            voiceEnabled: true,
            theme: 'default'
          }
        };
        
        setProfile(defaultProfile);
        await AsyncStorage.setItem('userProfile', JSON.stringify(defaultProfile));
      }
      
      console.log('✅ User profile loaded');
    } catch (error) {
      console.error('Failed to load user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const setUserRole = async (role: UserRole) => {
    try {
      if (!profile) return;
      
      const updatedProfile = {
        ...profile,
        role,
        features: [...TIER_FEATURES[profile.tier], `${role}_features`]
      };
      
      setProfile(updatedProfile);
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      await AsyncStorage.setItem('userRole', role);
      
      console.log('✅ User role updated to:', role);
    } catch (error) {
      console.error('Failed to update user role:', error);
      throw error;
    }
  };

  const upgradeUserTier = async (tier: MembershipTier) => {
    try {
      if (!profile) return;
      
      const updatedProfile = {
        ...profile,
        tier,
        features: [...TIER_FEATURES[tier], `${profile.role}_features`]
      };
      
      setProfile(updatedProfile);
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      
      console.log('✅ User tier upgraded to:', tier);
    } catch (error) {
      console.error('Failed to upgrade user tier:', error);
      throw error;
    }
  };

  const hasFeature = (feature: string): boolean => {
    return profile?.features.includes(feature) ?? false;
  };

  const canAccessFeature = (feature: string): boolean => {
    if (!profile) return false;
    
    // Check tier-based access
    const tierFeatures = TIER_FEATURES[profile.tier];
    const roleFeatures = [`${profile.role}_features`];
    
    return tierFeatures.includes(feature) || roleFeatures.includes(feature) || profile.features.includes(feature);
  };

  const getRoleColors = () => {
    return profile ? ROLE_COLORS[profile.role] : ROLE_COLORS.shopper;
  };

  const getTierFeatures = (): string[] => {
    return profile ? TIER_FEATURES[profile.tier] : TIER_FEATURES.regular;
  };

  const updatePreferences = async (preferences: Partial<UserProfile['preferences']>) => {
    try {
      if (!profile) return;
      
      const updatedProfile = {
        ...profile,
        preferences: { ...profile.preferences, ...preferences }
      };
      
      setProfile(updatedProfile);
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      
      console.log('✅ User preferences updated');
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!profile) return;
      
      const updatedProfile = { ...profile, ...updates };
      setProfile(updatedProfile);
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      
      console.log('✅ User profile updated');
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  const getTimeBasedGreeting = (): string => {
    const hour = new Date().getHours();
    
    if (hour < 6) return 'Good night';
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  };

  const getPersonalizedGreeting = (): string => {
    if (!profile) return `${getTimeBasedGreeting()}! Welcome to AisleMarts`;
    
    const timeGreeting = getTimeBasedGreeting();
    const userName = profile.name || 'there';
    
    // Customize based on greeting style preference
    switch (profile.preferences.greetingStyle) {
      case 'formal':
        return `${timeGreeting}, ${userName}. How may I assist you today?`;
      case 'casual':
        return `Hey ${userName}! ${timeGreeting.toLowerCase()}. What's up?`;
      case 'friendly':
      default:
        return `${timeGreeting}, ${userName}! What can I help you find today?`;
    }
  };

  return (
    <UserRolesContext.Provider value={{
      profile,
      loading,
      setUserRole,
      upgradeUserTier,
      hasFeature,
      canAccessFeature,
      getRoleColors,
      getTierFeatures,
      updatePreferences,
      updateProfile,
      getPersonalizedGreeting,
      getTimeBasedGreeting,
    }}>
      {children}
    </UserRolesContext.Provider>
  );
};

// Helper functions for UI components
export const getRoleIcon = (role: UserRole): string => {
  switch (role) {
    case 'shopper': return 'bag';
    case 'seller': return 'storefront';
    case 'hybrid': return 'infinite';
    default: return 'person';
  }
};

export const getTierBadge = (tier: MembershipTier): { icon: string; color: string } => {
  switch (tier) {
    case 'regular': return { icon: 'person', color: '#8E8E93' };
    case 'premium': return { icon: 'star', color: '#FF9500' };
    case 'pro': return { icon: 'diamond', color: '#007AFF' };
    case 'business': return { icon: 'business', color: '#34C759' };
    case 'first-class': return { icon: 'trophy', color: '#FF3B30' };
    case 'world-class': return { icon: 'globe', color: '#AF52DE' };
    default: return { icon: 'person', color: '#8E8E93' };
  }
};

export const formatTierName = (tier: MembershipTier): string => {
  return tier.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};