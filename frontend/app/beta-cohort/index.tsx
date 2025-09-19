import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  Alert,
  Share
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BetaUser {
  id: string;
  email: string;
  type: 'user' | 'creator' | 'vendor';
  status: 'invited' | 'activated' | 'active' | 'churned';
  joinedAt: string;
  inviteCode: string;
  cohort: string;
  activity: {
    lastSeen: string;
    posts: number;
    purchases: number;
    gmvContributed: number;
  };
}

interface CohortStats {
  totalInvited: number;
  totalActivated: number;
  totalActive: number;
  retentionRate: number;
  avgDaysActive: number;
  totalGMV: number;
}

const COHORT_LIMITS = {
  users: 100,
  creators: 20,
  vendors: 10
};

const SAMPLE_BETA_USERS: BetaUser[] = [
  {
    id: 'u1',
    email: 'emma.style@gmail.com',
    type: 'creator',
    status: 'active',
    joinedAt: '2024-12-15',
    inviteCode: 'CREATOR-BETA-001',
    cohort: 'C20-Founders',
    activity: {
      lastSeen: '2 hours ago',
      posts: 23,
      purchases: 5,
      gmvContributed: 2450
    }
  },
  {
    id: 'u2',
    email: 'luxury.shopper@icloud.com',
    type: 'user',
    status: 'active',
    joinedAt: '2024-12-16',
    inviteCode: 'USER-BETA-045',
    cohort: 'U100-Early',
    activity: {
      lastSeen: '1 hour ago',
      posts: 0,
      purchases: 12,
      gmvContributed: 3200
    }
  },
  {
    id: 'u3',
    email: 'premium.brands@company.com',
    type: 'vendor',
    status: 'activated',
    joinedAt: '2024-12-14',
    inviteCode: 'VENDOR-BETA-003',
    cohort: 'V10-Partners',
    activity: {
      lastSeen: '3 hours ago',
      posts: 0,
      purchases: 0,
      gmvContributed: 15600 // Revenue from their products
    }
  },
  {
    id: 'u4',
    email: 'tech.reviewer@influencer.co',
    type: 'creator',
    status: 'active',
    joinedAt: '2024-12-17',
    inviteCode: 'CREATOR-BETA-008',
    cohort: 'C20-Founders',
    activity: {
      lastSeen: '30 minutes ago',
      posts: 15,
      purchases: 3,
      gmvContributed: 1890
    }
  }
];

export default function BetaCohortScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'overview' | 'invite' | 'manage'>('overview');
  const [betaUsers, setBetaUsers] = useState<BetaUser[]>(SAMPLE_BETA_USERS);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserType, setNewUserType] = useState<'user' | 'creator' | 'vendor'>('user');
  const [demoMode, setDemoMode] = useState(true);

  useEffect(() => {
    loadBetaUsers();
  }, []);

  const loadBetaUsers = async () => {
    try {
      const saved = await AsyncStorage.getItem('betaUsers');
      if (saved) {
        setBetaUsers([...SAMPLE_BETA_USERS, ...JSON.parse(saved)]);
      }
    } catch (error) {
      console.error('Failed to load beta users:', error);
    }
  };

  const saveBetaUsers = async (users: BetaUser[]) => {
    try {
      const realUsers = users.filter(u => !SAMPLE_BETA_USERS.find(s => s.id === u.id));
      await AsyncStorage.setItem('betaUsers', JSON.stringify(realUsers));
    } catch (error) {
      console.error('Failed to save beta users:', error);
    }
  };

  const generateInviteCode = (type: string): string => {
    const prefix = type.toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    return `${prefix}-BETA-${timestamp}${random}`;
  };

  const getCohortStats = (type: 'user' | 'creator' | 'vendor'): CohortStats => {
    const cohortUsers = betaUsers.filter(u => u.type === type);
    const totalInvited = cohortUsers.length;
    const totalActivated = cohortUsers.filter(u => u.status !== 'invited').length;
    const totalActive = cohortUsers.filter(u => u.status === 'active').length;
    const retentionRate = totalInvited > 0 ? (totalActive / totalInvited) * 100 : 0;
    const totalGMV = cohortUsers.reduce((sum, u) => sum + u.activity.gmvContributed, 0);
    
    return {
      totalInvited,
      totalActivated,
      totalActive,
      retentionRate,
      avgDaysActive: 12.5, // Mock calculation
      totalGMV
    };
  };

  const inviteNewUser = () => {
    if (!newUserEmail) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    const cohort = betaUsers.filter(u => u.type === newUserType);
    const limit = COHORT_LIMITS[`${newUserType}s` as keyof typeof COHORT_LIMITS];
    
    if (cohort.length >= limit) {
      Alert.alert('Cohort Full', `${newUserType} cohort is full (${limit}/${limit})`);
      return;
    }

    const newUser: BetaUser = {
      id: `${newUserType}_${Date.now()}`,
      email: newUserEmail,
      type: newUserType,
      status: 'invited',
      joinedAt: new Date().toISOString().split('T')[0],
      inviteCode: generateInviteCode(newUserType),
      cohort: `${newUserType.charAt(0).toUpperCase()}${limit}-Beta`,
      activity: {
        lastSeen: 'Never',
        posts: 0,
        purchases: 0,
        gmvContributed: 0
      }
    };

    const updatedUsers = [...betaUsers, newUser];
    setBetaUsers(updatedUsers);
    saveBetaUsers(updatedUsers);

    // Share invite link
    shareInvite(newUser);

    setNewUserEmail('');
    Alert.alert('Invite Sent!', `Beta invite sent to ${newUserEmail}`);
  };

  const shareInvite = async (user: BetaUser) => {
    const inviteUrl = `https://aislemarts.com/beta/${user.inviteCode}`;
    const message = `🎉 You're invited to AisleMarts Beta!\n\nJoin the future of luxury lifestyle commerce:\n${inviteUrl}\n\nInvite Code: ${user.inviteCode}\n\n#AisleMartsBeta #LuxuryCommerce`;

    try {
      await Share.share({
        message,
        url: inviteUrl,
        title: 'AisleMarts Beta Invitation'
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const getStatusColor = (status: BetaUser['status']) => {
    switch (status) {
      case 'invited': return '#FF9800';
      case 'activated': return '#2196F3';
      case 'active': return '#4CAF50';
      case 'churned': return '#F44336';
      default: return '#666';
    }
  };

  const getTypeColor = (type: BetaUser['type']) => {
    switch (type) {
      case 'user': return '#9C27B0';
      case 'creator': return '#E91E63';
      case 'vendor': return '#00BCD4';
      default: return '#666';
    }
  };

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Cohort Summary Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏆 Beta Cohort Overview</Text>
        
        {['user', 'creator', 'vendor'].map((type) => {
          const stats = getCohortStats(type as any);
          const limit = COHORT_LIMITS[`${type}s` as keyof typeof COHORT_LIMITS];
          
          return (
            <View key={type} style={styles.cohortCard}>
              <LinearGradient
                colors={[`${getTypeColor(type as any)}20`, `${getTypeColor(type as any)}10`]}
                style={styles.cohortCardGradient}
              >
                <View style={styles.cohortCardHeader}>
                  <View style={styles.cohortInfo}>
                    <Text style={styles.cohortType}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}s
                    </Text>
                    <Text style={[styles.cohortLimit, { color: getTypeColor(type as any) }]}>
                      {stats.totalInvited}/{limit}
                    </Text>
                  </View>
                  <View style={[styles.cohortBadge, { backgroundColor: getTypeColor(type as any) }]}>
                    <Text style={styles.cohortBadgeText}>
                      {type === 'user' ? 'U100' : type === 'creator' ? 'C20' : 'V10'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.cohortStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.totalActive}</Text>
                    <Text style={styles.statLabel}>Active</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.retentionRate.toFixed(1)}%</Text>
                    <Text style={styles.statLabel}>Retention</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>${(stats.totalGMV/1000).toFixed(1)}K</Text>
                    <Text style={styles.statLabel}>GMV</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          );
        })}
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Recent Beta Activity</Text>
        <View style={styles.activityFeed}>
          {betaUsers.filter(u => u.status === 'active').slice(0, 5).map((user) => (
            <View key={user.id} style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: getTypeColor(user.type) }]}>
                <Text style={styles.activityIconText}>
                  {user.type === 'user' ? '👤' : user.type === 'creator' ? '🎥' : '🏪'}
                </Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityUser}>{user.email}</Text>
                <Text style={styles.activityDetail}>
                  {user.type === 'creator' 
                    ? `${user.activity.posts} posts • $${user.activity.gmvContributed} GMV`
                    : user.type === 'vendor'
                    ? `$${user.activity.gmvContributed} revenue generated`
                    : `${user.activity.purchases} purchases • $${user.activity.gmvContributed} spent`
                  }
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(user.status) }]}>
                <Text style={styles.statusText}>{user.status}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderInviteTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📧 Send Beta Invites</Text>
        
        {/* Invite Form */}
        <View style={styles.inviteForm}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={styles.textInput}
            value={newUserEmail}
            onChangeText={setNewUserEmail}
            placeholder="creator@example.com"
            placeholderTextColor="rgba(255,255,255,0.5)"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <Text style={styles.inputLabel}>Cohort Type</Text>
          <View style={styles.typeSelector}>
            {(['user', 'creator', 'vendor'] as const).map((type) => {
              const stats = getCohortStats(type);
              const limit = COHORT_LIMITS[`${type}s` as keyof typeof COHORT_LIMITS];
              const isSelected = newUserType === type;
              const isFull = stats.totalInvited >= limit;
              
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeOption,
                    isSelected && styles.typeOptionSelected,
                    isFull && styles.typeOptionDisabled
                  ]}
                  onPress={() => !isFull && setNewUserType(type)}
                  disabled={isFull}
                >
                  <Text style={[
                    styles.typeOptionText,
                    isSelected && styles.typeOptionTextSelected,
                    isFull && styles.typeOptionTextDisabled
                  ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                  <Text style={[styles.typeOptionCount, isFull && styles.typeOptionTextDisabled]}>
                    {stats.totalInvited}/{limit}
                  </Text>
                  {isFull && <Text style={styles.fullBadge}>FULL</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
          
          <TouchableOpacity
            style={[styles.inviteButton, !newUserEmail && styles.inviteButtonDisabled]}
            onPress={inviteNewUser}
            disabled={!newUserEmail}
          >
            <LinearGradient
              colors={newUserEmail ? ['#E8C968', '#D4AF37'] : ['#666', '#555']}
              style={styles.inviteButtonGradient}
            >
              <Text style={styles.inviteButtonText}>Send Beta Invite</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Bulk Invite Templates */}
        <View style={styles.bulkInvites}>
          <Text style={styles.bulkTitle}>🚀 Quick Invite Templates</Text>
          
          <TouchableOpacity style={styles.templateButton}>
            <Text style={styles.templateText}>Invite Instagram Creator</Text>
            <Text style={styles.templateSubtext}>Pre-filled DM template</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.templateButton}>
            <Text style={styles.templateText}>Invite Luxury Brand</Text>
            <Text style={styles.templateSubtext}>Vendor partnership email</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.templateButton}>
            <Text style={styles.templateText}>Invite Power User</Text>
            <Text style={styles.templateSubtext}>High-value shopper invite</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderManageTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👥 Manage Beta Users</Text>
        
        {/* Demo Mode Toggle */}
        <View style={styles.demoToggle}>
          <Text style={styles.demoToggleLabel}>Demo Mode</Text>
          <TouchableOpacity
            style={[styles.toggle, demoMode && styles.toggleActive]}
            onPress={() => setDemoMode(!demoMode)}
          >
            <View style={[styles.toggleDot, demoMode && styles.toggleDotActive]} />
          </TouchableOpacity>
        </View>
        
        {/* User List */}
        <View style={styles.userList}>
          {betaUsers.map((user) => (
            <View key={user.id} style={styles.userItem}>
              <View style={styles.userInfo}>
                <View style={styles.userHeader}>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  <View style={[styles.userTypeBadge, { backgroundColor: getTypeColor(user.type) }]}>
                    <Text style={styles.userTypeText}>{user.type}</Text>
                  </View>
                </View>
                
                <Text style={styles.userCohort}>{user.cohort} • Joined {user.joinedAt}</Text>
                <Text style={styles.userCode}>Code: {user.inviteCode}</Text>
                
                <View style={styles.userStats}>
                  <Text style={styles.userStat}>
                    🎬 {user.activity.posts} posts
                  </Text>
                  <Text style={styles.userStat}>
                    🛍️ {user.activity.purchases} purchases
                  </Text>
                  <Text style={styles.userStat}>
                    💰 ${user.activity.gmvContributed}
                  </Text>
                </View>
              </View>
              
              <View style={[styles.userStatus, { backgroundColor: getStatusColor(user.status) }]}>
                <Text style={styles.userStatusText}>{user.status}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#0C0F14', '#1a1a2e', '#16213e']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <LinearGradient
            colors={['#E8C968', '#D4AF37']}
            style={styles.titleBadge}
          >
            <Text style={styles.titleBadgeText}>BETA ELITE</Text>
          </LinearGradient>
          <Text style={styles.headerTitle}>Private Beta Cohort</Text>
          <Text style={styles.headerSubtitle}>100 Users • 20 Creators • 10 Vendors</Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'invite' && styles.activeTab]}
          onPress={() => setActiveTab('invite')}
        >
          <Text style={[styles.tabText, activeTab === 'invite' && styles.activeTabText]}>
            Invite
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'manage' && styles.activeTab]}
          onPress={() => setActiveTab('manage')}
        >
          <Text style={[styles.tabText, activeTab === 'manage' && styles.activeTabText]}>
            Manage
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'invite' && renderInviteTab()}
        {activeTab === 'manage' && renderManageTab()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0F14',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '600',
  },
  headerContent: {
    flex: 1,
  },
  titleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 8,
  },
  titleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#E8C968',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  activeTabText: {
    color: '#000',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  cohortCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cohortCardGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  cohortCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cohortInfo: {
    flex: 1,
  },
  cohortType: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  cohortLimit: {
    fontSize: 14,
    fontWeight: '600',
  },
  cohortBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  cohortBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  cohortStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  activityFeed: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityIconText: {
    fontSize: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityUser: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 2,
  },
  activityDetail: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  inviteForm: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  typeOption: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  typeOptionSelected: {
    backgroundColor: 'rgba(232, 201, 104, 0.2)',
    borderColor: '#E8C968',
  },
  typeOptionDisabled: {
    opacity: 0.5,
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  typeOptionTextSelected: {
    color: '#E8C968',
  },
  typeOptionTextDisabled: {
    color: 'rgba(255,255,255,0.4)',
  },
  typeOptionCount: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  fullBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F44336',
    marginTop: 4,
  },
  inviteButton: {
    // Style handled by gradient
  },
  inviteButtonDisabled: {
    opacity: 0.5,
  },
  inviteButtonGradient: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  inviteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  bulkInvites: {
    gap: 12,
  },
  bulkTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  templateButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  templateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  templateSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  demoToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  demoToggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#E8C968',
  },
  toggleDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
  },
  toggleDotActive: {
    alignSelf: 'flex-end',
  },
  userList: {
    gap: 16,
  },
  userItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  userInfo: {
    flex: 1,
    marginRight: 16,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
  },
  userTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  userTypeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  userCohort: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  userCode: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 8,
  },
  userStats: {
    flexDirection: 'row',
    gap: 16,
  },
  userStat: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  userStatus: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  userStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
});