import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authIdentityService, UserIdentity } from '../services/AuthIdentityService';
import { useAuth } from '../context/AuthContext';

const AuthIdentityScreen = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('identity');
  const [loading, setLoading] = useState(false);
  const [userIdentity, setUserIdentity] = useState<UserIdentity | null>(null);
  const [trustScore, setTrustScore] = useState<any>(null);
  const [verificationLevels, setVerificationLevels] = useState<any>(null);

  // Username change form
  const [usernameForm, setUsernameForm] = useState({
    new_username: '',
    validation_result: null as any
  });

  // Avatar change form
  const [avatarForm, setAvatarForm] = useState({
    image_data: '',
    validation_result: null as any
  });

  useEffect(() => {
    loadUserIdentity();
    loadVerificationLevels();
  }, []);

  const loadUserIdentity = async () => {
    if (!user?._id) return;
    
    try {
      const [identity, trust] = await Promise.all([
        authIdentityService.getUserIdentity(user._id).catch(() => null),
        authIdentityService.getTrustScore(user._id).catch(() => null)
      ]);

      setUserIdentity(identity);
      setTrustScore(trust);
    } catch (error) {
      console.error('Error loading user identity:', error);
    }
  };

  const loadVerificationLevels = async () => {
    try {
      const levels = await authIdentityService.getVerificationLevels();
      setVerificationLevels(levels);
    } catch (error) {
      console.error('Error loading verification levels:', error);
    }
  };

  const handleValidateUsernameChange = async () => {
    if (!usernameForm.new_username.trim()) {
      Alert.alert('Error', 'Please enter a new username');
      return;
    }

    setLoading(true);
    try {
      const result = await authIdentityService.validateUsernameChange({
        new_username: usernameForm.new_username
      });
      setUsernameForm({ ...usernameForm, validation_result: result });
    } catch (error) {
      Alert.alert('Error', 'Failed to validate username');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessUsernameChange = async () => {
    if (!usernameForm.validation_result?.valid) {
      Alert.alert('Error', 'Please validate username first');
      return;
    }

    setLoading(true);
    try {
      await authIdentityService.processUsernameChange(
        usernameForm.new_username,
        usernameForm.validation_result.verification_completed || {}
      );
      Alert.alert('Success', 'Username changed successfully!');
      await loadUserIdentity();
      setUsernameForm({ new_username: '', validation_result: null });
    } catch (error) {
      Alert.alert('Error', 'Failed to change username');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateVerification = async (verificationUpdates: Record<string, boolean>) => {
    setLoading(true);
    try {
      await authIdentityService.updateVerificationStatus({ verification_updates: verificationUpdates });
      Alert.alert('Success', 'Verification status updated!');
      await loadUserIdentity();
    } catch (error) {
      Alert.alert('Error', 'Failed to update verification');
    } finally {
      setLoading(false);
    }
  };

  const renderTabButton = (tabId: string, title: string, icon: string) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tabId && styles.activeTab]}
      onPress={() => setActiveTab(tabId)}
    >
      <Ionicons name={icon as any} size={20} color={activeTab === tabId ? '#007AFF' : '#666'} />
      <Text style={[styles.tabText, activeTab === tabId && styles.activeTabText]}>{title}</Text>
    </TouchableOpacity>
  );

  const renderIdentityTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>🛡️ Identity & Trust</Text>
      <Text style={styles.tabSubtitle}>Manage your identity verification and trust score</Text>

      {userIdentity ? (
        <View style={styles.identityOverview}>
          <View style={styles.identityCard}>
            <View style={styles.identityHeader}>
              <View style={styles.identityInfo}>
                <Text style={styles.displayName}>{userIdentity.display_name}</Text>
                <Text style={styles.username}>@{userIdentity.username}</Text>
                <Text style={styles.role}>{userIdentity.role}</Text>
              </View>
              {userIdentity.avatar_url && (
                <Image source={{ uri: userIdentity.avatar_url }} style={styles.avatar} />
              )}
            </View>
            
            <View style={styles.identityDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email:</Text>
                <Text style={styles.detailValue}>{userIdentity.email}</Text>
              </View>
              {userIdentity.phone && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Phone:</Text>
                  <Text style={styles.detailValue}>{userIdentity.phone}</Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Country:</Text>
                <Text style={styles.detailValue}>{userIdentity.country}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Member Since:</Text>
                <Text style={styles.detailValue}>
                  {new Date(userIdentity.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>

          {trustScore && (
            <View style={styles.trustScoreCard}>
              <View style={styles.trustScoreHeader}>
                <Text style={styles.trustScoreTitle}>🌟 Trust Score</Text>
                <View style={styles.trustScoreBadge}>
                  <Text style={styles.trustScoreValue}>{Math.round(trustScore.trust_score * 100)}</Text>
                  <Text style={styles.trustScoreMax}>/100</Text>
                </View>
              </View>
              
              <Text style={styles.verificationLevel}>
                Verification Level: {trustScore.verification_level?.toUpperCase()}
              </Text>
              
              <View style={styles.trustBreakdown}>
                <Text style={styles.breakdownTitle}>Score Breakdown:</Text>
                {Object.entries(trustScore.breakdown || {}).map(([key, value]) => (
                  <View key={key} style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>
                      {key.replace('_', ' ').charAt(0).toUpperCase() + key.replace('_', ' ').slice(1)}:
                    </Text>
                    <Text style={styles.breakdownValue}>+{value}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.trustStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{trustScore.verification_count}</Text>
                  <Text style={styles.statLabel}>Verified Items</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{trustScore.account_age_years}</Text>
                  <Text style={styles.statLabel}>Years Active</Text>
                </View>
              </View>
            </View>
          )}

          {userIdentity.verification_status && (
            <View style={styles.verificationCard}>
              <Text style={styles.verificationTitle}>✅ Verification Status</Text>
              <View style={styles.verificationList}>
                {Object.entries(userIdentity.verification_status).map(([key, verified]) => (
                  <View key={key} style={styles.verificationItem}>
                    <View style={styles.verificationInfo}>
                      <Ionicons 
                        name={verified ? 'checkmark-circle' : 'ellipse-outline'} 
                        size={20} 
                        color={verified ? '#28a745' : '#ccc'} 
                      />
                      <Text style={styles.verificationLabel}>
                        {key.replace('_', ' ').charAt(0).toUpperCase() + key.replace('_', ' ').slice(1)}
                      </Text>
                    </View>
                    {!verified && (
                      <TouchableOpacity
                        style={styles.verifyButton}
                        onPress={() => handleUpdateVerification({ [key]: true })}
                      >
                        <Text style={styles.verifyButtonText}>Verify</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.noIdentityCard}>
          <Ionicons name="person-circle" size={64} color="#ccc" />
          <Text style={styles.noIdentityTitle}>No Identity Found</Text>
          <Text style={styles.noIdentityText}>Your identity information is not available</Text>
        </View>
      )}
    </View>
  );

  const renderUsernameTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>👤 Username Management</Text>
      <Text style={styles.tabSubtitle}>Change your username with verification</Text>

      <View style={styles.currentUsernameCard}>
        <Text style={styles.currentUsernameLabel}>Current Username:</Text>
        <Text style={styles.currentUsernameValue}>@{userIdentity?.username || 'N/A'}</Text>
      </View>

      <View style={styles.usernameChangeCard}>
        <Text style={styles.changeTitle}>Change Username</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>New Username</Text>
          <TextInput
            style={styles.input}
            value={usernameForm.new_username}
            onChangeText={(text) => setUsernameForm({ ...usernameForm, new_username: text.toLowerCase() })}
            placeholder="Enter new username"
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity 
          style={styles.validateButton} 
          onPress={handleValidateUsernameChange} 
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : (
            <>
              <Ionicons name="search" size={20} color="white" />
              <Text style={styles.validateButtonText}>Validate Username</Text>
            </>
          )}
        </TouchableOpacity>

        {usernameForm.validation_result && (
          <View style={styles.validationResult}>
            <View style={[styles.validationHeader, usernameForm.validation_result.valid ? styles.validationSuccess : styles.validationError]}>
              <Ionicons 
                name={usernameForm.validation_result.valid ? 'checkmark-circle' : 'alert-circle'} 
                size={20} 
                color="white" 
              />
              <Text style={styles.validationHeaderText}>
                {usernameForm.validation_result.valid ? 'Username Available' : 'Username Not Available'}
              </Text>
            </View>

            {usernameForm.validation_result.reasons && (
              <View style={styles.validationReasons}>
                {usernameForm.validation_result.reasons.map((reason: string, index: number) => (
                  <Text key={index} style={styles.reasonText}>• {reason}</Text>
                ))}
              </View>
            )}

            {usernameForm.validation_result.requirements && (
              <View style={styles.validationRequirements}>
                <Text style={styles.requirementsTitle}>Requirements:</Text>
                {usernameForm.validation_result.requirements.map((req: string, index: number) => (
                  <Text key={index} style={styles.requirementText}>• {req}</Text>
                ))}
              </View>
            )}

            {usernameForm.validation_result.valid && (
              <TouchableOpacity 
                style={styles.processButton} 
                onPress={handleProcessUsernameChange}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="white" /> : (
                  <>
                    <Ionicons name="save" size={20} color="white" />
                    <Text style={styles.processButtonText}>Change Username</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );

  const renderVerificationTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>🔐 Verification Center</Text>
      <Text style={styles.tabSubtitle}>Complete verification to increase your trust score</Text>

      {verificationLevels && (
        <View style={styles.verificationLevelsCard}>
          <Text style={styles.levelsTitle}>Verification Levels</Text>
          {Object.entries(verificationLevels.verification_levels || {}).map(([level, config]: [string, any]) => (
            <View key={level} style={styles.levelCard}>
              <View style={styles.levelHeader}>
                <Text style={styles.levelName}>
                  {level.toUpperCase()} - {config.name}
                </Text>
                <View style={[styles.levelBadge, userIdentity?.verification_level === level && styles.currentLevelBadge]}>
                  <Text style={styles.levelBadgeText}>
                    {userIdentity?.verification_level === level ? 'Current' : 'Available'}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.levelDescription}>{config.description}</Text>
              
              <View style={styles.levelRequirements}>
                <Text style={styles.levelRequirementsTitle}>Requirements:</Text>
                {config.requires.map((req: string, index: number) => (
                  <View key={index} style={styles.requirementRow}>
                    <Ionicons 
                      name={userIdentity?.verification_status?.[req] ? 'checkmark-circle' : 'ellipse-outline'} 
                      size={16} 
                      color={userIdentity?.verification_status?.[req] ? '#28a745' : '#ccc'} 
                    />
                    <Text style={[styles.requirementLabel, userIdentity?.verification_status?.[req] && styles.completedRequirement]}>
                      {req.replace('_', ' ').charAt(0).toUpperCase() + req.replace('_', ' ').slice(1)}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.levelBenefits}>
                <Text style={styles.levelBenefitsTitle}>Benefits:</Text>
                {config.benefits.map((benefit: string, index: number) => (
                  <Text key={index} style={styles.benefitText}>• {benefit}</Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}

      {verificationLevels?.kyc_documents && (
        <View style={styles.documentsCard}>
          <Text style={styles.documentsTitle}>📄 Supported Documents</Text>
          <View style={styles.documentsList}>
            {verificationLevels.kyc_documents.map((doc: string, index: number) => (
              <View key={index} style={styles.documentItem}>
                <Ionicons name="document-text" size={16} color="#666" />
                <Text style={styles.documentText}>
                  {doc.replace('_', ' ').charAt(0).toUpperCase() + doc.replace('_', ' ').slice(1)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🛡️ Auth & Identity</Text>
        <Text style={styles.subtitle}>Secure identity verification system</Text>
      </View>

      <View style={styles.tabContainer}>
        {renderTabButton('identity', 'Identity', 'person')}
        {renderTabButton('username', 'Username', 'at')}
        {renderTabButton('verification', 'Verification', 'shield-checkmark')}
      </View>

      {activeTab === 'identity' && renderIdentityTab()}
      {activeTab === 'username' && renderUsernameTab()}
      {activeTab === 'verification' && renderVerificationTab()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginHorizontal: 4,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: 'white',
  },
  tabContent: {
    padding: 20,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  tabSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  identityOverview: {
    gap: 16,
  },
  identityCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  identityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  identityInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
  },
  identityDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  trustScoreCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  trustScoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trustScoreTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  trustScoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  trustScoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
  },
  trustScoreMax: {
    fontSize: 14,
    color: '#666',
  },
  verificationLevel: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 16,
  },
  trustBreakdown: {
    marginBottom: 16,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#666',
  },
  breakdownValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#28a745',
  },
  trustStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  verificationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  verificationList: {
    gap: 12,
  },
  verificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  verificationLabel: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  verifyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  noIdentityCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  noIdentityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  noIdentityText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  currentUsernameCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentUsernameLabel: {
    fontSize: 14,
    color: '#666',
  },
  currentUsernameValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  usernameChangeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  changeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  validateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  validateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  validationResult: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  validationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  validationSuccess: {
    backgroundColor: '#28a745',
  },
  validationError: {
    backgroundColor: '#dc3545',
  },
  validationHeaderText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  validationReasons: {
    padding: 12,
    backgroundColor: '#f8f9fa',
  },
  reasonText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  validationRequirements: {
    padding: 12,
    backgroundColor: '#fff8e1',
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  processButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    padding: 16,
    margin: 12,
    borderRadius: 8,
  },
  processButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  verificationLevelsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  levelsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  levelCard: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
  },
  levelBadge: {
    backgroundColor: '#e1e5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  currentLevelBadge: {
    backgroundColor: '#007AFF',
  },
  levelBadgeText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
  },
  levelDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  levelRequirements: {
    marginBottom: 12,
  },
  levelRequirementsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requirementLabel: {
    fontSize: 11,
    color: '#666',
    marginLeft: 8,
  },
  completedRequirement: {
    color: '#28a745',
    textDecorationLine: 'line-through',
  },
  levelBenefits: {
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
    paddingTop: 8,
  },
  levelBenefitsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 11,
    color: '#28a745',
    marginBottom: 2,
  },
  documentsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  documentsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  documentsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  documentText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
});

export default AuthIdentityScreen;