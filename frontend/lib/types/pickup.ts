/**
 * Phase 3 Week 3: Pickup Windows & Advanced Reservations - TypeScript Types
 * Shared types for pickup functionality
 */

export type PickupWindow = {
  id: string;
  location_id: string;
  date: string;          // YYYY-MM-DD
  time_slot: {
    start_time: string;  // HH:mm  
    end_time: string;    // HH:mm
  };
  capacity: number;
  reserved: number;
  status: 'active' | 'inactive' | 'full';
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type ReservationItem = {
  sku: string;
  qty: number;
  location_id: string;
  unit_price?: number;
};

export type Reservation = {
  reservation_id: string;
  reference: string;
  user_id: string;
  items: ReservationItem[];
  status: 'held' | 'scheduled' | 'confirmed' | 'partial_pickup' | 'completed' | 'cancelled' | 'expired';
  hold_expires_at?: string;   // ISO
  pickup_window_id?: string;
  pickup_code?: string;       // 6-digit code
  pickup_window?: PickupWindow;
  total_amount?: number;
  currency: string;
  created_at: string;
  
  // Advanced features
  extension_history?: ExtensionRecord[];
  modification_history?: ModificationRecord[];
  pickup_summary?: PickupSummary;
  audit?: AuditEntry[];
};

export type ExtensionRecord = {
  extended_at: string;
  extension_minutes: number;
  reason?: string;
  new_expiry: string;
};

export type ModificationRecord = {
  modified_at: string;
  changes: Record<string, string>;
};

export type PickupSummary = {
  fully_picked_up: any[];
  partially_picked_up: any[];
  remaining_items: any[];
};

export type AuditEntry = {
  at: string;
  event: string;
  by: string;
  comment: string;
};

export type PartialPickupItem = {
  sku: string;
  requested_qty: number;
  picked_up_qty: number;
  reason_for_shortage?: string;
};

export type ReservationScheduleResponse = {
  reservation_id: string;
  pickup_window_id: string;
  scheduled_slot: {
    date: string;
    time_slot: {
      start_time: string;
      end_time: string;
    };
    location_id: string;
  };
  confirmation_code: string;
  estimated_wait_time_minutes?: number;
};

export type PickupWindowsResponse = {
  location_id: string;
  date: string;
  windows: PickupWindow[];
  total_capacity: number;
  available_capacity: number;
  next_available_slot?: {
    window_id: string;
    time_slot: {
      start_time: string;
      end_time: string;
    };
    available_spots: number;
  };
};