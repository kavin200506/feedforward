-- Truncate all tables in Railway MySQL database
-- Run this from Railway environment or through Railway CLI

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE donation_history;
TRUNCATE TABLE food_requests;
TRUNCATE TABLE food_listings;
TRUNCATE TABLE ngos;
TRUNCATE TABLE restaurants;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

SELECT 'All tables truncated successfully in Railway MySQL!' AS message;
SELECT 'users' AS table_name, COUNT(*) AS count FROM users
UNION ALL SELECT 'restaurants', COUNT(*) FROM restaurants
UNION ALL SELECT 'ngos', COUNT(*) FROM ngos
UNION ALL SELECT 'food_listings', COUNT(*) FROM food_listings
UNION ALL SELECT 'food_requests', COUNT(*) FROM food_requests
UNION ALL SELECT 'donation_history', COUNT(*) FROM donation_history;
