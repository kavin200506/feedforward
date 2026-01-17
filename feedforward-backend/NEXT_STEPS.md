# Next Steps - Running Your Backend

## ✅ What's Already Done
- ✅ Java 21 installed and configured
- ✅ Project compiles successfully (BUILD SUCCESS)
- ✅ All code errors fixed

## 🚀 What to Run Next

### Step 1: Start MySQL Database (if not running)

**Option A: Using Homebrew (macOS)**
```bash
# Check if MySQL is installed
brew services list | grep mysql

# Start MySQL service
brew services start mysql

# Or if using MySQL@8.0
brew services start mysql@8.0
```

**Option B: Using Docker**
```bash
# Start MySQL in Docker
docker run --name mysql-feedforward \
  -e MYSQL_ROOT_PASSWORD=Root@1234 \
  -e MYSQL_DATABASE=feedforward_db \
  -p 3306:3306 \
  -d mysql:8.0
```

**Option C: Manual MySQL**
```bash
# If MySQL is installed but not as a service
mysql.server start
```

### Step 2: Verify Database Connection

```bash
# Test MySQL connection
mysql -u root -p -e "SHOW DATABASES;" 
# Password: Root@1234
```

### Step 3: Run the Spring Boot Application

**Make sure you're in the backend directory:**
```bash
cd feedforward-backend
```

**Set Java 21 (if not already set):**
```bash
source ~/.zshrc
# Or manually:
export JAVA_HOME=/opt/homebrew/opt/openjdk@21
export PATH=$JAVA_HOME/bin:$PATH
```

**Run the application:**
```bash
mvn spring-boot:run
```

**Or build and run JAR:**
```bash
mvn clean package
java -jar target/food-waste-management-1.0.0.jar
```

### Step 4: Verify Application is Running

Once the application starts, you should see:
```
Started FeedForwardApplication in X.XXX seconds
```

**Test the API:**
```bash
# Health check (if configured)
curl http://localhost:8080/api/auth/health

# Or test a public endpoint
curl http://localhost:8080/api/auth/register
```

### Step 5: Access the Application

- **API Base URL:** `http://localhost:8080/api`
- **Frontend should connect to:** `http://localhost:8080/api`

## 📝 Quick Command Reference

```bash
# 1. Navigate to backend
cd feedforward-backend

# 2. Ensure Java 21 is active
source ~/.zshrc
java -version  # Should show 21.0.9

# 3. Start MySQL (if needed)
brew services start mysql

# 4. Run the application
mvn spring-boot:run
```

## 🔍 Troubleshooting

### If MySQL connection fails:
- Check MySQL is running: `brew services list | grep mysql`
- Verify credentials in `application.yml`
- Check MySQL port: `lsof -i :3306`

### If port 8080 is already in use:
- Change port in `application.yml`: `server.port: 8081`
- Or kill the process: `lsof -ti:8080 | xargs kill`

### If you see compilation errors:
- Make sure Java 21 is active: `java -version`
- Clean and rebuild: `mvn clean compile`

## 🎯 Expected Output

When you run `mvn spring-boot:run`, you should see:
```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.2.1)

... (application logs) ...

Started FeedForwardApplication in X.XXX seconds
```

## 📚 Additional Resources

- API Documentation: See `API_ENDPOINTS.md`
- Testing Guide: See `TESTING_GUIDE.md`
- Postman Collection: `FeedForward_API.postman_collection.json`


