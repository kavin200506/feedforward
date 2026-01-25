-- Truncate all tables in Railway MySQL database
-- This script will delete all data from all tables

-- Disable foreign key checks temporarily to allow truncation
SET FOREIGN_KEY_CHECKS = 0;

-- Truncate tables in correct order (child tables first, then parent tables)
TRUNCATE TABLE donation_history;
TRUNCATE TABLE food_requests;
TRUNCATE TABLE food_listings;
TRUNCATE TABLE ngos;
TRUNCATE TABLE restaurants;
TRUNCATE TABLE users;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Show confirmation
SELECT 'All tables truncated successfully!' AS message;
SELECT COUNT(*) AS remaining_users FROM users;
SELECT COUNT(*) AS remaining_restaurants FROM restaurants;
SELECT COUNT(*) AS remaining_ngos FROM ngos;
SELECT COUNT(*) AS remaining_listings FROM food_listings;
SELECT COUNT(*) AS remaining_requests FROM food_requests;
SELECT COUNT(*) AS remaining_donations FROM donation_history;
