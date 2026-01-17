-- Sample Data for Testing FeedForward Application
USE feedforward_db;

-- Note: Run this after the application has created all tables

-- Sample Restaurant User
INSERT INTO users (email, password, name, phone, role, is_active, created_at, updated_at)
VALUES ('taj@restaurant.com', '$2a$10$xXPcH.z8gKKhJqKqE.kNOe7sN4lLhf1kJjH7VBmVL8qQ6vZ9x2z0e', 
        'Taj Restaurant Manager', '9876543210', 'RESTAURANT', true, NOW(), NOW());

SET @restaurant_user_id = LAST_INSERT_ID();

-- Sample Restaurant
INSERT INTO restaurants (user_id, organization_name, address, latitude, longitude, cuisine_type, rating, total_donations, total_servings_donated, created_at, updated_at)
VALUES (@restaurant_user_id, 'Taj Restaurant', '123 Anna Salai, Chennai', 13.0827, 80.2707, 
        'Multi-Cuisine', 4.5, 0, 0, NOW(), NOW());

-- Sample NGO User
INSERT INTO users (email, password, name, phone, role, is_active, created_at, updated_at)
VALUES ('akshaya@ngo.com', '$2a$10$xXPcH.z8gKKhJqKqE.kNOe7sN4lLhf1kJjH7VBmVL8qQ6vZ9x2z0e', 
        'Akshaya Patra Coordinator', '9876543211', 'NGO', true, NOW(), NOW());

SET @ngo_user_id = LAST_INSERT_ID();

-- Sample NGO
INSERT INTO ngos (user_id, organization_name, address, latitude, longitude, beneficiaries_count, 
                  food_preferences, dietary_requirements, total_received, total_servings_received, created_at, updated_at)
VALUES (@ngo_user_id, 'Akshaya Patra Foundation', '456 Mount Road, Chennai', 13.0850, 80.2750,
        200, 'Rice, Vegetables, Dal', 'Vegetarian', 0, 0, NOW(), NOW());

-- Note: Password for both test users is 'password123'


