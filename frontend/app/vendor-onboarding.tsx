import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  content: React.ReactNode;
}

export default function VendorOnboardingScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [vendorData, setVendorData] = useState({
    businessName: '',
    businessType: '',
    monthlyRevenue: '',
    currentPlatform: '',
  });
  
  const scrollViewRef = useRef<ScrollView>(null);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 0,
      title: "🚀 Welcome to AisleMarts",
      subtitle: "The World's First 0% Commission Marketplace",
      content: (
        <View style={styles.welcomeContent}>
          <View style={styles.revolutionCard}>
            <Text style={styles.revolutionTitle}>The CLP + PPL Revolution</Text>
            <Text style={styles.revolutionSubtitle}>Content Lead Purchase + Pay Per Lead = Your Success</Text>
            
            <View style={styles.comparisonGrid}>
              <View style={styles.oldWayCard}>
                <Text style={styles.oldWayTitle}>❌ Old Way (Amazon/Shopify)</Text>
                <Text style={styles.oldWayItem}>• 15-20% Commission Fees</Text>
                <Text style={styles.oldWayItem}>• Pay for Empty Clicks</Text>
                <Text style={styles.oldWayItem}>• No Lead Qualification</Text>
                <Text style={styles.oldWayItem}>• Waste 80% of Ad Spend</Text>
              </View>
              
              <View style={styles.newWayCard}>
                <Text style={styles.newWayTitle}>✅ AisleMarts Way</Text>
                <Text style={styles.newWayItem}>• 0% Commission Fees</Text>
                <Text style={styles.newWayItem}>• Pay Only for Real Buyers</Text>
                <Text style={styles.newWayItem}>• AI-Qualified Leads</Text>
                <Text style={styles.newWayItem}>• 100% ROI Guarantee</Text>
              </View>
            </View>
            
            <View style={styles.savingsCalculator}>
              <Text style={styles.savingsTitle}>💰 YOUR POTENTIAL SAVINGS</Text>
              <Text style={styles.savingsAmount}>$24,000/month</Text>
              <Text style={styles.savingsDetail}>Based on $10K monthly revenue</Text>
            </View>
          </View>
        </View>
      )
    },
    {
      id: 1,
      title: "💎 How CLP + PPL Works",
      subtitle: "Your Content = Direct Sales. Your Leads = Pure Profit.",
      content: (
        <View style={styles.clpPplContent}>
          <View style={styles.formulaCard}>
            <Text style={styles.formulaTitle}>⚡ THE AISLEMARTS FORMULA</Text>
            <View style={styles.formulaEquation}>
              <View style={styles.formulaPart}>
                <Text style={styles.formulaLabel}>CLP</Text>
                <Text style={styles.formulaDesc}>Content Lead Purchase</Text>
                <Text style={styles.formulaDetail}>Every post, video, review becomes a sales funnel</Text>
              </View>
              <Text style={styles.formulaPlus}>+</Text>
              <View style={styles.formulaPart}>
                <Text style={styles.formulaLabel}>PPL</Text>
                <Text style={styles.formulaDesc}>Pay Per Lead</Text>
                <Text style={styles.formulaDetail}>Only pay when qualified buyers engage</Text>
              </View>
              <Text style={styles.formulaEquals}>=</Text>
              <View style={styles.formulaPart}>
                <Text style={styles.formulaResult}>PROFIT</Text>
                <Text style={styles.formulaDetail}>Keep 100% of revenue</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.clpExamplesGrid}>
            <View style={styles.clpExample}>
              <Text style={styles.clpExampleIcon}>📱</Text>
              <Text style={styles.clpExampleTitle}>CLP Example</Text>
              <Text style={styles.clpExampleDesc}>Post phone review → 50 views → 5 purchases → You keep $2,500</Text>
            </View>
            
            <View style={styles.clpExample}>
              <Text style={styles.clpExampleIcon}>🎯</Text>
              <Text style={styles.clpExampleTitle}>PPL Example</Text>
              <Text style={styles.clpExampleDesc}>100 leads generated → 85 qualified by AI → Pay for only 15 real buyers</Text>
            </View>
          </View>
        </View>
      )
    },
    {
      id: 2,
      title: "📊 Your Business Profile",
      subtitle: "Let's calculate your potential AisleMarts earnings",
      content: (
        <View style={styles.businessProfileContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Business Name</Text>
            <TextInput
              style={styles.textInput}
              value={vendorData.businessName}
              onChangeText={(text) => setVendorData({...vendorData, businessName: text})}
              placeholder="Enter your business name"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Business Type</Text>
            <View style={styles.businessTypeGrid}>
              {['Retailer', 'Manufacturer', 'Wholesaler', 'Service Provider'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.businessTypeCard,
                    vendorData.businessType === type && styles.selectedBusinessType
                  ]}
                  onPress={() => setVendorData({...vendorData, businessType: type})}
                >
                  <Text style={[
                    styles.businessTypeText,
                    vendorData.businessType === type && styles.selectedBusinessTypeText
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Current Monthly Revenue</Text>
            <View style={styles.revenueGrid}>
              {['$1K-5K', '$5K-25K', '$25K-100K', '$100K+'].map((range) => (
                <TouchableOpacity
                  key={range}
                  style={[
                    styles.revenueCard,
                    vendorData.monthlyRevenue === range && styles.selectedRevenue
                  ]}
                  onPress={() => setVendorData({...vendorData, monthlyRevenue: range})}
                >
                  <Text style={[
                    styles.revenueText,
                    vendorData.monthlyRevenue === range && styles.selectedRevenueText
                  ]}>
                    {range}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {vendorData.monthlyRevenue && (
            <View style={styles.earningsProjection}>
              <Text style={styles.projectionTitle}>🎯 YOUR AISLEMARTS PROJECTION</Text>
              <Text style={styles.projectionRevenue}>Keep 100% of ${vendorData.monthlyRevenue.replace('$', '').replace('+', '')}</Text>
              <Text style={styles.projectionSavings}>Save up to $12,000/month in fees</Text>
              <Text style={styles.projectionGrowth}>Potential 300% growth with AI optimization</Text>
            </View>
          )}
        </View>
      )
    },
    {
      id: 3,
      title: "🎁 Claim Your Launch Bonus",
      subtitle: "100 Free Qualified Leads + CLP Dashboard Access",
      content: (
        <View style={styles.launchBonusContent}>
          <View style={styles.bonusCard}>
            <Text style={styles.bonusTitle}>🚀 LAUNCH BONUS PACKAGE</Text>
            <Text style={styles.bonusValue}>Worth $2,500</Text>
            
            <View style={styles.bonusItems}>
              <View style={styles.bonusItem}>
                <Text style={styles.bonusItemIcon}>🎯</Text>
                <View style={styles.bonusItemText}>
                  <Text style={styles.bonusItemTitle}>100 Free Qualified Leads</Text>
                  <Text style={styles.bonusItemDesc}>AI-verified buyers ready to purchase</Text>
                </View>
              </View>
              
              <View style={styles.bonusItem}>
                <Text style={styles.bonusItemIcon}>📊</Text>
                <View style={styles.bonusItemText}>
                  <Text style={styles.bonusItemTitle}>CLP Dashboard Access</Text>
                  <Text style={styles.bonusItemDesc}>Track content performance & conversions</Text>
                </View>
              </View>
              
              <View style={styles.bonusItem}>
                <Text style={styles.bonusItemIcon}>🤖</Text>
                <View style={styles.bonusItemText}>
                  <Text style={styles.bonusItemTitle}>Aisle AI Optimization</Text>
                  <Text style={styles.bonusItemDesc}>Personal AI agent for maximum ROI</Text>
                </View>
              </View>
              
              <View style={styles.bonusItem}>
                <Text style={styles.bonusItemIcon}>🌍</Text>
                <View style={styles.bonusItemText}>
                  <Text style={styles.bonusItemTitle}>Global Visibility</Text>
                  <Text style={styles.bonusItemDesc}>Reach 4M+ cities worldwide</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.urgencyBanner}>
              <Text style={styles.urgencyText}>⏰ LIMITED TIME: First 1,000 vendors only</Text>
            </View>
          </View>
        </View>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      router.push('/vendor-dashboard-clp');
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getButtonText = () => {
    switch (currentStep) {
      case 0: return "Discover CLP + PPL Magic";
      case 1: return "Set Up My Business Profile";
      case 2: return "Calculate My Earnings";
      case 3: return "🎁 CLAIM MY FREE LEADS";
      default: return "Continue";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#0C0F14', '#1a1a2e', '#16213e']}
        style={StyleSheet.absoluteFill}
      />

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View 
            style={[
              styles.progressFill,
              { width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentStep + 1} of {onboardingSteps.length}
        </Text>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{onboardingSteps[currentStep].title}</Text>
        <Text style={styles.headerSubtitle}>{onboardingSteps[currentStep].subtitle}</Text>
      </View>

      {/* Content */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {onboardingSteps[currentStep].content}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={prevStep}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.nextButton, currentStep === 0 ? styles.singleButton : null]}
          onPress={nextStep}
        >
          <LinearGradient
            colors={currentStep === 3 ? ['#D4AF37', '#FFD700'] : ['#007AFF', '#0056CC']}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>{getButtonText()}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0F14',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 2,
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  // Welcome Content Styles
  welcomeContent: {
    paddingBottom: 20,
  },
  revolutionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  revolutionTitle: {
    color: '#D4AF37',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  revolutionSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  comparisonGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  oldWayCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  newWayCard: {
    flex: 1,
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 0, 0.3)',
  },
  oldWayTitle: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  newWayTitle: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  oldWayItem: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginBottom: 6,
  },
  newWayItem: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginBottom: 6,
  },
  savingsCalculator: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  savingsTitle: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  savingsAmount: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  savingsDetail: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  
  // CLP + PPL Content Styles
  clpPplContent: {
    paddingBottom: 20,
  },
  formulaCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  formulaTitle: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  formulaEquation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  formulaPart: {
    flex: 1,
    alignItems: 'center',
  },
  formulaLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  formulaDesc: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  formulaDetail: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
  },
  formulaPlus: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginHorizontal: 8,
  },
  formulaEquals: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginHorizontal: 8,
  },
  formulaResult: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  clpExamplesGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  clpExample: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  clpExampleIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  clpExampleTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  clpExampleDesc: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  
  // Business Profile Styles
  businessProfileContent: {
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  businessTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  businessTypeCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedBusinessType: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderColor: '#D4AF37',
  },
  businessTypeText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedBusinessTypeText: {
    color: '#D4AF37',
    fontWeight: '600',
  },
  revenueGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  revenueCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedRevenue: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderColor: '#D4AF37',
  },
  revenueText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedRevenueText: {
    color: '#D4AF37',
    fontWeight: '600',
  },
  earningsProjection: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  projectionTitle: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  projectionRevenue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  projectionSavings: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  projectionGrowth: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  
  // Launch Bonus Styles
  launchBonusContent: {
    paddingBottom: 20,
  },
  bonusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  bonusTitle: {
    color: '#D4AF37',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  bonusValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  bonusItems: {
    marginBottom: 24,
  },
  bonusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  bonusItemIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  bonusItemText: {
    flex: 1,
  },
  bonusItemTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  bonusItemDesc: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  urgencyBanner: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  urgencyText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Navigation Styles
  navigation: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  singleButton: {
    flex: 1,
  },
  nextButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});