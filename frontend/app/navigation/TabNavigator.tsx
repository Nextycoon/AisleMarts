import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { usePathname, useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface TabItem {
  name: string;
  icon: string;
  route: string;
  label: string;
}

const tabs: TabItem[] = [
  { name: 'profile', icon: '👤', route: '/profile', label: 'Profile' },
  { name: 'aisleshop', icon: '🛍️', route: '/marketplace', label: 'Marts' },
  { name: 'friends', icon: '👥', route: '/friends', label: 'Social' },
  { name: 'create', icon: '➕', route: '/create', label: 'Create' },
  { name: 'business', icon: 'B', route: '/business', label: 'Business' },
  { name: 'brands', icon: '🏷️', route: '/brands', label: 'Brands' },
  { name: 'home', icon: '🏠', route: '/for-you', label: 'Home' },
];

export default function TabNavigator() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (route: string) => {
    if (route === '/categories' && pathname === '/categories') return true;
    if (route === '/for-you' && pathname === '/') return true;
    return pathname === route || pathname.startsWith(route + '/');
  };

  const handleTabPress = (route: string) => {
    // Add haptic feedback for better UX
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => handleTabPress(tab.route)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.tabContent,
              isActive(tab.route) && styles.activeTab
            ]}>
              <Text style={[
                styles.tabIcon,
                isActive(tab.route) && styles.activeTabIcon,
                tab.name === 'business' && styles.businessIcon
              ]}>
                {tab.icon}
              </Text>
              <Text style={[
                styles.tabLabel,
                isActive(tab.route) && styles.activeTabLabel
              ]}>
                {tab.label}
              </Text>
            </View>
            {isActive(tab.route) && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 4, // Reduced from 8 to align with right-side icons (right: 4px)
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  tabContent: {
    alignItems: 'center',
    padding: 4,
    borderRadius: 12,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
    opacity: 0.7,
  },
  activeTabIcon: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    textAlign: 'center',
  },
  activeTabLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    width: 20,
    backgroundColor: '#D4AF37',
    borderRadius: 1,
  },
});