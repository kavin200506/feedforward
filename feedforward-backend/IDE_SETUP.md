# IDE Setup Guide - Fixing Lombok Annotation Processing Errors

## Issue
Your IDE (NetBeans/IntelliJ/Eclipse) is showing errors like:
- `cannot find symbol: method getEmail()`
- `cannot find symbol: method getUserId()`
- `cannot find symbol: method builder()`

But `mvn clean compile` succeeds. This means **Lombok annotation processing is not enabled in your IDE**.

## Solution by IDE

### NetBeans (Based on your error stack trace)

1. **Install Lombok Plugin:**
   - Go to `Tools` → `Plugins`
   - Search for "Lombok"
   - Install the Lombok plugin
   - Restart NetBeans

2. **Enable Annotation Processing:**
   - Right-click on your project → `Properties`
   - Go to `Build` → `Compiling`
   - Check "Enable Annotation Processing"
   - Click "OK"

3. **Clean and Rebuild:**
   - Right-click project → `Clean and Build`
   - Or use `mvn clean install` from terminal

### IntelliJ IDEA

1. **Install Lombok Plugin:**
   - Go to `File` → `Settings` → `Plugins`
   - Search for "Lombok"
   - Install and restart IDE

2. **Enable Annotation Processing:**
   - Go to `File` → `Settings` → `Build, Execution, Deployment` → `Compiler` → `Annotation Processors`
   - Check "Enable annotation processing"
   - Click "Apply" and "OK"

3. **Rebuild Project:**
   - `Build` → `Rebuild Project`

### Eclipse

1. **Install Lombok:**
   - Download `lombok.jar` from https://projectlombok.org/download
   - Run: `java -jar lombok.jar`
   - Select your Eclipse installation
   - Restart Eclipse

2. **Enable Annotation Processing:**
   - Right-click project → `Properties`
   - Go to `Java Compiler` → `Annotation Processing`
   - Enable "Enable annotation processing"
   - Click "Apply and Close"

3. **Clean and Build:**
   - `Project` → `Clean...` → Select your project → `Clean`

## Verify It's Working

After setup, the IDE should:
- ✅ Show no errors for Lombok-generated methods
- ✅ Auto-complete `getEmail()`, `getUserId()`, `builder()`, etc.
- ✅ Show generated methods in code navigation

## If Still Not Working

1. **Check Java Version:**
   ```bash
   java -version  # Should be Java 23
   ```

2. **Verify Lombok Dependency:**
   ```bash
   mvn dependency:tree | grep lombok
   ```

3. **Clean Everything:**
   ```bash
   mvn clean
   rm -rf target
   mvn clean install -DskipTests
   ```

4. **Restart IDE completely**

## Note

The Maven build works fine because Maven processes Lombok annotations during compilation. The IDE errors are just because the IDE isn't processing them for code analysis. Your code will compile and run correctly even with these IDE errors.


