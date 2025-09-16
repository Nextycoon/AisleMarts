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
    // Add a maximum timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.log('AuthContext: Forcing loading to complete after timeout');
      setLoading(false);
    }, 5000); // 5 second max loading time

    loadStoredAuth().finally(() => {
      clearTimeout(loadingTimeout);
    });

    return () => clearTimeout(loadingTimeout);
  }, []);

  const loadStoredAuth = async () => {
    try {
      // Quick check for avatar setup without blocking
      const storedRole = await AsyncStorage.getItem('userRole');
      const storedSetup = await AsyncStorage.getItem('isAvatarSetup');
      const hasSetup = !!(storedRole || storedSetup === 'true');
      
      console.log('AuthContext: Loaded avatar setup status:', hasSetup);
      setHasCompletedAvatarSetup(hasSetup);
      
      // Skip token verification for now to avoid blocking
      console.log('AuthContext: Skipping token verification to avoid blocking');
      
    } catch (error) {
      console.log('Failed to load stored auth:', error);
      // Default to no avatar setup (show avatar screen)
      setHasCompletedAvatarSetup(false);
    } finally {
      console.log('AuthContext: Loading complete');
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