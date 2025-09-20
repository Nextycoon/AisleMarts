import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  TextInput,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import TabNavigator from './navigation/TabNavigator';

const { width } = Dimensions.get('window');

interface CreateOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  route: string;
  premium?: boolean;
}

export default function CreateScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<'content' | 'business' | 'social'>('content');

  const createOptions: Record<string, CreateOption[]> = {
    content: [
      {
        id: '1',
        title: 'Go Live',
        description: 'Start live shopping stream',
        icon: '🔴',
        color: '#FF3B30',
        route: '/live-commerce',
      },
      {
        id: '2',
        title: 'Product Post',
        description: 'Share a product discovery',
        icon: '📸',
        color: '#007AFF',
        route: '/create/product-post',
      },
      {
        id: '3',
        title: 'Story',
        description: '24-hour story content',
        icon: '⭐',
        color: '#FF9500',
        route: '/create/story',
      },
      {
        id: '4',
        title: 'Review',
        description: 'Write product review',
        icon: '⭐',
        color: '#34C759',
        route: '/create/review',
      },
      {
        id: '5',
        title: 'Collection',
        description: 'Curate product collection',
        icon: '📚',
        color: '#5856D6',
        route: '/create/collection',
      },
      {
        id: '6',
        title: 'Unboxing',
        description: 'Share unboxing experience',
        icon: '📦',
        color: '#FF2D92',
        route: '/create/unboxing',
      },
    ],
    business: [
      {
        id: '7',
        title: 'New Product',
        description: 'Add product to catalog',
        icon: '🏷️',
        color: '#D4AF37',
        route: '/business/products/new',
      },
      {
        id: '8',
        title: 'Promotion',
        description: 'Create marketing campaign',
        icon: '📢',
        color: '#FF6B35',
        route: '/business/promotions/new',
      },
      {
        id: '9',
        title: 'Analytics Report',
        description: 'Generate business insights',
        icon: '📊',
        color: '#00C896',
        route: '/business/analytics/create',
      },
      {
        id: '10',
        title: 'Brand Story',
        description: 'Share brand narrative',
        icon: '🎭',
        color: '#8E44AD',
        route: '/business/brand-story/create',
        premium: true,
      },
    ],
    social: [
      {
        id: '11',
        title: 'Group Chat',
        description: 'Start group conversation',
        icon: '👥',
        color: '#17A2B8',
        route: '/chat/create-group',
      },
      {
        id: '12',
        title: 'Family Link',
        description: 'Invite family member',
        icon: '👨‍👩‍👧‍👦',
        color: '#28A745',
        route: '/family/invite',
      },
      {
        id: '13',
        title: 'Voice Room',
        description: 'Host voice conversation',
        icon: '🎙️',
        color: '#6C5CE7',
        route: '/voice/create-room',
        premium: true,
      },
      {
        id: '14',
        title: 'Challenge',
        description: 'Start shopping challenge',
        icon: '🏆',
        color: '#FD79A8',
        route: '/challenges/create',
      },
    ],
  };

  const renderCreateOption = (option: CreateOption) => (
    <TouchableOpacity
      key={option.id}
      style={[styles.createCard, { borderLeftColor: option.color }]}
      onPress={() => router.push(option.route as any)}
      activeOpacity={0.7}
    >
      <View style={[styles.createIcon, { backgroundColor: option.color + '20' }]}>
        <Text style={styles.createIconText}>{option.icon}</Text>
      </View>
      <View style={styles.createContent}>
        <View style={styles.createHeader}>
          <Text style={styles.createTitle}>{option.title}</Text>
          {option.premium && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>⭐</Text>
            </View>
          )}
        </View>
        <Text style={styles.createDescription}>{option.description}</Text>
      </View>
      <View style={styles.createArrow}>
        <Text style={styles.createArrowText}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <SafeAreaView style={styles.header}>
        <Text style={styles.headerTitle}>➕ Create</Text>
        <TouchableOpacity style={styles.draftsButton}>
          <Text style={styles.draftsIcon}>📝</Text>
          <Text style={styles.draftsText}>Drafts (3)</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionPrimary}
          onPress={() => router.push('/live-commerce')}
        >
          <Text style={styles.quickActionIcon}>🔴</Text>
          <Text style={styles.quickActionText}>Go Live Now</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionSecondary}
          onPress={() => router.push('/create/product-post')}
        >
          <Text style={styles.quickActionIcon}>📸</Text>
          <Text style={styles.quickActionText}>Post</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionSecondary}
          onPress={() => router.push('/create/story')}
        >
          <Text style={styles.quickActionIcon}>⭐</Text>
          <Text style={styles.quickActionText}>Story</Text>
        </TouchableOpacity>
      </View>

      {/* Category Selector */}
      <View style={styles.categorySelector}>
        {[
          { key: 'content', label: 'Content', icon: '📸' },
          { key: 'business', label: 'Business', icon: '🏢' },
          { key: 'social', label: 'Social', icon: '👥' },
        ].map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryButton,
              selectedCategory === category.key && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(category.key as any)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === category.key && styles.categoryButtonTextActive,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Create Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'content' ? '📸 Content Creation' :
             selectedCategory === 'business' ? '🏢 Business Tools' :
             '👥 Social Features'}
          </Text>
          
          <View style={styles.createGrid}>
            {createOptions[selectedCategory]?.map(renderCreateOption)}
          </View>
        </View>

        {/* Inspiration Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Get Inspired</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.inspirationScroll}>
            {[
              {
                title: 'Trending Products',
                subtitle: 'What others are buying',
                image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
                color: '#FF6B35',
              },
              {
                title: 'Creator Tips',
                subtitle: 'Boost your content',
                image: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=200',
                color: '#6C5CE7',
              },
              {
                title: 'Success Stories',
                subtitle: 'Learn from others',
                image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200',
                color: '#00C896',
              },
            ].map((item, index) => (
              <TouchableOpacity key={index} style={styles.inspirationCard}>
                <Image source={{ uri: item.image }} style={styles.inspirationImage} />
                <View style={styles.inspirationOverlay}>
                  <Text style={styles.inspirationTitle}>{item.title}</Text>
                  <Text style={styles.inspirationSubtitle}>{item.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Your Recent Activity</Text>
          
          <View style={styles.activityCard}>
            <View style={styles.activityStat}>
              <Text style={styles.activityValue}>47</Text>
              <Text style={styles.activityLabel}>Posts this month</Text>
            </View>
            <View style={styles.activityDivider} />
            <View style={styles.activityStat}>
              <Text style={styles.activityValue}>12.3K</Text>
              <Text style={styles.activityLabel}>Total views</Text>
            </View>
            <View style={styles.activityDivider} />
            <View style={styles.activityStat}>
              <Text style={styles.activityValue}>89%</Text>
              <Text style={styles.activityLabel}>Engagement rate</Text>
            </View>
          </View>
        </View>

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
  draftsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  draftsIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  draftsText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  quickActionPrimary: {
    flex: 2,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionSecondary: {
    flex: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  categorySelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  categoryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#D4AF37',
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryButtonText: {
    color: '#CCCCCC',
    fontSize: 12,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  createGrid: {
    paddingHorizontal: 20,
  },
  createCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  createIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  createIconText: {
    fontSize: 20,
  },
  createContent: {
    flex: 1,
  },
  createHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  createTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  premiumBadge: {
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  premiumBadgeText: {
    fontSize: 10,
    color: '#000000',
  },
  createDescription: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  createArrow: {
    padding: 8,
  },
  createArrowText: {
    fontSize: 24,
    color: '#D4AF37',
    fontWeight: '300',
  },
  inspirationScroll: {
    paddingHorizontal: 20,
  },
  inspirationCard: {
    width: 160,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  inspirationImage: {
    width: '100%',
    height: '100%',
  },
  inspirationOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
  },
  inspirationTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  inspirationSubtitle: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  activityStat: {
    flex: 1,
    alignItems: 'center',
  },
  activityValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 4,
  },
  activityLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  activityDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
    marginHorizontal: 16,
  },
  bottomSpacing: {
    height: 100,
  },
});