// Production API URL
const PROD_API_URL = 'https://expense-tracker-production-a8b6.up.railway.app';
// Development API URL
const DEV_API_URL = 'http://localhost:8000';

const API_URL = process.env.NODE_ENV === 'production' ? PROD_API_URL : DEV_API_URL;

console.log('Current API URL:', API_URL);
console.log('Current Environment:', process.env.NODE_ENV);

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

export default config;
