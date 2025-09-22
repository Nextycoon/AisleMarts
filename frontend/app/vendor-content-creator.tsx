import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

interface ContentTemplate {
  id: string;
  type: 'video' | 'post' | 'review' | 'live';
  title: string;
  description: string;
  estimatedCTR: number;
  estimatedRevenue: number;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  icon: string;
}

interface AIOptimization {
  title: string;
  suggestion: string;
  impact: 'High' | 'Medium' | 'Low';
  category: 'SEO' | 'Engagement' | 'Conversion' | 'Timing';
}

export default function VendorContentCreatorScreen() {
  const router = useRouter();
  const [selectedContentType, setSelectedContentType] = useState<string>('video');
  const [contentTitle, setContentTitle] = useState('');
  const [contentDescription, setContentDescription] = useState('');
  const [showAIModal, setShowAIModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const contentTemplates: ContentTemplate[] = [
    {
      id: '1',
      type: 'video',
      title: 'Product Unboxing & First Look',
      description: 'Professional unboxing with detailed product walkthrough',
      estimatedCTR: 4.2,
      estimatedRevenue: 1250,
      difficulty: 'Easy',
      icon: '📦',
    },
    {
      id: '2',
      type: 'video',
      title: 'Before/After Transformation',
      description: 'Show dramatic improvements with your product',
      estimatedCTR: 6.8,
      estimatedRevenue: 2100,
      difficulty: 'Medium',
      icon: '✨',
    },
    {
      id: '3',
      type: 'live',
      title: 'Live Shopping Session',
      description: 'Interactive live stream with real-time purchases',
      estimatedCTR: 8.5,
      estimatedRevenue: 3400,
      difficulty: 'Advanced',
      icon: '🔴',
    },
    {
      id: '4',
      type: 'post',
      title: 'Problem-Solution Story',
      description: 'Relatable problem with your product as the solution',
      estimatedCTR: 3.9,
      estimatedRevenue: 980,
      difficulty: 'Easy',
      icon: '💡',
    },
    {
      id: '5',
      type: 'review',
      title: 'Honest Product Review',
      description: 'Authentic review highlighting pros and cons',
      estimatedCTR: 5.2,
      estimatedRevenue: 1680,
      difficulty: 'Medium',
      icon: '⭐',
    },
  ];

  const aiOptimizations: AIOptimization[] = [
    {
      title: 'Optimal Posting Time',
      suggestion: 'Post at 7:30 PM for 34% higher engagement',
      impact: 'High',
      category: 'Timing',
    },
    {
      title: 'Trending Keywords',
      suggestion: 'Include "game-changer" and "must-have" in title',
      impact: 'High',
      category: 'SEO',
    },
    {
      title: 'Call-to-Action',
      suggestion: 'Use "Tap to shop now" instead of "Buy here"',
      impact: 'Medium',
      category: 'Conversion',
    },
    {
      title: 'Visual Hook',
      suggestion: 'Start with product in action within first 3 seconds',
      impact: 'High',
      category: 'Engagement',
    },
  ];

  const contentTypes = [
    { id: 'video', name: 'Video', icon: '📹', color: '#FF6B6B' },
    { id: 'post', name: 'Post', icon: '📝', color: '#4ECDC4' },
    { id: 'review', name: 'Review', icon: '⭐', color: '#FFE66D' },
    { id: 'live', name: 'Live', icon: '🔴', color: '#FF8E53' },
  ];

  const showAIAssistant = () => {
    setShowAIModal(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideAIAssistant = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowAIModal(false);
    });
  };

  const generateAIContent = () => {
    const aiTitles = [
      "🔥 This Changed Everything! Here's Why You Need It",
      "💯 Honest Review: Is This Worth Your Money?",
      "⚡ Game-Changer Alert: Before vs After Results",
      "🎯 Why Everyone's Talking About This Product",
      "✨ The Secret That Saved Me $500+ This Year",
    ];
    
    const aiDescriptions = [
      "Discover the revolutionary product that's transforming lives worldwide. See real results and find out why thousands are making the switch today.",
      "After testing this for 30 days, here's my brutally honest take. Plus, exclusive discount inside!",
      "The results speak for themselves. Watch this transformation and see why this product is flying off the shelves.",
    ];

    setContentTitle(aiTitles[Math.floor(Math.random() * aiTitles.length)]);
    setContentDescription(aiDescriptions[Math.floor(Math.random() * aiDescriptions.length)]);
    hideAIAssistant();
  };

  const applyTemplate = (template: ContentTemplate) => {
    setContentTitle(template.title);
    setContentDescription(template.description);
    setSelectedContentType(template.type);
    setShowTemplatesModal(false);
  };

  const getContentTypeColor = (type: string) => {
    const contentType = contentTypes.find(ct => ct.id === type);
    return contentType?.color || '#FFFFFF';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return '#4ECDC4';
      case 'Medium': return '#FFE66D';
      case 'Low': return '#A8A8A8';
      default: return '#FFFFFF';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
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
          <Text style={styles.headerTitle}>CLP Content Creator</Text>
          <Text style={styles.headerSubtitle}>AI-Optimized Content for Maximum Conversions</Text>
        </View>
        <TouchableOpacity 
          style={styles.aiButton}
          onPress={showAIAssistant}
        >
          <Text style={styles.aiButtonText}>🤖</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Content Type Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Content Type</Text>
          <View style={styles.contentTypeGrid}>
            {contentTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.contentTypeCard,
                  selectedContentType === type.id && styles.selectedContentType,
                  { borderColor: selectedContentType === type.id ? type.color : 'rgba(255, 255, 255, 0.2)' }
                ]}
                onPress={() => setSelectedContentType(type.id)}
              >
                <Text style={styles.contentTypeIcon}>{type.icon}</Text>
                <Text style={[
                  styles.contentTypeName,
                  { color: selectedContentType === type.id ? type.color : 'rgba(255, 255, 255, 0.8)' }
                ]}>
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Content Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Content Details</Text>
            <TouchableOpacity 
              style={styles.templatesButton}
              onPress={() => setShowTemplatesModal(true)}
            >
              <Text style={styles.templatesButtonText}>📋 Templates</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={styles.textInput}
              value={contentTitle}
              onChangeText={setContentTitle}
              placeholder="Enter compelling title..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={contentDescription}
              onChangeText={setContentDescription}
              placeholder="Describe your content..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {/* AI Optimizations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🤖 AI Optimizations</Text>
            <Text style={styles.sectionSubtitle}>Personalized suggestions for your content</Text>
          </View>

          <View style={styles.optimizationsList}>
            {aiOptimizations.map((optimization, index) => (
              <View key={index} style={styles.optimizationCard}>
                <View style={styles.optimizationHeader}>
                  <Text style={styles.optimizationTitle}>{optimization.title}</Text>
                  <View style={[
                    styles.impactBadge,
                    { backgroundColor: getImpactColor(optimization.impact) + '20' }
                  ]}>
                    <Text style={[
                      styles.impactText,
                      { color: getImpactColor(optimization.impact) }
                    ]}>
                      {optimization.impact}
                    </Text>
                  </View>
                </View>
                <Text style={styles.optimizationSuggestion}>{optimization.suggestion}</Text>
                <Text style={styles.optimizationCategory}>{optimization.category}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CLP Prediction */}
        {contentTitle && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 CLP Performance Prediction</Text>
            <View style={styles.predictionCard}>
              <LinearGradient
                colors={['rgba(212, 175, 55, 0.2)', 'rgba(212, 175, 55, 0.1)']}
                style={styles.predictionGradient}
              >
                <View style={styles.predictionGrid}>
                  <View style={styles.predictionItem}>
                    <Text style={styles.predictionValue}>3.8%</Text>
                    <Text style={styles.predictionLabel}>Predicted CTR</Text>
                  </View>
                  <View style={styles.predictionItem}>
                    <Text style={styles.predictionValue}>$1,240</Text>
                    <Text style={styles.predictionLabel}>Est. Revenue</Text>
                  </View>
                  <View style={styles.predictionItem}>
                    <Text style={styles.predictionValue}>89</Text>
                    <Text style={styles.predictionLabel}>Expected Sales</Text>
                  </View>
                </View>
                <Text style={styles.predictionNote}>
                  Based on similar content performance and AI analysis
                </Text>
              </LinearGradient>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.previewButton}>
            <Text style={styles.previewButtonText}>👁️ Preview</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.publishButton}>
            <LinearGradient
              colors={['#4ECDC4', '#44A08D']}
              style={styles.publishButtonGradient}
            >
              <Text style={styles.publishButtonText}>🚀 Publish Content</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* AI Assistant Modal */}
      <Modal
        visible={showAIModal}
        transparent
        animationType="none"
        onRequestClose={hideAIAssistant}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.aiModal, { opacity: fadeAnim }]}>
            <LinearGradient
              colors={['rgba(78, 205, 196, 0.1)', 'rgba(78, 205, 196, 0.05)']}
              style={styles.aiModalGradient}
            >
              <Text style={styles.aiModalTitle}>🤖 Aisle AI Assistant</Text>
              <Text style={styles.aiModalSubtitle}>
                Let me help you create high-converting content
              </Text>
              
              <View style={styles.aiFeatures}>
                <View style={styles.aiFeature}>
                  <Text style={styles.aiFeatureIcon}>📝</Text>
                  <Text style={styles.aiFeatureText}>Generate compelling titles</Text>
                </View>
                <View style={styles.aiFeature}>
                  <Text style={styles.aiFeatureIcon}>📊</Text>
                  <Text style={styles.aiFeatureText}>Predict performance metrics</Text>
                </View>
                <View style={styles.aiFeature}>
                  <Text style={styles.aiFeatureIcon}>🎯</Text>
                  <Text style={styles.aiFeatureText}>Optimize for conversions</Text>
                </View>
              </View>
              
              <View style={styles.aiModalButtons}>
                <TouchableOpacity 
                  style={styles.aiActionButton}
                  onPress={generateAIContent}
                >
                  <Text style={styles.aiActionButtonText}>✨ Generate Content</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.aiCloseButton}
                  onPress={hideAIAssistant}
                >
                  <Text style={styles.aiCloseButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>

      {/* Templates Modal */}
      <Modal
        visible={showTemplatesModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTemplatesModal(false)}
      >
        <SafeAreaView style={styles.templatesModal}>
          <LinearGradient
            colors={['#0C0F14', '#1a1a2e', '#16213e']}
            style={StyleSheet.absoluteFill}
          />
          
          <View style={styles.templatesHeader}>
            <Text style={styles.templatesTitle}>Content Templates</Text>
            <TouchableOpacity onPress={() => setShowTemplatesModal(false)}>
              <Text style={styles.templatesCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.templatesContent}>
            {contentTemplates.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={styles.templateCard}
                onPress={() => applyTemplate(template)}
              >
                <View style={styles.templateHeader}>
                  <Text style={styles.templateIcon}>{template.icon}</Text>
                  <View style={styles.templateInfo}>
                    <Text style={styles.templateTitle}>{template.title}</Text>
                    <Text style={styles.templateType}>{template.type.toUpperCase()}</Text>
                  </View>
                  <View style={styles.templateDifficulty}>
                    <Text style={styles.templateDifficultyText}>{template.difficulty}</Text>
                  </View>
                </View>
                
                <Text style={styles.templateDescription}>{template.description}</Text>
                
                <View style={styles.templateMetrics}>
                  <View style={styles.templateMetric}>
                    <Text style={styles.templateMetricValue}>{template.estimatedCTR}%</Text>
                    <Text style={styles.templateMetricLabel}>Est. CTR</Text>
                  </View>
                  <View style={styles.templateMetric}>
                    <Text style={styles.templateMetricValue}>${template.estimatedRevenue}</Text>
                    <Text style={styles.templateMetricLabel}>Est. Revenue</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  headerContent: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  aiButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiButtonText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  sectionSubtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  templatesButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  templatesButtonText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '500',
  },
  contentTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  contentTypeCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  selectedContentType: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  contentTypeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  contentTypeName: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  optimizationsList: {
    gap: 12,
  },
  optimizationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  optimizationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optimizationTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  impactBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  impactText: {
    fontSize: 10,
    fontWeight: '600',
  },
  optimizationSuggestion: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  optimizationCategory: {
    color: '#D4AF37',
    fontSize: 10,
    fontWeight: '500',
  },
  predictionCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  predictionGradient: {
    padding: 20,
  },
  predictionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  predictionItem: {
    alignItems: 'center',
  },
  predictionValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  predictionLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  predictionNote: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 20,
  },
  previewButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  previewButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
  publishButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  publishButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  publishButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiModal: {
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    maxWidth: width - 40,
  },
  aiModalGradient: {
    padding: 24,
  },
  aiModalTitle: {
    color: '#4ECDC4',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  aiModalSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  aiFeatures: {
    marginBottom: 24,
  },
  aiFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiFeatureIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  aiFeatureText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  aiModalButtons: {
    gap: 12,
  },
  aiActionButton: {
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  aiActionButtonText: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: '600',
  },
  aiCloseButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  aiCloseButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
  templatesModal: {
    flex: 1,
    backgroundColor: '#0C0F14',
  },
  templatesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  templatesTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  templatesCloseText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  templatesContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  templateCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  templateIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  templateInfo: {
    flex: 1,
  },
  templateTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  templateType: {
    color: '#D4AF37',
    fontSize: 10,
    fontWeight: '500',
  },
  templateDifficulty: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  templateDifficultyText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontWeight: '500',
  },
  templateDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  templateMetrics: {
    flexDirection: 'row',
    gap: 24,
  },
  templateMetric: {
    alignItems: 'center',
  },
  templateMetricValue: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  templateMetricLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
  },
});