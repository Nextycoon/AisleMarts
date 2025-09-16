import React, { useEffect, useRef } from 'react';
import { View, Text, ImageBackground, Pressable, Animated, ScrollView, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/context/AuthContext';

// Import our micro-upgrades
import { getPersonalizedGreeting, getSpotlightFeature, SPOTLIGHT_CONFIG } from '../src/utils/greeting';
import { preloadCriticalScreens, pushFromHome, trackNavigationPerformance } from '../src/utils/navigation';
import { useAnalytics } from '../src/utils/analytics';
import { colors } from '../src/theme/tokens';

const BEST_PICKS = [
  { id: 1, title: "Tecno Spark 10", price: "KES 14,999", badge: "Best Pick" },
  { id: 2, title: "Samsung Galaxy A54", price: "KES 32,999", badge: "Popular" },
  { id: 3, title: "iPhone 13", price: "KES 89,999", badge: "Premium" },
  { id: 4, title: "Infinix Note 30", price: "KES 19,999", badge: "Value" },
];

const BUSINESS_FEATURES = [
  { title: "Create RFQ", route: "/b2b", desc: "Request quotes" },
  { title: "View Quotes", route: "/b2b", desc: "Manage offers" },
  { title: "Purchase Orders", route: "/b2b", desc: "Track orders" },
];

export default function HomeScreen() {
  const router = useRouter();
  const fade = useRef(new Animated.Value(0)).current;
  const top = useSafeAreaInsets().top;
  const { trackHomeCTAClick, trackBestPickView, trackScreenView, track } = useAnalytics();
  const { user } = useAuth();
  
  // Get personalized greeting
  const personalizedGreeting = getPersonalizedGreeting();
  
  // Get spotlight feature for this session
  const sessionId = "demo_session_2025"; // In production, use actual session ID
  const spotlightFeature = getSpotlightFeature(sessionId);

  // Role-based personalization
  const getRoleBasedContent = () => {
    switch (user?.role) {
      case 'buyer':
        return {
          title: "Shop. Discover. Experience.",
          subtitle: "Find the best products from trusted merchants across Kenya.",
          primaryCTA: { label: "Start Shopping", route: "/discover", color: "#22d3ee" }
        };
      case 'seller':
        return {
          title: "Showcase. Sell. Grow.",
          subtitle: "Connect with buyers and expand your business reach.",
          primaryCTA: { label: "Manage Store", route: "/merchant", color: "#f093fb" }
        };
      case 'hybrid':
        return {
          title: "Buy. Sell. Dominate.",
          subtitle: "The complete commerce experience in one platform.",
          primaryCTA: { label: "Command Center", route: "/command-center", color: "#4facfe" }
        };
      default:
        return {
          title: "Shop. Source. Pick Up.",
          subtitle: "The Universal AI Commerce Engine for Kenya — and the world.",
          primaryCTA: { label: "Discover", route: "/discover", color: "#22d3ee" }
        };
    }
  };

  const roleContent = getRoleBasedContent();

  useEffect(() => {
    // Track screen view with role context
    trackScreenView('home', 'app_launch', { user_role: user?.role || 'unknown' });
    
    // Cinematic fade-in animation
    Animated.timing(fade, { 
      toValue: 1, 
      duration: 800, 
      useNativeDriver: true 
    }).start();
    
    // Preload critical screens for instant navigation
    const cancelPreload = preloadCriticalScreens();
    
    return cancelPreload;
  }, []);

  const handleCTAPress = (cta: 'discover' | 'nearby' | 'rfq' | 'primary', route: string) => {
    const startTime = Date.now();
    trackHomeCTAClick(cta);
    trackNavigationPerformance('home', route, startTime);
    pushFromHome(route);
  };

  const handleProductCardPress = (productId: number, position: number) => {
    trackBestPickView(productId.toString(), position);
    pushFromHome(`/product/${productId}`);
  };

  const handleSpotlightPress = (feature: any) => {
    if (!feature) return;
    
    track('home_spotlight_click', {
      feature_key: feature.key,
      experiment_key: SPOTLIGHT_CONFIG.experimentKey,
      feature_status: feature.status,
      session_id: sessionId,
      user_role: user?.role
    });
    
    pushFromHome(feature.route);
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      {/* CINEMATIC HERO */}
      <Animated.View style={{ opacity: fade }}>
        <ImageBackground
          source={{ uri: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1200&auto=format&fit=crop" }}
          style={[styles.hero, { paddingTop: top }]}
          imageStyle={styles.heroImage}
        >
          <LinearGradient 
            colors={["transparent", "rgba(12,15,20,0.3)", "rgba(12,15,20,0.8)", "#0c0f14"]} 
            style={styles.heroGradient}
          >
            {/* Header with Profile Access */}
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.greeting}>
                  {personalizedGreeting.greeting}
                  {user?.role && (
                    <Text style={styles.roleText}>, {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Text>
                  )}
                </Text>
                <Text style={styles.location}>📍 {personalizedGreeting.location} {personalizedGreeting.flag}</Text>
              </View>
              <Pressable 
                onPress={() => pushFromHome('/command-center')}
                style={styles.profileButton}
                accessibilityLabel="Open Command Center"
              >
                <Ionicons name="grid" size={24} color="white" />
              </Pressable>
            </View>

            {/* Hero Content - Role-based */}
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>
                {roleContent.title}
              </Text>
              <Text style={styles.heroSubtitle}>
                {roleContent.subtitle}
              </Text>

              {/* Hero CTAs - Role-aware */}
              <View style={styles.heroCTAs}>
                <Pressable 
                  onPress={() => handleCTAPress('primary', roleContent.primaryCTA.route)}
                  style={[styles.primaryCTA, { backgroundColor: roleContent.primaryCTA.color }]}
                >
                  <Text style={[styles.ctaText, { color: "#0f172a" }]}>{roleContent.primaryCTA.label}</Text>
                </Pressable>
                
                <Pressable 
                  onPress={() => handleCTAPress('nearby', '/nearby')}
                  style={styles.secondaryCTA}
                >
                  <Text style={styles.ctaText}>Nearby</Text>
                </Pressable>
                
                {user?.role !== 'buyer' && (
                  <Pressable 
                    onPress={() => handleCTAPress('rfq', '/b2b')}
                    style={[styles.secondaryCTA, { 
                      backgroundColor: "rgba(168,85,247,0.18)", 
                      borderColor: "rgba(168,85,247,0.35)" 
                    }]}
                  >
                    <Text style={[styles.ctaText, { color: "#e9d5ff" }]}>Start RFQ</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </Animated.View>

      {/* CONTENT SECTIONS */}
      <View style={styles.sections}>
        {/* Role Badge */}
        {user?.role && (
          <View style={styles.section}>
            <View style={[styles.roleBadge, { 
              backgroundColor: user.role === 'buyer' ? 'rgba(34,211,238,0.1)' : 
                              user.role === 'seller' ? 'rgba(240,147,251,0.1)' : 
                              'rgba(79,172,254,0.1)',
              borderColor: user.role === 'buyer' ? 'rgba(34,211,238,0.3)' : 
                          user.role === 'seller' ? 'rgba(240,147,251,0.3)' : 
                          'rgba(79,172,254,0.3)'
            }]}>
              <Text style={styles.roleBadgeText}>
                🎭 {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Mode Active
              </Text>
              <Pressable onPress={() => pushFromHome('/aisle-avatar')}>
                <Text style={styles.changeRoleText}>Change</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Spotlight Feature */}
        {spotlightFeature && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⭐ Featured Today</Text>
            <Pressable
              onPress={() => handleSpotlightPress(spotlightFeature)}
              style={[styles.spotlightCard, { borderColor: colors.cyan + "40" }]}
            >
              <View style={styles.spotlightContent}>
                <Text style={styles.spotlightIcon}>{spotlightFeature.icon}</Text>
                <View style={styles.spotlightText}>
                  <Text style={styles.spotlightTitle}>{spotlightFeature.label}</Text>
                  <Text style={styles.spotlightDesc}>{spotlightFeature.description}</Text>
                </View>
                <View style={[styles.spotlightBadge, { backgroundColor: colors.cyan }]}>
                  <Text style={styles.spotlightBadgeText}>TRY NOW</Text>
                </View>
              </View>
            </Pressable>
          </View>
        )}

        {/* Search Pill */}
        <Pressable 
          onPress={() => router.push("/discover")}
          style={styles.searchPill}
        >
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <Text style={styles.searchText}>What are you looking for?</Text>
        </Pressable>

        {/* Best Picks Carousel */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Best Picks this week</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carousel}
          >
            {BEST_PICKS.map((item, index) => (
              <Pressable 
                key={item.id}
                onPress={() => handleProductCardPress(item.id, index)}
                style={styles.bestPickCard}
              >
                <ImageBackground
                  source={{ uri: `https://picsum.photos/seed/aisle${item.id}/600/400` }}
                  style={styles.cardImage}
                  imageStyle={styles.cardImageStyle}
                />
                <View style={styles.cardContent}>
                  <View style={styles.cardBadge}>
                    <Text style={styles.cardBadgeText}>{item.badge}</Text>
                  </View>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardPrice}>{item.price}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Business Strip - Only for sellers and hybrid */}
        {user?.role !== 'buyer' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>For Business</Text>
            <View style={styles.businessGrid}>
              {BUSINESS_FEATURES.map((feature) => (
                <Pressable 
                  key={feature.title}
                  onPress={() => router.push(feature.route as any)}
                  style={styles.businessCard}
                >
                  <Text style={styles.businessTitle}>{feature.title}</Text>
                  <Text style={styles.businessDesc}>{feature.desc}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Nearby Strip */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup near you</Text>
          <Pressable 
            onPress={() => router.push("/nearby")}
            style={styles.nearbyCard}
          >
            <View style={styles.nearbyContent}>
              <Text style={styles.nearbyTitle}>See stores in Westlands, Kilimani, Karen</Text>
              <Ionicons name="arrow-forward" size={20} color="#a5f3fc" />
            </View>
            <Text style={styles.nearbySubtitle}>5 merchants • 150+ products • Same-day pickup</Text>
          </Pressable>
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platform Status</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>Phases Complete</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>15</Text>
              <Text style={styles.statLabel}>Features Live</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>100%</Text>
              <Text style={styles.statLabel}>Uptime</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0c0f14",
  },
  hero: {
    height: 420,
    justifyContent: "flex-end",
  },
  heroImage: {
    opacity: 0.6,
  },
  heroGradient: {
    height: "100%",
    padding: 20,
    justifyContent: "space-between",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 20,
  },
  greeting: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  roleText: {
    color: "#22d3ee",
    fontWeight: "700",
  },
  location: {
    color: "#cbd5e1",
    fontSize: 14,
    marginTop: 2,
  },
  profileButton: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  heroContent: {
    marginBottom: 20,
  },
  heroTitle: {
    color: "white",
    fontSize: 40,
    fontWeight: "800",
    lineHeight: 44,
    marginBottom: 12,
  },
  heroSubtitle: {
    color: "#cbd5e1",
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 24,
  },
  heroCTAs: {
    flexDirection: "row",
    gap: 12,
  },
  primaryCTA: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  secondaryCTA: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  ctaText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  sections: {
    padding: 16,
    gap: 24,
  },
  roleBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  roleBadgeText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  changeRoleText: {
    color: "#22d3ee",
    fontSize: 12,
    fontWeight: "600",
  },
  searchPill: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchText: {
    color: "#9CA3AF",
    fontSize: 16,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "800",
  },
  carousel: {
    gap: 12,
    paddingRight: 16,
  },
  bestPickCard: {
    width: 240,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
  },
  cardImage: {
    height: 140,
    justifyContent: "flex-end",
    padding: 12,
  },
  cardImageStyle: {
    opacity: 0.9,
  },
  cardBadge: {
    backgroundColor: "#22d3ee",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  cardBadgeText: {
    color: "#0f172a",
    fontSize: 10,
    fontWeight: "700",
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
    marginTop: 8,
  },
  cardPrice: {
    color: "#9CA3AF",
    marginTop: 4,
    fontSize: 14,
  },
  businessGrid: {
    flexDirection: "row",
    gap: 12,
  },
  businessCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  businessTitle: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 4,
  },
  businessDesc: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  nearbyCard: {
    backgroundColor: "rgba(34,211,238,0.10)",
    borderColor: "rgba(34,211,238,0.35)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  nearbyContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  nearbyTitle: {
    color: "#a5f3fc",
    fontWeight: "700",
    fontSize: 16,
    flex: 1,
  },
  nearbySubtitle: {
    color: "#22d3ee",
    fontSize: 12,
    opacity: 0.8,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  statValue: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    color: "#9CA3AF",
    fontSize: 12,
    textAlign: "center",
  },
  spotlightCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  spotlightContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  spotlightIcon: {
    fontSize: 24,
  },
  spotlightText: {
    flex: 1,
  },
  spotlightTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  spotlightDesc: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  spotlightBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  spotlightBadgeText: {
    color: "#0f172a",
    fontSize: 10,
    fontWeight: "700",
  },
});