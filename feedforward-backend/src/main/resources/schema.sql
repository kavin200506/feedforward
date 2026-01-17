-- Create Database
CREATE DATABASE IF NOT EXISTS feedforward_db;
USE feedforward_db;

-- Users Table (Base table for authentication)
CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    role ENUM('RESTAURANT', 'NGO') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Restaurants Table
CREATE TABLE restaurants (
    restaurant_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    organization_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    cuisine_type VARCHAR(100),
    rating DECIMAL(2, 1) DEFAULT 0.0,
    total_donations INT DEFAULT 0,
    total_servings_donated INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_location (latitude, longitude),
    INDEX idx_user_id (user_id)
);

-- NGOs Table
CREATE TABLE ngos (
    ngo_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    organization_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    beneficiaries_count INT NOT NULL,
    food_preferences TEXT,
    dietary_requirements TEXT,
    total_received INT DEFAULT 0,
    total_servings_received INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_location (latitude, longitude),
    INDEX idx_user_id (user_id)
);

-- Food Listings Table
CREATE TABLE food_listings (
    listing_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id BIGINT NOT NULL,
    food_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    unit VARCHAR(20) NOT NULL,
    prepared_time TIMESTAMP NOT NULL,
    expiry_time TIMESTAMP NOT NULL,
    dietary_info TEXT,
    description TEXT,
    status ENUM('AVAILABLE', 'RESERVED', 'COMPLETED', 'EXPIRED') DEFAULT 'AVAILABLE',
    urgency_level ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_expiry (expiry_time),
    INDEX idx_restaurant (restaurant_id)
);

-- Food Requests Table
CREATE TABLE food_requests (
    request_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    listing_id BIGINT NOT NULL,
    ngo_id BIGINT NOT NULL,
    quantity_requested INT NOT NULL,
    urgency_level ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'PICKED_UP', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
    notes TEXT,
    restaurant_response TEXT,
    pickup_time TIMESTAMP,
    picked_up_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES food_listings(listing_id) ON DELETE CASCADE,
    FOREIGN KEY (ngo_id) REFERENCES ngos(ngo_id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_listing (listing_id),
    INDEX idx_ngo (ngo_id)
);

-- Donation History Table
CREATE TABLE donation_history (
    donation_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id BIGINT NOT NULL,
    ngo_id BIGINT NOT NULL,
    request_id BIGINT NOT NULL,
    food_name VARCHAR(255) NOT NULL,
    quantity_donated INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    donated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    restaurant_rating INT,
    ngo_rating INT,
    restaurant_feedback TEXT,
    ngo_feedback TEXT,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
    FOREIGN KEY (ngo_id) REFERENCES ngos(ngo_id) ON DELETE CASCADE,
    FOREIGN KEY (request_id) REFERENCES food_requests(request_id) ON DELETE CASCADE,
    INDEX idx_restaurant (restaurant_id),
    INDEX idx_ngo (ngo_id),
    INDEX idx_donated_at (donated_at)
);


