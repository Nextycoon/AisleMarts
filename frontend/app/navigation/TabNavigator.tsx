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
  { name: 'aisleshop', icon: '🛍️', route: '/categories', label: 'Marts' },
  { name: 'inbox', icon: '✉️', route: '/inbox', label: 'Inbox' },
  { name: 'create', icon: '➕', route: '/create', label: 'Create' },
  { name: 'brands', icon: '🏷️', route: '/brands', label: 'Brands' },
  { name: 'friends', icon: '👥', route: '/friends', label: 'Friends' },
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
                isActive(tab.route) && styles.activeTabIcon
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
    backgroundColor: '#000000',
  },
  vendorBadgeContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  vendorBadge: {
    alignSelf: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    paddingTop: 6,
    paddingBottom: 18,
    paddingHorizontal: 4,
    minHeight: 65,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  createButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  tabIconContainerActive: {
    // No special active container styling like TikTok
  },
  tabIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  tabIconActive: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  createIconContainer: {
    width: 48,
    height: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  createIcon: {
    fontSize: 18,
    color: '#000000',
    fontWeight: '600',
  },
  tabLabel: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});