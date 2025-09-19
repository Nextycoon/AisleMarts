import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  ImageBackground 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const LIFESTYLE_CATEGORIES = [
  {
    id: 'fashion',
    title: 'Fashion',
    subtitle: 'Luxury Style & Trends',
    description: 'Curated haute couture, designer brands, and trending fashion',
    color: '#E8C968',
    gradient: ['#E8C968', '#D4AF37'],
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop&crop=top',
  },
  {
    id: 'tech',
    title: 'Tech',
    subtitle: 'Innovation & Gadgets',
    description: 'Cutting-edge technology, premium gadgets, and smart living',
    color: '#4facfe',
    gradient: ['#4facfe', '#00f2fe'],
    image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&h=600&fit=crop&crop=center',
  },
  {
    id: 'home',
    title: 'Home',
    subtitle: 'Modern Living Spaces',
    description: 'Luxury furniture, decor, and lifestyle accessories',
    color: '#a8edea',
    gradient: ['#a8edea', '#fed6e3'],
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=center',
  },
  {
    id: 'sports',
    title: 'Sports',
    subtitle: 'Active Lifestyle',
    description: 'Premium athletic wear, fitness equipment, and wellness',
    color: '#ff9a9e',
    gradient: ['#ff9a9e', '#fecfef'],
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&crop=center',
  },
  {
    id: 'travel',
    title: 'Travel',
    subtitle: 'Global Adventures',
    description: 'Luxury travel gear, experiences, and destination essentials',
    color: '#ffecd2',
    gradient: ['#ffecd2', '#fcb69f'],
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop&crop=center',
  },
  {
    id: 'food',
    title: 'Food',
    subtitle: 'Gourmet & Cuisine',
    description: 'Premium ingredients, gourmet experiences, and culinary tools',
    color: '#a8cc8c',
    gradient: ['#a8cc8c', '#dbdcd7'],
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop&crop=center',
  },
];

export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();

  const handleCategoryPress = (categoryId: string) => {
    console.log(`🛍️ Navigating to ${categoryId} category`);
    router.push(`/categories/${categoryId}`);
  };

  const renderCategoryCard = (category: typeof LIFESTYLE_CATEGORIES[0], index: number) => (
    <TouchableOpacity
      key={category.id}
      style={[styles.categoryCard, { marginTop: index === 0 ? 0 : 24 }]}
      onPress={() => handleCategoryPress(category.id)}
      activeOpacity={0.9}
    >
      <ImageBackground
        source={{ uri: category.image }}
        style={styles.categoryImage}
        imageStyle={styles.categoryImageStyle}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
          locations={[0, 0.5, 1]}
          style={styles.categoryOverlay}
        >
          <View style={styles.categoryContent}>
            <LinearGradient
              colors={category.gradient}
              style={styles.categoryBadge}
            >
              <Text style={styles.categoryBadgeText}>{category.title}</Text>
            </LinearGradient>
            
            <Text style={styles.categoryTitle}>{category.subtitle}</Text>
            <Text style={styles.categoryDescription}>{category.description}</Text>
            
            <View style={styles.shopButton}>
              <LinearGradient
                colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                style={styles.shopButtonGradient}
              >
                <Text style={styles.shopButtonText}>Shop {category.title}</Text>
              </LinearGradient>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#0C0F14', '#1a1a2e', '#16213e']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lifestyle Categories</Text>
        <Text style={styles.headerSubtitle}>Curated collections for modern living</Text>
      </View>

      {/* Categories Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {LIFESTYLE_CATEGORIES.map((category, index) => 
          renderCategoryCard(category, index)
        )}
        
        {/* Bottom padding for safe area */}
        <View style={{ height: insets.bottom + 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0F14',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  categoryCard: {
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  categoryImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  categoryImageStyle: {
    borderRadius: 16,
  },
  categoryOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    borderRadius: 16,
  },
  categoryContent: {
    padding: 24,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  categoryDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
    lineHeight: 20,
  },
  shopButton: {
    alignSelf: 'flex-start',
  },
  shopButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  shopButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});