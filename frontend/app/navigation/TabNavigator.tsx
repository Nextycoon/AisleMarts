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
                active && styles.tabItemActive,
                { width: width / tabs.length }
              ]}
              onPress={() => handleTabPress(tab.route)}
              activeOpacity={0.7}
            >
              <View style={[styles.tabIconContainer, active && styles.tabIconContainerActive]}>
                <Text style={[styles.tabIcon, active && styles.tabIconActive]}>
                  {tab.icon}
                </Text>
              </View>
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {tab.label}
              </Text>
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
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.3)',
    paddingTop: 8,
    paddingBottom: 4,
    paddingHorizontal: 4,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tabItemActive: {
    // Active tab styling handled by individual elements
  },
  tabIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  tabIconContainerActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
  },
  tabIcon: {
    fontSize: 18,
  },
  tabIconActive: {
    fontSize: 20,
  },
  tabLabel: {
    fontSize: 10,
    color: '#999999',
    fontWeight: '500',
    textAlign: 'center',
  },
  tabLabelActive: {
    color: '#D4AF37',
    fontWeight: '600',
  },
});