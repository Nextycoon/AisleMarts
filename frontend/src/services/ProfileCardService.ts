import apiClient from '../api/client';

// Profile Card Service
export interface CreateProfileCardRequest {
  display_name?: string;
  username?: string;
  role?: string;
  is_premium?: boolean;
  avatar_url?: string;
  bio?: string;
  city?: string;
  country?: string;
  language?: string;
  currency?: string;
  timezone?: string;
  email?: string;
  phone?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
  business_name?: string;
  business_type?: string;
  industry?: string;
  business_address?: Record<string, string>;
  website?: string;
  business_description?: string;
}

export interface UpdateProfileCardRequest {
  display_name?: string;
  bio?: string;
  city?: string;
  avatar_url?: string;
}

export interface ContactInfo {
  method: 'email' | 'phone' | 'website' | 'social_media' | 'messaging';
  value: string;
  label: string;
  verified?: boolean;
  public?: boolean;
}

export interface UpdateContactInfoRequest {
  contact_info: ContactInfo[];
}

export interface AddSocialLinkRequest {
  platform: string;
  username: string;
}

export interface BusinessInfo {
  business_name: string;
  business_type: string;
  industry: string;
  tax_id?: string;
  registration_number?: string;
  address?: Record<string, string>;
  website?: string;
  description?: string;
}

export interface UpdateBusinessInfoRequest {
  business_info: BusinessInfo;
}

export interface ProfileCardSettings {
  card_type: 'user_card' | 'brand_card' | 'admin_card';
  visibility: 'public' | 'verified_only' | 'private';
  show_trust_score?: boolean;
  show_verification_badges?: boolean;
  show_activity_status?: boolean;
  show_location?: boolean;
  show_contact_methods?: ('email' | 'phone' | 'website' | 'social_media' | 'messaging')[];
  custom_fields?: Record<string, any>;
  theme_color?: string;
  background_image?: string;
}

export interface UpdateCardSettingsRequest {
  settings: ProfileCardSettings;
}

export interface ProfileCard {
  _id: string;
  user_id: string;
  card_type: string;
  display_name: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  city?: string;
  country: string;
  verification_level: string;
  verification_badges: any[];
  trust_score: number;
  contact_info: ContactInfo[];
  social_links: any[];
  business_info?: BusinessInfo;
  stats: any;
  settings: ProfileCardSettings;
  created_at: string;
  updated_at: string;
  public_url: string;
}

export interface ProfileCardView {
  id: string;
  display_name: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  city?: string;
  country: string;
  verification_badges: any[];
  trust_score?: number;
  stats: Record<string, any>;
  contact_methods: string[];
  member_since: string;
  public_url: string;
}

class ProfileCardService {
  async createProfileCard(request: CreateProfileCardRequest) {
    try {
      const response = await apiClient.post('/profile-cards/create', request);
      return response.data;
    } catch (error) {
      console.error('Error creating profile card:', error);
      throw error;
    }
  }

  async getMyProfileCard() {
    try {
      const response = await apiClient.get('/profile-cards/my-card');
      return response.data;
    } catch (error) {
      console.error('Error getting my profile card:', error);
      throw error;
    }
  }

  async getProfileCardById(userId: string) {
    try {
      const response = await apiClient.get(`/profile-cards/card/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting profile card by ID:', error);
      throw error;
    }
  }

  async getProfileCardByUsername(username: string) {
    try {
      const response = await apiClient.get(`/profile-cards/username/${username}`);
      return response.data;
    } catch (error) {
      console.error('Error getting profile card by username:', error);
      throw error;
    }
  }

  async updateProfileCard(request: UpdateProfileCardRequest) {
    try {
      const response = await apiClient.put('/profile-cards/update', request);
      return response.data;
    } catch (error) {
      console.error('Error updating profile card:', error);
      throw error;
    }
  }

  async updateContactInfo(request: UpdateContactInfoRequest) {
    try {
      const response = await apiClient.put('/profile-cards/contact-info', request);
      return response.data;
    } catch (error) {
      console.error('Error updating contact info:', error);
      throw error;
    }
  }

  async addSocialLink(request: AddSocialLinkRequest) {
    try {
      const response = await apiClient.post('/profile-cards/social-links/add', request);
      return response.data;
    } catch (error) {
      console.error('Error adding social link:', error);
      throw error;
    }
  }

  async removeSocialLink(platform: string) {
    try {
      const response = await apiClient.delete(`/profile-cards/social-links/${platform}`);
      return response.data;
    } catch (error) {
      console.error('Error removing social link:', error);
      throw error;
    }
  }

  async updateBusinessInfo(request: UpdateBusinessInfoRequest) {
    try {
      const response = await apiClient.put('/profile-cards/business-info', request);
      return response.data;
    } catch (error) {
      console.error('Error updating business info:', error);
      throw error;
    }
  }

  async updateCardSettings(request: UpdateCardSettingsRequest) {
    try {
      const response = await apiClient.put('/profile-cards/settings', request);
      return response.data;
    } catch (error) {
      console.error('Error updating card settings:', error);
      throw error;
    }
  }

  async getProfileCompleteness() {
    try {
      const response = await apiClient.get('/profile-cards/completeness');
      return response.data;
    } catch (error) {
      console.error('Error getting profile completeness:', error);
      throw error;
    }
  }

  async updateStats(statUpdates: Record<string, any>) {
    try {
      const response = await apiClient.put('/profile-cards/stats', { stat_updates: statUpdates });
      return response.data;
    } catch (error) {
      console.error('Error updating stats:', error);
      throw error;
    }
  }

  async searchProfiles(query: string, filters?: Record<string, any>, limit: number = 20) {
    try {
      const params = { query, limit, ...filters };
      const response = await apiClient.get('/profile-cards/search', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching profiles:', error);
      throw error;
    }
  }

  async getTemplates() {
    try {
      const response = await apiClient.get('/profile-cards/templates');
      return response.data;
    } catch (error) {
      console.error('Error getting templates:', error);
      throw error;
    }
  }

  async getSocialPlatforms() {
    try {
      const response = await apiClient.get('/profile-cards/social-platforms');
      return response.data;
    } catch (error) {
      console.error('Error getting social platforms:', error);
      throw error;
    }
  }

  async getContactMethods() {
    try {
      const response = await apiClient.get('/profile-cards/contact-methods');
      return response.data;
    } catch (error) {
      console.error('Error getting contact methods:', error);
      throw error;
    }
  }
}

export const profileCardService = new ProfileCardService();