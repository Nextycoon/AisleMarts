import { client } from '../api/client';

export interface WorkflowState {
  value: string;
  label: string;
}

export interface ApprovalLevel {
  value: string;
  label: string;
}

export interface PriorityLevel {
  value: string;
  label: string;
}

export interface ReviewerRole {
  value: string;
  label: string;
}

export interface DocumentProcedure {
  _id: string;
  document_id: string;
  document_type: string;
  document_title: string;
  current_state: string;
  approval_level_required: string;
  priority: string;
  created_by: string;
  current_assignee?: string;
  reviewer_pool: string[];
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  assigned_at?: string;
  due_date?: string;
  completed_at?: string;
  sla_config: {
    level: string;
    response_time_hours: number;
    completion_time_hours: number;
    escalation_time_hours: number;
    business_hours_only: boolean;
    excluded_days: string[];
  };
  sla_met?: boolean;
  response_time_minutes?: number;
  completion_time_minutes?: number;
  state_history: Array<{
    state: string;
    timestamp: string;
    user_id: string;
    action: string;
    details?: Record<string, any>;
  }>;
  approvals: Array<{
    approval_id: string;
    approver_id: string;
    approver_name: string;
    approver_role: string;
    approval_level: string;
    decision: string;
    timestamp: string;
    comments: string;
    conditions?: string[];
    signature_hash?: string;
  }>;
  comments: Array<{
    comment_id: string;
    user_id: string;
    user_name: string;
    user_role: string;
    comment: string;
    timestamp: string;
    is_internal: boolean;
    attachments: Array<{
      filename: string;
      url: string;
    }>;
  }>;
  escalations: Array<{
    escalation_id: string;
    trigger: string;
    from_level: string;
    to_level: string;
    escalated_by: string;
    escalated_at: string;
    reason: string;
    resolved_at?: string;
    resolution?: string;
  }>;
  risk_score: number;
  compliance_flags: string[];
  regulatory_requirements: string[];
  tags: string[];
  custom_fields: Record<string, any>;
  external_references: Array<{
    system: string;
    id: string;
  }>;
}

export interface CreateProcedureRequest {
  document_id: string;
  document_data: Record<string, any>;
}

export interface ApprovalRequest {
  approver_name: string;
  approver_role: string;
  comments?: string;
  conditions?: string[];
  signature_hash?: string;
}

export interface RejectionRequest {
  reviewer_name: string;
  reviewer_role: string;  
  comments: string;
}

export interface RevisionRequest {
  reviewer_name: string;
  reviewer_role: string;
  comments: string;
  attachments?: Array<{
    filename: string;
    url: string;
  }>;
}

export interface CommentRequest {
  comment: string;
  user_name: string;
  user_role?: string;
  is_internal?: boolean;
  attachments?: Array<{
    filename: string;
    url: string;
  }>;
}

export interface EscalationRequest {
  trigger?: string;
  reason: string;
  escalated_by: string;
}

export interface WorkflowInsightsRequest {
  context?: Record<string, any>;
}

class DocumentationProceduresService {
  private basePath = '/api/doc-procedures';

  // Health Check
  async getHealthCheck() {
    try {
      const response = await client.get(`${this.basePath}/health`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Procedure Management
  async createDocumentProcedure(procedureData: CreateProcedureRequest) {
    try {
      const response = await client.post(`${this.basePath}/create`, procedureData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  async getDocumentProcedure(procedureId: string) {
    try {
      const response = await client.get(`${this.basePath}/${procedureId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  async submitForReview(procedureId: string) {
    try {
      const response = await client.post(`${this.basePath}/${procedureId}/submit`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  // Approval Workflow
  async approveDocument(procedureId: string, approvalData: ApprovalRequest) {
    try {
      const response = await client.post(`${this.basePath}/${procedureId}/approve`, approvalData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  async rejectDocument(procedureId: string, rejectionData: RejectionRequest) {
    try {
      const response = await client.post(`${this.basePath}/${procedureId}/reject`, rejectionData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  async requestRevision(procedureId: string, revisionData: RevisionRequest) {
    try {
      const response = await client.post(`${this.basePath}/${procedureId}/request-revision`, revisionData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  // Comments and Communication
  async addComment(procedureId: string, commentData: CommentRequest) {
    try {
      const response = await client.post(`${this.basePath}/${procedureId}/comment`, commentData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  // Escalation Management
  async escalateProcedure(procedureId: string, escalationData: EscalationRequest) {
    try {
      const response = await client.post(`${this.basePath}/${procedureId}/escalate`, escalationData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  // User Procedures and Reviews
  async getMyProcedures(filters?: {
    state?: string;
    priority?: string;
    overdue_only?: boolean;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.state) params.append('state', filters.state);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.overdue_only) params.append('overdue_only', 'true');

      const response = await client.get(`${this.basePath}/my-procedures?${params}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  async getPendingReviews() {
    try {
      const response = await client.get(`${this.basePath}/pending-reviews`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  // AI Insights and Analytics
  async generateWorkflowInsights(context: Record<string, any> = {}) {
    try {
      const response = await client.post(`${this.basePath}/workflow-insights`, { context });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  async getWorkflowAnalytics(timePeriodDays: number = 30) {
    try {
      const response = await client.get(`${this.basePath}/analytics?time_period_days=${timePeriodDays}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  // Templates and Reference Data
  async getWorkflowTemplates() {
    try {
      const response = await client.get(`${this.basePath}/templates`);
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
  getStateDisplayName(state: string): string {
    const stateMap: Record<string, string> = {
      'draft': 'Draft',
      'pending_review': 'Pending Review',
      'in_review': 'In Review',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'revision_requested': 'Revision Requested',
      'superseded': 'Superseded',
      'archived': 'Archived',
      'suspended': 'Suspended'
    };
    return stateMap[state] || state.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getApprovalLevelDisplayName(level: string): string {
    const levelMap: Record<string, string> = {
      'auto': 'Automatic',
      'peer': 'Peer Review',
      'supervisor': 'Supervisor',
      'manager': 'Manager',
      'compliance': 'Compliance Officer',
      'senior_compliance': 'Senior Compliance',
      'legal': 'Legal Review'
    };
    return levelMap[level] || level.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getPriorityDisplayName(priority: string): string {
    const priorityMap: Record<string, string> = {
      'low': 'Low',
      'normal': 'Normal',
      'high': 'High',
      'urgent': 'Urgent',
      'critical': 'Critical'
    };
    return priorityMap[priority] || priority;
  }

  getReviewerRoleDisplayName(role: string): string {
    const roleMap: Record<string, string> = {
      'compliance_officer': 'Compliance Officer',
      'senior_compliance': 'Senior Compliance',
      'legal_counsel': 'Legal Counsel',
      'operations_manager': 'Operations Manager',
      'trade_specialist': 'Trade Specialist',
      'customs_expert': 'Customs Expert',
      'tax_advisor': 'Tax Advisor'
    };
    return roleMap[role] || role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getStateColor(state: string): string {
    const colorMap: Record<string, string> = {
      'draft': '#6B7280',
      'pending_review': '#3B82F6',
      'in_review': '#8B5CF6',
      'approved': '#10B981',
      'rejected': '#EF4444',
      'revision_requested': '#F59E0B',
      'superseded': '#9CA3AF',
      'archived': '#6B7280',
      'suspended': '#F97316'
    };
    return colorMap[state] || '#6B7280';
  }

  getPriorityColor(priority: string): string {
    const colorMap: Record<string, string> = {
      'low': '#6B7280',
      'normal': '#3B82F6',
      'high': '#F59E0B',
      'urgent': '#F97316',
      'critical': '#EF4444'
    };
    return colorMap[priority] || '#6B7280';
  }

  getStateIcon(state: string): string {
    const iconMap: Record<string, string> = {
      'draft': '📝',
      'pending_review': '⏳',
      'in_review': '🔍',
      'approved': '✅',
      'rejected': '❌',
      'revision_requested': '🔄',
      'superseded': '📋',
      'archived': '📦',
      'suspended': '⏸️'
    };
    return iconMap[state] || '📄';
  }

  getPriorityIcon(priority: string): string {
    const iconMap: Record<string, string> = {
      'low': '🟢',
      'normal': '🔵',
      'high': '🟡',
      'urgent': '🟠',
      'critical': '🔴'
    };
    return iconMap[priority] || '⚪';
  }

  getRiskScoreColor(score: number): string {
    if (score >= 0.8) return '#EF4444'; // red - high risk
    if (score >= 0.6) return '#F59E0B'; // yellow - medium-high risk
    if (score >= 0.4) return '#3B82F6'; // blue - medium risk
    if (score >= 0.2) return '#10B981'; // green - low-medium risk
    return '#6B7280'; // gray - low risk
  }

  getRiskScoreLabel(score: number): string {
    if (score >= 0.8) return 'High Risk';
    if (score >= 0.6) return 'Medium-High Risk';
    if (score >= 0.4) return 'Medium Risk';
    if (score >= 0.2) return 'Low-Medium Risk';
    return 'Low Risk';
  }

  getSLAStatus(procedure: DocumentProcedure): {
    status: 'met' | 'warning' | 'exceeded' | 'unknown';
    color: string;
    message: string;
  } {
    if (procedure.sla_met === true) {
      return { status: 'met', color: '#10B981', message: 'SLA Met' };
    }
    
    if (procedure.sla_met === false) {
      return { status: 'exceeded', color: '#EF4444', message: 'SLA Exceeded' };
    }

    if (procedure.due_date) {
      const now = new Date();
      const dueDate = new Date(procedure.due_date);
      const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursUntilDue < 0) {
        return { status: 'exceeded', color: '#EF4444', message: 'Overdue' };
      } else if (hoursUntilDue < 8) {
        return { status: 'warning', color: '#F59E0B', message: 'Due Soon' };
      }
    }

    return { status: 'unknown', color: '#6B7280', message: 'In Progress' };
  }

  formatDueDate(dueDateString?: string): string {
    if (!dueDateString) return 'No due date';
    
    const dueDate = new Date(dueDateString);
    const now = new Date();
    const diffMs = dueDate.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs < 0) {
      const overdueDays = Math.abs(diffDays);
      return `Overdue by ${overdueDays} day${overdueDays !== 1 ? 's' : ''}`;
    }

    if (diffHours < 24) {
      return `Due in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    }

    return `Due in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
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

  formatDuration(minutes?: number): string {
    if (!minutes) return 'N/A';
    
    if (minutes < 60) {
      return `${minutes}m`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours < 24) {
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
    
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  }
}

export const documentationProceduresService = new DocumentationProceduresService();