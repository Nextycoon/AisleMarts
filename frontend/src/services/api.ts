import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { 
  User, 
  Product, 
  Cart, 
  Order, 
  Vendor, 
  ChatSession,
  ShippingAddress,
  APIResponse 
} from '../types';

const BASE_URL = __DEV__ ? 'http://localhost:8000/api' : 'https://your-production-api.com/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, clear storage
          await SecureStore.deleteItemAsync('auth_token');
          await SecureStore.deleteItemAsync('user_data');
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<{ access_token: string; token_type: string }> {
    const response = await this.api.post('/auth/login', { email, password });
    return response.data;
  }

  async register(userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    role?: string;
  }): Promise<{ access_token: string; token_type: string; user_id: string }> {
    const response = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  // Product endpoints
  async getProducts(params?: {
    category?: string;
    status?: string;
    vendor_id?: string;
    search?: string;
    skip?: number;
    limit?: number;
  }): Promise<Product[]> {
    const response = await this.api.get('/products/', { params });
    return response.data;
  }

  async getProduct(productId: string): Promise<Product> {
    const response = await this.api.get(`/products/${productId}`);
    return response.data;
  }

  async createProduct(productData: any): Promise<APIResponse<any>> {
    const response = await this.api.post('/products/', productData);
    return response.data;
  }

  async updateProduct(productId: string, productData: any): Promise<APIResponse<any>> {
    const response = await this.api.put(`/products/${productId}`, productData);
    return response.data;
  }

  async deleteProduct(productId: string): Promise<APIResponse<any>> {
    const response = await this.api.delete(`/products/${productId}`);
    return response.data;
  }

  async getMyProducts(params?: { status?: string; skip?: number; limit?: number }): Promise<Product[]> {
    const response = await this.api.get('/products/my-products', { params });
    return response.data;
  }

  async getProductCategories(): Promise<string[]> {
    const response = await this.api.get('/products/categories/list');
    return response.data;
  }

  async getSearchSuggestions(query: string): Promise<{ suggestions: string[] }> {
    const response = await this.api.get('/products/search/suggestions', { params: { q: query } });
    return response.data;
  }

  // Cart endpoints
  async getCart(): Promise<Cart> {
    const response = await this.api.get('/cart/');
    return response.data;
  }

  async addToCart(productId: string, quantity: number = 1): Promise<APIResponse<any>> {
    const response = await this.api.post('/cart/items', null, {
      params: { product_id: productId, quantity }
    });
    return response.data;
  }

  async updateCartItem(productId: string, quantity: number): Promise<APIResponse<any>> {
    const response = await this.api.put(`/cart/items/${productId}`, null, {
      params: { quantity }
    });
    return response.data;
  }

  async removeFromCart(productId: string): Promise<APIResponse<any>> {
    const response = await this.api.delete(`/cart/items/${productId}`);
    return response.data;
  }

  async clearCart(): Promise<APIResponse<any>> {
    const response = await this.api.delete('/cart/clear');
    return response.data;
  }

  async getCartCount(): Promise<{ count: number }> {
    const response = await this.api.get('/cart/count');
    return response.data;
  }

  // Order endpoints
  async createOrder(shippingAddress: ShippingAddress): Promise<{
    order_id: string;
    order_number: string;
    total_amount: number;
    client_secret?: string;
  }> {
    const response = await this.api.post('/orders/create', shippingAddress);
    return response.data;
  }

  async getOrders(params?: { status?: string; skip?: number; limit?: number }): Promise<Order[]> {
    const response = await this.api.get('/orders/', { params });
    return response.data;
  }

  async getOrder(orderId: string): Promise<Order> {
    const response = await this.api.get(`/orders/${orderId}`);
    return response.data;
  }

  async confirmOrder(orderId: string, paymentIntentId: string): Promise<APIResponse<any>> {
    const response = await this.api.post(`/orders/${orderId}/confirm`, { payment_intent_id: paymentIntentId });
    return response.data;
  }

  async cancelOrder(orderId: string): Promise<APIResponse<any>> {
    const response = await this.api.put(`/orders/${orderId}/cancel`);
    return response.data;
  }

  // Vendor endpoints
  async createVendorProfile(vendorData: any): Promise<APIResponse<any>> {
    const response = await this.api.post('/vendors/', vendorData);
    return response.data;
  }

  async getMyVendorProfile(): Promise<Vendor> {
    const response = await this.api.get('/vendors/me');
    return response.data;
  }

  async updateVendorProfile(vendorData: any): Promise<APIResponse<any>> {
    const response = await this.api.put('/vendors/me', vendorData);
    return response.data;
  }

  async getVendors(params?: { status?: string; skip?: number; limit?: number }): Promise<Vendor[]> {
    const response = await this.api.get('/vendors/', { params });
    return response.data;
  }

  async getVendor(vendorId: string): Promise<Vendor> {
    const response = await this.api.get(`/vendors/${vendorId}`);
    return response.data;
  }

  async getVendorDashboardStats(): Promise<{
    total_products: number;
    active_products: number;
    recent_orders: number;
    vendor_status: string;
  }> {
    const response = await this.api.get('/vendors/dashboard/stats');
    return response.data;
  }

  // AI Concierge endpoints
  async chatWithAI(message: string, sessionId?: string): Promise<{
    response: string;
    session_id: string;
  }> {
    const response = await this.api.post('/ai/chat', null, {
      params: { message, session_id: sessionId }
    });
    return response.data;
  }

  async getChatSessions(): Promise<Array<{
    id: string;
    created_at: string;
    message_count: number;
    last_message: string;
  }>> {
    const response = await this.api.get('/ai/sessions');
    return response.data;
  }

  async getChatSession(sessionId: string): Promise<ChatSession> {
    const response = await this.api.get(`/ai/sessions/${sessionId}`);
    return response.data;
  }

  async deleteChatSession(sessionId: string): Promise<APIResponse<any>> {
    const response = await this.api.delete(`/ai/sessions/${sessionId}`);
    return response.data;
  }

  async getAIRecommendations(params?: {
    query?: string;
    category?: string;
    price_range?: string;
  }): Promise<Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    images: string[];
  }>> {
    const response = await this.api.post('/ai/recommendations', null, { params });
    return response.data;
  }

  async aiSearchAssistant(naturalQuery: string): Promise<{
    ai_interpretation?: string;
    original_query: string;
    search_query?: string;
    suggested_category?: string;
    price_range?: string;
    keywords?: string[];
  }> {
    const response = await this.api.post('/ai/search-assistant', null, {
      params: { natural_query: naturalQuery }
    });
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;