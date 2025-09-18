import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  ScrollView 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

type UserRole = 'shopper';

export default function AisleAvatarScreen() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('shopper');
  const [isLoading, setIsLoading] = useState(false);
  const { setupAvatar } = useAuth();

  const handleContinue = async () => {
    if (!selectedRole) return;
    
    setIsLoading(true);
    
    try {
      await setupAvatar(selectedRole);
      router.replace('/aisle-agent');
    } catch (error) {
      console.error('Failed to setup avatar:', error);
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['#0f0f23', '#1a1a2e', '#16213e', '#581c87']}
        style={StyleSheet.absoluteFill}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandAccent} />
          <Text style={styles.heroTitle}>AisleMarts</Text>
          <Text style={styles.heroSubtitle}>Luxury Shopping Redefined</Text>
          
          <View style={styles.taglineContainer}>
            <Text style={styles.tagline}>Your personal AI concierge awaits</Text>
            <Text style={styles.taglineSecondary}>Curated experiences • Premium service • Exclusive access</Text>
          </View>
        </View>

        {/* Prominent Aisle Identity Banner */}
        <View style={styles.aisleIdentityBanner}>
          <View style={styles.aisleIdentityHeader}>
            <View style={styles.aisleIconBadge}>
              <Text style={styles.aisleIconBadgeText}>AI</Text>
            </View>
            <Text style={styles.aisleIdentityTitle}>Meet Aisle</Text>
          </View>
          <Text style={styles.aisleIdentityStatement}>
            Aisle is an OpenAI ChatGPT‑5 AI Agent specialized in commerce and shopping that brings the right products to the right customers.
          </Text>
          <View style={styles.aisleFeatureList}>
            <Text style={styles.aisleFeature}>🛍️ Commerce Expert</Text>
            <Text style={styles.aisleFeature}>🤖 OpenAI Powered</Text>
            <Text style={styles.aisleFeature}>🎯 Smart Matching</Text>
          </View>
        </View>

        {/* Role Selection */}
        <View style={styles.roleSection}>
          <Text style={styles.sectionTitle}>Choose Your Experience</Text>
          
          <TouchableOpacity
            style={[styles.roleCard, selectedRole === 'shopper' && styles.selectedCard]}
            onPress={() => setSelectedRole('shopper')}
            activeOpacity={0.8}
          >
            <View style={styles.roleContent}>
              <View style={styles.roleHeader}>
                <View style={styles.iconContainer}>
                  <Text style={styles.roleIcon}>🛍️</Text>
                </View>
                
                <View style={styles.roleInfo}>
                  <Text style={styles.roleTitle}>Elite Shopper</Text>
                  <Text style={styles.roleSubtitle}>Curated luxury shopping experience</Text>
                </View>
                
                {selectedRole === 'shopper' && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkIcon}>✓</Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.roleDescription}>
                Discover premium brands, exclusive deals, and personalized recommendations crafted by your dedicated AI shopping expert.
              </Text>
              
              {/* Enhanced Aisle Integration within Role Card */}
              <View style={styles.aisleIntegrationCard}>
                <Text style={styles.aisleIntegrationTitle}>🤖 Powered by Aisle AI</Text>
                <Text style={styles.aisleIntegrationDescription}>
                  Your personal OpenAI ChatGPT-5 shopping companion specializing in bringing you the perfect products.
                </Text>
              </View>
              
              <View style={styles.featuresContainer}>
                <View style={styles.feature}>
                  <Text style={styles.featureIcon}>🤖</Text>
                  <Text style={styles.featureText}>AI Personal Stylist</Text>
                </View>
                <View style={styles.feature}>
                  <Text style={styles.featureIcon}>💎</Text>
                  <Text style={styles.featureText}>VIP Access</Text>
                </View>
                <View style={styles.feature}>
                  <Text style={styles.featureIcon}>🎯</Text>
                  <Text style={styles.featureText}>Smart Recommendations</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={[styles.ctaButton, (!selectedRole || isLoading) && styles.ctaButtonDisabled]}
            onPress={handleContinue}
            disabled={!selectedRole || isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#f59e0b', '#d97706']}
              style={styles.ctaButtonGradient}
            >
              <Text style={styles.ctaButtonText}>
                {isLoading ? "Preparing Your Experience..." : "Enter the Luxury Marketplace"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={styles.disclaimer}>
            Premium shopping experience • Personalized service • Exclusive brands
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    paddingBottom: 80,
  },
  
  header: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 48,
    alignItems: 'center',
  },
  
  brandAccent: {
    width: 60,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#f59e0b',
    marginBottom: 24,
  },
  
  heroTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  
  heroSubtitle: {
    fontSize: 18,
    fontWeight: '300',
    color: '#f59e0b',
    textAlign: 'center',
    marginBottom: 24,
  },
  
  taglineContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  
  tagline: {
    fontSize: 16,
    fontWeight: '500',
    color: '#e5e5e5',
    textAlign: 'center',
    marginBottom: 8,
  },
  
  taglineSecondary: {
    fontSize: 14,
    fontWeight: '400',
    color: '#a1a1a3',
    textAlign: 'center',
  },
  
  // Prominent Aisle Identity Banner Styles
  aisleIdentityBanner: {
    marginHorizontal: 24,
    marginVertical: 20,
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  
  aisleIdentityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  aisleIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#a855f7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  
  aisleIconBadgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  
  aisleIdentityTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#a855f7',
  },
  
  aisleIdentityStatement: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff',
    lineHeight: 22,
    marginBottom: 16,
    textAlign: 'center',
  },
  
  aisleFeatureList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  
  aisleFeature: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d4d4d8',
    textAlign: 'center',
  },
  
  // Enhanced Aisle Integration within Role Card
  aisleIntegrationCard: {
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  
  aisleIntegrationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#a855f7',
    marginBottom: 8,
  },
  
  aisleIntegrationDescription: {
    fontSize: 13,
    fontWeight: '400',
    color: '#e5e5e5',
    lineHeight: 18,
  },
  
  roleSection: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 32,
  },
  
  roleCard: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  selectedCard: {
    borderColor: '#f59e0b',
    borderWidth: 2,
  },
  
  roleContent: {
    padding: 24,
  },
  
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  
  roleIcon: {
    fontSize: 28,
  },
  
  roleInfo: {
    flex: 1,
  },
  
  roleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  
  roleSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#f59e0b',
  },
  
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  checkmarkIcon: {
    fontSize: 16,
    color: '#0f0f23',
    fontWeight: 'bold',
  },
  
  roleDescription: {
    fontSize: 16,
    fontWeight: '400',
    color: '#d4d4d8',
    lineHeight: 24,
    marginBottom: 24,
  },
  
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  
  featureIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  
  featureText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#a1a1a3',
    textAlign: 'center',
  },
  
  ctaSection: {
    paddingHorizontal: 24,
    marginTop: 32,
    alignItems: 'center',
  },
  
  ctaButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  
  ctaButtonDisabled: {
    opacity: 0.5,
  },
  
  ctaButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f0f23',
    textAlign: 'center',
  },
  
  disclaimer: {
    fontSize: 14,
    fontWeight: '400',
    color: '#71717a',
    textAlign: 'center',
  },
});