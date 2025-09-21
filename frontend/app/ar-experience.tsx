/**
 * 🥽 AisleMarts AR/VR Experience Center
 * Next-generation augmented and virtual reality product visualization
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function ARExperienceScreen() {
  const [activeTab, setActiveTab] = useState('ar');
  const [arSupported, setArSupported] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('furniture');

  const categories = [
    { id: 'furniture', name: 'Furniture', icon: '🪑', color: '#FF6B6B' },
    { id: 'jewelry', name: 'Jewelry', icon: '💎', color: '#4ECDC4' },
    { id: 'fashion', name: 'Fashion', icon: '👗', color: '#45B7D1' },
    { id: 'electronics', name: 'Electronics', icon: '📱', color: '#96CEB4' },
    { id: 'art', name: 'Art', icon: '🎨', color: '#FFEAA7' },
    { id: 'beauty', name: 'Beauty', icon: '💄', color: '#FD79A8' },
  ];

  const featuredProducts = [
    {
      id: 1,
      name: 'Designer Luxury Sofa',
      category: 'furniture',
      price: '$4,299',
      image: '🛋️',
      arReady: true,
      vrReady: true,
      features: ['Room placement', 'Material preview', 'Size fitting']
    },
    {
      id: 2,
      name: 'Diamond Tennis Bracelet',
      category: 'jewelry',
      price: '$12,500',
      image: '💎',
      arReady: true,
      vrReady: true,
      features: ['Try-on preview', 'Detail inspection', 'Size comparison']
    },
    {
      id: 3,
      name: 'Smart Home Display',
      category: 'electronics',
      price: '$899',
      image: '📺',
      arReady: true,
      vrReady: false,
      features: ['Wall mounting', 'Size preview', 'Interface demo']
    },
    {
      id: 4,
      name: 'Luxury Evening Gown',
      category: 'fashion',
      price: '$2,899',
      image: '👗',
      arReady: false,
      vrReady: true,
      features: ['Virtual try-on', 'Color variants', 'Fabric preview']
    },
  ];

  const filteredProducts = featuredProducts.filter(product => 
    product.category === selectedCategory
  );

  const handleARExperience = (product) => {
    if (!product.arReady) {
      Alert.alert(
        'AR Not Available',
        'AR experience is not yet available for this product. We\'re working on adding AR support!',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Start AR Experience',
      `Launch AR visualization for ${product.name}? Make sure you have good lighting and a flat surface.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start AR', 
          onPress: () => {
            // In production: Launch AR session
            Alert.alert('AR Started', 'AR experience would launch here with camera access');
          }
        }
      ]
    );
  };

  const handleVRExperience = (product) => {
    if (!product.vrReady) {
      Alert.alert(
        'VR Not Available',
        'VR showroom experience is not yet available for this product.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Launch VR Showroom',
      `Enter virtual showroom for ${product.name}? This will open an immersive 3D environment.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Enter VR', 
          onPress: () => {
            // In production: Launch VR experience
            Alert.alert('VR Loading', 'VR showroom would launch here');
          }
        }
      ]
    );
  };

  const renderProduct = (product) => (
    <View key={product.id} style={styles.productCard}>
      <View style={styles.productHeader}>
        <View style={styles.productImageContainer}>
          <Text style={styles.productEmoji}>{product.image}</Text>
          <View style={styles.productBadges}>
            {product.arReady && <Text style={styles.badge}>AR</Text>}
            {product.vrReady && <Text style={styles.badge}>VR</Text>}
          </View>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>{product.price}</Text>
        </View>
      </View>

      <View style={styles.productFeatures}>
        {product.features.map((feature, index) => (
          <Text key={index} style={styles.featureTag}>
            ✨ {feature}
          </Text>
        ))}
      </View>

      <View style={styles.productActions}>
        <TouchableOpacity
          style={[styles.actionButton, !product.arReady && styles.actionButtonDisabled]}
          onPress={() => handleARExperience(product)}
        >
          <Text style={styles.actionButtonText}>🥽 Try in AR</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, !product.vrReady && styles.actionButtonDisabled]}
          onPress={() => handleVRExperience(product)}
        >
          <Text style={styles.actionButtonText}>🌐 View in VR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>AR/VR Experience</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'ar' && styles.activeTab]}
          onPress={() => setActiveTab('ar')}
        >
          <Text style={[styles.tabText, activeTab === 'ar' && styles.activeTabText]}>
            🥽 Augmented Reality
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'vr' && styles.activeTab]}
          onPress={() => setActiveTab('vr')}
        >
          <Text style={[styles.tabText, activeTab === 'vr' && styles.activeTabText]}>
            🌐 Virtual Showroom
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Selector */}
      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.activeCategoryChip,
                { borderColor: category.color }
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.activeCategoryText
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {activeTab === 'ar' ? 'AR Ready Products' : 'VR Showroom Available'}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {activeTab === 'ar' 
              ? 'Try products in your space using augmented reality'
              : 'Explore products in immersive virtual environments'
            }
          </Text>
        </View>

        {filteredProducts.length > 0 ? (
          filteredProducts.map(renderProduct)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No products available</Text>
            <Text style={styles.emptyText}>
              AR/VR experiences are being added for this category. Check back soon!
            </Text>
          </View>
        )}

        {/* Technology Info */}
        <View style={styles.techInfoContainer}>
          <Text style={styles.techTitle}>Technology Features</Text>
          <View style={styles.techFeatures}>
            <View style={styles.techFeature}>
              <Text style={styles.techIcon}>📱</Text>
              <View>
                <Text style={styles.techFeatureTitle}>Device Compatibility</Text>
                <Text style={styles.techFeatureText}>iPhone 12+, Android ARCore</Text>
              </View>
            </View>
            <View style={styles.techFeature}>
              <Text style={styles.techIcon}>🎯</Text>
              <View>
                <Text style={styles.techFeatureTitle}>Precision Tracking</Text>
                <Text style={styles.techFeatureText}>Room-scale AR with 6DOF</Text>
              </View>
            </View>
            <View style={styles.techFeature}>
              <Text style={styles.techIcon}>⚡</Text>
              <View>
                <Text style={styles.techFeatureTitle}>Real-time Rendering</Text>
                <Text style={styles.techFeatureText}>60 FPS photorealistic quality</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Coming Soon */}
        <View style={styles.comingSoonContainer}>
          <Text style={styles.comingSoonTitle}>🚀 Coming Soon</Text>
          <View style={styles.comingSoonFeatures}>
            <Text style={styles.comingSoonFeature}>• Apple Vision Pro support</Text>
            <Text style={styles.comingSoonFeature}>• AI-powered 3D model generation</Text>
            <Text style={styles.comingSoonFeature}>• Social AR shopping experiences</Text>
            <Text style={styles.comingSoonFeature}>• Custom product configuration</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#D4AF37',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 44,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    marginHorizontal: 4,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeTab: {
    backgroundColor: '#D4AF37',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888888',
  },
  activeTabText: {
    color: '#000000',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 16,
  },
  categoriesScroll: {
    marginTop: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  activeCategoryChip: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#888888',
  },
  activeCategoryText: {
    color: '#D4AF37',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  productCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  productHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  productImageContainer: {
    position: 'relative',
  },
  productEmoji: {
    fontSize: 48,
    marginRight: 16,
  },
  productBadges: {
    position: 'absolute',
    top: -8,
    right: 8,
    flexDirection: 'row',
  },
  badge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
    backgroundColor: '#D4AF37',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 2,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D4AF37',
  },
  productFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  featureTag: {
    fontSize: 12,
    color: '#888888',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  productActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: '#333333',
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 20,
  },
  techInfoContainer: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  techTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4AF37',
    marginBottom: 12,
  },
  techFeatures: {
    gap: 12,
  },
  techFeature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  techIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  techFeatureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  techFeatureText: {
    fontSize: 12,
    color: '#888888',
  },
  comingSoonContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
  },
  comingSoonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  comingSoonFeatures: {
    gap: 8,
  },
  comingSoonFeature: {
    fontSize: 14,
    color: '#888888',
  },
});