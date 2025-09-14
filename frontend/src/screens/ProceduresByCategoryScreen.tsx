import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  proceduresByCategoryService, 
  OnboardingProgress, 
  VerificationBadge 
} from '../services/ProceduresByCategoryService';

const ProceduresByCategoryScreen: React.FC = () => {
  const [onboardingProgress, setOnboardingProgress] = useState<OnboardingProgress | null>(null);
  const [userBadge, setUserBadge] = useState<VerificationBadge | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showGuidanceModal, setShowGuidanceModal] = useState(false);
  const [aiGuidance, setAiGuidance] = useState<string>('');
  const [showRoleSelectionModal, setShowRoleSelectionModal] = useState(false);
  const [serviceHealth, setServiceHealth] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load service health
      const healthResult = await proceduresByCategoryService.getHealthCheck();
      if (healthResult.success) {
        setServiceHealth(healthResult.data);
      }

      // Try to load existing procedure
      const progressResult = await proceduresByCategoryService.getOnboardingProgress();
      if (progressResult.success) {
        setOnboardingProgress(progressResult.data);
        
        // Load user badge
        const badgeResult = await proceduresByCategoryService.getUserBadge();
        if (badgeResult.success) {
          setUserBadge(badgeResult.data);
        }

        // Load permissions
        const permissionsResult = await proceduresByCategoryService.getUserPermissions();
        if (permissionsResult.success) {
          setPermissions(permissionsResult.data.permissions || []);
        }
      } else {
        // No procedure exists, show role selection
        setShowRoleSelectionModal(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCreateProcedure = async (role: 'seller_brand' | 'buyer') => {
    try {
      const result = await proceduresByCategoryService.createUserProcedure(role);
      if (result.success) {
        setShowRoleSelectionModal(false);
        loadData();
        Alert.alert('Success', `${role === 'seller_brand' ? 'Brand' : 'Buyer'} procedure created successfully`);
      } else {
        Alert.alert('Error', result.error || 'Failed to create procedure');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create procedure');
    }
  };

  const handleCompleteStep = async (stepName: string) => {
    if (!onboardingProgress) return;

    try {
      // This would typically open a form to collect step data
      // For demo purposes, we'll just mark it as completed
      const result = await proceduresByCategoryService.completeOnboardingStep({
        step: stepName,
        step_data: {
          completed: true,
          completion_date: new Date().toISOString()
        }
      });

      if (result.success) {
        Alert.alert('Success', 'Step completed successfully');
        loadData();
      } else {
        Alert.alert('Error', result.error || 'Failed to complete step');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to complete step');
    }
  };

  const handleGetGuidance = async () => {
    try {
      const result = await proceduresByCategoryService.generateOnboardingGuidance({
        current_progress: onboardingProgress?.progress,
        user_category: onboardingProgress?.category
      });

      if (result.success) {
        setAiGuidance(result.data.guidance);
        setShowGuidanceModal(true);
      } else {
        Alert.alert('Error', result.error || 'Failed to generate guidance');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate AI guidance');
    }
  };

  const handleRequestReverification = async () => {
    Alert.alert(
      'Request Reverification',
      'Are you sure you want to request reverification? This will reset your verification status.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const result = await proceduresByCategoryService.requestReverification();
              if (result.success) {
                Alert.alert('Success', 'Reverification requested successfully');
                loadData();
              } else {
                Alert.alert('Error', result.error || 'Failed to request reverification');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to request reverification');
            }
          }
        }
      ]
    );
  };

  const renderServiceHealth = () => (
    <View style={styles.healthCard}>
      <View style={styles.healthHeader}>
        <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
        <Text style={styles.healthTitle}>Service Status</Text>
      </View>
      {serviceHealth && (
        <View style={styles.healthStats}>
          <Text style={styles.healthStat}>
            👥 {serviceHealth.user_categories} Categories
          </Text>
          <Text style={styles.healthStat}>
            📋 {serviceHealth.onboarding_steps} Steps
          </Text>
          <Text style={styles.healthStat}>
            🔑 {serviceHealth.permissions} Permissions
          </Text>
        </View>
      )}
    </View>
  );

  const renderProgressCard = () => {
    if (!onboardingProgress) return null;

    const progressPercentage = onboardingProgress.progress.percentage;
    const progressColor = proceduresByCategoryService.getProgressColor(progressPercentage);

    return (
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <View>
            <Text style={styles.progressTitle}>Onboarding Progress</Text>
            <Text style={styles.progressSubtitle}>
              {proceduresByCategoryService.getRoleDisplayName(onboardingProgress.category)}
            </Text>
          </View>
          {userBadge && userBadge.verified && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeIcon}>
                {proceduresByCategoryService.getBadgeIcon(userBadge.badge)}
              </Text>
              <Text style={styles.badgeText}>Verified</Text>
            </View>
          )}
        </View>

        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPercentage}%`,
                  backgroundColor: progressColor
                }
              ]}
            />
          </View>
          <Text style={styles.progressText}>{progressPercentage.toFixed(1)}%</Text>
        </View>

        <View style={styles.progressStats}>
          <View style={styles.progressStat}>
            <Text style={styles.statNumber}>{onboardingProgress.progress.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.progressStat}>
            <Text style={styles.statNumber}>{onboardingProgress.progress.total - onboardingProgress.progress.completed}</Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </View>
          <View style={styles.progressStat}>
            <Text style={styles.statNumber}>{permissions.length}</Text>
            <Text style={styles.statLabel}>Permissions</Text>
          </View>
        </View>

        {onboardingProgress.current_step && (
          <View style={styles.nextStepContainer}>
            <Text style={styles.nextStepTitle}>Next Step:</Text>
            <Text style={styles.nextStepText}>
              {proceduresByCategoryService.getStepDisplayName(onboardingProgress.current_step)}
            </Text>
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => handleCompleteStep(onboardingProgress.current_step!)}
            >
              <Text style={styles.completeButtonText}>Complete Step</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.progressActions}>
          <TouchableOpacity style={styles.guidanceButton} onPress={handleGetGuidance}>
            <Ionicons name="lightbulb-outline" size={16} color="#3B82F6" />
            <Text style={styles.guidanceButtonText}>Get AI Guidance</Text>
          </TouchableOpacity>
          
          {onboardingProgress.onboarding_complete && (
            <TouchableOpacity style={styles.reverifyButton} onPress={handleRequestReverification}>
              <Ionicons name="refresh-outline" size={16} color="#F59E0B" />
              <Text style={styles.reverifyButtonText}>Reverify</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderStepsList = () => {
    if (!onboardingProgress || onboardingProgress.progress.remaining_steps.length === 0) {
      return null;
    }

    return (
      <View style={styles.stepsCard}>
        <Text style={styles.stepsTitle}>Remaining Steps</Text>
        {onboardingProgress.progress.remaining_steps.map((step, index) => (
          <View key={index} style={styles.stepItem}>
            <View style={styles.stepIcon}>
              <Text style={styles.stepNumber}>{index + 1}</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepName}>
                {proceduresByCategoryService.getStepDisplayName(step)}
              </Text>
              <Text style={styles.stepGuidance}>
                {proceduresByCategoryService.getNextStepGuidance(step, onboardingProgress.category)}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.stepButton,
                step === onboardingProgress.current_step && styles.stepButtonActive
              ]}
              onPress={() => handleCompleteStep(step)}
              disabled={step !== onboardingProgress.current_step}
            >
              <Text style={[
                styles.stepButtonText,
                step === onboardingProgress.current_step && styles.stepButtonActiveText
              ]}>
                {step === onboardingProgress.current_step ? 'Start' : 'Locked'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  const renderPermissions = () => {
    if (permissions.length === 0) return null;

    return (
      <View style={styles.permissionsCard}>
        <Text style={styles.permissionsTitle}>Your Permissions</Text>
        <View style={styles.permissionsList}>
          {permissions.map((permission, index) => (
            <View key={index} style={styles.permissionItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.permissionText}>
                {proceduresByCategoryService.getPermissionDisplayName(permission)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderRoleSelectionModal = () => (
    <Modal
      visible={showRoleSelectionModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Select Your Role</Text>
          <Text style={styles.modalSubtitle}>
            Choose your role to start the onboarding process
          </Text>
        </View>

        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.roleOption}
            onPress={() => handleCreateProcedure('seller_brand')}
          >
            <View style={styles.roleIcon}>
              <Ionicons name="business-outline" size={24} color="#3B82F6" />
            </View>
            <View style={styles.roleContent}>
              <Text style={styles.roleTitle}>Company / Brand</Text>
              <Text style={styles.roleDescription}>
                I represent a company or brand selling products
              </Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>🔵 Blue Verified Badge</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.roleOption}
            onPress={() => handleCreateProcedure('buyer')}
          >
            <View style={styles.roleIcon}>
              <Ionicons name="person-outline" size={24} color="#10B981" />
            </View>
            <View style={styles.roleContent}>
              <Text style={styles.roleTitle}>Buyer / Visitor</Text>
              <Text style={styles.roleDescription}>
                I'm here to buy products and browse the marketplace
              </Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>🟢 Green Verified Badge</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderGuidanceModal = () => (
    <Modal
      visible={showGuidanceModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowGuidanceModal(false)}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>AI Guidance</Text>
          <View />
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.guidanceContainer}>
            <View style={styles.guidanceHeader}>
              <Ionicons name="lightbulb" size={24} color="#8B5CF6" />
              <Text style={styles.guidanceTitle}>Personalized Guidance</Text>
            </View>
            <Text style={styles.guidanceText}>{aiGuidance}</Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading your procedure...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Procedures by Category</Text>
        <Text style={styles.headerSubtitle}>Role-specific Onboarding Workflows</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {renderServiceHealth()}
        {renderProgressCard()}
        {renderStepsList()}
        {renderPermissions()}
      </ScrollView>

      {renderRoleSelectionModal()}
      {renderGuidanceModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280'
  },
  content: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280'
  },
  healthCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  healthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8
  },
  healthStats: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  healthStat: {
    fontSize: 12,
    color: '#6B7280'
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2
  },
  progressSubtitle: {
    fontSize: 14,
    color: '#6B7280'
  },
  badgeContainer: {
    alignItems: 'center'
  },
  badgeIcon: {
    fontSize: 24,
    marginBottom: 4
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#10B981'
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginRight: 12
  },
  progressFill: {
    height: '100%',
    borderRadius: 4
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    minWidth: 40
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16
  },
  progressStat: {
    alignItems: 'center'
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280'
  },
  nextStepContainer: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16
  },
  nextStepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4
  },
  nextStepText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12
  },
  completeButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start'
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500'
  },
  progressActions: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  guidanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6
  },
  guidanceButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4
  },
  reverifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6
  },
  reverifyButtonText: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4
  },
  stepsCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  stepIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280'
  },
  stepContent: {
    flex: 1,
    marginRight: 12
  },
  stepName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2
  },
  stepGuidance: {
    fontSize: 12,
    color: '#6B7280'
  },
  stepButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  stepButtonActive: {
    backgroundColor: '#3B82F6'
  },
  stepButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280'
  },
  stepButtonActiveText: {
    color: '#FFFFFF'
  },
  permissionsCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  permissionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16
  },
  permissionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8
  },
  permissionText: {
    fontSize: 12,
    color: '#059669',
    marginLeft: 4
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  modalHeader: {
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center'
  },
  modalContent: {
    flex: 1,
    padding: 16
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  roleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  roleContent: {
    flex: 1
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4
  },
  roleDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8
  },
  roleBadge: {
    alignSelf: 'flex-start'
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280'
  },
  guidanceContainer: {
    padding: 16
  },
  guidanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  guidanceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8
  },
  guidanceText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151'
  }
});

export default ProceduresByCategoryScreen;