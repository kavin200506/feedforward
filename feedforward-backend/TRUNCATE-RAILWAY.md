# How to Truncate Tables in Railway MySQL

Since `mysql.railway.internal` is only accessible from within Railway's network, 
you need to run the truncate script from Railway's environment.

## Method 1: Using Railway CLI (Easiest)

1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Link to your project (if not already):
   ```bash
   railway link
   ```

4. Connect to MySQL:
   ```bash
   railway connect mysql
   ```

5. Once connected to MySQL, run:
   ```sql
   SET FOREIGN_KEY_CHECKS = 0;
   TRUNCATE TABLE donation_history;
   TRUNCATE TABLE food_requests;
   TRUNCATE TABLE food_listings;
   TRUNCATE TABLE ngos;
   TRUNCATE TABLE restaurants;
   TRUNCATE TABLE users;
   SET FOREIGN_KEY_CHECKS = 1;
   ```

   Or source the file:
   ```sql
   source truncate-railway-tables.sql
   ```

## Method 2: Using Railway Web Interface

1. Go to https://railway.app
2. Select your project
3. Click on your MySQL service
4. Go to the "Data" or "Query" tab
5. Paste and execute the SQL from `truncate-railway-tables.sql`

## Method 3: Create a Temporary Endpoint (Quick Fix)

I can create a temporary admin endpoint in your Spring Boot app that truncates tables.
This can be called from anywhere and will run on Railway's server.

Would you like me to create this?
