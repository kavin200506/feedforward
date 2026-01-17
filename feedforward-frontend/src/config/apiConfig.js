const API_CONFIG = {
  // Development
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  
  // Production
  PROD_URL: 'https://api.feedforward.com/api',
  
  TIMEOUT: 30000,
};

export default API_CONFIG;


