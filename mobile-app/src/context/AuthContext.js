import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      
      if (storedToken && storedUser) {

         console.log("Loaded token from storage:", storedToken);
         console.log("Loaded user from storage:", JSON.parse(storedUser));

         api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
  try {
    console.log(' Attempting login with:', email);
    const response = await api.post('/login', { email, password });
    const { token: newToken, user: userData } = response.data;
    console.log("Login response:", response.data);

    console.log(' Login successful, user role:', userData.role);

    
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

    
    setToken(newToken);
    setUser(userData);
    await AsyncStorage.setItem('token', newToken);
    await AsyncStorage.setItem('user', JSON.stringify(userData));

    return { success: true, user: userData };
  } catch (error) {
    console.error(' Login error:', error);
    console.error('Response:', error.response?.data);
    return { 
      success: false, 
      error: error.response?.data?.error || 'Login failed' 
    };
  }
};


  const register = async (email, password) => {
    try {
      const response = await api.post('/register', { email, password });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    setToken(null);
    setUser(null);
    
    
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    
    
    delete api.defaults.headers.common['Authorization'];
  };

  const updateUser = (userData) => {
    setUser(userData);
    AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 