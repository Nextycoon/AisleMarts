import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  StatusBar,
  SafeAreaView,
  TouchableOpacity 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  SlideInUp, 
  SlideInDown, 
  FadeIn, 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

type UserRole = 'shopper';

const roleOptions = [
  {
    id: 'shopper' as UserRole,
    title: 'Elite Shopper',
    subtitle: 'Curated luxury shopping experience',
    description: 'Discover premium brands, exclusive deals, and personalized recommendations crafted by AI',
    icon: '🛍️',
  }
];

const { width, height } = Dimensions.get('window');

export default function AisleAvatarScreen() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('shopper');
  const [isLoading, setIsLoading] = useState(false);
  const { setupAvatar } = useAuth();
  
  const fadeAnim = useSharedValue(0);

  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 1000 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
  }));

  const handleContinue = async () => {
    if (!selectedRole) return;
    
    setIsLoading(true);
    
    try {
      await setupAvatar(selectedRole);
      router.replace('/aisle-agent');
    } catch (error) {
      console.error('Failed to setup avatar:', error);
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Luxury Background */}
      <LinearGradient
        colors={['#0f0f23', '#1a1a2e', '#16213e', '#581c87']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Animated Background Orbs */}
      <View style={[styles.backgroundOrb, styles.orb1]} />
      <View style={[styles.backgroundOrb, styles.orb2]} />
      
      <Animated.ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Luxury Header */}
        <Animated.View 
          style={[styles.header, animatedStyle]}
          entering={SlideInDown.delay(200)}
        >
          <View style={styles.brandAccent} />
          <Text style={styles.heroTitle}>AisleMarts</Text>
          <Text style={styles.heroSubtitle}>Luxury Shopping Redefined</Text>
          <View style={styles.taglineContainer}>
            <Text style={styles.tagline}>Your personal AI concierge awaits</Text>
            <Text style={styles.taglineSecondary}>Curated experiences • Premium service • Exclusive access</Text>
          </View>
        </Animated.View>

        {/* Role Selection */}
        <Animated.View 
          style={styles.roleSection}
          entering={SlideInUp.delay(400)}
        >
          <Text style={styles.sectionTitle}>Choose Your Experience</Text>
          
          {roleOptions.map((role, index) => (
            <Animated.View 
              key={role.id}
              entering={SlideInUp.delay(600)}
            >
              <TouchableOpacity
                style={[styles.roleCard, selectedRole === role.id && styles.selectedCard]}
                onPress={() => setSelectedRole(role.id)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['rgba(168, 85, 247, 0.2)', 'rgba(245, 158, 11, 0.1)']}
                  style={styles.roleCardGradient}
                />
                
                <View style={styles.roleContent}>
                  <View style={styles.roleHeader}>
                    <View style={styles.iconContainer}>
                      <Text style={styles.roleIcon}>{role.icon}</Text>
                    </View>
                    
                    <View style={styles.roleInfo}>
                      <Text style={styles.roleTitle}>{role.title}</Text>
                      <Text style={styles.roleSubtitle}>{role.subtitle}</Text>
                    </View>
                    
                    {selectedRole === role.id && (
                      <View style={styles.checkmark}>
                        <Text style={styles.checkmarkIcon}>✓</Text>
                      </View>
                    )}
                  </View>
                  
                  <Text style={styles.roleDescription}>{role.description}</Text>
                  
                  {/* Premium Features */}
                  <View style={styles.featuresContainer}>
                    <View style={styles.feature}>
                      <Text style={styles.featureIcon}>🤖</Text>
                      <Text style={styles.featureText}>AI Personal Stylist</Text>
                    </View>
                    <View style={styles.feature}>
                      <Text style={styles.featureIcon}>💎</Text>
                      <Text style={styles.featureText}>VIP Access</Text>
                    </View>
                    <View style={styles.feature}>
                      <Text style={styles.featureIcon}>🎯</Text>
                      <Text style={styles.featureText}>Smart Recommendations</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Animated.View>

        {/* CTA Section */}
        <Animated.View 
          style={styles.ctaSection}
          entering={SlideInUp.delay(800)}
        >
          <TouchableOpacity
            style={[styles.ctaButton, (!selectedRole || isLoading) && styles.ctaButtonDisabled]}
            onPress={handleContinue}
            disabled={!selectedRole || isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#f59e0b', '#d97706']}
              style={styles.ctaButtonGradient}
            >
              <Text style={styles.ctaButtonText}>
                {isLoading ? "Preparing Your Experience..." : "Enter the Luxury Marketplace"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={styles.disclaimer}>
            Premium shopping experience • Personalized service • Exclusive brands
          </Text>
        </Animated.View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Cinematic Background */}
      <LinearGradient
        colors={[
          colors.fashion.midnight,
          colors.fashion.charcoal,
          colors.fashion.smokeGray,
          colors.primary[900]
        ]}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Animated Background Orbs */}
      <Animated.View style={[styles.backgroundOrb, styles.orb1]} />
      <Animated.View style={[styles.backgroundOrb, styles.orb2]} />
      <Animated.View style={[styles.backgroundOrb, styles.orb3]} />
      
      <Animated.ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        entering={FadeIn.delay(200)}
      >
        {/* Luxury Header */}
        <Animated.View 
          style={[styles.header, animatedContainerStyle]}
          entering={SlideInDown.delay(400)}
        >
          <LinearGradient
            colors={[colors.gold[400], colors.gold[500]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.brandAccent}
          />
          
          <Text style={styles.heroTitle}>AisleMarts</Text>
          <Text style={styles.heroSubtitle}>Luxury Shopping Redefined</Text>
          
          <View style={styles.taglineContainer}>
            <Text style={styles.tagline}>Your personal AI concierge awaits</Text>
            <Text style={styles.taglineSecondary}>Curated experiences • Premium service • Exclusive access</Text>
          </View>
        </Animated.View>

        {/* Role Selection Card */}
        <Animated.View 
          style={styles.roleSection}
          entering={SlideInUp.delay(600)}
        >
          <Text style={styles.sectionTitle}>Choose Your Experience</Text>
          
          {roleOptions.map((role, index) => (
            <Animated.View 
              key={role.id}
              entering={SlideInUp.delay(800 + index * 100)}
            >
              <LuxuryCard
                variant="glass"
                elevation="lg"
                style={[
                  styles.roleCard,
                  selectedRole === role.id && styles.selectedCard
                ]}
                onPress={() => setSelectedRole(role.id)}
              >
                <LinearGradient
                  colors={role.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.roleGradient}
                />
                
                <View style={styles.roleContent}>
                  <View style={styles.roleHeader}>
                    <View style={styles.iconContainer}>
                      <Text style={styles.roleIcon}>{role.icon}</Text>
                    </View>
                    
                    <View style={styles.roleInfo}>
                      <Text style={styles.roleTitle}>{role.title}</Text>
                      <Text style={styles.roleSubtitle}>{role.subtitle}</Text>
                    </View>
                    
                    {selectedRole === role.id && (
                      <Animated.View 
                        style={styles.checkmark}
                        entering={FadeIn.duration(200)}
                      >
                        <Text style={styles.checkmarkIcon}>✓</Text>
                      </Animated.View>
                    )}
                  </View>
                  
                  <Text style={styles.roleDescription}>{role.description}</Text>
                  
                  {/* Premium Features */}
                  <View style={styles.featuresContainer}>
                    <View style={styles.feature}>
                      <Text style={styles.featureIcon}>🤖</Text>
                      <Text style={styles.featureText}>AI Personal Stylist</Text>
                    </View>
                    <View style={styles.feature}>
                      <Text style={styles.featureIcon}>💎</Text>
                      <Text style={styles.featureText}>VIP Access</Text>
                    </View>
                    <View style={styles.feature}>
                      <Text style={styles.featureIcon}>🎯</Text>
                      <Text style={styles.featureText}>Smart Recommendations</Text>
                    </View>
                  </View>
                </View>
              </LuxuryCard>
            </Animated.View>
          ))}
        </Animated.View>

        {/* CTA Section */}
        <Animated.View 
          style={styles.ctaSection}
          entering={SlideInUp.delay(1000)}
        >
          <LuxuryButton
            title={isLoading ? "Preparing Your Experience..." : "Enter the Luxury Marketplace"}
            onPress={handleContinue}
            variant="luxury"
            size="lg"
            fullWidth
            disabled={!selectedRole || isLoading}
            style={styles.ctaButton}
          />
          
          <Text style={styles.disclaimer}>
            Premium shopping experience • Personalized service • Exclusive brands
          </Text>
        </Animated.View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.fashion.midnight,
  },
  
  backgroundOrb: {
    position: 'absolute',
    borderRadius: 200,
    opacity: 0.1,
  },
  
  orb1: {
    width: 300,
    height: 300,
    backgroundColor: colors.primary[500],
    top: -100,
    right: -100,
  },
  
  orb2: {
    width: 200,
    height: 200,
    backgroundColor: colors.gold[500],
    bottom: 100,
    left: -50,
  },
  
  orb3: {
    width: 150,
    height: 150,
    backgroundColor: colors.primary[400],
    top: height * 0.4,
    right: -75,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    paddingBottom: spacing[20],
  },
  
  header: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[16],
    paddingBottom: spacing[12],
    alignItems: 'center',
  },
  
  brandAccent: {
    width: 60,
    height: 4,
    borderRadius: 2,
    marginBottom: spacing[6],
  },
  
  heroTitle: {
    fontSize: typography.sizes['5xl'],
    fontFamily: typography.fonts.luxury,
    fontWeight: typography.weights.bold,
    color: colors.dark.text,
    textAlign: 'center',
    letterSpacing: typography.tracking.wide,
    marginBottom: spacing[2],
  },
  
  heroSubtitle: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.heading,
    fontWeight: typography.weights.light,
    color: colors.gold[400],
    textAlign: 'center',
    letterSpacing: typography.tracking.wider,
    marginBottom: spacing[6],
  },
  
  taglineContainer: {
    alignItems: 'center',
    marginTop: spacing[4],
  },
  
  tagline: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.medium,
    color: colors.platinum[200],
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  
  taglineSecondary: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.normal,
    color: colors.platinum[400],
    textAlign: 'center',
    letterSpacing: typography.tracking.wide,
  },
  
  roleSection: {
    paddingHorizontal: spacing[6],
    marginTop: spacing[8],
  },
  
  sectionTitle: {
    fontSize: typography.sizes['2xl'],
    fontFamily: typography.fonts.heading,
    fontWeight: typography.weights.semibold,
    color: colors.dark.text,
    textAlign: 'center',
    marginBottom: spacing[8],
    letterSpacing: typography.tracking.wide,
  },
  
  roleCard: {
    marginBottom: spacing[4],
    overflow: 'hidden',
    position: 'relative',
  },
  
  selectedCard: {
    borderColor: colors.gold[400],
    borderWidth: 2,
  },
  
  roleGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  
  roleContent: {
    padding: spacing[6],
  },
  
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[4],
  },
  
  roleIcon: {
    fontSize: 28,
  },
  
  roleInfo: {
    flex: 1,
  },
  
  roleTitle: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.heading,
    fontWeight: typography.weights.bold,
    color: colors.dark.text,
    marginBottom: spacing[1],
  },
  
  roleSubtitle: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.medium,
    color: colors.gold[400],
  },
  
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gold[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  checkmarkIcon: {
    fontSize: 18,
    color: colors.dark.bg,
    fontWeight: typography.weights.bold,
  },
  
  roleDescription: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.normal,
    color: colors.platinum[300],
    lineHeight: typography.leading.relaxed * typography.sizes.base,
    marginBottom: spacing[6],
  },
  
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  
  featureIcon: {
    fontSize: 20,
    marginBottom: spacing[1],
  },
  
  featureText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.medium,
    color: colors.platinum[400],
    textAlign: 'center',
  },
  
  ctaSection: {
    paddingHorizontal: spacing[6],
    marginTop: spacing[8],
    alignItems: 'center',
  },
  
  ctaButton: {
    marginBottom: spacing[4],
  },
  
  disclaimer: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.normal,
    color: colors.platinum[500],
    textAlign: 'center',
    letterSpacing: typography.tracking.wide,
  },
});