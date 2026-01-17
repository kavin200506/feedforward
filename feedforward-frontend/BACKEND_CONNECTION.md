# Backend Connection Guide

## Overview

This guide explains how the React frontend connects to the Spring Boot backend API.

## Configuration

### 1. Environment Variables

Create a `.env` file in the root of the frontend project:

```env
VITE_API_URL=http://localhost:8080/api
VITE_USE_MOCK_AUTH=false
```

### 2. API Configuration

The API base URL is configured in:
- `src/config/apiConfig.js` - Centralized API configuration
- `src/utils/constants.js` - Fallback API URL

### 3. Axios Setup

The axios instance is configured in:
- `src/services/axiosConfig.js` - Axios instance with interceptors

**Features:**
- Automatic JWT token injection
- Automatic error handling
- 401 redirect to login
- Request/response interceptors

## Service Layer

### Available Services

1. **authService** - Authentication (login, register, profile)
2. **foodListingService** - Food listing management
3. **requestService** - Food request management
4. **dashboardService** - Dashboard statistics
5. **restaurantService** - Restaurant-specific operations
6. **ngoService** - NGO-specific operations

### Usage Example

```javascript
import authService from '../services/authService';
import foodListingService from '../services/foodListingService';

// Login
const handleLogin = async () => {
  try {
    const response = await authService.login(email, password);
    if (response.success) {
      // Redirect based on role
      const user = authService.getCurrentUser();
      if (user.role === 'RESTAURANT') {
        navigate('/restaurant/dashboard');
      } else if (user.role === 'NGO') {
        navigate('/ngo/dashboard');
      }
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// Add food listing
const handleAddListing = async () => {
  try {
    const response = await foodListingService.addFoodListing(listingData);
    if (response.success) {
      // Handle success
    }
  } catch (error) {
    console.error('Failed to add listing:', error);
  }
};
```

## Response Format

All backend responses follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2026-01-17T16:00:00"
}
```

Error responses:

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Validation error message",
  "path": "/api/endpoint",
  "timestamp": "2026-01-17T16:00:00"
}
```

## Authentication Flow

1. **Login/Register** → Store JWT token in localStorage
2. **All API calls** → Axios interceptor adds `Authorization: Bearer <token>` header
3. **401 Response** → Auto-redirect to `/auth` and clear tokens

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:3000` (Vite default)
- `http://localhost:3001` (Alternative port)

## Testing

### Development Mode

Set `VITE_USE_MOCK_AUTH=true` in `.env` to use mock authentication for testing without backend.

### Production Mode

Ensure backend is running on `http://localhost:8080` (or update `VITE_API_URL`).

## Troubleshooting

### CORS Errors
- Verify backend CORS configuration includes your frontend URL
- Check `application.yml` in backend

### 401 Unauthorized
- Check if JWT token is stored in localStorage
- Verify token hasn't expired
- Check Authorization header format: `Bearer <token>`

### Network Errors
- Verify backend is running
- Check API URL in `.env` file
- Verify backend port (default: 8080)

## Next Steps

1. Start backend: `cd feedforward-backend && mvn spring-boot:run`
2. Start frontend: `cd feedforward-frontend && npm run dev`
3. Test connection: Open browser console and check for API calls


