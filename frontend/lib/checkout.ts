// /app/frontend/lib/checkout.ts
import * as Application from 'expo-application';
import { loadLocalCart } from './cart';

export interface CheckoutItem {
  productId: string;
  name: string;
  qty: number;
  price: number; // in cents
  currency: string;
  image?: string;
}

export async function getCartForCheckout() {
  const deviceId = Application.androidId ?? Application.applicationId ?? 'web-demo';
  const cartItems = await loadLocalCart();
  
  // Transform cart items to checkout format
  const items: CheckoutItem[] = cartItems.map(item => ({
    productId: item.productId,
    name: `Product ${item.productId}`, // In production, get from product details
    qty: item.qty,
    price: 12999, // Mock price in cents - in production, get from product API
    currency: 'usd',
    image: 'https://picsum.photos/100/100'
  }));
  
  return {
    deviceId,
    items,
    email: 'demo@aislemarts.com'
  };
}