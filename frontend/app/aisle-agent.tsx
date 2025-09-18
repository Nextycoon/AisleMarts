import React, { useState, useEffect } from 'react';
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

export default function AisleAgentScreen() {
  const [isListening, setIsListening] = useState(false);

  const handleVoicePress = () => {
    setIsListening(!isListening);
  };

  const quickActions = [
    {
      icon: '🔥',
      title: 'Trending',
      subtitle: 'Hot deals & new arrivals',
      onPress: () => console.log('Trending pressed')
    },
    {
      icon: '📍',
      title: 'Nearby',
      subtitle: 'Local boutiques & stores',
      onPress: () => console.log('Nearby pressed')
    },
    {
      icon: '🛒',
      title: 'Shop',
      subtitle: 'Browse premium brands',
      onPress: () => console.log('Shop pressed')
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['#0f0f23', '#1a1a2e', '#16213e', '#581c87']}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>AI Shopping Assistant</Text>
            <View style={styles.statusIndicator}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Premium Mode</Text>
            </View>
          </View>
        </View>

        {/* Prominent Aisle Identity Section */}
        <View style={styles.aisleIdentitySection}>
          <View style={styles.aisleIdentityCard}>
            <View style={styles.aisleIdentityHeader}>
              <View style={styles.aisleAvatarContainer}>
                <Text style={styles.aisleAvatarIcon}>🤖</Text>
              </View>
              <View style={styles.aisleIdentityInfo}>
                <Text style={styles.aisleIdentityName}>Aisle</Text>
                <Text style={styles.aisleIdentityTagline}>OpenAI ChatGPT-5 Powered</Text>
              </View>
            </View>
            <Text style={styles.aisleIdentityStatement}>
              Aisle is an OpenAI ChatGPT‑5 AI Agent specialized in commerce and shopping that brings the right products to the right customers.
            </Text>
            <View style={styles.aisleCapabilities}>
              <Text style={styles.aisleCapability}>🛍️ Commerce Expert</Text>
              <Text style={styles.aisleCapability}>🎯 Smart Product Matching</Text>
              <Text style={styles.aisleCapability}>⚡ Instant Recommendations</Text>
            </View>
          </View>
        </View>

        {/* AI Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#a855f7', '#3b82f6', '#f59e0b']}
              style={styles.avatarGradient}
            >
              <View style={styles.avatarInner}>
                <Text style={styles.avatarIcon}>🤖</Text>
              </View>
            </LinearGradient>
          </View>
          
          <TouchableOpacity
            style={styles.voiceButton}
            onPress={handleVoicePress}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isListening ? ['#f59e0b', '#d97706'] : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
              style={styles.voiceButtonGradient}
            >
              <Text style={[styles.voiceButtonText, isListening && styles.voiceButtonTextActive]}>
                {isListening ? "Listening..." : "Tap to talk with me!"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <View style={styles.statusContainer}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>• {isListening ? 'Listening' : 'Ready'}</Text>
            </View>
          </View>
        </View>

        {/* Conversation Section */}
        <View style={styles.conversationSection}>
          <View style={styles.conversationCard}>
            <Text style={styles.conversationTitle}>Meet Aisle - Your AI Shopping Expert</Text>
            
            {/* Aisle Identity Message */}
            <View style={styles.aisleIdentityBanner}>
              <View style={styles.aisleIdentityHeader}>
                <Text style={styles.aisleIdentityIcon}>🤖</Text>
                <Text style={styles.aisleIdentityLabel}>Powered by OpenAI ChatGPT-5</Text>
              </View>
              <Text style={styles.aisleIdentityMessage}>
                Aisle is an OpenAI ChatGPT‑5 AI Agent specialized in commerce and shopping — bringing the right products to the right customers, 24/7/365, in every language and market.
              </Text>
            </View>
            
            <Text style={styles.conversationText}>
              Good evening! Welcome to AisleMarts Premium. I'm your personal AI shopping companion ready to help you discover amazing products, find exclusive deals, and make luxury shopping effortless.
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.actionsTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={action.title}
                style={styles.actionItem}
                onPress={action.onPress}
                activeOpacity={0.8}
              >
                <View style={styles.actionContent}>
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
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
  
  header: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 16,
  },
  
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f59e0b',
    marginRight: 8,
  },
  
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#e5e5e5',
  },
  
  // Prominent Aisle Identity Section Styles
  aisleIdentitySection: {
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 24,
  },
  
  aisleIdentityCard: {
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
  
  aisleAvatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#a855f7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  
  aisleAvatarIcon: {
    fontSize: 28,
    color: '#ffffff',
  },
  
  aisleIdentityInfo: {
    flex: 1,
  },
  
  aisleIdentityName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#a855f7',
    marginBottom: 4,
  },
  
  aisleIdentityTagline: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d4d4d8',
  },
  
  aisleIdentityStatement: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff',
    lineHeight: 22,
    marginBottom: 16,
    textAlign: 'center',
  },
  
  aisleCapabilities: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  
  aisleCapability: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d4d4d8',
    textAlign: 'center',
  },
  
  avatarSection: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 32,
  },
  
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
  },
  
  avatarGradient: {
    flex: 1,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  avatarInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  avatarIcon: {
    fontSize: 40,
    color: '#ffffff',
  },
  
  voiceButton: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  voiceButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 200,
  },
  
  voiceButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  
  voiceButtonTextActive: {
    color: '#0f0f23',
  },
  
  statusContainer: {
    alignItems: 'center',
  },
  
  statusBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#f59e0b',
  },
  
  conversationSection: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  
  conversationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  conversationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  
  // Aisle Identity Banner Styles
  aisleIdentityBanner: {
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  
  aisleIdentityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  aisleIdentityIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  
  aisleIdentityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a855f7',
  },
  
  aisleIdentityMessage: {
    fontSize: 13,
    fontWeight: '400',
    color: '#e5e5e5',
    lineHeight: 18,
  },
  
  conversationText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#d4d4d8',
    lineHeight: 24,
  },
  
  actionsSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  
  actionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 24,
    textAlign: 'center',
  },
  
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  
  actionItem: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    aspectRatio: 1,
  },
  
  actionContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  
  actionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
    textAlign: 'center',
  },
  
  actionSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: '#a1a1a3',
    textAlign: 'center',
  },
});