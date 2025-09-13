import apiClient from './client';

// AI User Agents Service
export interface CreateAgentConfigRequest {
  agent_role: 'buyer_agent' | 'brand_agent';
  tasks_enabled: string[];
  priority_rules: ('speed' | 'cost' | 'sustainability' | 'reliability')[];
  interest_tags: string[];
  agent_style: 'formal' | 'concise' | 'friendly' | 'data_driven';
  default_mode: 'manual' | 'semi_auto' | 'auto';
  spend_limits: Record<string, number>;
  learning_enabled?: boolean;
  privacy_mode?: boolean;
}

export interface UpdateAgentConfigRequest {
  tasks_enabled?: string[];
  priority_rules?: ('speed' | 'cost' | 'sustainability' | 'reliability')[];
  interest_tags?: string[];
  agent_style?: 'formal' | 'concise' | 'friendly' | 'data_driven';
  default_mode?: 'manual' | 'semi_auto' | 'auto';
  spend_limits?: Record<string, number>;
  learning_enabled?: boolean;
  privacy_mode?: boolean;
}

export interface CreateTaskRequest {
  task_type: string;
  task_name: string;
  description: string;
  mode: 'manual' | 'semi_auto' | 'auto';
  parameters: Record<string, any>;
  budget_limit?: number;
  deadline?: string;
}

export interface TaskActionRequest {
  task_id: string;
  action: 'approve' | 'reject' | 'cancel' | 'retry';
  feedback?: string;
}

export interface ShoppingTaskRequest {
  cart_id: string;
  payment_pref: 'auto' | 'manual_select';
  address_id: string;
  max_budget?: number;
}

export interface LogisticsEstimateRequest {
  items: any[];
  origin?: string;
  destination: string;
  incoterm?: string;
}

export interface DocumentGenerationRequest {
  flow: 'export' | 'import';
  items: {
    sku: string;
    desc: string;
    hs?: string;
    value: number;
    qty: number;
    origin: string;
  }[];
  incoterm: string;
  destination: string;
}

export interface AgentConfiguration {
  _id: string;
  user_id: string;
  agent_role: string;
  tasks_enabled: string[];
  priority_rules: string[];
  interest_tags: string[];
  agent_style: string;
  default_mode: string;
  spend_limits: Record<string, number>;
  learning_enabled: boolean;
  privacy_mode: boolean;
  created_at: string;
  updated_at: string;
}

export interface AgentTask {
  _id: string;
  user_id: string;
  agent_id: string;
  task_type: string;
  task_name: string;
  description: string;
  status: string;
  delegation_mode: string;
  requires_approval: boolean;
  output_data?: any;
  execution_log: any[];
  created_at: string;
  estimated_cost?: number;
  actual_cost?: number;
}

class AIUserAgentsService {
  async createAgentConfiguration(request: CreateAgentConfigRequest) {
    try {
      const response = await apiClient.post('/agents/config/create', request);
      return response.data;
    } catch (error) {
      console.error('Error creating agent configuration:', error);
      throw error;
    }
  }

  async getAgentConfiguration() {
    try {
      const response = await apiClient.get('/agents/config');
      return response.data;
    } catch (error) {
      console.error('Error getting agent configuration:', error);
      throw error;
    }
  }

  async updateAgentConfiguration(request: UpdateAgentConfigRequest) {
    try {
      const response = await apiClient.put('/agents/config/update', request);
      return response.data;
    } catch (error) {
      console.error('Error updating agent configuration:', error);
      throw error;
    }
  }

  async createTask(request: CreateTaskRequest) {
    try {
      const response = await apiClient.post('/agents/tasks/create', request);
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async getUserTasks(status?: string, limit: number = 50) {
    try {
      const params = { limit, ...(status && { status }) };
      const response = await apiClient.get('/agents/tasks', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting user tasks:', error);
      throw error;
    }
  }

  async getTaskDetails(taskId: string) {
    try {
      const response = await apiClient.get(`/agents/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting task details:', error);
      throw error;
    }
  }

  async performTaskAction(request: TaskActionRequest) {
    try {
      const response = await apiClient.post('/agents/tasks/action', request);
      return response.data;
    } catch (error) {
      console.error('Error performing task action:', error);
      throw error;
    }
  }

  async executeShoppingTask(request: ShoppingTaskRequest) {
    try {
      const response = await apiClient.post('/agents/tasks/shopping', request);
      return response.data;
    } catch (error) {
      console.error('Error executing shopping task:', error);
      throw error;
    }
  }

  async getLogisticsEstimate(request: LogisticsEstimateRequest) {
    try {
      const response = await apiClient.post('/agents/tasks/logistics-estimate', request);
      return response.data;
    } catch (error) {
      console.error('Error getting logistics estimate:', error);
      throw error;
    }
  }

  async generateDocuments(request: DocumentGenerationRequest) {
    try {
      const response = await apiClient.post('/agents/tasks/document-generation', request);
      return response.data;
    } catch (error) {
      console.error('Error generating documents:', error);
      throw error;
    }
  }

  async getAgentAnalytics() {
    try {
      const response = await apiClient.get('/agents/analytics');
      return response.data;
    } catch (error) {
      console.error('Error getting agent analytics:', error);
      throw error;
    }
  }

  async getCapabilities() {
    try {
      const response = await apiClient.get('/agents/capabilities');
      return response.data;
    } catch (error) {
      console.error('Error getting capabilities:', error);
      throw error;
    }
  }

  async getTemplates() {
    try {
      const response = await apiClient.get('/agents/templates');
      return response.data;
    } catch (error) {
      console.error('Error getting templates:', error);
      throw error;
    }
  }

  async simulateAction(taskType: string, parameters: Record<string, any>) {
    try {
      const response = await apiClient.post('/agents/simulate', { task_type: taskType, parameters });
      return response.data;
    } catch (error) {
      console.error('Error simulating action:', error);
      throw error;
    }
  }
}

export const aiUserAgentsService = new AIUserAgentsService();