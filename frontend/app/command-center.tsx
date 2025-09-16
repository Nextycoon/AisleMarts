import React, { useEffect } from 'react';
import { View, Text, Image, ScrollView, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

// Import our new centralized configs
import { FEATURES_REGISTRY, QUICK_ACTIONS, getVisibleFeatures, getStatusColor, getStatusText } from '../src/config/features';
import { colors, spacing, radii, shadows, presets } from '../src/theme/tokens';
import { useAnalytics } from '../src/utils/analytics';
import { getDuration } from '../src/theme/motion';

export default function CommandCenter() {
  const top = useSafeAreaInsets().top;
  const router = useRouter();
  const { trackScreenView, trackProfileTileClick } = useAnalytics();
  
  // Get features for current user (demo: assume user role for now)
  const userRoles = ["user", "merchant"]; // In real app, get from auth context
  const visibleFeatures = getVisibleFeatures(userRoles);

  useEffect(() => {
    trackScreenView('command_center', 'home_grid_icon');
    
    // Track feature inventory for PMs (analytics snapshot)
    analytics.trackFeatureInventory(FEATURES_REGISTRY);
  }, []);

  const handleFeatureTilePress = (feature: any) => {
    trackProfileTileClick(feature.key, feature.route, userRoles.join(','));
    router.push(feature.route as any);
  };

  const handleQuickActionPress = (action: any) => {
    trackProfileTileClick(action.key, action.route, 'quick_action');
    router.push(action.route as any);
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <LinearGradient 
        colors={[colors.bg, colors.bgSecondary]} 
        style={[styles.header, { paddingTop: top + 24 }]}
      >
        <View style={styles.headerContent}>
          <Image
            source={{ uri: "https://i.pravatar.cc/160?seed=aislemarts" }}
            style={styles.avatar}
          />
          <Text style={styles.userName}>Command Center</Text>
          <Text style={styles.userMeta}>Kenya 🇰🇪 • All Features • Phase 1-3 Complete</Text>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            {QUICK_ACTIONS.map((action) => (
              <Pressable
                key={action.key}
                onPress={() => handleQuickActionPress(action)}
                style={[styles.quickActionButton, { borderColor: action.color + "40" }]}
                accessibilityRole="button"
                accessibilityLabel={`${action.label} quick action`}
              >
                <Text style={styles.quickActionText}>
                  {action.icon} {action.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </LinearGradient>

      {/* Feature Grid */}
      <View style={styles.featureGrid}>
        <Text style={styles.sectionTitle}>All AisleMarts Features</Text>
        <Text style={styles.sectionSubtitle}>
          {visibleFeatures.length} core capabilities • Production ready
        </Text>
        
        <View style={styles.tilesContainer}>
          {visibleFeatures.map((feature) => (
            <Pressable
              key={feature.key}
              onPress={() => handleFeatureTilePress(feature)}
              style={styles.featureTile}
              accessibilityRole="button"
              accessibilityLabel={`${feature.label} feature`}
            >
              <View style={styles.tileHeader}>
                <Text style={styles.tileIcon}>{feature.icon}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(feature.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(feature.status)}</Text>
                </View>
              </View>
              <Text style={styles.tileLabel}>{feature.label}</Text>
              <Text style={styles.tileDesc}>{feature.description}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.activitySection}>
        <Text style={styles.sectionTitle}>Live Activity</Text>
        <View style={styles.activityCard}>
          <View style={styles.activityItem}>
            <View style={styles.activityDot} />
            <Text style={styles.activityText}>RFQ #AM-RFQ-102 → 2 suppliers responded</Text>
            <Text style={styles.activityTime}>2m ago</Text>
          </View>
          <View style={styles.activityItem}>
            <View style={[styles.activityDot, { backgroundColor: colors.warning }]} />
            <Text style={styles.activityText}>Pickup reservation scheduled for Tecno Spark 10</Text>
            <Text style={styles.activityTime}>5m ago</Text>
          </View>
          <View style={styles.activityItem}>
            <View style={[styles.activityDot, { backgroundColor: colors.cyan }]} />
            <Text style={styles.activityText}>3 new nearby merchants detected in Westlands</Text>
            <Text style={styles.activityTime}>12m ago</Text>
          </View>
        </View>
      </View>

      {/* Performance Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Platform Status</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>100%</Text>
            <Text style={styles.statLabel}>Uptime</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{visibleFeatures.length}/15</Text>
            <Text style={styles.statLabel}>Features</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Phases</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>KES</Text>
            <Text style={styles.statLabel}>Currency</Text>
          </View>
        </View>
      </View>

      {/* System Info */}
      <View style={styles.systemSection}>
        <Text style={styles.sectionTitle}>System Information</Text>
        <View style={styles.systemCard}>
          <View style={styles.systemRow}>
            <Text style={styles.systemLabel}>App Version</Text>
            <Text style={styles.systemValue}>Phase 3.0.0</Text>
          </View>
          <View style={styles.systemRow}>
            <Text style={styles.systemLabel}>Build</Text>
            <Text style={styles.systemValue}>2025.09.16</Text>
          </View>
          <View style={styles.systemRow}>
            <Text style={styles.systemLabel}>Status</Text>
            <Text style={[styles.systemValue, { color: colors.success }]}>All Operational ✅</Text>
          </View>
          <View style={styles.systemRow}>
            <Text style={styles.systemLabel}>Location</Text>
            <Text style={styles.systemValue}>Nairobi, Kenya 🇰🇪</Text>
          </View>
          <View style={styles.systemRow}>
            <Text style={styles.systemLabel}>Backend</Text>
            <Text style={styles.systemValue}>FastAPI + MongoDB</Text>
          </View>
          <View style={styles.systemRow}>
            <Text style={styles.systemLabel}>Stack</Text>
            <Text style={styles.systemValue}>Expo + React Native</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
    <ScrollView 
      style={styles.container} 
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <LinearGradient 
        colors={["#0c0f14", "#111827"]} 
        style={[styles.header, { paddingTop: top + 24 }]}
      >
        <View style={styles.headerContent}>
          <Image
            source={{ uri: "https://i.pravatar.cc/160?seed=aislemarts" }}
            style={styles.avatar}
          />
          <Text style={styles.userName}>Command Center</Text>
          <Text style={styles.userMeta}>Kenya 🇰🇪 • All Features • Phase 1-3 Complete</Text>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            {QUICK_ACTIONS.map((action) => (
              <Pressable
                key={action.label}
                onPress={() => router.push(action.route as any)}
                style={[styles.quickActionButton, { borderColor: action.color + "40" }]}
                accessibilityRole="button"
                accessibilityLabel={`${action.label} quick action`}
              >
                <Text style={styles.quickActionText}>
                  {action.icon} {action.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </LinearGradient>

      {/* Feature Grid */}
      <View style={styles.featureGrid}>
        <Text style={styles.sectionTitle}>All AisleMarts Features</Text>
        <Text style={styles.sectionSubtitle}>15 core capabilities • Production ready</Text>
        
        <View style={styles.tilesContainer}>
          {FEATURE_TILES.map((tile) => (
            <Pressable
              key={tile.label}
              onPress={() => router.push(tile.route as any)}
              style={styles.featureTile}
              accessibilityRole="button"
              accessibilityLabel={`${tile.label} feature`}
            >
              <View style={styles.tileHeader}>
                <Text style={styles.tileIcon}>{tile.icon}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(tile.status) }]}>
                  <Text style={styles.statusText}>{tile.status}</Text>
                </View>
              </View>
              <Text style={styles.tileLabel}>{tile.label}</Text>
              <Text style={styles.tileDesc}>{tile.desc}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.activitySection}>
        <Text style={styles.sectionTitle}>Live Activity</Text>
        <View style={styles.activityCard}>
          <View style={styles.activityItem}>
            <View style={styles.activityDot} />
            <Text style={styles.activityText}>RFQ #AM-RFQ-102 → 2 suppliers responded</Text>
            <Text style={styles.activityTime}>2m ago</Text>
          </View>
          <View style={styles.activityItem}>
            <View style={[styles.activityDot, { backgroundColor: "#ff9500" }]} />
            <Text style={styles.activityText}>Pickup reservation scheduled for Tecno Spark 10</Text>
            <Text style={styles.activityTime}>5m ago</Text>
          </View>
          <View style={styles.activityItem}>
            <View style={[styles.activityDot, { backgroundColor: "#22d3ee" }]} />
            <Text style={styles.activityText}>3 new nearby merchants detected in Westlands</Text>
            <Text style={styles.activityTime}>12m ago</Text>
          </View>
        </View>
      </View>

      {/* Performance Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Platform Status</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>100%</Text>
            <Text style={styles.statLabel}>Uptime</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>15/15</Text>
            <Text style={styles.statLabel}>Features</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Phases</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>KES</Text>
            <Text style={styles.statLabel}>Currency</Text>
          </View>
        </View>
      </View>

      {/* System Info */}
      <View style={styles.systemSection}>
        <Text style={styles.sectionTitle}>System Information</Text>
        <View style={styles.systemCard}>
          <View style={styles.systemRow}>
            <Text style={styles.systemLabel}>App Version</Text>
            <Text style={styles.systemValue}>Phase 3.0.0</Text>
          </View>
          <View style={styles.systemRow}>
            <Text style={styles.systemLabel}>Build</Text>
            <Text style={styles.systemValue}>2025.09.16</Text>
          </View>
          <View style={styles.systemRow}>
            <Text style={styles.systemLabel}>Status</Text>
            <Text style={[styles.systemValue, { color: "#34c759" }]}>All Operational ✅</Text>
          </View>
          <View style={styles.systemRow}>
            <Text style={styles.systemLabel}>Location</Text>
            <Text style={styles.systemValue}>Nairobi, Kenya 🇰🇪</Text>
          </View>
          <View style={styles.systemRow}>
            <Text style={styles.systemLabel}>Backend</Text>
            <Text style={styles.systemValue}>FastAPI + MongoDB</Text>
          </View>
          <View style={styles.systemRow}>
            <Text style={styles.systemLabel}>Stack</Text>
            <Text style={styles.systemValue}>Expo + React Native</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingBottom: spacing.md,
  },
  headerContent: {
    paddingHorizontal: spacing.lg,
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.line,
  },
  userName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
  },
  userMeta: {
    color: colors.textDim,
    marginTop: 4,
    fontSize: 14,
    textAlign: "center",
  },
  quickActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  quickActionButton: {
    backgroundColor: colors.glass.primary,
    borderWidth: 1,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 4,
    borderRadius: radii.md,
  },
  quickActionText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  featureGrid: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: colors.textDim,
    fontSize: 14,
    marginBottom: spacing.md,
  },
  tilesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  featureTile: {
    width: "48%",
    margin: "1%",
    ...presets.featureTile,
  },
  tileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xs,
  },
  tileIcon: {
    fontSize: 24,
  },
  statusBadge: {
    ...presets.statusChip,
  },
  statusText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: "700",
  },
  tileLabel: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 4,
  },
  tileDesc: {
    color: colors.textDim,
    fontSize: 12,
  },
  activitySection: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  activityCard: {
    ...presets.glassCard,
    padding: spacing.md,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: spacing.sm,
  },
  activityText: {
    color: colors.textSecondary,
    fontSize: 14,
    flex: 1,
  },
  activityTime: {
    color: colors.textDim,
    fontSize: 12,
  },
  statsSection: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    ...presets.glassCard,
    padding: spacing.md,
    alignItems: "center",
  },
  statValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    color: colors.textDim,
    fontSize: 12,
  },
  systemSection: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  systemCard: {
    ...presets.glassCard,
    padding: spacing.md,
  },
  systemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  systemLabel: {
    color: colors.textDim,
    fontSize: 14,
  },
  systemValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
});