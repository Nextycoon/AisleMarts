import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { profileCardService, ProfileCard, ContactInfo, BusinessInfo } from '../services/ProfileCardService';
import { useAuth } from '../context/AuthContext';

const ProfileCardScreen = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('card');
  const [loading, setLoading] = useState(false);
  const [profileCard, setProfileCard] = useState<ProfileCard | null>(null);
  const [completeness, setCompleteness] = useState<any>(null);
  const [socialPlatforms, setSocialPlatforms] = useState<string[]>([]);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    display_name: '',
    bio: '',
    city: '',
    avatar_url: ''
  });

  // Contact form
  const [contactForm, setContactForm] = useState<ContactInfo>({
    method: 'email',
    value: '',
    label: '',
    verified: false,
    public: true
  });

  // Social link form
  const [socialForm, setSocialForm] = useState({
    platform: '',
    username: ''
  });

  // Business form
  const [businessForm, setBusinessForm] = useState<BusinessInfo>({
    business_name: '',
    business_type: '',
    industry: '',
    tax_id: '',
    registration_number: '',
    address: {},
    website: '',
    description: ''
  });

  useEffect(() => {
    loadProfileData();
    loadSocialPlatforms();
  }, []);

  const loadProfileData = async () => {
    try {
      const [card, completenessData] = await Promise.all([
        profileCardService.getMyProfileCard().catch(() => null),
        profileCardService.getProfileCompleteness().catch(() => null)
      ]);

      if (card) {
        setProfileCard(card);
        setProfileForm({
          display_name: card.display_name || '',
          bio: card.bio || '',
          city: card.city || '',
          avatar_url: card.avatar_url || ''
        });

        if (card.business_info) {
          setBusinessForm({
            business_name: card.business_info.business_name || '',
            business_type: card.business_info.business_type || '',
            industry: card.business_info.industry || '',
            tax_id: card.business_info.tax_id || '',
            registration_number: card.business_info.registration_number || '',
            address: card.business_info.address || {},
            website: card.business_info.website || '',
            description: card.business_info.description || ''
          });
        }
      }

      setCompleteness(completenessData);
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const loadSocialPlatforms = async () => {
    try {
      const platforms = await profileCardService.getSocialPlatforms();
      setSocialPlatforms(platforms.platforms || []);
    } catch (error) {
      console.error('Error loading social platforms:', error);
    }
  };

  const handleCreateProfileCard = async () => {
    setLoading(true);
    try {
      await profileCardService.createProfileCard({
        display_name: user?.username || 'User',
        role: 'buyer',
        email: user?.email,
        country: 'US'
      });
      Alert.alert('Success', 'Profile card created successfully!');
      await loadProfileData();
    } catch (error) {
      Alert.alert('Error', 'Failed to create profile card');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!profileForm.display_name.trim()) {
      Alert.alert('Error', 'Display name is required');
      return;
    }

    setLoading(true);
    try {
      await profileCardService.updateProfileCard(profileForm);
      Alert.alert('Success', 'Profile updated successfully!');
      await loadProfileData();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async () => {
    if (!contactForm.value.trim() || !contactForm.label.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const newContactList = [...(profileCard?.contact_info || []), contactForm];
      await profileCardService.updateContactInfo({ contact_info: newContactList });
      Alert.alert('Success', 'Contact information added!');
      setContactForm({
        method: 'email',
        value: '',
        label: '',
        verified: false,
        public: true
      });
      await loadProfileData();
    } catch (error) {
      Alert.alert('Error', 'Failed to add contact');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSocialLink = async () => {
    if (!socialForm.platform || !socialForm.username.trim()) {
      Alert.alert('Error', 'Please select platform and enter username');
      return;
    }

    setLoading(true);
    try {
      const result = await profileCardService.addSocialLink(socialForm);
      if (result.success) {
        Alert.alert('Success', 'Social link added successfully!');
        setSocialForm({ platform: '', username: '' });
        await loadProfileData();
      } else {
        Alert.alert('Error', result.error || 'Failed to add social link');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add social link');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBusiness = async () => {
    if (!businessForm.business_name.trim()) {
      Alert.alert('Error', 'Business name is required');
      return;
    }

    setLoading(true);
    try {
      await profileCardService.updateBusinessInfo({ business_info: businessForm });
      Alert.alert('Success', 'Business information updated!');
      await loadProfileData();
    } catch (error) {
      Alert.alert('Error', 'Failed to update business information');
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

  const renderCardTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>👤 Profile Card</Text>
      <Text style={styles.tabSubtitle}>Your unified digital identity</Text>

      {profileCard ? (
        <View style={styles.profileCardContainer}>
          <View style={styles.profileCard}>
            <View style={styles.cardHeader}>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{profileCard.display_name}</Text>
                <Text style={styles.profileUsername}>@{profileCard.username}</Text>
                <Text style={styles.profileBio}>{profileCard.bio || 'No bio provided'}</Text>
              </View>
              {profileCard.avatar_url && (
                <Image source={{ uri: profileCard.avatar_url }} style={styles.profileAvatar} />
              )}
            </View>

            <View style={styles.cardStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{Math.round(profileCard.trust_score * 100)}</Text>
                <Text style={styles.statLabel}>Trust Score</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{profileCard.verification_badges?.length || 0}</Text>
                <Text style={styles.statLabel}>Badges</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{profileCard.social_links?.length || 0}</Text>
                <Text style={styles.statLabel}>Social Links</Text>
              </View>
            </View>

            <View style={styles.cardLocation}>
              <Ionicons name="location" size={16} color="#666" />
              <Text style={styles.locationText}>
                {profileCard.city ? `${profileCard.city}, ` : ''}{profileCard.country}
              </Text>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.memberSince}>
                Member since {new Date(profileCard.created_at).toLocaleDateString()}
              </Text>
              <TouchableOpacity style={styles.shareButton}>
                <Ionicons name="share" size={16} color="#007AFF" />
                <Text style={styles.shareButtonText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>

          {completeness && (
            <View style={styles.completenessCard}>
              <View style={styles.completenessHeader}>
                <Text style={styles.completenessTitle}>📊 Profile Completeness</Text>
                <Text style={styles.completenessPercent}>{completeness.percentage}%</Text>
              </View>
              
              <View style={styles.completenessBar}>
                <View 
                  style={[styles.completenessProgress, { width: `${completeness.percentage}%` }]} 
                />
              </View>

              {completeness.missing_fields && completeness.missing_fields.length > 0 && (
                <View style={styles.missingSections}>
                  <Text style={styles.missingSectionsTitle}>Missing Information:</Text>
                  {completeness.missing_fields.map((field: string, index: number) => (
                    <Text key={index} style={styles.missingField}>
                      • {field.replace('_', ' ').charAt(0).toUpperCase() + field.replace('_', ' ').slice(1)}
                    </Text>
                  ))}
                </View>
              )}

              {completeness.suggestions && completeness.suggestions.length > 0 && (
                <View style={styles.suggestionsSection}>
                  <Text style={styles.suggestionsTitle}>💡 Suggestions:</Text>
                  {completeness.suggestions.map((suggestion: string, index: number) => (
                    <Text key={index} style={styles.suggestionText}>• {suggestion}</Text>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      ) : (
        <View style={styles.noCardContainer}>
          <Ionicons name="card" size={64} color="#ccc" />
          <Text style={styles.noCardTitle}>No Profile Card</Text>
          <Text style={styles.noCardText}>Create your digital profile card to get started</Text>
          
          <TouchableOpacity style={styles.createButton} onPress={handleCreateProfileCard} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : (
              <>
                <Ionicons name="add-circle" size={20} color="white" />
                <Text style={styles.createButtonText}>Create Profile Card</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderEditTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>✏️ Edit Profile</Text>
      <Text style={styles.tabSubtitle}>Update your profile information</Text>

      <View style={styles.editForm}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Display Name *</Text>
          <TextInput
            style={styles.input}
            value={profileForm.display_name}
            onChangeText={(text) => setProfileForm({...profileForm, display_name: text})}
            placeholder="Your display name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={profileForm.bio}
            onChangeText={(text) => setProfileForm({...profileForm, bio: text})}
            placeholder="Tell others about yourself..."
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            value={profileForm.city}
            onChangeText={(text) => setProfileForm({...profileForm, city: text})}
            placeholder="Your city"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Avatar URL</Text>
          <TextInput
            style={styles.input}
            value={profileForm.avatar_url}
            onChangeText={(text) => setProfileForm({...profileForm, avatar_url: text})}
            placeholder="https://example.com/avatar.jpg"
          />
        </View>

        <TouchableOpacity style={styles.updateButton} onPress={handleUpdateProfile} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : (
            <>
              <Ionicons name="save" size={20} color="white" />
              <Text style={styles.updateButtonText}>Update Profile</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContactTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>📞 Contact & Social</Text>
      <Text style={styles.tabSubtitle}>Manage your contact methods and social links</Text>

      <View style={styles.contactSection}>
        <Text style={styles.sectionTitle}>Add Contact Method</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contact Method</Text>
          <View style={styles.methodButtons}>
            {['email', 'phone', 'website', 'messaging'].map(method => (
              <TouchableOpacity
                key={method}
                style={[styles.methodButton, contactForm.method === method && styles.activeMethodButton]}
                onPress={() => setContactForm({...contactForm, method: method as any})}
              >
                <Text style={[styles.methodButtonText, contactForm.method === method && styles.activeMethodButtonText]}>
                  {method.charAt(0).toUpperCase() + method.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, {flex: 1, marginRight: 8}]}>
            <Text style={styles.label}>Value</Text>
            <TextInput
              style={styles.input}
              value={contactForm.value}
              onChangeText={(text) => setContactForm({...contactForm, value: text})}
              placeholder="Contact value"
            />
          </View>
          
          <View style={[styles.inputGroup, {flex: 1, marginLeft: 8}]}>
            <Text style={styles.label}>Label</Text>
            <TextInput
              style={styles.input}
              value={contactForm.label}
              onChangeText={(text) => setContactForm({...contactForm, label: text})}
              placeholder="Label"
            />
          </View>
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Make Public</Text>
          <TouchableOpacity
            style={[styles.switch, contactForm.public && styles.switchActive]}
            onPress={() => setContactForm({...contactForm, public: !contactForm.public})}
          >
            <View style={[styles.switchThumb, contactForm.public && styles.switchThumbActive]} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddContact} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : (
            <>
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.addButtonText}>Add Contact</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.socialSection}>
        <Text style={styles.sectionTitle}>Add Social Link</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Platform</Text>
          <View style={styles.platformButtons}>
            {socialPlatforms.slice(0, 6).map(platform => (
              <TouchableOpacity
                key={platform}
                style={[styles.platformButton, socialForm.platform === platform && styles.activePlatformButton]}
                onPress={() => setSocialForm({...socialForm, platform})}
              >
                <Text style={[styles.platformButtonText, socialForm.platform === platform && styles.activePlatformButtonText]}>
                  {platform}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={socialForm.username}
            onChangeText={(text) => setSocialForm({...socialForm, username: text})}
            placeholder="Your username"
          />
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddSocialLink} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : (
            <>
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.addButtonText}>Add Social Link</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {profileCard && (
        <View style={styles.existingContactsSection}>
          <Text style={styles.sectionTitle}>Current Contacts</Text>
          {profileCard.contact_info?.map((contact, index) => (
            <View key={index} style={styles.contactItem}>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>{contact.label}</Text>
                <Text style={styles.contactValue}>{contact.value}</Text>
                <Text style={styles.contactMethod}>{contact.method}</Text>
              </View>
              <View style={styles.contactStatus}>
                {contact.verified && <Ionicons name="checkmark-circle" size={16} color="#28a745" />}
                {contact.public && <Ionicons name="globe" size={16} color="#007AFF" />}
              </View>
            </View>
          ))}

          <Text style={styles.sectionTitle}>Social Links</Text>
          {profileCard.social_links?.map((social, index) => (
            <View key={index} style={styles.socialItem}>
              <View style={styles.socialInfo}>
                <Text style={styles.socialPlatform}>{social.platform}</Text>
                <Text style={styles.socialUsername}>{social.username}</Text>
              </View>
              {social.verified && <Ionicons name="checkmark-circle" size={16} color="#28a745" />}
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderBusinessTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>🏢 Business Information</Text>
      <Text style={styles.tabSubtitle}>Add business details for professional profiles</Text>

      <View style={styles.businessForm}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Business Name *</Text>
          <TextInput
            style={styles.input}
            value={businessForm.business_name}
            onChangeText={(text) => setBusinessForm({...businessForm, business_name: text})}
            placeholder="Your business name"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, {flex: 1, marginRight: 8}]}>
            <Text style={styles.label}>Business Type</Text>
            <TextInput
              style={styles.input}
              value={businessForm.business_type}
              onChangeText={(text) => setBusinessForm({...businessForm, business_type: text})}
              placeholder="e.g., LLC, Corp"
            />
          </View>
          
          <View style={[styles.inputGroup, {flex: 1, marginLeft: 8}]}>
            <Text style={styles.label}>Industry</Text>
            <TextInput
              style={styles.input}
              value={businessForm.industry}
              onChangeText={(text) => setBusinessForm({...businessForm, industry: text})}
              placeholder="e.g., Technology"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Website</Text>
          <TextInput
            style={styles.input}
            value={businessForm.website}
            onChangeText={(text) => setBusinessForm({...businessForm, website: text})}
            placeholder="https://yourwebsite.com"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={businessForm.description}
            onChangeText={(text) => setBusinessForm({...businessForm, description: text})}
            placeholder="Describe your business..."
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, {flex: 1, marginRight: 8}]}>
            <Text style={styles.label}>Tax ID</Text>
            <TextInput
              style={styles.input}
              value={businessForm.tax_id}
              onChangeText={(text) => setBusinessForm({...businessForm, tax_id: text})}
              placeholder="Tax ID"
            />
          </View>
          
          <View style={[styles.inputGroup, {flex: 1, marginLeft: 8}]}>
            <Text style={styles.label}>Registration Number</Text>
            <TextInput
              style={styles.input}
              value={businessForm.registration_number}
              onChangeText={(text) => setBusinessForm({...businessForm, registration_number: text})}
              placeholder="Registration #"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.updateButton} onPress={handleUpdateBusiness} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : (
            <>
              <Ionicons name="business" size={20} color="white" />
              <Text style={styles.updateButtonText}>Update Business Info</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>👤 Profile Card</Text>
        <Text style={styles.subtitle}>Your unified digital identity</Text>
      </View>

      <View style={styles.tabContainer}>
        {renderTabButton('card', 'Card', 'card')}
        {renderTabButton('edit', 'Edit', 'create')}
        {renderTabButton('contact', 'Contact', 'mail')}
        {renderTabButton('business', 'Business', 'business')}
      </View>

      {activeTab === 'card' && renderCardTab()}
      {activeTab === 'edit' && renderEditTab()}
      {activeTab === 'contact' && renderContactTab()}
      {activeTab === 'business' && renderBusinessTab()}
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
  profileCardContainer: {
    gap: 16,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 8,
  },
  profileBio: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f3f4',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  cardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberSince: {
    fontSize: 12,
    color: '#999',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f8ff',
    borderRadius: 6,
  },
  shareButtonText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 4,
  },
  completenessCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  completenessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  completenessTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  completenessPercent: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28a745',
  },
  completenessBar: {
    height: 8,
    backgroundColor: '#e1e5e9',
    borderRadius: 4,
    marginBottom: 16,
  },
  completenessProgress: {
    height: '100%',
    backgroundColor: '#28a745',
    borderRadius: 4,
  },
  missingSections: {
    marginBottom: 16,
  },
  missingSectionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  missingField: {
    fontSize: 12,
    color: '#dc3545',
    marginBottom: 4,
  },
  suggestionsSection: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  noCardContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  noCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  noCardText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  editForm: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
  },
  updateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  contactSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  socialSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  methodButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  methodButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  activeMethodButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  methodButtonText: {
    fontSize: 12,
    color: '#666',
  },
  activeMethodButtonText: {
    color: 'white',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e1e5e9',
    justifyContent: 'center',
    padding: 2,
  },
  switchActive: {
    backgroundColor: '#007AFF',
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  switchThumbActive: {
    transform: [{ translateX: 20 }],
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  platformButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  platformButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  activePlatformButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  platformButtonText: {
    fontSize: 10,
    color: '#666',
    textTransform: 'capitalize',
  },
  activePlatformButtonText: {
    color: 'white',
  },
  existingContactsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  contactValue: {
    fontSize: 12,
    color: '#666',
  },
  contactMethod: {
    fontSize: 10,
    color: '#999',
    textTransform: 'capitalize',
  },
  contactStatus: {
    flexDirection: 'row',
    gap: 4,
  },
  socialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  socialInfo: {
    flex: 1,
  },
  socialPlatform: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
  },
  socialUsername: {
    fontSize: 12,
    color: '#666',
  },
  businessForm: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
});

export default ProfileCardScreen;