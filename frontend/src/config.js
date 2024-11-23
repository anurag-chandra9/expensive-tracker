import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://expense-tracker-production-a8b6.up.railway.app';

const config = {
  API_URL,
  API_ENDPOINTS: {
    LOGIN: '/api/auth/login/',
    REGISTER: '/api/auth/register/',
    EXPENSES: '/api/expenses/',
    CATEGORIES: '/api/categories/',
    DASHBOARD: '/api/expenses/dashboard/',
  },
};

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Export both config and axios instance
export { config as default, axiosInstance };
