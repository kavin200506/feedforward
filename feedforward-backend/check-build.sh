#!/bin/bash

echo "=== FeedForward Backend Build Checker ==="
echo ""

# Check Java version
echo "1. Java Version:"
java -version
echo ""

# Check Maven version
echo "2. Maven Version:"
mvn --version
echo ""

# Check JAVA_HOME
echo "3. JAVA_HOME:"
echo $JAVA_HOME
echo ""

# Check if we're in the right directory
echo "4. Current Directory:"
pwd
echo ""

# Check if pom.xml exists
echo "5. Checking pom.xml:"
if [ -f "pom.xml" ]; then
    echo "✅ pom.xml found"
else
    echo "❌ pom.xml NOT found!"
    exit 1
fi
echo ""

# Clean and compile
echo "6. Running mvn clean compile..."
echo "----------------------------------------"
mvn clean compile
BUILD_STATUS=$?
echo "----------------------------------------"
echo ""

if [ $BUILD_STATUS -eq 0 ]; then
    echo "✅ BUILD SUCCESS!"
else
    echo "❌ BUILD FAILED with exit code: $BUILD_STATUS"
    echo ""
    echo "Please share the error output above."
fi


