// /app/frontend/lib/cart.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";

const CART_KEY = "aisle.cart.v1";

export type CartItem = { productId: string; qty: number };

export async function loadLocalCart(): Promise<CartItem[]> {
  try {
    const raw = await AsyncStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Failed to load local cart:', error);
    return [];
  }
}

export async function saveLocalCart(items: CartItem[]) {
  try {
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save local cart:', error);
  }
}

export async function persistCartToServer(items: CartItem[], deviceId: string) {
  try {
    await fetch("http://localhost:8000/api/cart/persist", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-Device-Id": deviceId 
      },
      body: JSON.stringify({ items })
    });
  } catch (error) {
    console.error('Failed to persist cart to server:', error);
  }
}

export async function hydrateCart(deviceId: string): Promise<CartItem[]> {
  try {
    const local = await loadLocalCart();
    await persistCartToServer(local, deviceId);
    
    const response = await fetch("http://localhost:8000/api/cart/current", { 
      headers: { "X-Device-Id": deviceId } 
    });
    const data = await response.json();
    
    const serverItems = data.items ?? [];
    await saveLocalCart(serverItems);
    return serverItems;
  } catch (error) {
    console.error('Failed to hydrate cart:', error);
    return await loadLocalCart();
  }
}