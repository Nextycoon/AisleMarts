import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import TabNavigator from './navigation/TabNavigator';

const { width } = Dimensions.get('window');

interface LifeCategory {
  id: string;
  title: string;
  icon: string;
  subtitle: string;
  color: string;
  route: string;
}

interface LifeActivity {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  trending: boolean;
}

export default function LifeScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('wellness');

  const lifeCategories: LifeCategory[] = [
    {
      id: 'wellness',
      title: 'Wellness',
      icon: '🧘‍♀️',
      subtitle: 'Mind & Body',
      color: '#4CAF50',
      route: '/life/wellness',
    },
    {
      id: 'lifestyle',
      title: 'Lifestyle', 
      icon: '✨',
      subtitle: 'Daily Life',
      color: '#FF9800',
      route: '/life/lifestyle',
    },
    {
      id: 'travel',
      title: 'Travel',
      icon: '✈️',
      subtitle: 'Adventures',
      color: '#2196F3',
      route: '/life/travel',
    },
    {
      id: 'food',
      title: 'Food & Dining',
      icon: '🍽️',
      subtitle: 'Culinary',
      color: '#E91E63',
      route: '/life/food',
    },
    {
      id: 'fashion',
      title: 'Fashion',
      icon: '👗',
      subtitle: 'Style',
      color: '#9C27B0',
      route: '/life/fashion',
    },
    {
      id: 'home',
      title: 'Home & Living',
      icon: '🏡',
      subtitle: 'Interior',
      color: '#795548',
      route: '/life/home',
    },
  ];

  const lifeActivities: LifeActivity[] = [
    {
      id: '1',
      title: 'Morning Meditation',
      description: 'Start your day with mindfulness',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300',
      category: 'wellness',
      trending: true,
    },
    {
      id: '2',
      title: 'Weekend Getaway Guide',
      description: 'Perfect spots for a quick escape',
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300',
      category: 'travel',
      trending: true,
    },
    {
      id: '3',
      title: 'Healthy Recipes',
      description: 'Nutritious meals made easy',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300',
      category: 'food',
      trending: false,
    },
    {
      id: '4',
      title: 'Style Inspiration',
      description: 'Latest fashion trends',
      image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=300',
      category: 'fashion',
      trending: true,
    },
  ];

  const filteredActivities = lifeActivities.filter(
    activity => activity.category === activeCategory
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🌟 Life</Text>
          <Text style={styles.headerSubtitle}>Discover your lifestyle</Text>
        </View>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => router.push('/search')}
        >
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Featured Banner */}
        <View style={styles.featuredBanner}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800' }}
            style={styles.bannerImage}
          />
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTitle}>Live Your Best Life</Text>
            <Text style={styles.bannerSubtitle}>
              Discover curated content for wellness, travel, and lifestyle
            </Text>
            <TouchableOpacity style={styles.bannerButton}>
              <Text style={styles.bannerButtonText}>Explore Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView 
            horizontal 
            style={styles.categoriesScroll}
            showsHorizontalScrollIndicator={false}
          >
            {lifeCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  { borderColor: category.color },
                  activeCategory === category.id && { backgroundColor: `${category.color}20` }
                ]}
                onPress={() => setActiveCategory(category.id)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Trending Now */}
        <View style={styles.trendingSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Now</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            style={styles.trendingScroll}
            showsHorizontalScrollIndicator={false}
          >
            {lifeActivities.filter(activity => activity.trending).map((activity) => (
              <TouchableOpacity key={activity.id} style={styles.trendingCard}>
                <Image source={{ uri: activity.image }} style={styles.trendingImage} />
                <View style={styles.trendingBadge}>
                  <Text style={styles.trendingBadgeText}>🔥</Text>
                </View>
                <View style={styles.trendingContent}>
                  <Text style={styles.trendingTitle}>{activity.title}</Text>
                  <Text style={styles.trendingDescription}>{activity.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* For You */}
        <View style={styles.forYouSection}>
          <Text style={styles.sectionTitle}>For You</Text>
          {filteredActivities.map((activity) => (
            <TouchableOpacity key={activity.id} style={styles.activityCard}>
              <Image source={{ uri: activity.image }} style={styles.activityImage} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityDescription}>{activity.description}</Text>
                <View style={styles.activityMeta}>
                  <Text style={styles.activityCategory}>
                    {lifeCategories.find(c => c.id === activity.category)?.icon} {' '}
                    {lifeCategories.find(c => c.id === activity.category)?.title}
                  </Text>
                  {activity.trending && (
                    <View style={styles.trendingTag}>
                      <Text style={styles.trendingTagText}>Trending</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
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
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.3)',
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    marginTop: 2,
  },
  searchButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  searchIcon: {
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  featuredBanner: {
    height: 200,
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
    padding: 20,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  bannerSubtitle: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  bannerButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  categoriesScroll: {
    paddingLeft: 20,
  },
  categoryCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 120,
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  categorySubtitle: {
    color: '#CCCCCC',
    fontSize: 12,
    textAlign: 'center',
  },
  trendingSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  seeAllText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
  },
  trendingScroll: {
    paddingLeft: 20,
  },
  trendingCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    marginRight: 16,
    width: 180,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  trendingImage: {
    width: '100%',
    height: 120,
    position: 'relative',
  },
  trendingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendingBadgeText: {
    fontSize: 12,
  },
  trendingContent: {
    padding: 12,
  },
  trendingTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  trendingDescription: {
    color: '#CCCCCC',
    fontSize: 12,
    lineHeight: 16,
  },
  forYouSection: {
    marginHorizontal: 20,
    marginBottom: 32,
  },
  activityCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    marginBottom: 16,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  activityImage: {
    width: 100,
    height: 100,
  },
  activityContent: {
    flex: 1,
    padding: 16,
  },
  activityTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  activityDescription: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  activityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityCategory: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '500',
  },
  trendingTag: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  trendingTagText: {
    color: '#FF3B30',
    fontSize: 10,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 100,
  },
});