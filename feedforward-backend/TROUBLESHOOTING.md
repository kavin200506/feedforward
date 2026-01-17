# Troubleshooting Guide - Lombok Annotation Processing

## Issue: "cannot find symbol" errors for Lombok-generated methods

### Problem
When running `mvn spring-boot:run` or `mvn clean compile`, you get errors like:
```
cannot find symbol: method builder()
cannot find symbol: method getEmail()
```

This means Lombok annotation processing is not working.

### Solution 1: Use Java 17 (Recommended)

The project is configured for Java 17. If you're using Java 25, switch to Java 17:

**On macOS:**
```bash
# Install Java 17 (if not installed)
brew install openjdk@17

# Set Java 17 as default for this project
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
java -version  # Should show version 17

# Then run Maven
mvn clean compile
mvn spring-boot:run
```

**Or use SDKMAN:**
```bash
sdk install java 17.0.9-tem
sdk use java 17.0.9-tem
```

### Solution 2: Enable Annotation Processing in IDE

If using IntelliJ IDEA:
1. Go to `File` → `Settings` → `Build, Execution, Deployment` → `Compiler` → `Annotation Processors`
2. Check "Enable annotation processing"
3. Click "Apply" and "OK"
4. Rebuild project: `Build` → `Rebuild Project`

If using Eclipse:
1. Right-click project → `Properties`
2. Go to `Java Compiler` → `Annotation Processing`
3. Enable "Enable annotation processing"
4. Clean and rebuild project

### Solution 3: Manual Maven Configuration

If annotation processing still doesn't work, try:

```bash
# Clean everything
mvn clean

# Delete target directory
rm -rf target

# Rebuild
mvn clean install -DskipTests
```

### Solution 4: Verify Lombok Installation

Check if Lombok is properly installed:
```bash
mvn dependency:tree | grep lombok
```

Should show: `org.projectlombok:lombok:jar:1.18.30:compile`

### Solution 5: Check IDE Lombok Plugin

**IntelliJ IDEA:**
1. Install "Lombok" plugin from Marketplace
2. Restart IDE
3. Enable annotation processing (see Solution 2)

**Eclipse:**
1. Download lombok.jar from https://projectlombok.org/download
2. Run: `java -jar lombok.jar`
3. Select your Eclipse installation
4. Restart Eclipse

### Current Java Version Issue

You're currently using **Java 25**, but the project is configured for **Java 17**.

**Quick Fix:**
```bash
# Check available Java versions
/usr/libexec/java_home -V

# Switch to Java 17 (replace with your Java 17 path)
export JAVA_HOME=$(/usr/libexec/java_home -v 17)

# Verify
java -version

# Then run Maven
mvn clean compile
```

### If Nothing Works

As a last resort, you can manually add getters/setters, but this is not recommended. The proper solution is to:
1. Use Java 17
2. Enable annotation processing in your IDE
3. Install Lombok plugin in your IDE

### Verification

After fixing, verify Lombok is working:
```bash
# Should compile without errors
mvn clean compile

# Should run successfully
mvn spring-boot:run
```

The application should start and show:
```
🍽️ FeedForward Backend is running on port 8080!
```


