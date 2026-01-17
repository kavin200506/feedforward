# Registration Flow Fixes

## Issues Found and Fixed

### 1. ✅ Field Name Mismatch (CRITICAL)
**Problem:** Frontend was sending `restaurantName` or `ngoName`, but backend expects `organizationName`

**Fixed in:** `feedforward-frontend/src/components/auth/RegisterForm.jsx`
- Changed payload to always send `organizationName` regardless of role
- Removed conditional `restaurantName`/`ngoName` fields

### 2. ✅ Response Handling (CRITICAL)
**Problem:** Frontend wasn't correctly parsing the backend response structure

**Backend Response Structure:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "...",
    "userId": 1,
    "email": "...",
    "name": "...",
    "role": "RESTAURANT",
    "profile": {
      "organizationName": "...",
      ...
    }
  }
}
```

**Fixed in:**
- `feedforward-frontend/src/services/authService.js` - Correctly extracts token and user data
- `feedforward-frontend/src/context/AuthContext.jsx` - Properly builds user object from response

### 3. ✅ Role Navigation
**Problem:** Navigation was using form role instead of response role

**Fixed in:** `feedforward-frontend/src/components/auth/RegisterForm.jsx`
- Now uses role from API response for navigation
- Falls back to selectedRole if response role is missing

## Files Modified

1. `feedforward-frontend/src/components/auth/RegisterForm.jsx`
   - Fixed payload to send `organizationName` instead of `restaurantName`/`ngoName`
   - Fixed role extraction from response

2. `feedforward-frontend/src/services/authService.js`
   - Improved response parsing
   - Better error handling
   - Correctly extracts organization name from profile

3. `feedforward-frontend/src/context/AuthContext.jsx`
   - Fixed user object construction from API response
   - Correctly extracts organization name from profile

## Testing Checklist

- [ ] Register as Restaurant - should create user and redirect to restaurant dashboard
- [ ] Register as NGO - should create user and redirect to NGO dashboard
- [ ] Verify token is saved in localStorage
- [ ] Verify user profile is saved correctly
- [ ] Verify organization name is displayed correctly
- [ ] Test error handling (duplicate email, validation errors)

## Expected Flow

1. User fills registration form
2. Frontend sends POST to `/api/auth/register` with:
   - `organizationName` (not `restaurantName`/`ngoName`)
   - `role` as string ("RESTAURANT" or "NGO")
   - All other required fields

3. Backend validates and creates:
   - User entity
   - Restaurant or NGO entity
   - Returns `ApiResponse<AuthResponse>`

4. Frontend receives response and:
   - Saves token to localStorage
   - Saves user profile to localStorage
   - Updates AuthContext
   - Navigates to appropriate dashboard based on role

## Backend Endpoint

**POST** `/api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "password123",
  "role": "RESTAURANT",
  "organizationName": "My Restaurant",
  "address": "123 Main St",
  "latitude": 19.0760,
  "longitude": 72.8777,
  "cuisineType": "North Indian"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "role": "RESTAURANT",
    "profile": {
      "userId": 1,
      "email": "john@example.com",
      "name": "John Doe",
      "role": "RESTAURANT",
      "organizationName": "My Restaurant",
      ...
    }
  }
}
```

## CORS Configuration

Backend allows requests from:
- `http://localhost:3000`
- `http://localhost:3001`
- `http://localhost:5173` (Vite default)

Make sure your frontend is running on one of these ports.


