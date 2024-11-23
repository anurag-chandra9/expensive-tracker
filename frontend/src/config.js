const config = {
  API_URL: process.env.REACT_APP_API_URL || 'https://expense-tracker-production-a8b6.up.railway.app',
  API_ENDPOINTS: {
    LOGIN: '/api/auth/login/',
    REGISTER: '/api/auth/register/',
    EXPENSES: '/api/expenses/',
    CATEGORIES: '/api/categories/',
  },
  TOKEN_KEY: 'expense_tracker_token',
};

export default config;
