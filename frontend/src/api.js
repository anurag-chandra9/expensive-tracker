import axios from 'axios';
import config from './config';

// Create axios instance with default config
const api = axios.create({
  baseURL: config.API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Disable credentials for now
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    // Add CORS headers
    config.headers['Access-Control-Allow-Origin'] = '*';
    
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('Response error:', error.response || error);
    
    if (error.response?.status === 401) {
      // Clear tokens and redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
