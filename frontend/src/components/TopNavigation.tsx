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
}

const topNavTabs: TopNavItem[] = [
  { name: 'for-you', route: '/for-you', label: 'For You' },
  { name: 'following', route: '/following', label: 'Following' },
  { name: 'explore', route: '/explore', label: 'Explore' },
  { name: 'live', route: '/live-streaming', label: 'Live' },
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

  const handleLivePress = () => {
    router.push('/live-streaming');
  };

  const handleSearchPress = () => {
    router.push('/search');
  };

  return (
    <View style={styles.container}>
      {/* Status Bar */}
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <View style={styles.navBar}>
        {/* Search Button - First Position */}
        <TouchableOpacity style={styles.searchButton} onPress={handleSearchPress}>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>

        {/* Navigation Tabs - Center */}
        <View style={styles.tabsContainer}>
          {topNavTabs.map((tab, index) => {
            const active = isActive(tab.route);
            
            return (
              <TouchableOpacity
                key={tab.name}
                style={styles.navItem}
                onPress={() => handleTabPress(tab.route)}
                activeOpacity={0.7}
              >
                <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                  {tab.label}
                </Text>
                {active && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>
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
    width: 50,
  },
  liveContainer: {
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
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
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  tabsContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
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
    width: 50,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  searchIcon: {
    fontSize: 20,
    color: '#D4AF37',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});