import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import TabNavigator from './navigation/TabNavigator';

const { width } = Dimensions.get('window');

interface ProfileStat {
  label: string;
  value: string;
  icon: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  subtitle?: string;
  route: string;
  badge?: string;
  hasSwitch?: boolean;
  switchValue?: boolean;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);

  const profileStats: ProfileStat[] = [
    { label: 'Following', value: '247', icon: '👥' },
    { label: 'Followers', value: '1.2K', icon: '❤️' },
    { label: 'Posts', value: '89', icon: '📸' },
    { label: 'Reviews', value: '34', icon: '⭐' },
  ];

  const menuSections: MenuSection[] = [
    {
      title: 'Account',
      items: [
        {
          id: '1',
          title: 'Edit Profile',
          icon: '👤',
          subtitle: 'Name, bio, avatar',
          route: '/profile/edit',
        },
        {
          id: '2',
          title: 'Privacy & Security',
          icon: '🔒',
          subtitle: 'Permissions, data',
          route: '/profile/privacy',
        },
        {
          id: '3',
          title: 'Notifications',
          icon: '🔔',
          subtitle: 'Push, email, SMS',
          route: '/profile/notifications',
          hasSwitch: true,
          switchValue: notificationsEnabled,
        },
        {
          id: '4',
          title: 'Messages & Inbox',
          icon: '✉️',
          subtitle: 'Chat, notifications',
          route: '/profile/inbox',
          badge: '3',
        },
        {
          id: '5',
          title: 'Payment Methods',
          icon: '💳',
          subtitle: 'Cards, wallets',
          route: '/profile/payments',
        },
      ],
    },
    {
      title: 'Family & Safety',
      items: [
        {
          id: '6',
          title: 'Family Dashboard',
          icon: '👨‍👩‍👧‍👦',
          subtitle: 'Manage family group',
          route: '/family/dashboard',
        },
        {
          id: '7',
          title: 'Screen Time & Wellbeing',
          icon: '⏰',
          subtitle: 'Digital wellness',
          route: '/family/screen-time',
        },
        {
          id: '8',
          title: 'Spending Controls',
          icon: '💰',
          subtitle: 'Budget limits',
          route: '/family/budget',
        },
        {
          id: '9',
          title: 'Safety Settings',
          icon: '🛡️',
          subtitle: 'Content filtering',
          route: '/family/safety',
        },
      ],
    },
    {
      title: 'Business',
      items: [
        {
          id: '10',
          title: 'Business Dashboard',
          icon: '⭐',
          subtitle: 'Analytics, insights',
          route: '/business/dashboard',
        },
        {
          id: '10',
          title: 'Creator Studio',
          icon: '🎬',
          subtitle: 'Content creation',
          route: '/business/content',
        },
        {
          id: '11',
          title: 'Monetization',
          icon: '💸',
          subtitle: 'Earnings, payouts',
          route: '/business/monetization',
        },
        {
          id: '12',
          title: 'Brand Settings',
          icon: '🏢',
          subtitle: 'Verification, trust',
          route: '/business/brand',
        },
      ],
    },
    {
      title: 'Shopping',
      items: [
        {
          id: '13',
          title: 'Order History',
          icon: '📦',
          subtitle: 'Past purchases',
          route: '/orders',
        },
        {
          id: '14',
          title: 'Wishlist',
          icon: '❤️',
          subtitle: 'Saved items',
          route: '/wishlist',
        },
        {
          id: '15',
          title: 'Reviews & Ratings',
          icon: '⭐',
          subtitle: 'Your feedback',
          route: '/reviews',
        },
        {
          id: '16',
          title: 'Addresses',
          icon: '📍',
          subtitle: 'Shipping locations',
          route: '/profile/addresses',
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          id: '17',
          title: 'Language & Region',
          icon: '🌍',
          subtitle: 'English (US)',
          route: '/profile/language',
        },
        {
          id: '18',
          title: 'Currency',
          icon: '💱',
          subtitle: 'EUR (Euro)',
          route: '/profile/currency',
        },
        {
          id: '19',
          title: 'Dark Mode',
          icon: '🌙',
          subtitle: 'Appearance',
          route: '/profile/appearance',
          hasSwitch: true,
          switchValue: darkModeEnabled,
        },
        {
          id: '20',
          title: 'Data & Storage',
          icon: '💾',
          subtitle: 'Cache, downloads',
          route: '/profile/data',
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: '21',
          title: 'Help Center',
          icon: '❓',
          subtitle: 'FAQs, guides',
          route: '/help',
        },
        {
          id: '22',
          title: 'Contact Support',
          icon: '📞',
          subtitle: '24/7 assistance',
          route: '/support',
        },
        {
          id: '23',
          title: 'Report Issue',
          icon: '🐛',
          subtitle: 'Bug reports',
          route: '/report',
        },
        {
          id: '24',
          title: 'About AisleMarts',
          icon: 'ℹ️',
          subtitle: 'Version 2.1.0',
          route: '/about',
        },
      ],
    },
  ];

  const handleSwitchToggle = (itemId: string, value: boolean) => {
    if (itemId === '3') {
      setNotificationsEnabled(value);
    } else if (itemId === '19') {
      setDarkModeEnabled(value);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <SafeAreaView style={styles.header}>
        <Text style={styles.headerTitle}>👤 Profile</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push('/profile/settings')}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1494790108755-2616b68650e3?w=200' }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editAvatarButton}>
              <Text style={styles.editAvatarIcon}>📷</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>Sarah Johnson</Text>
          <Text style={styles.userHandle}>@sarah_j</Text>
          <Text style={styles.userBio}>
            Fashion enthusiast 👗 • Coffee lover ☕ • Berlin-based 🇩🇪
          </Text>

          {/* Stats */}
          <View style={styles.statsContainer}>
            {profileStats.map((stat, index) => (
              <TouchableOpacity key={index} style={styles.statItem}>
                <Text style={styles.statIcon}>{stat.icon}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() => router.push('/profile/edit')}
            >
              <Text style={styles.editProfileButtonText}>Edit Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.shareProfileButton}
              onPress={() => {}}
            >
              <Text style={styles.shareProfileIcon}>📤</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Achievements Banner */}
        <View style={styles.achievementsBanner}>
          <View style={styles.achievementsContent}>
            <Text style={styles.achievementsIcon}>🏆</Text>
            <View style={styles.achievementsText}>
              <Text style={styles.achievementsTitle}>Digital Wellbeing Champion</Text>
              <Text style={styles.achievementsSubtitle}>
                Completed 15 missions this month
              </Text>
            </View>
            <TouchableOpacity
              style={styles.achievementsButton}
              onPress={() => router.push('/family/badges')}
            >
              <Text style={styles.achievementsButtonText}>View All</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionItems}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    itemIndex === section.items.length - 1 && styles.lastMenuItem,
                  ]}
                  onPress={() => !item.hasSwitch && router.push(item.route as any)}
                  disabled={item.hasSwitch}
                >
                  <View style={styles.menuItemLeft}>
                    <Text style={styles.menuItemIcon}>{item.icon}</Text>
                    <View style={styles.menuItemContent}>
                      <Text style={styles.menuItemTitle}>{item.title}</Text>
                      {item.subtitle && (
                        <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.menuItemRight}>
                    {item.badge && (
                      <View style={styles.menuItemBadge}>
                        <Text style={styles.menuItemBadgeText}>{item.badge}</Text>
                      </View>
                    )}
                    {item.hasSwitch ? (
                      <Switch
                        value={item.switchValue}
                        onValueChange={(value) => handleSwitchToggle(item.id, value)}
                        trackColor={{ false: '#767577', true: '#D4AF37' }}
                        thumbColor={item.switchValue ? '#000000' : '#f4f3f4'}
                      />
                    ) : (
                      <Text style={styles.menuItemArrow}>›</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton}>
          <Text style={styles.signOutIcon}>🚪</Text>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <TabNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.3)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  settingsButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  settingsIcon: {
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.3)',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#D4AF37',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#D4AF37',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAvatarIcon: {
    fontSize: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userHandle: {
    fontSize: 16,
    color: '#D4AF37',
    marginBottom: 8,
  },
  userBio: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  editProfileButton: {
    flex: 1,
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editProfileButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  shareProfileButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  shareProfileIcon: {
    fontSize: 16,
  },
  achievementsBanner: {
    marginHorizontal: 20,
    marginVertical: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  achievementsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementsIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  achievementsText: {
    flex: 1,
  },
  achievementsTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  achievementsSubtitle: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  achievementsButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  achievementsButtonText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '600',
  },
  menuSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionItems: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.1)',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuItemBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  menuItemBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  menuItemArrow: {
    color: '#D4AF37',
    fontSize: 20,
    fontWeight: '300',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
    marginBottom: 20,
  },
  signOutIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  signOutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 100,
  },
});