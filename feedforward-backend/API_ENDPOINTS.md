# FeedForward Backend API Documentation

Base URL: `http://localhost:8080/api`

## Authentication Endpoints

### Register
- **POST** `/auth/register`
- **Body**: RegisterRequest
- **Response**: AuthResponse with JWT token

### Login
- **POST** `/auth/login`
- **Body**: LoginRequest
- **Response**: AuthResponse with JWT token

### Get Profile
- **GET** `/auth/profile`
- **Auth**: Required
- **Response**: UserProfileResponse

---

## Restaurant Endpoints (Requires RESTAURANT role)

### Get Dashboard
- **GET** `/restaurant/dashboard`
- **Response**: RestaurantDashboardResponse

### Add Food Listing
- **POST** `/restaurant/listings`
- **Body**: FoodListingRequest
- **Response**: FoodListingResponse

### Get All Listings
- **GET** `/restaurant/listings`
- **Response**: List<FoodListingResponse>

### Get Active Listings
- **GET** `/restaurant/listings/active`
- **Response**: List<FoodListingResponse>

### Get Listing by ID
- **GET** `/restaurant/listings/{id}`
- **Response**: FoodListingResponse

### Update Listing Status
- **PATCH** `/restaurant/listings/{id}/status?status=EXPIRED`
- **Response**: Success message

### Delete Listing
- **DELETE** `/restaurant/listings/{id}`
- **Response**: Success message

### Get Pending Requests
- **GET** `/requests/restaurant/pending`
- **Response**: List<FoodRequestResponse>

### Get All Requests
- **GET** `/requests/restaurant/all`
- **Response**: List<FoodRequestResponse>

### Approve Request
- **POST** `/requests/{id}/approve`
- **Body**: ApproveRequestDto
- **Response**: FoodRequestResponse

### Reject Request
- **POST** `/requests/{id}/reject`
- **Body**: RejectRequestDto
- **Response**: FoodRequestResponse

---

## NGO Endpoints (Requires NGO role)

### Get Dashboard
- **GET** `/ngo/dashboard`
- **Response**: NgoDashboardResponse

### Search Available Food
- **POST** `/ngo/search`
- **Body**: SearchFoodRequest
- **Response**: List<FoodListingResponse>

### Get Available Food (Default)
- **GET** `/ngo/available`
- **Response**: List<FoodListingResponse>

### Get Listing Details
- **GET** `/ngo/listings/{id}`
- **Response**: FoodListingResponse

### Create Food Request
- **POST** `/requests`
- **Body**: CreateFoodRequestDto
- **Response**: FoodRequestResponse

### Get My Requests
- **GET** `/requests/ngo/my-requests`
- **Response**: List<FoodRequestResponse>

### Get Active Requests
- **GET** `/requests/ngo/active`
- **Response**: List<FoodRequestResponse>

### Get Completed Requests
- **GET** `/requests/ngo/completed`
- **Response**: List<FoodRequestResponse>

### Mark as Picked Up
- **PATCH** `/requests/{id}/pickup`
- **Response**: FoodRequestResponse

### Complete Donation
- **POST** `/requests/{id}/complete`
- **Body**: CompleteDonationRequest
- **Response**: FoodRequestResponse

### Cancel Request
- **DELETE** `/requests/{id}`
- **Response**: Success message

---

## Dashboard Endpoints (Authenticated)

### Get Dashboard
- **GET** `/dashboard`
- **Response**: RestaurantDashboardResponse or NgoDashboardResponse

### Get Restaurant Leaderboard
- **GET** `/dashboard/leaderboard/restaurants`
- **Response**: List<RestaurantLeaderboardResponse>

### Get NGO Leaderboard
- **GET** `/dashboard/leaderboard/ngos`
- **Response**: List<NgoLeaderboardResponse>

---

## Public Endpoints (No Auth Required)

### Get Impact Statistics
- **GET** `/impact/stats`
- **Response**: ImpactStatsResponse

### Get Top Restaurants
- **GET** `/impact/top-restaurants`
- **Response**: List<RestaurantLeaderboardResponse>

### Get Top NGOs
- **GET** `/impact/top-ngos`
- **Response**: List<NgoLeaderboardResponse>

---

## Request/Response Examples

### Register Request
```json
{
  "name": "Hotel Taj",
  "email": "taj@example.com",
  "phone": "9876543210",
  "password": "password123",
  "role": "RESTAURANT",
  "organizationName": "Taj Restaurant",
  "address": "123 Main St, Chennai",
  "latitude": 13.0827,
  "longitude": 80.2707,
  "cuisineType": "South Indian"
}
```

### Login Request
```json
{
  "email": "taj@example.com",
  "password": "password123"
}
```

### Food Listing Request
```json
{
  "foodName": "Biryani",
  "category": "COOKED_RICE",
  "quantity": 50,
  "unit": "servings",
  "preparedTime": "2026-01-17T14:00:00",
  "expiryTime": "2026-01-17T20:00:00",
  "dietaryInfo": "Non-Veg, Halal",
  "description": "Fresh chicken biryani"
}
```

### Create Request
```json
{
  "listingId": 1,
  "quantityRequested": 30,
  "urgencyLevel": "HIGH",
  "notes": "Needed for evening meal distribution"
}
```

### Approve Request
```json
{
  "response": "Approved! Please come by 6 PM",
  "pickupTime": "2026-01-17T18:00:00"
}
```

### Complete Donation
```json
{
  "quantityReceived": 30,
  "rating": 5,
  "feedback": "Excellent quality food, thank you!"
}
```

### Error Response Format
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Food listing has expired",
  "path": "/api/requests",
  "timestamp": "2026-01-17T16:00:00",
  "validationErrors": []
}
```

### Success Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2026-01-17T16:00:00"
}
```


