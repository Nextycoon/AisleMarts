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
  { name: 'explore', route: '/explore', label: 'Explore' },
  { name: 'following', route: '/following', label: 'Following' },
  { name: 'for-you', route: '/for-you', label: 'For You' },
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
        {/* LIVE Button */}
        <TouchableOpacity style={styles.liveButton} onPress={handleLivePress}>
          <View style={styles.liveContainer}>
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </TouchableOpacity>

        {/* Navigation Tabs */}
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

        {/* Search Button */}
        <TouchableOpacity style={styles.searchButton} onPress={handleSearchPress}>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
  },
  navBar: {
    flexDirection: 'row',
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  navItemActive: {
    // Active styling handled by individual elements
  },
  navLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
    textAlign: 'center',
  },
  navLabelActive: {
    color: '#D4AF37',
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -12,
    left: '50%',
    marginLeft: -20,
    width: 40,
    height: 3,
    backgroundColor: '#D4AF37',
    borderRadius: 2,
  },
});