import axiosInstance from './axiosConfig';

class AuthService {
  // Register
  async register(userData) {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      
      if (response.data && response.data.success) {
        const authData = response.data.data; // AuthResponse object
        const { token, ...userProfile } = authData;
        
        // Save to localStorage
        localStorage.setItem('authToken', token);
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        
        // Extract organization name from profile if available
        const organizationName = authData.profile?.organizationName || 
                                 authData.organizationName || 
                                 userProfile.name;
        
        localStorage.setItem('user', JSON.stringify({
          userId: authData.userId,
          name: authData.name,
          role: authData.role,
          organizationName: organizationName,
        }));
        
        return response.data;
      }
      
      throw new Error(response.data?.message || 'Registration failed');
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle 409 Conflict (duplicate email/phone)
      if (error.response?.status === 409) {
        const errorMessage = error.response?.data?.message || 
                           'This email or phone number is already registered. Please use a different one or login instead.';
        const registrationError = new Error(errorMessage);
        registrationError.statusCode = 409;
        registrationError.isConflict = true;
        registrationError.responseData = error.response?.data;
        throw registrationError;
      }
      
      // Handle 400 Bad Request (validation errors)
      if (error.response?.status === 400) {
        const validationErrors = error.response?.data?.validationErrors;
        if (validationErrors && validationErrors.length > 0) {
          const errorMessages = validationErrors.map(e => `${e.field}: ${e.message}`).join(', ');
          const validationError = new Error(errorMessages);
          validationError.statusCode = 400;
          validationError.validationErrors = validationErrors;
          validationError.responseData = error.response?.data;
          throw validationError;
        }
        const badRequestError = new Error(error.response?.data?.message || 'Invalid input data');
        badRequestError.statusCode = 400;
        badRequestError.responseData = error.response?.data;
        throw badRequestError;
      }
      
      // Generic error with status code
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Registration failed. Please try again.';
      const genericError = new Error(errorMessage);
      genericError.statusCode = error.response?.status;
      genericError.responseData = error.response?.data;
      throw genericError;
    }
  }

  // Login
  async login(email, password) {
    try {
      // Development mode: Mock login for testing without backend
      // Only use mock if explicitly enabled via environment variable
      const useMockAuth = import.meta.env.VITE_USE_MOCK_AUTH === 'true';
      
      if (useMockAuth) {
        // Mock login for development
        const mockUsers = {
          'restaurant@test.com': {
            userId: 'rest-001',
            name: 'Test Restaurant',
            role: 'RESTAURANT',
            organizationName: 'Test Restaurant',
            token: 'mock-token-restaurant-123',
          },
          'ngo@test.com': {
            userId: 'ngo-001',
            name: 'Test NGO',
            role: 'NGO',
            organizationName: 'Test NGO Shelter',
            token: 'mock-token-ngo-123',
          },
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const mockUser = mockUsers[email.toLowerCase()];
        
        if (mockUser && password === 'password123') {
          localStorage.setItem('authToken', mockUser.token);
          const user = {
            userId: mockUser.userId,
            name: mockUser.name,
            role: mockUser.role,
            organizationName: mockUser.organizationName,
          };
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('userProfile', JSON.stringify(user));
          return { success: true, data: { ...mockUser }, message: 'Login successful (Development Mode)' };
        } else {
          throw new Error('Invalid credentials. Use: restaurant@test.com or ngo@test.com with password: password123');
        }
      }

      // Production: Real API call
      const response = await axiosInstance.post('/auth/login', {
        email,
        password,
      });
      
      if (response.data.success) {
        const { token, ...userProfile } = response.data.data;
        
        // Save to localStorage
        localStorage.setItem('authToken', token);
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        localStorage.setItem('user', JSON.stringify({
          userId: userProfile.userId,
          name: userProfile.name,
          role: userProfile.role,
          organizationName: userProfile.profile?.organizationName || userProfile.name,
        }));
        
        return response.data;
      }
      
      throw new Error(response.data.message);
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle 401 Unauthorized (wrong credentials)
      if (error.response?.status === 401) {
        const unauthorizedError = new Error('Invalid email or password. Please try again.');
        unauthorizedError.statusCode = 401;
        unauthorizedError.responseData = error.response?.data;
        throw unauthorizedError;
      }
      
      // Handle 400 Bad Request (validation errors)
      if (error.response?.status === 400) {
        const validationErrors = error.response?.data?.validationErrors;
        if (validationErrors && validationErrors.length > 0) {
          const errorMessages = validationErrors.map(e => `${e.field}: ${e.message}`).join(', ');
          const validationError = new Error(errorMessages);
          validationError.statusCode = 400;
          validationError.validationErrors = validationErrors;
          validationError.responseData = error.response?.data;
          throw validationError;
        }
        const badRequestError = new Error(error.response?.data?.message || 'Invalid input data');
        badRequestError.statusCode = 400;
        badRequestError.responseData = error.response?.data;
        throw badRequestError;
      }
      
      // Generic error handling
      if (error.response) {
        // API returned an error response
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            'Login failed';
        const apiError = new Error(errorMessage);
        apiError.statusCode = error.response?.status;
        apiError.responseData = error.response?.data;
        throw apiError;
      } else if (error.message) {
        // Error with a message (from mock or other sources)
        throw error;
      } else {
        // Unknown error
        const unknownError = new Error('Login failed. Please check your credentials and try again.');
        unknownError.statusCode = null;
        throw unknownError;
      }
    }
  }

  // Get Profile
  async getProfile() {
    try {
      const response = await axiosInstance.get('/auth/profile');
      
      if (response.data.success) {
        localStorage.setItem('userProfile', JSON.stringify(response.data.data));
        return response.data.data;
      }
      
      throw new Error(response.data.message);
    } catch (error) {
      console.error('Get profile error:', error);
      
      // Handle 401 Unauthorized (not authenticated)
      if (error.response?.status === 401) {
        const unauthorizedError = new Error('Please login to view your profile');
        unauthorizedError.statusCode = 401;
        unauthorizedError.responseData = error.response?.data;
        throw unauthorizedError;
      }
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to get profile';
      const profileError = new Error(errorMessage);
      profileError.statusCode = error.response?.status;
      profileError.responseData = error.response?.data;
      throw profileError;
    }
  }

  // Logout
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('user');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }

  // Get current user
  getCurrentUser() {
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
      try {
        return JSON.parse(userProfile);
      } catch (error) {
        console.error('Error parsing userProfile:', error);
        return null;
      }
    }
    // Fallback to old 'user' key for backward compatibility
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user:', error);
        return null;
      }
    }
    return null;
  }

  // Get authentication token
  getToken() {
    return localStorage.getItem('authToken');
  }
}

export default new AuthService();

