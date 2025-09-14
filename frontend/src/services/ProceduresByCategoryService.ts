import { client } from '../api/client';

export interface UserRole {
  value: string;
  label: string;
}

export interface OnboardingStep {
  value: string;
  label: string;
}

export interface Permission {
  value: string;
  label: string;
}

export interface VerificationBadge {
  badge: string;
  verified: boolean;
  config: {
    icon: string;
    color: string;
    placement: string;
    tooltip: string;
  };
  category: string;
  earned_at?: string;
}

export interface UserProcedure {
  _id: string;
  user_id: string;
  category: string;
  current_step?: string;
  completed_steps: string[];
  verification_status: Record<string, boolean>;
  badge_earned: string;
  permissions_granted: string[];
  created_at: string;
  updated_at: string;
  onboarding_completed_at?: string;
  next_reverification_due?: string;
  status: string;
  notes?: string;
  step_history: Array<{
    step: string;
    action: string;
    timestamp: string;
    user_id: string;
    details?: Record<string, any>;
  }>;
  verification_history: Array<Record<string, any>>;
}

export interface OnboardingProgress {
  user_id: string;
  category: string;
  current_step?: string;
  progress: {
    percentage: number;
    completed: number;
    total: number;
    remaining_steps: string[];
  };
  badge_earned: string;
  permissions: string[];
  status: string;
  onboarding_complete: boolean;
  next_reverification_due?: string;
  category_config: Record<string, any>;
}

export interface CreateUserProcedureRequest {
  role: 'seller_brand' | 'buyer' | 'visitor' | 'admin';
}

export interface CompleteStepRequest {
  step: string;
  step_data: Record<string, any>;
}

export interface OnboardingGuidanceRequest {
  context?: Record<string, any>;
}

class ProceduresByCategoryService {
  private basePath = '/api/procedures';

  // Health Check
  async getHealthCheck() {
    try {
      const response = await client.get(`${this.basePath}/health`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // User Procedure Management
  async createUserProcedure(role: CreateUserProcedureRequest['role']) {
    try {
      const response = await client.post(`${this.basePath}/create`, { role });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  async getMyProcedure() {
    try {
      const response = await client.get(`${this.basePath}/my-procedure`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  async getOnboardingProgress() {
    try {
      const response = await client.get(`${this.basePath}/progress`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  async completeOnboardingStep(stepData: CompleteStepRequest) {
    try {
      const response = await client.post(`${this.basePath}/complete-step`, stepData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  // Permission Management
  async getUserPermissions() {
    try {
      const response = await client.get(`${this.basePath}/permissions`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  async checkUserPermission(permission: string) {
    try {
      const response = await client.get(`${this.basePath}/permissions/${permission}/check`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  // Badge System
  async getUserBadge() {
    try {
      const response = await client.get(`${this.basePath}/badge`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  async requestReverification() {
    try {
      const response = await client.post(`${this.basePath}/reverification`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  // AI Guidance
  async generateOnboardingGuidance(context: Record<string, any> = {}) {
    try {
      const response = await client.post(`${this.basePath}/guidance`, { context });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  // Analytics
  async getUserAnalytics() {
    try {
      const response = await client.get(`${this.basePath}/analytics`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  // Reference Data
  async getCategoryConfigurations() {
    try {
      const response = await client.get(`${this.basePath}/categories`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  async getReferenceData() {
    try {
      const response = await client.get(`${this.basePath}/reference-data`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  // Helper Methods
  getRoleDisplayName(role: string): string {
    const roleMap: Record<string, string> = {
      'seller_brand': 'Company/Brand',
      'buyer': 'Buyer',
      'visitor': 'Visitor',
      'admin': 'Administrator'
    };
    return roleMap[role] || role;
  }

  getStepDisplayName(step: string): string {
    const stepMap: Record<string, string> = {
      'create_account': 'Create Account',
      'email_phone_verify': 'Email & Phone Verification',
      'enable_2fa': 'Enable Two-Factor Authentication',
      'business_profile_setup': 'Business Profile Setup',
      'kyb_submission': 'KYB Document Submission',
      'bank_account_verification': 'Bank Account Verification',
      'tax_ids_submission': 'Tax ID Submission',
      'brand_assets_upload': 'Brand Assets Upload',
      'policy_acceptance': 'Policy Acceptance',
      'profile_basics': 'Profile Basics',
      'payment_method_verification': 'Payment Method Verification'
    };
    return stepMap[step] || step.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getPermissionDisplayName(permission: string): string {
    const permissionMap: Record<string, string> = {
      'list_products': 'List Products',
      'b2b_trading': 'B2B Trading',
      'cross_border': 'Cross-Border Trade',
      'payments_accept': 'Accept Payments',
      'payouts_receive': 'Receive Payouts',
      'api_access': 'API Access',
      'city_targeting': 'City Targeting',
      'browse_buy': 'Browse & Buy',
      'wishlist': 'Wishlist',
      'reviews': 'Reviews',
      'returns_support': 'Returns Support',
      'seller_tools': 'Seller Tools'
    };
    return permissionMap[permission] || permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getBadgeIcon(badge: string): string {
    const iconMap: Record<string, string> = {
      'blue': '🔵',
      'green': '🟢',
      'none': '⚪'
    };
    return iconMap[badge] || '⚪';
  }

  getBadgeColor(badge: string): string {
    const colorMap: Record<string, string> = {
      'blue': '#3B82F6',
      'green': '#10B981',
      'none': '#9CA3AF'
    };
    return colorMap[badge] || '#9CA3AF';
  }

  getProgressColor(percentage: number): string {
    if (percentage >= 100) return '#10B981'; // green
    if (percentage >= 75) return '#3B82F6';  // blue  
    if (percentage >= 50) return '#F59E0B';  // yellow
    if (percentage >= 25) return '#F97316';  // orange
    return '#EF4444'; // red
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getNextStepGuidance(currentStep?: string, category?: string): string {
    if (!currentStep) return "Complete your profile setup to get started!";
    
    const guidanceMap: Record<string, string> = {
      'create_account': 'Verify your email and phone number to continue.',
      'email_phone_verify': 'Set up two-factor authentication for enhanced security.',
      'enable_2fa': category === 'seller_brand' ? 'Complete your business profile information.' : 'Set up your basic profile information.',
      'business_profile_setup': 'Submit your KYB documents for verification.',
      'kyb_submission': 'Verify your bank account for payments.',
      'bank_account_verification': 'Submit your tax identification documents.',
      'tax_ids_submission': 'Upload your brand assets and logos.',
      'brand_assets_upload': 'Review and accept our terms and policies.',
      'profile_basics': 'Verify your payment method to complete setup.',
      'payment_method_verification': 'Congratulations! Your onboarding is complete.'
    };
    
    return guidanceMap[currentStep] || 'Continue with the onboarding process.';
  }
}

export const proceduresByCategoryService = new ProceduresByCategoryService();