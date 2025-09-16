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
      const storedToken = await AsyncStorage.getItem('auth_token');
      if (storedToken) {
        setAuth(storedToken);
        setToken(storedToken);
        
        // Verify token by fetching user data
        const { data } = await API.get('/auth/me');
        setUser(data);
      }
    } catch (error) {
      console.log('Failed to load stored auth:', error);
      await AsyncStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
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
    setAuth(undefined);
    setToken(undefined);
    setUser(undefined);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};