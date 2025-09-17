import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useAuth } from '../src/context/AuthContext';
import { useUserRoles, UserRole } from '../src/context/UserRolesContext';
import { useHaptics } from '../src/hooks/useHaptics';  
import { API } from '../src/api/client';

type UserRole = 'shopper' | 'seller' | 'hybrid';

const roleOptions = [
  {
    id: 'shopper' as UserRole,
    title: 'Shopper',
    subtitle: 'Discover nearby stock, reserve, pick up fast.',
    icon: 'bag' as const,
    gradient: ['#4facfe', '#00f2fe']
  },
  {
    id: 'seller' as UserRole, 
    title: 'Seller',
    subtitle: 'List inventory, set pickup windows, grow revenue.',
    icon: 'storefront' as const,
    gradient: ['#43e97b', '#38f9d7']
  },
  {
    id: 'hybrid' as UserRole,
    title: 'Hybrid',
    subtitle: 'Shop and sell from one account.',
    icon: 'infinite' as const,
    gradient: ['#667eea', '#764ba2']
  }
];

// Analytics helper
const trackAnalyticsEvent = (event: string, data: any) => {
  console.log(`📊 Analytics: ${event}`, data);
  // TODO: Implement proper analytics integration
};

// Offline queue for failed API calls
const enqueueOfflineAction = async (action: any) => {
  try {
    const existingQueue = await AsyncStorage.getItem('offlineQueue');
    const queue = existingQueue ? JSON.parse(existingQueue) : [];
    queue.push({
      ...action,
      timestamp: Date.now(),
      retryCount: 0
    });
    await AsyncStorage.setItem('offlineQueue', JSON.stringify(queue));
    console.log('📦 Queued offline action:', action.type);
  } catch (error) {
    console.error('Failed to enqueue offline action:', error);
  }
};

export default function AisleAvatarScreen() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const { setupAvatar, hasCompletedAvatarSetup } = useAuth();
  const { triggerHaptic } = useHaptics();

  useEffect(() => {
    // Idempotency check: if user already completed avatar setup, redirect
    if (hasCompletedAvatarSetup) {
      console.log('🔄 Avatar already set up, redirecting to live avatar');
      router.replace('/live-avatar');
      return;
    }

    // Track impression
    trackAnalyticsEvent('avatar_impression', {
      timestamp: Date.now(),
      userAgent: 'mobile'
    });

    // Monitor network status
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? true);
      console.log('🌐 Network status:', state.isConnected ? 'online' : 'offline');
    });

    return unsubscribe;
  }, [hasCompletedAvatarSetup]);

  const handleRoleSelect = (role: UserRole) => {
    triggerHaptic('selection');
    setSelectedRole(role);
    
    // Track role selection
    trackAnalyticsEvent('avatar_role_selected', {
      role,
      timestamp: Date.now()
    });

    console.log('✨ Role selected:', role);
  };

  const syncAvatarToServer = async (role: UserRole): Promise<boolean> => {
    try {
      // For now, using a demo user ID - in production this would come from auth
      const mockUserId = 'demo_user_' + Date.now();
      
      const response = await API.patch(`/users/${mockUserId}/avatar`, { 
        role 
      });
      
      console.log('✅ Avatar synced to server:', response.data);
      return true;
    } catch (error: any) {
      console.warn('⚠️ Server sync failed:', error.message);
      
      // Log failure with network state and retry count
      trackAnalyticsEvent('avatar_save_error', {
        role,
        error: error.message,
        networkState: isOnline ? 'online' : 'offline',
        retryCount: 0
      });
      
      // Enqueue for offline retry if it was a network error
      if (!isOnline || error.code >= 500) {
        await enqueueOfflineAction({
          type: 'AVATAR_SETUP',
          payload: { role },
          endpoint: `/users/${mockUserId}/avatar`
        });
      }
      
      return false;
    }
  };

  const handleEnterMarketplace = async () => {
    if (!selectedRole) {
      Alert.alert('Select Your Role', 'Please choose your avatar role to continue.');
      return;
    }

    setIsLoading(true);
    triggerHaptic('impact');

    // Track continue tap
    trackAnalyticsEvent('avatar_continue_tap', {
      role: selectedRole,
      timestamp: Date.now()
    });

    try {
      // 1. Optimistic local update (instant UX)
      await AsyncStorage.setItem('userRole', selectedRole);
      await AsyncStorage.setItem('isAvatarSetup', 'true');
      
      // 2. Update AuthContext (triggers routing logic)
      await setupAvatar(selectedRole);
      
      console.log('💾 Avatar setup persisted locally');

      // 3. Sync to server (non-blocking)
      const serverSyncSuccess = await syncAvatarToServer(selectedRole);
      
      if (serverSyncSuccess) {
        trackAnalyticsEvent('avatar_save_success', {
          role: selectedRole,
          syncMethod: 'immediate',
          timestamp: Date.now()
        });
      } else if (isOnline) {
        // Show warning for online failures, but don't block UX
        console.warn('🔄 Server sync failed, but local setup completed');
      }

      // 4. Success haptic and navigation
      triggerHaptic('success');
      
      // Cinematic transition delay then navigate to Live Avatar
      setTimeout(() => {
        router.replace('/live-avatar');
      }, 800);

    } catch (error) {
      console.error('❌ Avatar setup failed:', error);
      
      // Revert optimistic updates
      await AsyncStorage.removeItem('userRole');
      await AsyncStorage.removeItem('isAvatarSetup');
      
      triggerHaptic('error');
      
      Alert.alert(
        'Setup Failed', 
        'Couldn\'t save your selection. Please try again.',
        [{ text: 'Retry', onPress: handleEnterMarketplace }]
      );
      
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0C0F14', '#1a1a2e', '#16213e']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.content}>
        {/* Hero Section */}
        <Animated.View 
          entering={SlideInUp.delay(300)}
          style={styles.heroSection}
        >
          <Text style={styles.heroTitle}>Choose your Aisle.</Text>
          <Text style={styles.heroTitle}>Define your journey.</Text>
          <Text style={styles.heroSubtitle}>
            Your avatar is your key.{'\n'}It unlocks your path.
          </Text>
        </Animated.View>

        {/* Role Selection */}
        <Animated.View 
          entering={SlideInUp.delay(600)}
          style={styles.roleSection}
          accessibilityRole="radiogroup"
          accessibilityLabel="Choose your marketplace role"
        >
          <Text style={styles.rolePrompt}>Select your role in the marketplace</Text>
          
          <View style={styles.roleGrid}>
            {roleOptions.map((role, index) => (
              <Animated.View
                key={role.id}
                entering={SlideInUp.delay(800 + index * 150)}
              >
                <Pressable
                  style={[
                    styles.roleCard,
                    selectedRole === role.id && styles.selectedRoleCard
                  ]}
                  onPress={() => handleRoleSelect(role.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selectedRole === role.id }}
                  accessibilityLabel={`${role.title}: ${role.subtitle}`}
                  accessibilityHint="Double tap to select this role"
                >
                  <BlurView intensity={selectedRole === role.id ? 24 : 18} style={styles.roleCardBlur}>
                    <LinearGradient
                      colors={role.gradient}
                      style={styles.roleIconContainer}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons name={role.icon} size={32} color="white" />
                    </LinearGradient>
                    
                    <View style={styles.roleTextContainer}>
                      <Text style={styles.roleTitle}>{role.title}</Text>
                      <Text style={styles.roleSubtitle}>{role.subtitle}</Text>
                    </View>
                    
                    {selectedRole === role.id && (
                      <Animated.View 
                        entering={FadeIn.duration(140)}
                        style={styles.selectedIndicator}
                        accessibilityLabel="Selected"
                      >
                        <View style={styles.selectedRing}>
                          <Ionicons name="checkmark-circle" size={24} color="#4facfe" />
                        </View>
                      </Animated.View>
                    )}
                  </BlurView>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* CTA Button */}
        <Animated.View 
          entering={SlideInUp.delay(1200)}
          style={styles.ctaSection}
        >
          <Pressable
            style={[
              styles.ctaButton,
              selectedRole && styles.ctaButtonActive,
              isLoading && styles.ctaButtonLoading
            ]}
            onPress={handleEnterMarketplace}
            disabled={!selectedRole || isLoading}
            accessibilityRole="button"
            accessibilityLabel={
              selectedRole 
                ? isOnline 
                  ? "Enter the marketplace" 
                  : "Continue offline"
                : "Select a role first"
            }
            accessibilityHint="Complete avatar setup and continue to main app"
            accessibilityState={{ disabled: !selectedRole || isLoading }}
          >
            <BlurView intensity={selectedRole ? 30 : 15} style={styles.ctaButtonBlur}>
              <LinearGradient
                colors={selectedRole ? ['#667eea', '#764ba2'] : ['#333', '#444']}
                style={styles.ctaButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <Text style={styles.ctaButtonText}>Welcome to your Aisle...</Text>
                ) : (
                  <>
                    <Text style={styles.ctaButtonText}>
                      {isOnline ? 'Enter the Marketplace' : 'Continue (Offline)'}
                    </Text>
                    {!isLoading && (
                      <Ionicons name="arrow-forward" size={20} color="white" />
                    )}
                  </>
                )}
              </LinearGradient>
            </BlurView>
          </Pressable>

          {/* Terms & Privacy */}
          <View style={styles.legalSection}>
            <Text style={styles.legalText}>By continuing you agree to our </Text>
            <Pressable 
              onPress={() => console.log('Terms pressed')}
              accessibilityRole="link"
              accessibilityLabel="Terms of service"
            >
              <Text style={styles.legalLink}>Terms</Text>
            </Pressable>
            <Text style={styles.legalText}> & </Text>
            <Pressable 
              onPress={() => console.log('Privacy pressed')}
              accessibilityRole="link"
              accessibilityLabel="Privacy policy"
            >
              <Text style={styles.legalLink}>Privacy</Text>
            </Pressable>
            <Text style={styles.legalText}>.</Text>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0F14',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  roleSection: {
    flex: 1,
    justifyContent: 'center',
  },
  rolePrompt: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '500',
  },
  roleGrid: {
    gap: 16,
  },
  roleCard: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    minHeight: 88,
  },
  selectedRoleCard: {
    borderColor: '#00f2fe',
    borderWidth: 2,
    transform: [{ scale: 1.06 }],
  },
  roleCardBlur: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    minHeight: 88,
  },
  roleIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  roleTextContainer: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  roleSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  selectedRing: {
    backgroundColor: 'rgba(0,242,254,0.2)',
    borderRadius: 16,
    padding: 2,
  },
  ctaSection: {
    marginTop: 32,
  },
  ctaButton: {
    borderRadius: 16,
    overflow: 'hidden',
    opacity: 0.5,
    minHeight: 56,
  },
  ctaButtonActive: {
    opacity: 1,
  },
  ctaButtonLoading: {
    opacity: 0.8,
  },
  ctaButtonBlur: {
    overflow: 'hidden',
  },
  ctaButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 8,
    minHeight: 56,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 0.5,
  },
  legalSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    flexWrap: 'wrap',
  },
  legalText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  legalLink: {
    fontSize: 12,
    color: '#4facfe',
    textDecorationLine: 'underline',
  },
});