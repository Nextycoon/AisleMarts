import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';

const { width } = Dimensions.get('window');

interface TabItem {
  name: string;
  icon: string;
  route: string;
  label: string;
}

const tabs: TabItem[] = [
  { name: 'home', icon: '🏠', route: '/for-you', label: 'Home' },
  { name: 'friends', icon: '👥', route: '/friends', label: 'Friends' },
  { name: 'create', icon: '➕', route: '/create', label: '' },
  { name: 'inbox', icon: '✉️', route: '/notifications', label: 'Inbox' },
  { name: 'profile', icon: '👤', route: '/profile', label: 'Profile' },
];

export default function TabNavigator() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (route: string) => {
    if (route === '/aisle-agent' && pathname === '/') return true;
    return pathname === route || pathname.startsWith(route + '/');
  };

  const handleTabPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab, index) => {
          const active = isActive(tab.route);
          
          return (
            <TouchableOpacity
              key={tab.name}
              style={[
                styles.tabItem,
                tab.name === 'create' && styles.createButton,
                { width: width / tabs.length }
              ]}
              onPress={() => handleTabPress(tab.route)}
              activeOpacity={0.7}
            >
              {tab.name === 'create' ? (
                <View style={styles.createIconContainer}>
                  <Text style={styles.createIcon}>{tab.icon}</Text>
                </View>
              ) : (
                <View style={[styles.tabIconContainer, active && styles.tabIconContainerActive]}>
                  <Text style={[styles.tabIcon, active && styles.tabIconActive]}>
                    {tab.icon}
                  </Text>
                </View>
              )}
              {tab.label && (
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    paddingTop: 8,
    paddingBottom: 20, // Account for home indicator on iPhone
    paddingHorizontal: 0,
    minHeight: 70,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
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
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '400',
    textAlign: 'center',
  },
  tabLabelActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});