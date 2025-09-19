import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Image,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STYLE_PREFERENCES = [
  { id: 'minimalist', label: 'Minimalist', color: '#E8C968' },
  { id: 'luxury', label: 'Luxury', color: '#D4AF37' },
  { id: 'trendy', label: 'Trendy', color: '#4facfe' },
  { id: 'classic', label: 'Classic', color: '#a8edea' },
  { id: 'bohemian', label: 'Bohemian', color: '#ff9a9e' },
  { id: 'urban', label: 'Urban', color: '#ffecd2' },
];

const BUDGET_RANGES = [
  { id: 'budget', label: 'Budget-Friendly', range: 'Under $50', color: '#a8cc8c' },
  { id: 'mid', label: 'Mid-Range', range: '$50 - $200', color: '#4facfe' },
  { id: 'premium', label: 'Premium', range: '$200 - $500', color: '#E8C968' },
  { id: 'luxury', label: 'Luxury', range: '$500+', color: '#D4AF37' },
];

const LANGUAGES = [
  { id: 'en', label: 'English', flag: '🇺🇸' },
  { id: 'es', label: 'Español', flag: '🇪🇸' },
  { id: 'fr', label: 'Français', flag: '🇫🇷' },
  { id: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { id: 'it', label: 'Italiano', flag: '🇮🇹' },
  { id: 'ja', label: '日本語', flag: '🇯🇵' },
];

interface UserProfile {
  name: string;
  bio: string;
  profileImage: string;
  stylePreferences: string[];
  budgetRange: string;
  language: string;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('basic');
  const [profile, setProfile] = useState<UserProfile>({
    name: user?.name || '',
    bio: '',
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616c6d32b42?w=200&h=200&fit=crop&crop=face',
    stylePreferences: [],
    budgetRange: '',
    language: 'en',
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('userProfile');
      if (savedProfile) {
        setProfile({ ...profile, ...JSON.parse(savedProfile) });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const saveProfile = async () => {
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Failed to save profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  const toggleStylePreference = (styleId: string) => {
    setProfile(prev => ({
      ...prev,
      stylePreferences: prev.stylePreferences.includes(styleId)
        ? prev.stylePreferences.filter(id => id !== styleId)
        : [...prev.stylePreferences, styleId]
    }));
  };

  const renderBasicInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Basic Information</Text>
      
      <View style={styles.profileImageContainer}>
        <Image source={{ uri: profile.profileImage }} style={styles.profileImage} />
        {isEditing && (
          <TouchableOpacity style={styles.changeImageButton}>
            <Text style={styles.changeImageText}>Change Photo</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Name</Text>
        <TextInput
          style={[styles.textInput, !isEditing && styles.disabledInput]}
          value={profile.name}
          onChangeText={(text) => setProfile(prev => ({ ...prev, name: text }))}
          editable={isEditing}
          placeholder="Enter your name"
          placeholderTextColor="rgba(255,255,255,0.5)"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Bio</Text>
        <TextInput
          style={[styles.textInput, styles.bioInput, !isEditing && styles.disabledInput]}
          value={profile.bio}
          onChangeText={(text) => setProfile(prev => ({ ...prev, bio: text }))}
          editable={isEditing}
          placeholder="Tell us about your style and preferences..."
          placeholderTextColor="rgba(255,255,255,0.5)"
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );

  const renderStylePreferences = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Style Preferences</Text>
      <Text style={styles.sectionSubtitle}>Select styles that resonate with you</Text>
      
      <View style={styles.preferencesGrid}>
        {STYLE_PREFERENCES.map((style) => (
          <TouchableOpacity
            key={style.id}
            style={[
              styles.preferenceChip,
              profile.stylePreferences.includes(style.id) && styles.preferenceChipSelected,
              { borderColor: style.color }
            ]}
            onPress={() => isEditing && toggleStylePreference(style.id)}
            disabled={!isEditing}
          >
            <Text style={[
              styles.preferenceChipText,
              profile.stylePreferences.includes(style.id) && { color: style.color }
            ]}>
              {style.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderBudgetPreferences = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Budget Range</Text>
      <Text style={styles.sectionSubtitle}>Select your typical spending range</Text>
      
      <View style={styles.budgetGrid}>
        {BUDGET_RANGES.map((budget) => (
          <TouchableOpacity
            key={budget.id}
            style={[
              styles.budgetCard,
              profile.budgetRange === budget.id && styles.budgetCardSelected,
              { borderColor: budget.color }
            ]}
            onPress={() => isEditing && setProfile(prev => ({ ...prev, budgetRange: budget.id }))}
            disabled={!isEditing}
          >
            <Text style={[
              styles.budgetLabel,
              profile.budgetRange === budget.id && { color: budget.color }
            ]}>
              {budget.label}
            </Text>
            <Text style={styles.budgetRange}>{budget.range}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderLanguagePreferences = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Language</Text>
      <Text style={styles.sectionSubtitle}>Select your preferred language</Text>
      
      <View style={styles.languageGrid}>
        {LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang.id}
            style={[
              styles.languageCard,
              profile.language === lang.id && styles.languageCardSelected
            ]}
            onPress={() => isEditing && setProfile(prev => ({ ...prev, language: lang.id }))}
            disabled={!isEditing}
          >
            <Text style={styles.languageFlag}>{lang.flag}</Text>
            <Text style={[
              styles.languageLabel,
              profile.language === lang.id && styles.languageLabelSelected
            ]}>
              {lang.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
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
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => isEditing ? saveProfile() : setIsEditing(true)}
        >
          <Text style={styles.editButtonText}>
            {isEditing ? 'Save' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'basic' && styles.activeTab]}
          onPress={() => setActiveTab('basic')}
        >
          <Text style={[styles.tabText, activeTab === 'basic' && styles.activeTabText]}>
            Basic
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'preferences' && styles.activeTab]}
          onPress={() => setActiveTab('preferences')}
        >
          <Text style={[styles.tabText, activeTab === 'preferences' && styles.activeTabText]}>
            Preferences
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'basic' ? (
          renderBasicInfo()
        ) : (
          <>
            {renderStylePreferences()}
            {renderBudgetPreferences()}
            {renderLanguagePreferences()}
          </>
        )}
        
        <View style={{ height: insets.bottom + 32 }} />
      </ScrollView>
    </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E8C968',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#E8C968',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  activeTabText: {
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 20,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#E8C968',
  },
  changeImageButton: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: 'rgba(232, 201, 104, 0.2)',
    borderWidth: 1,
    borderColor: '#E8C968',
  },
  changeImageText: {
    fontSize: 12,
    color: '#E8C968',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  disabledInput: {
    opacity: 0.7,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  preferencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  preferenceChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  preferenceChipSelected: {
    backgroundColor: 'rgba(232, 201, 104, 0.2)',
  },
  preferenceChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  budgetGrid: {
    gap: 12,
  },
  budgetCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  budgetCardSelected: {
    backgroundColor: 'rgba(232, 201, 104, 0.1)',
  },
  budgetLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  budgetRange: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  languageCard: {
    flex: 1,
    minWidth: 120,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  languageCardSelected: {
    backgroundColor: 'rgba(232, 201, 104, 0.2)',
    borderColor: '#E8C968',
  },
  languageFlag: {
    fontSize: 24,
    marginBottom: 4,
  },
  languageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  languageLabelSelected: {
    color: '#E8C968',
  },
});