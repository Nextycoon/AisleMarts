import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  ActivityIndicator,
  Dimensions,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');

interface Mood {
  id: string;
  name: string;
  description: string;
  color: string;
  categories: string[];
}

interface ProductRecommendation {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  tags: string[];
  ai_reasoning: string;
  mood_match_score: number;
}

interface MoodCartResponse {
  mood: {
    id: string;
    name: string;
    description: string;
    color: string;
  };
  recommendations: ProductRecommendation[];
  cart_total: number;
  ai_insight: string;
  personalization_note: string;
}

const API_URL = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL;

export default function MoodToCartScreen() {
  const insets = useSafeAreaInsets();
  const [moods, setMoods] = useState<Mood[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [cart, setCart] = useState<MoodCartResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMoods, setLoadingMoods] = useState(true);

  useEffect(() => {
    loadMoods();
  }, []);

  const loadMoods = async () => {
    try {
      const response = await fetch(`${API_URL}/api/mood/moods`);
      const data = await response.json();
      
      if (data.success) {
        setMoods(data.moods);
      }
    } catch (error) {
      console.error('Failed to load moods:', error);
      Alert.alert('Error', 'Failed to load mood options');
    } finally {
      setLoadingMoods(false);
    }
  };

  const generateMoodCart = async (moodId: string) => {
    setLoading(true);
    setSelectedMood(moodId);
    
    try {
      const response = await fetch(`${API_URL}/api/mood/generate-cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mood: moodId,
          budget_max: 1000,
          categories: [],
          user_preferences: {}
        }),
      });
      
      const data = await response.json();
      setCart(data);
    } catch (error) {
      console.error('Failed to generate mood cart:', error);
      Alert.alert('Error', 'Failed to generate your mood cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addToMainCart = (product: ProductRecommendation) => {
    console.log(`🛒 Adding ${product.name} to main cart`);
    Alert.alert('Added to Cart', `${product.name} has been added to your cart!`);
  };

  const renderMoodSelector = () => (
    <View style={styles.moodSelector}>
      <Text style={styles.sectionTitle}>How are you feeling today?</Text>
      <Text style={styles.sectionSubtitle}>Choose a mood and let our AI curate the perfect cart for you</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodScroll}>
        <View style={styles.moodGrid}>
          {moods.map((mood) => (
            <TouchableOpacity
              key={mood.id}
              style={[
                styles.moodCard,
                selectedMood === mood.id && styles.selectedMoodCard
              ]}
              onPress={() => generateMoodCart(mood.id)}
              disabled={loading}
            >
              <LinearGradient
                colors={[mood.color, `${mood.color}80`]}
                style={styles.moodCardGradient}
              >
                <Text style={styles.moodName}>{mood.name}</Text>
                <Text style={styles.moodDescription}>{mood.description}</Text>
                <View style={styles.moodCategories}>
                  {mood.categories.slice(0, 3).map((category) => (
                    <View key={category} style={styles.categoryTag}>
                      <Text style={styles.categoryTagText}>{category}</Text>
                    </View>
                  ))}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderProductCard = (product: ProductRecommendation) => (
    <View key={product.id} style={styles.productCard}>
      <Image source={{ uri: product.image }} style={styles.productImage} />
      
      <View style={styles.productInfo}>
        <View style={styles.productHeader}>
          <Text style={styles.productBrand}>{product.brand}</Text>
          <View style={styles.matchScore}>
            <Text style={styles.matchScoreText}>{Math.round(product.mood_match_score)}% match</Text>
          </View>
        </View>
        
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productPrice}>${product.price.toFixed(0)}</Text>
        
        <View style={styles.productTags}>
          {product.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={styles.productTag}>
              <Text style={styles.productTagText}>#{tag}</Text>
            </View>
          ))}
        </View>
        
        <Text style={styles.aiReasoning}>{product.ai_reasoning}</Text>
        
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={() => addToMainCart(product)}
        >
          <LinearGradient
            colors={['#E8C968', '#D4AF37']}
            style={styles.addToCartGradient}
          >
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMoodCart = () => {
    if (!cart) return null;

    return (
      <View style={styles.cartContainer}>
        {/* Mood Header */}
        <View style={styles.cartHeader}>
          <LinearGradient
            colors={[cart.mood.color, `${cart.mood.color}80`]}
            style={styles.cartMoodBadge}
          >
            <Text style={styles.cartMoodName}>{cart.mood.name}</Text>
          </LinearGradient>
          <Text style={styles.cartPersonalization}>{cart.personalization_note}</Text>
        </View>

        {/* AI Insight */}
        <View style={styles.aiInsightCard}>
          <Text style={styles.aiInsightTitle}>🤖 AI Insight</Text>
          <Text style={styles.aiInsightText}>{cart.ai_insight}</Text>
        </View>

        {/* Products */}
        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>Your Curated Selection</Text>
          {cart.recommendations.map(renderProductCard)}
        </View>

        {/* Cart Summary */}
        <View style={styles.cartSummary}>
          <LinearGradient
            colors={['rgba(232, 201, 104, 0.2)', 'rgba(212, 175, 55, 0.2)']}
            style={styles.cartSummaryGradient}
          >
            <View style={styles.cartSummaryContent}>
              <Text style={styles.cartSummaryTitle}>Cart Total</Text>
              <Text style={styles.cartSummaryPrice}>${cart.cart_total.toFixed(0)}</Text>
            </View>
            <Text style={styles.cartSummarySubtext}>
              {cart.recommendations.length} items perfectly matched to your {cart.mood.name.toLowerCase()} mood
            </Text>
            
            <TouchableOpacity style={styles.checkoutButton}>
              <LinearGradient
                colors={['#E8C968', '#D4AF37']}
                style={styles.checkoutButtonGradient}
              >
                <Text style={styles.checkoutButtonText}>Add All to Cart</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    );
  };

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
            <Text style={styles.titleBadgeText}>AI POWERED</Text>
          </LinearGradient>
          <Text style={styles.headerTitle}>Mood-to-Cart™</Text>
          <Text style={styles.headerSubtitle}>AI curates products based on your mood</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loadingMoods ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E8C968" />
            <Text style={styles.loadingText}>Loading mood options...</Text>
          </View>
        ) : (
          <>
            {!cart && renderMoodSelector()}
            
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E8C968" />
                <Text style={styles.loadingText}>Curating your perfect cart...</Text>
                <Text style={styles.loadingSubtext}>Our AI is analyzing your mood</Text>
              </View>
            )}
            
            {cart && renderMoodCart()}
            
            <View style={{ height: insets.bottom + 32 }} />
          </>
        )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
    textAlign: 'center',
  },
  moodSelector: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 24,
  },
  moodScroll: {
    marginHorizontal: -24,
  },
  moodGrid: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
  },
  moodCard: {
    width: 200,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
  },
  selectedMoodCard: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  moodCardGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  moodName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  moodDescription: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.8)',
    lineHeight: 16,
    marginBottom: 12,
  },
  moodCategories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryTag: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryTagText: {
    fontSize: 10,
    color: '#000',
    fontWeight: '600',
  },
  cartContainer: {
    gap: 24,
  },
  cartHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  cartMoodBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 12,
  },
  cartMoodName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  cartPersonalization: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  aiInsightCard: {
    backgroundColor: 'rgba(75, 172, 254, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(75, 172, 254, 0.3)',
  },
  aiInsightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4facfe',
    marginBottom: 8,
  },
  aiInsightText: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 20,
  },
  productsSection: {
    gap: 16,
  },
  productCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  productImage: {
    width: '100%',
    height: 200,
  },
  productInfo: {
    padding: 16,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productBrand: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  matchScore: {
    backgroundColor: 'rgba(232, 201, 104, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  matchScoreText: {
    fontSize: 10,
    color: '#E8C968',
    fontWeight: '600',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E8C968',
    marginBottom: 12,
  },
  productTags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  productTag: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  productTagText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
  },
  aiReasoning: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  addToCartButton: {
    alignSelf: 'flex-start',
  },
  addToCartGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addToCartText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  cartSummary: {
    marginTop: 16,
  },
  cartSummaryGradient: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(232, 201, 104, 0.3)',
  },
  cartSummaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cartSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  cartSummaryPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#E8C968',
  },
  cartSummarySubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 16,
  },
  checkoutButton: {
    width: '100%',
  },
  checkoutButtonGradient: {
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
});