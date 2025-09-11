import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CartItem {
  product_id: string;
  title: string;
  price: number;
  currency: string;
  quantity: number;
  image?: string;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  loading: boolean;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    saveCart();
  }, [items]);

  const loadCart = async () => {
    try {
      const stored = await AsyncStorage.getItem('cart_items');
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (error) {
      console.log('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCart = async () => {
    try {
      await AsyncStorage.setItem('cart_items', JSON.stringify(items));
    } catch (error) {
      console.log('Failed to save cart:', error);
    }
  };

  const addItem = (newItem: CartItem) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(item => item.product_id === newItem.product_id);
      
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + newItem.quantity
        };
        return updated;
      } else {
        return [...prev, newItem];
      }
    });
  };

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(item => item.product_id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    
    setItems(prev => prev.map(item => 
      item.product_id === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      items,
      itemCount,
      totalAmount,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      loading
    }}>
      {children}
    </CartContext.Provider>
  );
};