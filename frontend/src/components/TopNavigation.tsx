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
        {/* Search Icon - Left Side */}
        <TouchableOpacity style={styles.navIconButton} onPress={handleSearchPress}>
          <Text style={styles.navIcon}>🔍</Text>
        </TouchableOpacity>

        {/* Notification Icon */}
        <TouchableOpacity style={styles.navIconButton} onPress={() => console.log('Notifications pressed')}>
          <Text style={styles.navIcon}>🔔</Text>
        </TouchableOpacity>

        {/* For You Text */}
        <TouchableOpacity 
          style={styles.forYouButton} 
          onPress={() => handleTabPress('/for-you')}
        >
          <Text style={[styles.forYouText, isActive('/for-you') && styles.forYouActive]}>
            For You
          </Text>
          {isActive('/for-you') && <View style={styles.activeIndicator} />}
        </TouchableOpacity>

        {/* Following Icon */}
        <TouchableOpacity style={styles.navIconButton} onPress={() => handleTabPress('/following')}>
          <Text style={[styles.navIcon, isActive('/following') && styles.navIconActive]}>👥</Text>
          {isActive('/following') && <View style={styles.iconActiveIndicator} />}
        </TouchableOpacity>

        {/* Explore Icon */}
        <TouchableOpacity style={styles.navIconButton} onPress={() => handleTabPress('/explore')}>
          <Text style={[styles.navIcon, isActive('/explore') && styles.navIconActive]}>🔍</Text>
          {isActive('/explore') && <View style={styles.iconActiveIndicator} />}
        </TouchableOpacity>

        {/* Nearby Icon */}
        <TouchableOpacity style={styles.navIconButton} onPress={() => console.log('Nearby pressed')}>
          <Text style={styles.navIcon}>📍</Text>
        </TouchableOpacity>

        {/* Live Icon */}
        <TouchableOpacity style={styles.navIconButton} onPress={handleLivePress}>
          <Text style={styles.liveIcon}>◉</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 12,
    paddingVertical: 12,
    height: 50,
  },
  rightContainer: {
    flex: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 16, // Balanced spacing from center tabs
    width: 60, // Fixed width to match profile avatar area
    paddingRight: 16, // Align with typical profile avatar right margin
  },
  liveButton: {
    width: 44, // Standard touch target size, matches profile avatar
    height: 44, // Square aspect ratio like profile avatar
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 0, 50, 0.1)',
    borderRadius: 22, // Half of width/height for perfect circle
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 50, 0.3)',
    shadowColor: '#FF0032',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  liveIcon: {
    fontSize: 22,
    color: '#FF0032', // Enhanced bright red for LIVE
    fontWeight: '700',
    textShadowColor: 'rgba(255, 0, 50, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
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
  navIconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  navIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  navIconActive: {
    color: '#D4AF37',
    textShadowColor: 'rgba(212, 175, 55, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  forYouButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
  },
  forYouText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  forYouActive: {
    color: '#D4AF37',
    textShadowColor: 'rgba(212, 175, 55, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  activeIndicator: {
    height: 2,
    width: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 1,
    marginTop: 4,
  },
  iconActiveIndicator: {
    height: 2,
    width: 20,
    backgroundColor: '#D4AF37',
    borderRadius: 1,
    marginTop: 2,
    alignSelf: 'center',
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