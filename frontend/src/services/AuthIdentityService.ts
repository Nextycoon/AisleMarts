import apiClient from './client';

// Auth Identity & Verification Service
export interface CreateUserIdentityRequest {
  username: string;
  display_name?: string;
  email: string;
  phone?: string;
  is_seller?: boolean;
  is_buyer?: boolean;
  avatar_url?: string;
  bio?: string;
  city?: string;
  country?: string;
  language?: string;
  currency?: string;
  timezone?: string;
  business_name?: string;
  business_type?: string;
  industry?: string;
}

export interface VerificationUpdateRequest {
  verification_updates: Record<string, boolean>;
}

export interface UsernameChangeRequest {
  new_username: string;
}

export interface AvatarChangeRequest {
  image_data: string;
}

export interface UserIdentity {
  _id: string;
  user_id: string;
  username: string;
  display_name: string;
  email: string;
  phone?: string;
  role: string;
  verification_level: string;
  verification_status: Record<string, boolean>;
  trust_score: number;
  avatar_url?: string;
  bio?: string;
  city?: string;
  country: string;
  created_at: string;
}

export interface ProfileCard {
  id: string;
  display_name: string;
  avatar_url?: string;
  username: string;
  role: string;
  badge?: any;
  city?: any;
  currency?: string;
  language?: string;
  last_seen_iso?: string;
  created_at: string;
}

class AuthIdentityService {
  async createUserIdentity(request: CreateUserIdentityRequest) {
    try {
      const response = await apiClient.post('/identity/create', request);
      return response.data;
    } catch (error) {
      console.error('Error creating user identity:', error);
      throw error;
    }
  }

  async getUserIdentity(userId: string) {
    try {
      const response = await apiClient.get(`/identity/profile/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting user identity:', error);
      throw error;
    }
  }

  async getProfileCard(userId: string) {
    try {
      const response = await apiClient.get(`/identity/profile-card/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting profile card:', error);
      throw error;
    }
  }

  async updateVerificationStatus(updates: VerificationUpdateRequest) {
    try {
      const response = await apiClient.put('/identity/verification/update', updates);
      return response.data;
    } catch (error) {
      console.error('Error updating verification status:', error);
      throw error;
    }
  }

  async validateUsernameChange(request: UsernameChangeRequest) {
    try {
      const response = await apiClient.post('/identity/username/validate', request);
      return response.data;
    } catch (error) {
      console.error('Error validating username change:', error);
      throw error;
    }
  }

  async processUsernameChange(newUsername: string, verificationCompleted: Record<string, boolean>) {
    try {
      const response = await apiClient.post('/identity/username/change', {
        new_username: newUsername,
        verification_completed: verificationCompleted
      });
      return response.data;
    } catch (error) {
      console.error('Error processing username change:', error);
      throw error;
    }
  }

  async validateAvatarChange(request: AvatarChangeRequest) {
    try {
      const response = await apiClient.post('/identity/avatar/validate', request);
      return response.data;
    } catch (error) {
      console.error('Error validating avatar change:', error);
      throw error;
    }
  }

  async processAvatarChange(imageData: string, verificationCompleted: Record<string, boolean>) {
    try {
      const response = await apiClient.post('/identity/avatar/change', {
        image_data: imageData,
        verification_completed: verificationCompleted
      });
      return response.data;
    } catch (error) {
      console.error('Error processing avatar change:', error);
      throw error;
    }
  }

  async getVerificationRequirements() {
    try {
      const response = await apiClient.get('/identity/verification/requirements');
      return response.data;
    } catch (error) {
      console.error('Error getting verification requirements:', error);
      throw error;
    }
  }

  async getVerificationLevels() {
    try {
      const response = await apiClient.get('/identity/verification/levels');
      return response.data;
    } catch (error) {
      console.error('Error getting verification levels:', error);
      throw error;
    }
  }

  async getUsernamePolicy() {
    try {
      const response = await apiClient.get('/identity/username/policy');
      return response.data;
    } catch (error) {
      console.error('Error getting username policy:', error);
      throw error;
    }
  }

  async getAvatarPolicy() {
    try {
      const response = await apiClient.get('/identity/avatar/policy');
      return response.data;
    } catch (error) {
      console.error('Error getting avatar policy:', error);
      throw error;
    }
  }

  async getTrustScore(userId: string) {
    try {
      const response = await apiClient.get(`/identity/trust-score/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting trust score:', error);
      throw error;
    }
  }
}

export const authIdentityService = new AuthIdentityService();