import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

interface Permission {
  id: string;
  title: string;
  description: string;
  icon: string;
  required: boolean;
  enabled: boolean;
}

export default function FamilyPairingScreen() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'parent' | 'teen' | null>(null);
  const [currentStep, setCurrentStep] = useState<'role' | 'permissions' | 'confirmation'>('role');
  const [scaleAnim] = useState(new Animated.Value(1));

  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: 'purchase_approval',
      title: 'Purchase Approval',
      description: 'Require parent approval for purchases over $25',
      icon: '💳',
      required: true,
      enabled: true,
    },
    {
      id: 'budget_monitoring',
      title: 'Budget Monitoring',
      description: 'Monitor spending and set daily/weekly limits',
      icon: '📊',
      required: true,
      enabled: true,
    },
    {
      id: 'safety_filtering',
      title: 'Safety Filtering',
      description: 'Filter age-inappropriate products and content',
      icon: '🛡️',
      required: true,
      enabled: true,
    },
    {
      id: 'screen_time',
      title: 'Screen Time Limits',
      description: 'Set healthy screen time boundaries',
      icon: '⏱️',
      required: false,
      enabled: true,
    },
    {
      id: 'location_sharing',
      title: 'Location Sharing',
      description: 'Share location for delivery and safety',
      icon: '📍',
      required: false,
      enabled: false,
    },
    {
      id: 'activity_reports',
      title: 'Activity Reports',
      description: 'Weekly summaries of shopping activity',
      icon: '📈',
      required: false,
      enabled: true,
    },
  ]);

  const handleRoleSelection = (role: 'parent' | 'teen') => {
    setSelectedRole(role);
    
    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      setCurrentStep('permissions');
    }, 200);
  };

  const togglePermission = (id: string) => {
    setPermissions(prev =>
      prev.map(permission =>
        permission.id === id && !permission.required
          ? { ...permission, enabled: !permission.enabled }
          : permission
      )
    );
  };

  const handleContinue = () => {
    const requiredPermissions = permissions.filter(p => p.required);
    const allRequiredEnabled = requiredPermissions.every(p => p.enabled);

    if (!allRequiredEnabled) {
      Alert.alert(
        'Required Permissions',
        'Some required permissions are needed for family safety. Please enable all required permissions.',
        [{ text: 'OK' }]
      );
      return;
    }

    setCurrentStep('confirmation');
  };

  const handleComplete = () => {
    Alert.alert(
      'Family Pairing Setup',
      `Great! You're set up as a ${selectedRole}. ${
        selectedRole === 'parent'
          ? 'You can now invite family members and manage their settings.'
          : 'Ask your parent to send you a family invitation link.'
      }`,
      [
        {
          text: 'Continue',
          onPress: () => {
            if (selectedRole === 'parent') {
              router.push('/family/invite');
            } else {
              router.push('/family/join');
            }
          },
        },
      ]
    );
  };

  const renderRoleSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Who's setting up this account?</Text>
      <Text style={styles.stepDescription}>
        This helps us customize the experience and safety features for your family.
      </Text>

      <View style={styles.roleButtons}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={styles.roleButton}
            onPress={() => handleRoleSelection('parent')}
          >
            <Text style={styles.roleIcon}>👨‍👩‍👧‍👦</Text>
            <Text style={styles.roleTitle}>I'm a Parent</Text>
            <Text style={styles.roleDescription}>
              Setting up family shopping with safety controls
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={styles.roleButton}
            onPress={() => handleRoleSelection('teen')}
          >
            <Text style={styles.roleIcon}>🧑‍🎓</Text>
            <Text style={styles.roleTitle}>I'm a Teen</Text>
            <Text style={styles.roleDescription}>
              Joining my family's safe shopping experience
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <View style={styles.trustIndicators}>
        <View style={styles.trustItem}>
          <Text style={styles.trustIcon}>🔒</Text>
          <Text style={styles.trustText}>Your data is private and secure</Text>
        </View>
        <View style={styles.trustItem}>
          <Text style={styles.trustIcon}>👪</Text>
          <Text style={styles.trustText}>Built for healthy family relationships</Text>
        </View>
      </View>
    </View>
  );

  const renderPermissions = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>
        {selectedRole === 'parent' ? 'Family Safety Settings' : 'Permission Settings'}
      </Text>
      <Text style={styles.stepDescription}>
        {selectedRole === 'parent'
          ? 'These settings help keep your family safe while shopping online.'
          : 'These permissions help your parents keep you safe while giving you independence.'}
      </Text>

      <View style={styles.permissionsList}>
        {permissions.map((permission) => (
          <View key={permission.id} style={styles.permissionItem}>
            <View style={styles.permissionContent}>
              <Text style={styles.permissionIcon}>{permission.icon}</Text>
              <View style={styles.permissionText}>
                <View style={styles.permissionHeader}>
                  <Text style={styles.permissionTitle}>{permission.title}</Text>
                  {permission.required && (
                    <View style={styles.requiredBadge}>
                      <Text style={styles.requiredText}>Required</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.permissionDescription}>{permission.description}</Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={[
                styles.toggle,
                permission.enabled && styles.toggleEnabled,
                permission.required && styles.toggleRequired,
              ]}
              onPress={() => togglePermission(permission.id)}
              disabled={permission.required}
            >
              <View
                style={[
                  styles.toggleThumb,
                  permission.enabled && styles.toggleThumbEnabled,
                ]}
              />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.permissionNote}>
        <Text style={styles.noteIcon}>💡</Text>
        <Text style={styles.noteText}>
          {selectedRole === 'parent'
            ? 'You can adjust these settings anytime in Family Settings.'
            : 'Your parents can adjust these settings to give you more independence over time.'}
        </Text>
      </View>

      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );

  const renderConfirmation = () => (
    <View style={styles.stepContainer}>
      <View style={styles.confirmationHeader}>
        <Text style={styles.confirmationIcon}>✨</Text>
        <Text style={styles.stepTitle}>All Set!</Text>
        <Text style={styles.stepDescription}>
          Your family safety settings are configured. 
          {selectedRole === 'parent'
            ? ' You can now invite family members to join.'
            : ' Ask your parent to send you an invitation link.'}
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Your Settings Summary</Text>
        {permissions
          .filter(p => p.enabled)
          .map((permission) => (
            <View key={permission.id} style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>{permission.icon}</Text>
              <Text style={styles.summaryText}>{permission.title}</Text>
              <Text style={styles.summaryCheck}>✓</Text>
            </View>
          ))}
      </View>

      <View style={styles.nextSteps}>
        <Text style={styles.nextStepsTitle}>What's Next?</Text>
        {selectedRole === 'parent' ? (
          <View>
            <View style={styles.nextStepItem}>
              <Text style={styles.nextStepNumber}>1</Text>
              <Text style={styles.nextStepText}>Invite your family members</Text>
            </View>
            <View style={styles.nextStepItem}>
              <Text style={styles.nextStepNumber}>2</Text>
              <Text style={styles.nextStepText}>Set up budgets and spending limits</Text>
            </View>
            <View style={styles.nextStepItem}>
              <Text style={styles.nextStepNumber}>3</Text>
              <Text style={styles.nextStepText}>Start shopping safely together</Text>
            </View>
          </View>
        ) : (
          <View>
            <View style={styles.nextStepItem}>
              <Text style={styles.nextStepNumber}>1</Text>
              <Text style={styles.nextStepText}>Wait for your parent's invitation</Text>
            </View>
            <View style={styles.nextStepItem}>
              <Text style={styles.nextStepNumber}>2</Text>
              <Text style={styles.nextStepText}>Learn about smart shopping habits</Text>
            </View>
            <View style={styles.nextStepItem}>
              <Text style={styles.nextStepNumber}>3</Text>
              <Text style={styles.nextStepText}>Start your safe shopping journey</Text>
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
        <Text style={styles.completeButtonText}>
          {selectedRole === 'parent' ? 'Invite Family' : 'Continue'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#F5F7FA" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Family Safety Setup</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width:
                  currentStep === 'role'
                    ? '33%'
                    : currentStep === 'permissions'
                    ? '66%'
                    : '100%',
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          Step {currentStep === 'role' ? '1' : currentStep === 'permissions' ? '2' : '3'} of 3
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentStep === 'role' && renderRoleSelection()}
        {currentStep === 'permissions' && renderPermissions()}
        {currentStep === 'confirmation' && renderConfirmation()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E6F3FF',
  },
  backButton: {
    fontSize: 32,
    color: '#0066CC',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  placeholder: {
    width: 32,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E6F3FF',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E6F3FF',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0066CC',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#8E95A3',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 12,
  },
  stepDescription: {
    fontSize: 16,
    color: '#8E95A3',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  roleButtons: {
    gap: 16,
    marginBottom: 32,
  },
  roleButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6F3FF',
    elevation: 2,
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  roleIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 14,
    color: '#8E95A3',
    textAlign: 'center',
    lineHeight: 20,
  },
  trustIndicators: {
    gap: 12,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  trustText: {
    fontSize: 14,
    color: '#8E95A3',
  },
  permissionsList: {
    gap: 16,
    marginBottom: 24,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E6F3FF',
  },
  permissionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  permissionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  permissionText: {
    flex: 1,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginRight: 8,
  },
  requiredBadge: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  requiredText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  permissionDescription: {
    fontSize: 14,
    color: '#8E95A3',
    lineHeight: 20,
  },
  toggle: {
    width: 44,
    height: 24,
    backgroundColor: '#E6F3FF',
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleEnabled: {
    backgroundColor: '#0066CC',
  },
  toggleRequired: {
    backgroundColor: '#4A90E2',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  toggleThumbEnabled: {
    alignSelf: 'flex-end',
  },
  permissionNote: {
    flexDirection: 'row',
    backgroundColor: '#E6F3FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  noteIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: '#0066CC',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  confirmationHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  confirmationIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E6F3FF',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  summaryText: {
    flex: 1,
    fontSize: 14,
    color: '#2C3E50',
  },
  summaryCheck: {
    fontSize: 16,
    color: '#0066CC',
    fontWeight: 'bold',
  },
  nextSteps: {
    backgroundColor: '#E6F3FF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  nextStepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  nextStepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  nextStepNumber: {
    width: 24,
    height: 24,
    backgroundColor: '#0066CC',
    borderRadius: 12,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
  },
  nextStepText: {
    flex: 1,
    fontSize: 14,
    color: '#2C3E50',
  },
  completeButton: {
    backgroundColor: '#0066CC',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});