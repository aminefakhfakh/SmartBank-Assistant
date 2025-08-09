// API Configuration
export const API_CONFIG = {
  
  BASE_URL: 'http://192.168.1.201:3000',
  
  TIMEOUT: 10000,
  

  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  

};


export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}; 