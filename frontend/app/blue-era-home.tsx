import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../src/context/AuthContext';
import AisleAvatar from '../src/components/AisleAvatar';

const { width, height } = Dimensions.get('window');

interface UserRole {
  id: 'brand' | 'shopper';
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  badgeColor: string;
  features: string[];
}

const USER_ROLES: UserRole[] = [
  {
    id: 'brand',
    title: 'Brand / Business',
    subtitle: 'I want to sell globally',
    description: 'Access enterprise tools, AI trade intelligence, and global reach',
    icon: 'business',
    color: '#0A2540', // Deep Blue
    badgeColor: '#1E90FF', // Trust Blue
    features: [
      '🌍 Global marketplace access',
      '🤖 AI trade intelligence',
      '📄 Documentation compliance',
      '💳 Payment processing',
      '📊 Analytics dashboard',
    ],
  },
  {
    id: 'shopper',
    title: 'Shopper / Buyer',
    subtitle: 'I want to discover & buy',
    description: 'Personalized shopping with AI recommendations and global selection',
    icon: 'storefront',
    color: '#34C759', // Trust Green
    badgeColor: '#34C759',
    features: [
      '🛍️ Personalized recommendations',
      '🔍 AI-powered search',
      '🌐 Global product discovery',
      '💬 Smart shopping assistant',
      '📦 Order tracking',
    ],
  },
];

export default function BlueEraHomeScreen() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<'welcome' | 'role-selection' | 'dashboard'>('welcome');
  const [selectedRole, setSelectedRole] = useState<'brand' | 'shopper' | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Welcome animation
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-advance to role selection after 3 seconds if no interaction
    const timer = setTimeout(() => {
      if (currentStep === 'welcome') {
        handleWelcomeComplete();
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleWelcomeComplete = () => {
    setCurrentStep('role-selection');
    Animated.timing(slideAnim, {
      toValue: 2,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  const handleRoleSelection = (role: 'brand' | 'shopper') => {
    setSelectedRole(role);
    
    // Store role preference (could be saved to backend/local storage)
    console.log('User selected role:', role);
    
    // Transition to dashboard
    setCurrentStep('dashboard');
    
    // Navigate to appropriate dashboard after a brief delay
    setTimeout(() => {
      router.push('/blue-era-dashboard');
    }, 2000);
  };

  const renderWelcomeScreen = () => (
    <Animated.View style={[styles.welcomeContainer, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#0A2540', '#1E90FF']}
        style={styles.welcomeBackground}
      >
        <View style={styles.welcomeContent}>
          <AisleAvatar
            pose="wave"
            expression="joyful"
            size="large"
            showSpeechBubble={true}
            message="I'm here to help you succeed! 🌟"
          />
          
          <Text style={styles.welcomeTitle}>
            Welcome to the{'\n'}
            <Text style={styles.blueEraText}>Blue Era</Text>
          </Text>
          
          <Text style={styles.welcomeSubtitle}>
            Where commerce becomes human again
          </Text>
          
          <View style={styles.philosophyCard}>
            <Text style={styles.philosophyTitle}>💙 Our Philosophy</Text>
            <Text style={styles.philosophyText}>
              Technology warm. AI human. Commerce caring.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleWelcomeComplete}
          >
            <Text style={styles.continueButtonText}>Let's Begin</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderRoleSelection = () => (
    <Animated.View 
      style={[
        styles.roleSelectionContainer,
        {
          transform: [{
            translateX: slideAnim.interpolate({
              inputRange: [0, 1, 2],
              outputRange: [width, 0, -width],
            }),
          }],
        },
      ]}
    >
      <View style={styles.roleHeader}>
        <AisleAvatar
          pose="speak"
          expression="caring"
          size="medium"
          showSpeechBubble={true}
          message="How would you like to use AisleMarts today?"
        />
        
        <Text style={styles.roleTitle}>Choose Your Journey</Text>
        <Text style={styles.roleSubtitle}>
          I'll personalize your experience based on your goals
        </Text>
      </View>

      <ScrollView style={styles.roleCardsContainer}>
        {USER_ROLES.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={[styles.roleCard, { borderColor: role.color }]}
            onPress={() => handleRoleSelection(role.id)}
          >
            <LinearGradient
              colors={[role.color, role.badgeColor]}
              style={styles.roleCardGradient}
            >
              <View style={styles.roleCardHeader}>
                <View style={[styles.roleIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Ionicons name={role.icon as any} size={32} color="white" />
                </View>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>
                    {role.id === 'brand' ? 'BLUE BADGE' : 'GREEN BADGE'}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.roleCardTitle}>{role.title}</Text>
              <Text style={styles.roleCardSubtitle}>{role.subtitle}</Text>
              <Text style={styles.roleCardDescription}>{role.description}</Text>
              
              <View style={styles.roleFeatures}>
                {role.features.map((feature, index) => (
                  <Text key={index} style={styles.roleFeature}>
                    {feature}
                  </Text>
                ))}
              </View>
              
              <View style={styles.roleCardFooter}>
                <Text style={styles.selectText}>Tap to Select</Text>
                <Ionicons name="arrow-forward-circle" size={24} color="white" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );

  const renderDashboardTransition = () => (
    <View style={styles.transitionContainer}>
      <LinearGradient
        colors={selectedRole === 'brand' ? ['#0A2540', '#1E90FF'] : ['#34C759', '#32D74B']}
        style={styles.transitionBackground}
      >
        <AisleAvatar
          pose="caring"
          expression="confident"
          size="large"
          showSpeechBubble={true}
          message={`Perfect! Setting up your ${selectedRole === 'brand' ? 'Brand' : 'Shopping'} experience...`}
        />
        
        <Text style={styles.transitionTitle}>
          Welcome to your{'\n'}
          <Text style={styles.blueEraText}>Blue Era Dashboard</Text>
        </Text>
        
        <View style={styles.loadingIndicator}>
          <Animated.View style={styles.loadingDot} />
          <Animated.View style={styles.loadingDot} />
          <Animated.View style={styles.loadingDot} />
        </View>
        
        <Text style={styles.transitionSubtitle}>
          Personalizing your journey...
        </Text>
      </LinearGradient>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {currentStep === 'welcome' && renderWelcomeScreen()}
      {currentStep === 'role-selection' && renderRoleSelection()}
      {currentStep === 'dashboard' && renderDashboardTransition()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A2540',
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeContent: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  blueEraText: {
    color: '#FFD700', // Accent Gold
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 32,
  },
  philosophyCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  philosophyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  philosophyText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    gap: 8,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A2540',
  },
  roleSelectionContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  roleHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: 'white',
  },
  roleTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0A2540',
    marginTop: 16,
    marginBottom: 8,
  },
  roleSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  roleCardsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  roleCard: {
    borderRadius: 20,
    marginVertical: 12,
    borderWidth: 2,
    overflow: 'hidden',
  },
  roleCardGradient: {
    padding: 24,
  },
  roleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  roleIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  roleBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  roleCardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  roleCardSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  roleCardDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 16,
    lineHeight: 20,
  },
  roleFeatures: {
    marginBottom: 20,
  },
  roleFeature: {
    fontSize: 14,
    color: 'white',
    marginBottom: 8,
    paddingLeft: 8,
  },
  roleCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  transitionContainer: {
    flex: 1,
  },
  transitionBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  transitionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 32,
  },
  transitionSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 16,
  },
  loadingIndicator: {
    flexDirection: 'row',
    gap: 8,
  },
  loadingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'white',
    opacity: 0.6,
  },
});