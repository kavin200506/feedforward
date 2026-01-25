import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle common errors
api.interceptors.response.use(
  (response) => {
    // Return only the data part of the response
    return response.data;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          // Only redirect if not already on auth page to prevent redirect loops
          if (!window.location.pathname.includes('/auth')) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/auth';
          }
          break;

        case 403:
          // Forbidden - user doesn't have permission
          console.error('Access forbidden');
          break;

        case 404:
          // Not found
          console.error('Resource not found');
          break;

        case 500:
          // Server error
          console.error('Server error occurred');
          break;

        default:
          console.error('An error occurred:', data.message || 'Unknown error');
      }

      // Return error with message extracted from response
      const errorData = error.response.data;
      return Promise.reject({
        message: errorData?.message || errorData?.error || 'An unexpected error occurred',
        status: status,
        data: errorData
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network error - no response received');
      return Promise.reject({
        message: 'Network error. Please check your connection.',
      });
    } else {
      // Something else happened
      console.error('Error:', error.message);
      return Promise.reject({ message: error.message });
    }
  }
);

export default api;


