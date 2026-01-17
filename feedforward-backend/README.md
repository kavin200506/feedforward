# FeedForward Backend

Food Waste Management Platform - Backend API

## Tech Stack

- **Java 17**
- **Spring Boot 3.2.1**
- **Spring Security** (JWT Authentication)
- **Spring Data JPA**
- **MySQL 8.0**
- **Maven**

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+
- Docker (optional, for containerized deployment)

## Setup

### 1. Database Setup

```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE IF NOT EXISTS feedforward_db;
USE feedforward_db;

# Grant privileges
GRANT ALL PRIVILEGES ON feedforward_db.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2. Configuration

Update `src/main/resources/application.yml` with your database credentials:

```yaml
spring:
  datasource:
    username: root
    password: Root@1234
```

### 3. Build and Run

#### Option 1: Using Maven
```bash
# Clean and build
mvn clean install

# Run application
mvn spring-boot:run
```

#### Option 2: Using JAR
```bash
# Build JAR
mvn clean package

# Run JAR
java -jar target/food-waste-management-1.0.0.jar
```

#### Option 3: Using Docker
```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop
docker-compose down
```

## API Documentation

Base URL: `http://localhost:8080/api`

See [API_ENDPOINTS.md](./API_ENDPOINTS.md) for complete API documentation.

## Testing

### Unit Tests
```bash
mvn test
```

### Integration Tests
```bash
mvn test -Dtest=*IntegrationTest
```

### Manual Testing
See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for cURL commands and Postman collection.

## Project Structure

```
feedforward-backend/
├── src/
│   ├── main/
│   │   ├── java/com/feedforward/
│   │   │   ├── config/          # Configuration classes
│   │   │   ├── controller/      # REST controllers
│   │   │   ├── dto/             # Data Transfer Objects
│   │   │   ├── entity/          # JPA entities
│   │   │   ├── enums/           # Enum classes
│   │   │   ├── exception/       # Custom exceptions
│   │   │   ├── repository/     # JPA repositories
│   │   │   ├── security/        # Security configuration
│   │   │   ├── service/         # Business logic
│   │   │   └── util/            # Utility classes
│   │   └── resources/
│   │       ├── application.yml  # Application configuration
│   │       └── schema.sql       # Database schema
│   └── test/                    # Test classes
├── pom.xml                      # Maven configuration
├── Dockerfile                    # Docker image definition
├── docker-compose.yml           # Docker Compose configuration
└── README.md                    # This file
```

## Environment Variables

For production, set these environment variables:

```bash
DB_HOST=localhost
DB_PORT=3306
DB_NAME=feedforward_db
DB_USERNAME=root
DB_PASSWORD=your_password
JWT_SECRET=your-super-secret-jwt-key-minimum-64-characters
JWT_EXPIRATION=86400000
PORT=8080
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

## Health Check

```bash
curl http://localhost:8080/api/auth/health
```

## Deployment

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for pre-deployment verification.

## License

MIT License
