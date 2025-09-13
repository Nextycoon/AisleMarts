import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useCart } from '../src/context/CartContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { clearCart } = useCart();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            clearCart();
            router.replace('/');
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      title: 'My Orders',
      icon: 'receipt-outline',
      onPress: () => router.push('/orders'),
      color: '#007AFF',
    },
    {
      title: '🌍 AI Trade Intelligence',
      icon: 'globe-outline',
      onPress: () => router.push('/ai-domain'),
      color: '#5856D6',
      isNew: true,
    },
    {
      title: '🤖 AI User Agents',
      icon: 'hardware-chip-outline',
      onPress: () => router.push('/ai-agents'),
      color: '#AF52DE',
      isNew: true,
    },
    {
      title: '🛡️ Identity & Verification',
      icon: 'shield-checkmark-outline',
      onPress: () => router.push('/auth-identity'),
      color: '#FF9500',
      isNew: true,
    },
    {
      title: '👤 Profile Card',
      icon: 'card-outline',
      onPress: () => router.push('/profile-card'),
      color: '#34C759',
      isNew: true,
    },
    ...(user?.roles.includes('vendor') ? [{
      title: 'Seller Dashboard',
      icon: 'business-outline',
      onPress: () => router.push('/vendor-dashboard'),
      color: '#34C759',
    }] : []),
    ...(user?.roles.includes('admin') ? [{
      title: 'Admin Dashboard',
      icon: 'analytics-outline',
      onPress: () => router.push('/admin-dashboard'),
      color: '#FF3B30',
    }] : []),
    {
      title: 'Shopping Cart',
      icon: 'cart-outline', 
      onPress: () => router.push('/cart'),
      color: '#007AFF',
    },
    {
      title: 'Help & Support',
      icon: 'help-circle-outline',
      onPress: () => Alert.alert('Help', 'Contact support at help@aislemarts.com'),
      color: '#FF9500',
    },
    {
      title: 'Privacy Policy',
      icon: 'shield-outline',
      onPress: () => Alert.alert('Privacy', 'Privacy policy coming soon'),
      color: '#8E8E93',
    },
    {
      title: 'About AisleMarts',
      icon: 'information-circle-outline',
      onPress: () => Alert.alert('About', 'AisleMarts v2.0\nYour AI-powered global marketplace with enterprise-grade features:\n\n🌍 AI Trade Intelligence\n🤖 Personal AI Agents\n🛡️ Advanced Identity System\n👤 Professional Profile Cards\n💳 Global Payment Engine\n📊 Real-time Analytics'),
      color: '#8E8E93',
    },
  ];

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authRequiredContainer}>
          <Ionicons name="person-outline" size={64} color="#ccc" />
          <Text style={styles.authRequiredTitle}>Sign In Required</Text>
          <Text style={styles.authRequiredSubtitle}>
            Please sign in to access your profile
          </Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push('/auth')}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={32} color="white" />
            </View>
          </View>
          <Text style={styles.userName}>{user.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.userRoles}>
            {user.roles.map((role, index) => (
              <View key={index} style={styles.roleBadge}>
                <Text style={styles.roleText}>{role.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionHeader}>🚀 Enterprise Features</Text>
          {menuItems.filter(item => item.isNew).map((item, index) => (
            <TouchableOpacity
              key={`new-${index}`}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
                  <Ionicons name={item.icon as any} size={20} color="white" />
                </View>
                <View style={styles.menuItemTextContainer}>
                  <Text style={styles.menuItemText}>{item.title}</Text>
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>NEW</Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            </TouchableOpacity>
          ))}
          
          <Text style={styles.sectionHeader}>📱 General</Text>
          {menuItems.filter(item => !item.isNew).map((item, index) => (
            <TouchableOpacity
              key={`general-${index}`}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
                  <Ionicons name={item.icon as any} size={20} color="white" />
                </View>
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <View style={styles.signOutSection}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfoSection}>
          <Text style={styles.appInfoText}>AisleMarts Mobile v1.0</Text>
          <Text style={styles.appInfoSubtext}>
            Built with ❤️ for global commerce
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  userSection: {
    backgroundColor: 'white',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  userRoles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  menuSection: {
    backgroundColor: 'white',
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
  signOutSection: {
    backgroundColor: 'white',
    marginTop: 8,
    padding: 16,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FFF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE6E6',
  },
  signOutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  appInfoSection: {
    alignItems: 'center',
    padding: 24,
  },
  appInfoText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  appInfoSubtext: {
    fontSize: 12,
    color: '#8E8E93',
  },
  authRequiredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  authRequiredTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  authRequiredSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  signInButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  signInButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});