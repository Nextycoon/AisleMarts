import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StatusBar,
  Platform,
  Alert,
  Pressable,
  Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  FadeIn,
  SlideInUp,
  interpolate,
  runOnJS
} from 'react-native-reanimated';
import { useAuth } from '@/src/context/AuthContext';
import { useHaptics } from '@/src/hooks/useHaptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const { width, height } = Dimensions.get('window');

type UserRole = 'buyer' | 'seller' | 'hybrid';

interface RoleOption {
  id: UserRole;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: string[];
}

const roleOptions: RoleOption[] = [
  {
    id: 'buyer',
    title: 'Buyer',
    subtitle: 'Discover nearby stock, reserve, pick up fast.',
    icon: 'bag',
    gradient: ['#667eea', '#764ba2']
  },
  {
    id: 'seller', 
    title: 'Seller',
    subtitle: 'List inventory, set pickup windows, grow revenue.',
    icon: 'storefront',
    gradient: ['#f093fb', '#f5576c']
  },
  {
    id: 'hybrid',
    title: 'Hybrid',
    subtitle: 'Shop and sell from one account.',
    icon: 'infinite',
    gradient: ['#4facfe', '#00f2fe']
  }
];

export default function AisleAvatarScreen() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLearnMore, setShowLearnMore] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const { updateUser } = useAuth();
  const { triggerHaptic, onButtonPress, onFormSubmit } = useHaptics();

  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);
  const scaleAnim = useSharedValue(0.9);

  React.useEffect(() => {
    // Check network status
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? true);
    });

    // Cinematic entrance animation
    fadeAnim.value = withSpring(1, { duration: 800 });
    slideAnim.value = withSpring(0, { duration: 800 });
    scaleAnim.value = withSpring(1, { duration: 800 });

    return unsubscribe;
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    triggerHaptic('selection');
    setSelectedRole(role);
  };

  const handleLearnMore = () => {
    onButtonPress();
    setShowLearnMore(true);
  };

  const handleTermsPress = () => {
    onButtonPress();
    Linking.openURL('https://aislemarts.com/terms');
  };

  const handlePrivacyPress = () => {
    onButtonPress();
    Linking.openURL('https://aislemarts.com/privacy');
  };

  const handleEnterMarketplace = async () => {
    if (!selectedRole) {
      Alert.alert('Select Your Role', 'Please choose your avatar role to continue.');
      return;
    }

    setIsLoading(true);
    onFormSubmit();

    try {
      // Optimistic update
      await updateUser({ role: selectedRole });
      
      // Persist to AsyncStorage (offline support)
      await AsyncStorage.setItem('userRole', selectedRole);
      await AsyncStorage.setItem('isAvatarSetup', 'true');

      // Analytics event
      // trackEvent('avatar_save_success', { role: selectedRole });

      // Success haptic
      triggerHaptic('success');

      // Cinematic transition delay
      setTimeout(() => {
        router.replace('/home');
      }, 800);

    } catch (error) {
      console.error('Failed to save user role:', error);
      
      // Error haptic
      triggerHaptic('error');
      
      // Show inline toast
      Alert.alert(
        'Connection Issue', 
        isOnline 
          ? 'Couldn\'t save your selection. Check connection and try again.' 
          : 'Saved locally. Will sync when online.',
        isOnline ? [{ text: 'Retry', onPress: handleEnterMarketplace }] : [{ text: 'Continue Offline' }]
      );
      
      setIsLoading(false);
    }
  };

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [
        { translateY: slideAnim.value },
        { scale: scaleAnim.value }
      ]
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#0C0F14', '#1a1a2e', '#16213e']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Animated Background Particles */}
      <View style={styles.particlesContainer}>
        {[...Array(20)].map((_, i) => (
          <Animated.View
            key={i}
            entering={FadeIn.delay(i * 100)}
            style={[
              styles.particle,
              {
                left: Math.random() * width,
                top: Math.random() * height,
                opacity: Math.random() * 0.3,
              }
            ]}
          />
        ))}
      </View>

      <Animated.View style={[styles.content, animatedContainerStyle]}>
        {/* Hero Section */}
        <Animated.View 
          entering={SlideInUp.delay(300)}
          style={styles.heroSection}
        >
          <Text style={styles.heroTitle}>Choose your Aisle.</Text>
          <Text style={styles.heroTitle}>Define your journey.</Text>
          <Text style={styles.heroSubtitle}>
            Your avatar is your key.{'\n'}It unlocks your path in AisleMarts.
          </Text>
        </Animated.View>

        {/* Role Selection */}
        <Animated.View 
          entering={SlideInUp.delay(600)}
          style={styles.roleSection}
        >
          <Text style={styles.rolePrompt}>Who are you in the marketplace?</Text>
          
          <View style={styles.roleGrid}>
            {roleOptions.map((role, index) => (
              <Animated.View
                key={role.id}
                entering={SlideInUp.delay(800 + index * 150)}
              >
                <TouchableOpacity
                  style={[
                    styles.roleCard,
                    selectedRole === role.id && styles.selectedRoleCard
                  ]}
                  onPress={() => handleRoleSelect(role.id)}
                  activeOpacity={0.8}
                >
                  <BlurView intensity={20} style={styles.roleCardBlur}>
                    <LinearGradient
                      colors={role.gradient}
                      style={styles.roleIconContainer}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons name={role.icon} size={32} color="white" />
                    </LinearGradient>
                    
                    <Text style={styles.roleTitle}>{role.title}</Text>
                    <Text style={styles.roleSubtitle}>{role.subtitle}</Text>
                    
                    {selectedRole === role.id && (
                      <Animated.View 
                        entering={FadeIn.duration(300)}
                        style={styles.selectedIndicator}
                      >
                        <Ionicons name="checkmark-circle" size={24} color="#4facfe" />
                      </Animated.View>
                    )}
                  </BlurView>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* CTA Button */}
        <Animated.View 
          entering={SlideInUp.delay(1200)}
          style={styles.ctaSection}
        >
          <TouchableOpacity
            style={[
              styles.ctaButton,
              selectedRole && styles.ctaButtonActive,
              isLoading && styles.ctaButtonLoading
            ]}
            onPress={handleEnterMarketplace}
            disabled={!selectedRole || isLoading}
            activeOpacity={0.8}
          >
            <BlurView intensity={30} style={styles.ctaButtonBlur}>
              <LinearGradient
                colors={selectedRole ? ['#667eea', '#764ba2'] : ['#333', '#444']}
                style={styles.ctaButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <Text style={styles.ctaButtonText}>Welcome to your Aisle...</Text>
                ) : (
                  <Text style={styles.ctaButtonText}>Enter the Marketplace</Text>
                )}
                
                {!isLoading && (
                  <Ionicons name="arrow-forward" size={20} color="white" />
                )}
              </LinearGradient>
            </BlurView>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0F14',
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: '#667eea',
    borderRadius: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
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
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  selectedRoleCard: {
    borderColor: '#4facfe',
    borderWidth: 2,
  },
  roleCardBlur: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  roleIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  roleSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    flex: 2,
    marginLeft: 8,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  ctaSection: {
    marginTop: 32,
  },
  ctaButton: {
    borderRadius: 16,
    overflow: 'hidden',
    opacity: 0.5,
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
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 0.5,
  },
});