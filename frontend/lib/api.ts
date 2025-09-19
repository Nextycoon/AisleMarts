// API helpers for Phase 2 Luxury Communication Suite

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

// Generic API helper
async function apiRequest(method: string, endpoint: string, data?: any, headers?: any) {
  try {
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Request failed: ${method} ${endpoint}`, error);
    throw error;
  }
}

const GET = (endpoint: string, headers?: any) => apiRequest('GET', endpoint, undefined, headers);
const POST = (endpoint: string, data: any, headers?: any) => apiRequest('POST', endpoint, data, headers);
const PATCH = (endpoint: string, data: any, headers?: any) => apiRequest('PATCH', endpoint, data, headers);
const DELETE = (endpoint: string, headers?: any) => apiRequest('DELETE', endpoint, undefined, headers);

// ===================
// CALLS API
// ===================
export const CallsAPI = {
  initiate: (data: any) => POST('/api/calls/initiate', data),
  answer: (data: any) => POST('/api/calls/answer', data),
  decline: (data: any) => POST('/api/calls/decline', data),
  end: (data: any) => POST('/api/calls/end', data),
  sendICECandidate: (data: any) => POST('/api/calls/ice-candidate', data),
  getHistory: () => GET('/api/calls/history'),
  getActive: () => GET('/api/calls/active'),
};

// ===================
// CHANNELS API
// ===================
export const ChannelsAPI = {
  list: (type?: string) => GET(`/api/channels${type ? `?channel_type=${type}` : ''}`),
  create: (data: any) => POST('/api/channels', data),
  get: (id: string) => GET(`/api/channels/${id}`),
  join: (id: string, data: any = {}) => POST(`/api/channels/${id}/join`, data),
  update: (id: string, data: any) => PATCH(`/api/channels/${id}`, data),
  
  // Messages
  getMessages: (id: string, limit?: number, before?: string) => 
    GET(`/api/channels/${id}/messages${limit ? `?limit=${limit}` : ''}${before ? `&before=${before}` : ''}`),
  postMessage: (id: string, data: any) => POST(`/api/channels/${id}/messages`, data),
  
  // Moderation
  pinMessage: (id: string, messageId: string) => POST(`/api/channels/${id}/pin`, { message_id: messageId }),
  
  // Invites
  createInvite: (id: string, expiresHours?: number, maxUses?: number) => 
    POST(`/api/channels/${id}/invite`, { expires_hours: expiresHours, max_uses: maxUses }),
  inviteMembers: (id: string, userIds: string[], role?: string) => 
    POST(`/api/channels/${id}/members`, { user_ids: userIds, role }),
};

// ===================
// LIVESALE API
// ===================
export const LiveSaleAPI = {
  // Consumer endpoints
  list: (status?: string) => GET(`/api/livesale${status ? `?status=${status}` : ''}`),
  get: (id: string) => GET(`/api/livesale/${id}`),
  join: (id: string) => POST(`/api/livesale/${id}/join`, {}),
  leave: (id: string) => POST(`/api/livesale/${id}/leave`, {}),
  purchase: (id: string, data: any) => POST(`/api/livesale/${id}/purchase`, data),
  share: (id: string, data: any) => POST(`/api/livesale/${id}/share`, data),
  getActive: () => GET('/api/livesale/active/all'),

  // Business endpoints
  Business: {
    create: (data: any) => POST('/api/biz/livesales', data),
    list: () => GET('/api/biz/livesales'),
    update: (id: string, data: any) => PATCH(`/api/biz/livesales/${id}`, data),
    start: (id: string, streamUrl: string) => POST(`/api/biz/livesales/${id}/start`, { stream_url: streamUrl }),
    getAnalytics: (id: string) => GET(`/api/biz/livesales/${id}/analytics`),
  },
};

// ===================
// LEADS API
// ===================
export const LeadsAPI = {
  list: (stage?: string, assignedTo?: string, limit?: number) => {
    const params = new URLSearchParams();
    if (stage) params.append('stage', stage);
    if (assignedTo) params.append('assigned_to', assignedTo);
    if (limit) params.append('limit', limit.toString());
    return GET(`/api/biz/leads${params.toString() ? '?' + params.toString() : ''}`);
  },
  
  get: (id: string) => GET(`/api/biz/leads/${id}`),
  update: (id: string, data: any) => PATCH(`/api/biz/leads/${id}`, data),
  
  // Notes
  addNote: (id: string, data: any) => POST(`/api/biz/leads/${id}/notes`, data),
  
  // Actions
  initiateCall: (id: string) => POST(`/api/biz/leads/${id}/call`, {}),
  jumpToDM: (id: string) => POST(`/api/biz/leads/${id}/dm`, {}),
  createOffer: (id: string, data: any) => POST(`/api/biz/leads/${id}/offer`, data),
  
  // Analytics
  getAnalytics: () => GET('/api/biz/leads/analytics'),
  
  // Kanban
  getKanbanSummary: () => GET('/api/biz/leads/kanban/summary'),
  moveStage: (leadId: string, newStage: string) => 
    POST('/api/biz/leads/kanban/move', { lead_id: leadId, new_stage: newStage }),
};

// ===================
// EXISTING DM API (Phase 1)
// ===================
export const DMAPI = {
  getConversations: () => GET('/api/dm/conversations'),
  getConversation: (id: string) => GET(`/api/dm/conversations/${id}`),
  createConversation: (data: any) => POST('/api/dm/conversations', data),
  getMessages: (id: string, limit?: number, before?: string) => 
    GET(`/api/dm/conversations/${id}/messages${limit ? `?limit=${limit}` : ''}${before ? `&before=${before}` : ''}`),
  sendMessage: (data: any) => POST('/api/dm/messages', data),
  sendTyping: (data: any) => POST('/api/dm/typing', data),
  markRead: (data: any) => POST('/api/dm/receipts', data),
};

// ===================
// AUTH HELPERS
// ===================
export const AuthAPI = {
  login: (email: string, password: string) => POST('/api/auth/login', { email, password }),
  register: (email: string, password: string, role?: string) => 
    POST('/api/auth/register', { email, password, role }),
  getProfile: () => GET('/api/auth/me'),
};

// Error handling wrapper
export const withErrorHandling = async <T>(apiCall: () => Promise<T>): Promise<T | null> => {
  try {
    return await apiCall();
  } catch (error) {
    console.error('API call failed:', error);
    // You could add toast notifications here
    return null;
  }
};