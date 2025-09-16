import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API, setAuth } from '../api/client';

interface User {
  id: string;
  email: string;
  name?: string;
  roles: string[];
  role?: 'buyer' | 'seller' | 'hybrid'; // Avatar role
}

interface AuthContextType {
  user?: User;
  token?: string;
  loading: boolean;
  hasCompletedAvatarSetup: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  checkAvatarSetup: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>();
  const [token, setToken] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [hasCompletedAvatarSetup, setHasCompletedAvatarSetup] = useState(false);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      // First, check avatar setup completion (this doesn't require auth)
      const hasSetup = await checkAvatarSetup();
      
      // For new users without avatar setup, skip token verification to avoid delay
      if (!hasSetup) {
        console.log('New user detected, skipping token verification for fast avatar setup');
        setLoading(false);
        return;
      }
      
      // Only try to load token if we have completed avatar setup
      const storedToken = await AsyncStorage.getItem('auth_token');
      if (storedToken) {
        setAuth(storedToken);
        setToken(storedToken);
        
        try {
          // Verify token by fetching user data (with timeout)
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout
          
          const { data } = await API.get('/auth/me', {
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          
          setUser(data);
        } catch (authError) {
          console.log('Token verification failed or timed out:', authError);
          // Remove invalid token but don't block avatar setup
          await AsyncStorage.removeItem('auth_token');
          setAuth(undefined);
          setToken(undefined);
        }
      }
      
    } catch (error) {
      console.log('Failed to load stored auth:', error);
      await AsyncStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const checkAvatarSetup = async (): Promise<boolean> => {
    try {
      const storedRole = await AsyncStorage.getItem('userRole');
      const storedSetup = await AsyncStorage.getItem('isAvatarSetup');
      const hasSetup = !!(storedRole || storedSetup === 'true');
      setHasCompletedAvatarSetup(hasSetup);
      return hasSetup;
    } catch (error) {
      console.log('Failed to check avatar setup:', error);
      // Default to false (show avatar screen) on error
      setHasCompletedAvatarSetup(false);
      return false;
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    try {
      if (updates.role) {
        // Save role to AsyncStorage
        await AsyncStorage.setItem('userRole', updates.role);
        setHasCompletedAvatarSetup(true);
      }

      // Update user state
      setUser(prev => prev ? { ...prev, ...updates } : undefined);

      // TODO: Send to backend API
      // if (token) {
      //   await API.patch('/auth/me', updates);
      // }
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    const { data } = await API.post('/auth/login', { email, password });
    const newToken = data.access_token;
    
    await AsyncStorage.setItem('auth_token', newToken);
    setAuth(newToken);
    setToken(newToken);
    
    // Fetch user data
    const userResponse = await API.get('/auth/me');
    setUser(userResponse.data);
  };

  const register = async (email: string, password: string, name?: string) => {
    const { data } = await API.post('/auth/register', { email, password, name });
    const newToken = data.access_token;
    
    await AsyncStorage.setItem('auth_token', newToken);
    setAuth(newToken);
    setToken(newToken);
    
    // Fetch user data
    const userResponse = await API.get('/auth/me');
    setUser(userResponse.data);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('userRole');
    setAuth(undefined);
    setToken(undefined);
    setUser(undefined);
    setHasCompletedAvatarSetup(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      hasCompletedAvatarSetup,
      login, 
      register, 
      logout,
      updateUser,
      checkAvatarSetup
    }}>
      {children}
    </AuthContext.Provider>
  );
};