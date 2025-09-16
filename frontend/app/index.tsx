import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function IndexScreen() {
  const { loading, hasCompletedAvatarSetup } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!hasCompletedAvatarSetup) {
        // Redirect to Avatar setup
        router.replace('/aisle-avatar');
      } else {
        // Redirect to main home screen
        router.replace('/home');
      }
    }
  }, [loading, hasCompletedAvatarSetup]);

  // Show loading screen while checking avatar setup
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0C0F14', '#1a1a2e', '#16213e']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <ActivityIndicator size="large" color="#667eea" />
    </View>
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