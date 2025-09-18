import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API, setAuth } from '../api/client';

interface User {
  id: string;
  email: string;
  name?: string;
  roles: string[];
  role?: 'shopper'; // Avatar role - only shopper supported
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
  setupAvatar: (role: 'buyer' | 'seller' | 'hybrid') => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>();
  const [token, setToken] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [hasCompletedAvatarSetup, setHasCompletedAvatarSetup] = useState(false);

  useEffect(() => {
    // Quick initialization with timeout failsafe
    const initTimeout = setTimeout(() => {
      console.log('⏰ AuthContext: Initialization timeout, forcing completion');
      setLoading(false);
    }, 3000); // 3 second maximum loading time

    loadStoredAuth().finally(() => {
      clearTimeout(initTimeout);
    });

    return () => clearTimeout(initTimeout);
  }, []);

  const loadStoredAuth = async () => {
    try {
      console.log('🔄 AuthContext: Starting initialization...');
      
      // Quick check for avatar setup
      const storedRole = await AsyncStorage.getItem('userRole');
      const storedSetup = await AsyncStorage.getItem('isAvatarSetup');
      const hasSetup = !!(storedRole || storedSetup === 'true');
      
      console.log('✅ AuthContext: Avatar setup status:', hasSetup);
      setHasCompletedAvatarSetup(hasSetup);
      
      // Try to load stored auth data (non-blocking)
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');
        
        if (storedToken && storedUser) {
          const userData = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(userData);
          setAuth(storedToken);
          console.log('✅ AuthContext: Restored user session');
        }
      } catch (authError) {
        console.log('⚠️ AuthContext: Could not restore session:', authError);
        // Continue without auth - this is not critical for app initialization
      }
      
      console.log('✅ AuthContext: Initialization complete');
      
    } catch (error) {
      console.log('⚠️ AuthContext: Error during initialization:', error);
      // Default to no avatar setup (show avatar screen)
      setHasCompletedAvatarSetup(false);
    } finally {
      console.log('🎯 AuthContext: Setting loading to false');
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await API.post('/users/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);
      setAuth(newToken);
      
      // Store auth data
      await AsyncStorage.setItem('token', newToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      console.log('✅ Login successful');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    try {
      const response = await API.post('/users/register', { email, password, name });
      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);
      setAuth(newToken);
      
      // Store auth data
      await AsyncStorage.setItem('token', newToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      console.log('✅ Registration successful');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setToken(undefined);
      setUser(undefined);
      setAuth(undefined);
      
      // Clear stored auth data
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('userRole');
      await AsyncStorage.removeItem('isAvatarSetup');
      
      setHasCompletedAvatarSetup(false);
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    try {
      if (!user || !token) {
        throw new Error('No authenticated user');
      }

      const response = await API.patch(`/users/${user.id}`, updates);
      const updatedUser = response.data;
      
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      console.log('✅ User updated successfully');
    } catch (error) {
      console.error('Update user failed:', error);
      throw error;
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

  const setupAvatar = async (role: 'buyer' | 'seller' | 'hybrid') => {
    try {
      // Save role to AsyncStorage
      await AsyncStorage.setItem('userRole', role);
      await AsyncStorage.setItem('isAvatarSetup', 'true');
      
      // Update context state
      setHasCompletedAvatarSetup(true);
      
      // Update user state if user exists
      if (user) {
        setUser(prev => prev ? { ...prev, role } : undefined);
      }
      
      console.log('✅ Avatar setup completed for role:', role);
    } catch (error) {
      console.error('Failed to setup avatar:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    hasCompletedAvatarSetup,
    login,
    register,
    logout,
    updateUser,
    checkAvatarSetup,
    setupAvatar,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};