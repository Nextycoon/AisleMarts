import { client } from '../api/client';

export interface DocumentType {
  value: string;
  label: string;
}

export interface DocumentStatus {
  value: string;
  label: string;
}

export interface TradeDocument {
  _id: string;
  document_type: string;
  title: string;
  user_id: string;
  status: string;
  version: string;
  created_at: string;
  updated_at: string;
  parties: Array<{
    name: string;
    address: Record<string, string>;
    country: string;
    role: string;
  }>;
  items: Array<{
    sku: string;
    description: string;
    value: number;
    quantity: number;
    unit_of_measure: string;
    origin_country: string;
  }>;
  totals: Record<string, number>;
  currency: string;
  compliance_checks: Array<{
    check_type: string;
    status: string;
    message: string;
  }>;
  tags: string[];
}

export interface CreateDocumentRequest {
  document_type: string;
  title?: string;
  country?: string;
  currency?: string;
  incoterm?: string;
  parties: Array<Record<string, any>>;
  items: Array<Record<string, any>>;
  terms: Record<string, any>;
  totals: Record<string, any>;
  expires_at?: string;
  tags?: string[];
  notes?: string;
  ai_generated: boolean;
}

export interface AmendDocumentRequest {
  level: 'minor' | 'material' | 'regulated';
  changes: Record<string, any>;
  reason: string;
  verification_completed?: Record<string, boolean>;
}

export interface AIGenerateDocumentRequest {
  document_type: string;
  context: Record<string, any>;
}

class DocumentationComplianceService {
  private basePath = '/api/documents';

  // Health Check
  async getHealthCheck() {
    try {
      const response = await client.get(`${this.basePath}/health`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Document Management
  async createDocument(documentData: CreateDocumentRequest) {
    try {
      const response = await client.post(`${this.basePath}/create`, documentData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  async getUserDocuments(filters?: {
    document_type?: string;
    status?: string;
    limit?: number;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.document_type) params.append('document_type', filters.document_type);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await client.get(`${this.basePath}/list?${params}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  async getDocument(documentId: string) {
    try {
      const response = await client.get(`${this.basePath}/${documentId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  async submitDocument(documentId: string) {
    try {
      const response = await client.post(`${this.basePath}/${documentId}/submit`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  async amendDocument(documentId: string, amendmentData: AmendDocumentRequest) {
    try {
      const response = await client.post(`${this.basePath}/${documentId}/amend`, amendmentData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  // AI Features
  async generateDocumentAI(requestData: AIGenerateDocumentRequest) {
    try {
      const response = await client.post(`${this.basePath}/generate-ai`, requestData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  // Templates and References
  async getDocumentTemplates() {
    try {
      const response = await client.get(`${this.basePath}/templates/list`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  async getComplianceStandards() {
    try {
      const response = await client.get(`${this.basePath}/compliance/standards`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  async getDocumentTypes() {
    try {
      const response = await client.get(`${this.basePath}/types`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  // Helper Methods
  getDocumentTypeDisplayName(type: string): string {
    const typeMap: Record<string, string> = {
      'commercial_invoice': 'Commercial Invoice',
      'packing_list': 'Packing List',
      'certificate_of_origin': 'Certificate of Origin',
      'customs_declaration': 'Customs Declaration',
      'export_license': 'Export License',
      'insurance_certificate': 'Insurance Certificate',
      'bill_of_lading': 'Bill of Lading',
      'air_waybill': 'Air Waybill',
      'compliance_certificate': 'Compliance Certificate',
      'tax_registration': 'Tax Registration',
      'bank_letter': 'Bank Letter',
      'brand_authorization': 'Brand Authorization',
      'proforma_invoice': 'Proforma Invoice',
      'order_confirmation': 'Order Confirmation',
      'return_authorization': 'Return Authorization',
      'warranty_receipt': 'Warranty Receipt'
    };
    return typeMap[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getStatusDisplayName(status: string): string {
    const statusMap: Record<string, string> = {
      'draft': 'Draft',
      'submitted': 'Submitted',
      'auto_validated': 'Auto Validated',
      'needs_revision': 'Needs Revision',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'superseded': 'Superseded',
      'archived': 'Archived'
    };
    return statusMap[status] || status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      'draft': '#6B7280',
      'submitted': '#3B82F6', 
      'auto_validated': '#8B5CF6',
      'needs_revision': '#F59E0B',
      'approved': '#10B981',
      'rejected': '#EF4444',
      'superseded': '#9CA3AF',
      'archived': '#6B7280'
    };
    return colorMap[status] || '#6B7280';
  }

  getComplianceCheckIcon(status: string): string {
    const iconMap: Record<string, string> = {
      'pass': '✅',
      'fail': '❌',
      'warning': '⚠️'
    };
    return iconMap[status] || '❓';
  }

  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

export const documentationComplianceService = new DocumentationComplianceService();