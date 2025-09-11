export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  category_id?: string;
  brand?: string;
  attributes: Record<string, string>;
  stock: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent_id?: string;
  active: boolean;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  roles: string[];
}

export interface Order {
  id: string;
  user_id: string;
  items: OrderItem[];
  subtotal: number;
  currency: string;
  status: 'created' | 'paid' | 'failed' | 'refunded';
  created_at: string;
}

export interface OrderItem {
  product_id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency: string;
}