import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Dimensions,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface InviteMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  action: () => void;
}

export default function FamilyPairingScreen() {
  const router = useRouter();
  const [step, setStep] = useState<'welcome' | 'create' | 'join' | 'invite' | 'success'>('welcome');
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [userName, setUserName] = useState('');
  const [userAge, setUserAge] = useState('');

  const handleCreateFamily = () => {
    if (!familyName.trim()) {
      Alert.alert('Error', 'Please enter a family name');
      return;
    }
    // In real app, call API to create family
    setStep('invite');
  };

  const handleJoinFamily = () => {
    if (!inviteCode.trim() || !userName.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    // In real app, call API to join family
    setStep('success');
  };

  const inviteMethods: InviteMethod[] = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: '💬',
      description: 'Share via WhatsApp',
      action: () => Alert.alert('WhatsApp', 'WhatsApp sharing would open here'),
    },
    {
      id: 'sms',
      name: 'SMS',
      icon: '📱',
      description: 'Send text message',
      action: () => Alert.alert('SMS', 'SMS sharing would open here'),
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: '✈️',
      description: 'Share via Telegram',
      action: () => Alert.alert('Telegram', 'Telegram sharing would open here'),
    },
    {
      id: 'email',
      name: 'Email',
      icon: '📧',
      description: 'Send email invitation',
      action: () => Alert.alert('Email', 'Email sharing would open here'),
    },
    {
      id: 'copy',
      name: 'Copy Link',
      icon: '📋',
      description: 'Copy invitation link',
      action: () => Alert.alert('Copied', 'Invitation link copied to clipboard'),
    },
    {
      id: 'qr',
      name: 'QR Code',
      icon: '📱',
      description: 'Show QR code',
      action: () => Alert.alert('QR Code', 'QR code display would open here'),
    },
  ];

  const renderWelcome = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.welcomeContainer}>
        <Text style={styles.familyIcon}>👨‍👩‍👧‍👦</Text>
        <Text style={styles.welcomeTitle}>BlueWave Family Safety</Text>
        <Text style={styles.welcomeSubtitle}>
          Connect with your family for safer shopping, spending controls, and digital wellbeing
        </Text>

        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🛡️</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Smart Safety Controls</Text>
              <Text style={styles.featureDescription}>
                Screen time limits, purchase approvals, and content filtering
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💰</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Budget Management</Text>
              <Text style={styles.featureDescription}>
                Set spending limits, approve purchases, and track family expenses
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🎯</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Gamified Wellbeing</Text>
              <Text style={styles.featureDescription}>
                Earn badges, complete missions, and build healthy digital habits
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📊</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Family Dashboard</Text>
              <Text style={styles.featureDescription}>
                View family activity, insights, and wellbeing scores
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setStep('create')}
          >
            <Text style={styles.primaryButtonText}>Create Family Group</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setStep('join')}
          >
            <Text style={styles.secondaryButtonText}>Join Existing Family</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderCreateFamily = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.formContainer}>
        <Text style={styles.stepTitle}>Create Your Family Group</Text>
        <Text style={styles.stepDescription}>
          Set up a family group to manage safety and spending together
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Family Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., The Johnson Family"
            placeholderTextColor="#8E95A3"
            value={familyName}
            onChangeText={setFamilyName}
          />
        </View>

        <View style={styles.roleSelection}>
          <Text style={styles.inputLabel}>Your Role</Text>
          <View style={styles.roleCard}>
            <Text style={styles.roleIcon}>👑</Text>
            <View style={styles.roleInfo}>
              <Text style={styles.roleName}>Parent/Guardian</Text>
              <Text style={styles.roleDescription}>
                Full control over family settings, budgets, and safety controls
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.permissionsPreview}>
          <Text style={styles.inputLabel}>Your Permissions</Text>
          <View style={styles.permissionsList}>
            <View style={styles.permissionItem}>
              <Text style={styles.permissionIcon}>✅</Text>
              <Text style={styles.permissionText}>Manage family members</Text>
            </View>
            <View style={styles.permissionItem}>
              <Text style={styles.permissionIcon}>✅</Text>
              <Text style={styles.permissionText}>Set spending limits</Text>
            </View>
            <View style={styles.permissionItem}>
              <Text style={styles.permissionIcon}>✅</Text>
              <Text style={styles.permissionText}>Approve purchases</Text>
            </View>
            <View style={styles.permissionItem}>
              <Text style={styles.permissionIcon}>✅</Text>
              <Text style={styles.permissionText}>Configure screen time</Text>
            </View>
            <View style={styles.permissionItem}>
              <Text style={styles.permissionIcon}>✅</Text>
              <Text style={styles.permissionText}>View all activity</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleCreateFamily}>
          <Text style={styles.primaryButtonText}>Create Family Group</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderJoinFamily = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.formContainer}>
        <Text style={styles.stepTitle}>Join Family Group</Text>
        <Text style={styles.stepDescription}>
          Enter your invitation code to join an existing family group
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Invitation Code</Text>
          <TextInput
            style={styles.textInput}
            placeholder="INV_XXXXXXXX"
            placeholderTextColor="#8E95A3"
            value={inviteCode}
            onChangeText={setInviteCode}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Your Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your name"
            placeholderTextColor="#8E95A3"
            value={userName}
            onChangeText={setUserName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Your Age (Optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your age"
            placeholderTextColor="#8E95A3"
            value={userAge}
            onChangeText={setUserAge}
            keyboardType="numeric"
          />
          <Text style={styles.inputHint}>
            Age helps determine appropriate safety settings
          </Text>
        </View>

        <View style={styles.rolePreview}>
          <Text style={styles.inputLabel}>Your Role Will Be</Text>
          <View style={styles.roleCard}>
            <Text style={styles.roleIcon}>👤</Text>
            <View style={styles.roleInfo}>
              <Text style={styles.roleName}>Family Member</Text>
              <Text style={styles.roleDescription}>
                Role and permissions will be set by family admin
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleJoinFamily}>
          <Text style={styles.primaryButtonText}>Join Family</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderInvite = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.inviteContainer}>
        <Text style={styles.stepTitle}>Family Created Successfully! 🎉</Text>
        <Text style={styles.stepDescription}>
          Now invite your family members to join
        </Text>

        <View style={styles.inviteCodeContainer}>
          <Text style={styles.inviteCodeLabel}>Your Family Invite Code</Text>
          <View style={styles.inviteCodeBox}>
            <Text style={styles.inviteCode}>INV_AB12CD34</Text>
            <TouchableOpacity style={styles.copyButton}>
              <Text style={styles.copyButtonText}>Copy</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inviteMethodsContainer}>
          <Text style={styles.inviteMethodsTitle}>Share Invitation</Text>
          <View style={styles.inviteMethodsGrid}>
            {inviteMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={styles.inviteMethodCard}
                onPress={method.action}
              >
                <Text style={styles.inviteMethodIcon}>{method.icon}</Text>
                <Text style={styles.inviteMethodName}>{method.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/family/dashboard')}
        >
          <Text style={styles.secondaryButtonText}>Go to Family Dashboard</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderSuccess = () => (
    <View style={styles.successContainer}>
      <Text style={styles.successIcon}>🎉</Text>
      <Text style={styles.successTitle}>Welcome to the Family!</Text>
      <Text style={styles.successDescription}>
        You've successfully joined the family group. You can now enjoy safe shopping and digital wellbeing features.
      </Text>

      <View style={styles.nextStepsContainer}>
        <Text style={styles.nextStepsTitle}>What's Next?</Text>
        <View style={styles.nextStepItem}>
          <Text style={styles.nextStepIcon}>📱</Text>
          <Text style={styles.nextStepText}>Set up your screen time preferences</Text>
        </View>
        <View style={styles.nextStepItem}>
          <Text style={styles.nextStepIcon}>💰</Text>
          <Text style={styles.nextStepText}>Configure spending limits</Text>
        </View>
        <View style={styles.nextStepItem}>
          <Text style={styles.nextStepIcon}>🎯</Text>
          <Text style={styles.nextStepText}>Start earning wellbeing badges</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.push('/family/dashboard')}
      >
        <Text style={styles.primaryButtonText}>Go to Family Dashboard</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#F5F7FA" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (step === 'welcome') {
            router.back();
          } else {
            setStep('welcome');
          }
        }}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Family Pairing</Text>
        <View style={styles.placeholder} />
      </View>

      {step === 'welcome' && renderWelcome()}
      {step === 'create' && renderCreateFamily()}
      {step === 'join' && renderJoinFamily()}
      {step === 'invite' && renderInvite()}
      {step === 'success' && renderSuccess()}
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
  content: {
    flex: 1,
  },
  welcomeContainer: {
    padding: 20,
    alignItems: 'center',
  },
  familyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#8E95A3',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  featuresContainer: {
    alignSelf: 'stretch',
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E6F3FF',
  },
  featureIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#8E95A3',
    lineHeight: 20,
  },
  actionButtons: {
    alignSelf: 'stretch',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#0066CC',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0066CC',
  },
  secondaryButtonText: {
    color: '#0066CC',
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#8E95A3',
    lineHeight: 24,
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6F3FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2C3E50',
  },
  inputHint: {
    fontSize: 12,
    color: '#8E95A3',
    marginTop: 4,
  },
  roleSelection: {
    marginBottom: 24,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  roleIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    color: '#8E95A3',
    lineHeight: 20,
  },
  permissionsPreview: {
    marginBottom: 32,
  },
  permissionsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E6F3FF',
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  permissionIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  permissionText: {
    fontSize: 14,
    color: '#2C3E50',
  },
  rolePreview: {
    marginBottom: 32,
  },
  inviteContainer: {
    padding: 20,
  },
  inviteCodeContainer: {
    marginBottom: 32,
  },
  inviteCodeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  inviteCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  inviteCode: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#0066CC',
    letterSpacing: 2,
  },
  copyButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  inviteMethodsContainer: {
    marginBottom: 32,
  },
  inviteMethodsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  inviteMethodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  inviteMethodCard: {
    width: (width - 40 - 24) / 3,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6F3FF',
  },
  inviteMethodIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  inviteMethodName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2C3E50',
    textAlign: 'center',
  },
  successContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center',
  },
  successDescription: {
    fontSize: 16,
    color: '#8E95A3',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  nextStepsContainer: {
    alignSelf: 'stretch',
    marginBottom: 32,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
    textAlign: 'center',
  },
  nextStepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E6F3FF',
  },
  nextStepIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  nextStepText: {
    fontSize: 16,
    color: '#2C3E50',
  },
});