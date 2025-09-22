import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';

const { width } = Dimensions.get('window');

interface TopNavItem {
  name: string;
  route: string;
  label: string;
  icon?: string;
}

const topNavTabs: TopNavItem[] = [
  { name: 'for-you', route: '/for-you', label: 'For You' },
  { name: 'following', route: '/following', label: 'Following', icon: '👤' },
  { name: 'explore', route: '/explore', label: 'Explore', icon: '↗' },
];

export default function TopNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (route: string) => {
    return pathname === route || pathname.startsWith(route + '/');
  };

  const handleTabPress = (route: string) => {
    router.push(route as any);
  };

  const handleSearchPress = () => {
    router.push('/search');
  };

  return (
    <View style={styles.container}>
      {/* Status Bar */}
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <View style={styles.navBar}>
        {/* Search Button - Left Side with More Space */}
        <TouchableOpacity style={styles.searchButton} onPress={handleSearchPress}>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>

        {/* Grouped Center Navigation Tabs - For You | Following | Explore */}
        <View style={styles.centerTabsContainer}>
          {topNavTabs.map((tab, index) => {
            const active = isActive(tab.route);
            
            return (
              <TouchableOpacity
                key={tab.name}
                style={styles.compactNavItem}
                onPress={() => handleTabPress(tab.route)}
                activeOpacity={0.7}
              >
                {tab.icon ? (
                  <Text style={[styles.compactNavIcon, active && styles.navIconActive]}>
                    {tab.icon}
                  </Text>
                ) : (
                  <Text style={[styles.compactNavLabel, active && styles.navLabelActive]}>
                    {tab.label}
                  </Text>
                )}
                {active && <View style={styles.compactActiveIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Right Side Spacer - Maintain Balance */}
        <View style={styles.rightSpacer} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    paddingTop: StatusBar.currentHeight || 44, // Account for status bar
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 50,
  },
  liveButton: {
    width: 60,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSpacer: {
    width: 60,
    height: 40,
  },
  liveIcon: {
    fontSize: 20,
    color: '#FF0050', // Bright red for LIVE
    textShadowColor: 'rgba(255, 0, 80, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  liveContainer: {
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.5)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  liveText: {
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  centerTabsContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    position: 'relative',
  },
  navLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  navLabelActive: {
    color: '#FFFFFF',
    fontWeight: '800',
    textShadowColor: 'rgba(212, 175, 55, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -20,
    width: 40,
    height: 3,
    backgroundColor: '#D4AF37',
    borderRadius: 2,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 8,
  },
  searchButton: {
    width: 60,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent', // No background
    // Removed all border, shadow, and background styling
  },
  searchIcon: {
    fontSize: 20,
    color: '#FFFFFF', // Clean white color to match minimal design
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  compactNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    position: 'relative',
    flex: 1,
  },
  compactNavLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  compactActiveIndicator: {
    position: 'absolute',
    bottom: -4,
    left: '50%',
    marginLeft: -15,
    width: 30,
    height: 2,
    backgroundColor: '#D4AF37',
    borderRadius: 1,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 4,
  },
  compactNavIcon: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  navIconActive: {
    color: '#FFFFFF',
    textShadowColor: '#D4AF37',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});