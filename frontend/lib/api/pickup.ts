/**
 * Phase 3 Week 3: Pickup Windows & Advanced Reservations - API Client
 * API client functions for pickup operations
 */

import Constants from 'expo-constants';
import { 
  PickupWindow, 
  Reservation, 
  PickupWindowsResponse, 
  ReservationScheduleResponse,
  PartialPickupItem 
} from '../types/pickup';

const API_BASE = Constants.expoConfig?.extra?.BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

// Helper for authenticated requests
const makeRequest = async (method: string, endpoint: string, data?: any, params?: Record<string, string>) => {
  const url = new URL(`${API_BASE}${endpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      // TODO: Add authorization header when user auth is available
      // 'Authorization': `Bearer ${token}`
    },
  };

  if (data && (method === 'POST' || method === 'PATCH')) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url.toString(), config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`);
  }

  return response.json();
};

// Pickup Windows API
export async function getPickupWindows(
  locationId: string, 
  date: string, 
  minCapacity: number = 1
): Promise<PickupWindowsResponse> {
  return makeRequest('GET', '/api/v1/pickup/windows', undefined, {
    location_id: locationId,
    date,
    min_capacity: minCapacity.toString()
  });
}

export async function createPickupWindows(data: {
  location_id: string;
  date: string;
  time_slots: Array<{ start_time: string; end_time: string }>;
  capacity_per_slot: number;
  notes?: string;
}): Promise<PickupWindow[]> {
  return makeRequest('POST', '/api/v1/pickup/windows', data);
}

export async function updatePickupWindow(
  windowId: string,
  data: { capacity?: number; status?: string; notes?: string }
): Promise<PickupWindow> {
  return makeRequest('PATCH', `/api/v1/pickup/windows/${windowId}`, data);
}

// Reservation Scheduling API
export async function scheduleReservation(
  reservationId: string, 
  pickupWindowId: string
): Promise<ReservationScheduleResponse> {
  return makeRequest('POST', `/api/v1/pickup/reservations/${reservationId}/schedule`, undefined, {
    pickup_window_id: pickupWindowId
  });
}

export async function getReservationStatus(reservationId: string): Promise<Reservation> {
  return makeRequest('GET', `/api/v1/pickup/reservations/${reservationId}/status`);
}

// Advanced Reservation Management
export async function extendReservation(
  reservationId: string,
  extensionMinutes: number = 30,
  reason?: string
): Promise<{ 
  reservation_id: string; 
  new_expiry: string; 
  extension_minutes: number; 
  extensions_remaining: number 
}> {
  return makeRequest('POST', `/api/v1/pickup/reservations/${reservationId}/extend`, {
    extension_minutes: extensionMinutes,
    reason
  });
}

export async function modifyReservation(
  reservationId: string,
  modifications: {
    items?: Array<{ sku: string; qty: number; location_id: string }>;
    pickup_window_id?: string;
    notes?: string;
  }
): Promise<{
  reservation_id: string;
  modifications_applied: Record<string, string>;
  updated_at: string;
}> {
  return makeRequest('PATCH', `/api/v1/pickup/reservations/${reservationId}/modify`, modifications);
}

export async function processPartialPickup(
  reservationId: string,
  items: PartialPickupItem[],
  pickupNotes?: string,
  completionStatus: 'partial' | 'complete' = 'partial'
): Promise<{
  reservation_id: string;
  pickup_status: string;
  pickup_summary: {
    fully_picked_up: any[];
    partially_picked_up: any[];
    remaining_items: any[];
  };
  has_remaining_items: boolean;
}> {
  return makeRequest('POST', `/api/v1/pickup/reservations/${reservationId}/partial-pickup`, {
    items,
    pickup_notes: pickupNotes,
    completion_status: completionStatus
  });
}

export async function cancelReservation(
  reservationId: string,
  reason: 'customer_request' | 'out_of_stock' | 'location_closed' | 'other' = 'customer_request',
  notes?: string,
  refundRequested: boolean = false
): Promise<{
  reservation_id: string;
  status: string;
  refund_requested: boolean;
  cancelled_at: string;
}> {
  return makeRequest('POST', `/api/v1/pickup/reservations/${reservationId}/cancel`, {
    reason,
    notes,
    refund_requested: refundRequested
  });
}

// Analytics & Monitoring
export async function getWindowAnalytics(
  locationId: string,
  startDate: string,
  endDate: string
): Promise<{
  location_id: string;
  date_range: { start: string; end: string };
  total_windows_created: number;
  total_capacity_offered: number;
  total_reservations_made: number;
  utilization_rate: number;
  popular_slots: Array<{ slot: string; bookings: number; utilization: number }>;
  avg_window_utilization: number;
}> {
  return makeRequest('GET', '/api/v1/pickup/analytics/windows', undefined, {
    location_id: locationId,
    start_date: startDate,
    end_date: endDate
  });
}

export async function getReservationAnalytics(
  startDate: string,
  endDate: string,
  locationId?: string
): Promise<{
  location_id?: string;
  date_range: { start: string; end: string };
  total_reservations: number;
  confirmed_reservations: number;
  cancelled_reservations: number;
  expired_reservations: number;
  completed_pickups: number;
  successful_pickup_rate: number;
  status_breakdown: Record<string, number>;
}> {
  const params: Record<string, string> = {
    start_date: startDate,
    end_date: endDate
  };
  
  if (locationId) {
    params.location_id = locationId;
  }

  return makeRequest('GET', '/api/v1/pickup/analytics/reservations', undefined, params);
}

// Health & Status
export async function getPickupSystemHealth(): Promise<{
  status: string;
  active_windows: number;
  recent_reservations_24h: number;
  pending_pickups: number;
  overdue_reservations: number;
  features: Record<string, boolean>;
  recommendations: (string | null)[];
}> {
  return makeRequest('GET', '/api/v1/pickup/health');
}

// Utility functions
export function formatTimeSlot(timeSlot: { start_time: string; end_time: string }): string {
  return `${timeSlot.start_time}–${timeSlot.end_time}`;
}

export function formatPickupDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
}

export function getAvailableCapacity(window: PickupWindow): number {
  return Math.max(0, window.capacity - window.reserved);
}

export function isWindowAvailable(window: PickupWindow, minCapacity: number = 1): boolean {
  return window.status === 'active' && getAvailableCapacity(window) >= minCapacity;
}

export function formatReservationStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'held': 'Reserved',
    'scheduled': 'Scheduled',
    'confirmed': 'Confirmed',
    'partial_pickup': 'Partially Picked Up',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'expired': 'Expired'
  };
  return statusMap[status] || status;
}

export function canExtendReservation(reservation: Reservation): boolean {
  if (reservation.status !== 'held' && reservation.status !== 'scheduled') {
    return false;
  }
  
  const extensionCount = reservation.extension_history?.length || 0;
  return extensionCount < 2; // Max 2 extensions allowed
}

export function getTimeUntilExpiry(expiresAt: string): string {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();
  
  if (diff <= 0) {
    return 'Expired';
  }
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m remaining`;
  } else {
    return `${minutes}m remaining`;
  }
}