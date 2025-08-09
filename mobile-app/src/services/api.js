import axios from 'axios';
import { API_CONFIG } from '../config/api';

// axios 
export const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
});


api.interceptors.request.use(
  (config) => {
    console.log(' API Request:', config.method?.toUpperCase(), config.url);
    console.log(' Auth header:', config.headers?.Authorization ? 'Present' : 'Missing');
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      
      console.log('Token expired, redirecting to login');
    }
    return Promise.reject(error);
  }
);


export const authAPI = {
  login: (email, password) => api.post('/login', { email, password }),
  register: (email, password) => api.post('/register', { email, password }),
  logout: () => api.post('/logout'),
};

export const accountAPI = {
  getBalance: (accountId) => api.get(`/account/${accountId}/balance`),
  getDetails: (accountId) => api.get(`/account/${accountId}`),
  getTransactions: (accountId, limit = 10, offset = 0) => 
    api.get(`/account/${accountId}/transactions?limit=${limit}&offset=${offset}`),
  updateAccount: (accountId, data) => api.put(`/account/${accountId}`, data),
};

export const transferAPI = {
  transfer: (data) => api.post('/transfer/transfer', data),
};

export const adminAPI = {
  getAllAccounts: () => api.get('/admin/accounts'),
  getAllTransactions: () => api.get('/admin/transactions'),
  createAccount: (data) => api.post('/admin/accounts', data),
  updateAccount: (accountId, data) => api.put(`/admin/accounts/${accountId}`, data),
  deleteAccount: (accountId) => api.delete(`/admin/accounts/${accountId}`),
};

export const userAPI = {
  getCurrentUser: () => api.get('/me'),
}; 