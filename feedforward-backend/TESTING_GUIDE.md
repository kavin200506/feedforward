# FeedForward Backend Testing Guide

## Running Tests

### Unit Tests
```bash
mvn test
```

### Integration Tests
```bash
mvn test -Dtest=*IntegrationTest
```

### All Tests
```bash
mvn clean test
```

## Test Coverage
```bash
mvn jacoco:report
```

## Manual Testing with cURL

### 1. Register Restaurant
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Taj Restaurant Manager",
    "email": "taj@restaurant.com",
    "phone": "9876543210",
    "password": "password123",
    "role": "RESTAURANT",
    "organizationName": "Taj Restaurant",
    "address": "123 Anna Salai, Chennai",
    "latitude": 13.0827,
    "longitude": 80.2707,
    "cuisineType": "South Indian"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "taj@restaurant.com",
    "password": "password123"
  }'
```

### 3. Save Token
```bash
export TOKEN="your-jwt-token-here"
```

### 4. Get Profile
```bash
curl -X GET http://localhost:8080/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Add Food Listing
```bash
curl -X POST http://localhost:8080/api/restaurant/listings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "foodName": "Chicken Biryani",
    "category": "COOKED_RICE",
    "quantity": 50,
    "unit": "servings",
    "preparedTime": "2026-01-17T14:00:00",
    "expiryTime": "2026-01-17T20:00:00",
    "dietaryInfo": "Non-Veg, Halal",
    "description": "Fresh chicken biryani"
  }'
```

### 6. Get Impact Statistics (Public)
```bash
curl -X GET http://localhost:8080/api/impact/stats
```

## Postman Collection

Import `FeedForward_API.postman_collection.json` into Postman for easy API testing.

## Troubleshooting

### Database Connection Failed
1. Check MySQL is running: `sudo systemctl status mysql`
2. Verify credentials in `application.yml`
3. Ensure database exists: `CREATE DATABASE feedforward_db;`
4. Check MySQL port (default 3306)

### Port 8080 Already in Use
```bash
# Change port in application.yml
server:
  port: 8081

# Or kill process using port 8080
lsof -i :8080
kill -9 <PID>
```

### JWT Token Errors
1. Verify JWT secret is properly set in `application.yml`
2. Check token expiration time
3. Ensure Authorization header format: `"Bearer <token>"`

### CORS Errors
1. Check CORS configuration in `application.yml`
2. Add frontend URL to allowed origins
3. Verify WebConfig and CorsConfig classes

### Validation Errors
1. Check request body matches DTO fields
2. Ensure all required fields are provided
3. Verify data types and formats (dates, enums, etc.)


