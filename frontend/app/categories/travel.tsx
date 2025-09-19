import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  ImageBackground,
  FlatList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const TRAVEL_COLLECTIONS = [
  {
    id: 'luggage',
    title: 'Luggage',
    itemCount: 78,
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=800&fit=crop&crop=center',
    price: 'From $99',
  },
  {
    id: 'accessories',
    title: 'Accessories',
    itemCount: 156,
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=800&fit=crop&crop=center',
    price: 'From $19',
  },
  {
    id: 'gadgets',
    title: 'Travel Tech',
    itemCount: 89,
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=800&fit=crop&crop=center',
    price: 'From $29',
  },
  {
    id: 'essentials',
    title: 'Essentials',
    itemCount: 203,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=800&fit=crop&crop=center',
    price: 'From $9',
  },
];

export default function TravelScreen() {
  const insets = useSafeAreaInsets();

  const renderCollectionCard = ({ item }: { item: typeof TRAVEL_COLLECTIONS[0] }) => (
    <TouchableOpacity
      style={styles.collectionCard}
      onPress={() => console.log(`🛍️ Viewing ${item.title} collection`)}
      activeOpacity={0.9}
    >
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.collectionImage}
        imageStyle={styles.collectionImageStyle}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          locations={[0, 1]}
          style={styles.collectionOverlay}
        >
          <View style={styles.collectionContent}>
            <Text style={styles.collectionTitle}>{item.title}</Text>
            <Text style={styles.collectionItems}>{item.itemCount} items</Text>
            <Text style={styles.collectionPrice}>{item.price}</Text>
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <LinearGradient
            colors={['#ffecd2', '#fcb69f']}
            style={styles.categoryBadge}
          >
            <Text style={styles.categoryBadgeText}>TRAVEL</Text>
          </LinearGradient>
          <Text style={styles.headerTitle}>Global Adventures</Text>
          <Text style={styles.headerSubtitle}>Luxury travel gear, experiences, and destination essentials</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <FlatList
          data={TRAVEL_COLLECTIONS}
          renderItem={renderCollectionCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.collectionRow}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.collectionsGrid}
        />
        
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
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  categoryBadgeText: {
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
    paddingTop: 16,
  },
  collectionsGrid: {
    paddingBottom: 24,
  },
  collectionRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  collectionCard: {
    width: (width - 64) / 2,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  collectionImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  collectionImageStyle: {
    borderRadius: 12,
  },
  collectionOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  collectionContent: {
    alignItems: 'flex-start',
  },
  collectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  collectionItems: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  collectionPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffecd2',
  },
});