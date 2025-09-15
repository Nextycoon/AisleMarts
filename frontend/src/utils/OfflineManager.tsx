import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { theme } from '../theme/theme';

interface OfflineContextType {
  isOnline: boolean;
  isConnected: boolean;
  networkType: string | null;
  queueOperation: (operation: QueuedOperation) => void;
  getQueuedOperations: () => QueuedOperation[];
  clearQueue: () => void;
  retryQueue: () => Promise<void>;
}

interface QueuedOperation {
  id: string;
  type: 'ai_query' | 'cart_update' | 'order_status' | 'analytics_event';
  data: any;
  timestamp: number;
  retryCount: number;
}

const OfflineContext = createContext<OfflineContextType | null>(null);

// Offline storage keys
const OFFLINE_CART_KEY = 'offline_cart';
const OFFLINE_QUEUE_KEY = 'offline_queue';
const OFFLINE_PRODUCTS_KEY = 'offline_products';
const OFFLINE_USER_DATA_KEY = 'offline_user_data';

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within OfflineProvider');
  }
  return context;
};

interface OfflineProviderProps {
  children: ReactNode;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [networkType, setNetworkType] = useState<string | null>(null);
  const [queuedOperations, setQueuedOperations] = useState<QueuedOperation[]>([]);

  useEffect(() => {
    // Load queued operations from storage
    loadQueuedOperations();

    // Set up network listener
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
      setIsOnline(state.isInternetReachable ?? false);
      setNetworkType(state.type);

      // If we just came back online, process the queue
      if (state.isConnected && state.isInternetReachable) {
        retryQueue();
      }
    });

    return () => unsubscribe();
  }, []);

  const loadQueuedOperations = async () => {
    try {
      const stored = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      if (stored) {
        setQueuedOperations(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load queued operations:', error);
    }
  };

  const saveQueuedOperations = async (operations: QueuedOperation[]) => {
    try {
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(operations));
    } catch (error) {
      console.error('Failed to save queued operations:', error);
    }
  };

  const queueOperation = (operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'retryCount'>) => {
    const newOperation: QueuedOperation = {
      ...operation,
      id: Date.now().toString(),
      timestamp: Date.now(),
      retryCount: 0
    };

    const updatedQueue = [...queuedOperations, newOperation];
    setQueuedOperations(updatedQueue);
    saveQueuedOperations(updatedQueue);
  };

  const getQueuedOperations = () => queuedOperations;

  const clearQueue = async () => {
    setQueuedOperations([]);
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
  };

  const retryQueue = async () => {
    if (!isOnline || queuedOperations.length === 0) return;

    const successfulOperations: string[] = [];

    for (const operation of queuedOperations) {
      try {
        // Simulate processing different operation types
        await processQueuedOperation(operation);
        successfulOperations.push(operation.id);
      } catch (error) {
        console.error(`Failed to process operation ${operation.id}:`, error);
        
        // Increment retry count
        operation.retryCount += 1;
        
        // Remove operations that have failed too many times
        if (operation.retryCount > 3) {
          successfulOperations.push(operation.id);
        }
      }
    }

    // Remove successful operations from queue
    const remainingOperations = queuedOperations.filter(
      op => !successfulOperations.includes(op.id)
    );
    
    setQueuedOperations(remainingOperations);
    saveQueuedOperations(remainingOperations);
  };

  const processQueuedOperation = async (operation: QueuedOperation) => {
    switch (operation.type) {
      case 'ai_query':
        // Send queued AI query to backend
        console.log('Processing queued AI query:', operation.data);
        break;
      case 'cart_update':
        // Sync cart changes
        console.log('Processing cart update:', operation.data);
        break;
      case 'order_status':
        // Update order status
        console.log('Processing order status update:', operation.data);
        break;
      case 'analytics_event':
        // Send analytics event
        console.log('Processing analytics event:', operation.data);
        break;
    }
  };

  const value: OfflineContextType = {
    isOnline,
    isConnected,
    networkType,
    queueOperation,
    getQueuedOperations,
    clearQueue,
    retryQueue
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
      <OfflineIndicator />
    </OfflineContext.Provider>
  );
};

// Offline indicator banner
const OfflineIndicator: React.FC = () => {
  const { isOnline, isConnected, queuedOperations, retryQueue } = useOffline();

  if (isOnline && isConnected) return null;

  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: '#FF6B6B',
      padding: theme.space.sm,
      zIndex: 1000,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>
          {!isConnected ? '📶 No Connection' : '🌐 Limited Internet'}
        </Text>
        <Text style={{ color: 'white', fontSize: 12, opacity: 0.9 }}>
          {queuedOperations && queuedOperations.length > 0 
            ? `${queuedOperations.length} actions queued`
            : 'Working offline'
          }
        </Text>
      </View>
      
      {isConnected && queuedOperations && queuedOperations.length > 0 && (
        <TouchableOpacity
          onPress={retryQueue}
          style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            paddingHorizontal: theme.space.sm,
            paddingVertical: theme.space.xs,
            borderRadius: theme.radius.sm
          }}
        >
          <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
            RETRY
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Utility functions for offline data management
export class OfflineStorage {
  
  // Cart persistence
  static async saveCart(cartData: any) {
    try {
      await AsyncStorage.setItem(OFFLINE_CART_KEY, JSON.stringify(cartData));
    } catch (error) {
      console.error('Failed to save cart offline:', error);
    }
  }

  static async getCart() {
    try {
      const stored = await AsyncStorage.getItem(OFFLINE_CART_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load offline cart:', error);
      return null;
    }
  }

  // Product cache for offline browsing
  static async cacheProducts(products: any[]) {
    try {
      await AsyncStorage.setItem(OFFLINE_PRODUCTS_KEY, JSON.stringify({
        products,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to cache products:', error);
    }
  }

  static async getCachedProducts(maxAge = 24 * 60 * 60 * 1000) { // 24 hours
    try {
      const stored = await AsyncStorage.getItem(OFFLINE_PRODUCTS_KEY);
      if (!stored) return null;

      const { products, timestamp } = JSON.parse(stored);
      const age = Date.now() - timestamp;
      
      if (age > maxAge) return null; // Cache expired
      
      return products;
    } catch (error) {
      console.error('Failed to load cached products:', error);
      return null;
    }
  }

  // User data persistence
  static async saveUserData(userData: any) {
    try {
      await AsyncStorage.setItem(OFFLINE_USER_DATA_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to save user data offline:', error);
    }
  }

  static async getUserData() {
    try {
      const stored = await AsyncStorage.getItem(OFFLINE_USER_DATA_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load offline user data:', error);
      return null;
    }
  }
}