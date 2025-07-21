-- server/database.sql - Complete Database Schema

-- Drop existing tables if they exist
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS owners CASCADE;
DROP TABLE IF EXISTS co_hosts CASCADE;
DROP TABLE IF EXISTS custom_pricing CASCADE;
DROP TABLE IF EXISTS payout_methods CASCADE;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Owners table
CREATE TABLE owners (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    profile_image TEXT,
    verification_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Co-hosts table
CREATE TABLE co_hosts (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    owner_id INTEGER REFERENCES owners(id) ON DELETE CASCADE,
    co_host_id INTEGER REFERENCES owners(id) ON DELETE CASCADE,
    permissions JSONB, -- e.g., {"can_edit_listing": true, "can_manage_bookings": true}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    profile_image TEXT,
    date_of_birth DATE,
    id_number VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Properties table
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER REFERENCES owners(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    property_type VARCHAR(50) NOT NULL,
    bedrooms INTEGER NOT NULL,
    bathrooms INTEGER NOT NULL,
    max_guests INTEGER NOT NULL,
    nightly_price DECIMAL(10, 2) NOT NULL,
    cleaning_fee DECIMAL(10, 2) DEFAULT 0,
    extra_guest_fee DECIMAL(10, 2) DEFAULT 0,
    pet_fee DECIMAL(10, 2) DEFAULT 0,
    security_deposit DECIMAL(10, 2) DEFAULT 0,
    minimum_stay INTEGER DEFAULT 1,
    maximum_stay INTEGER DEFAULT 365,
    amenities JSON,
    house_rules JSON,
    guest_requirements JSON,
    images JSON,
    videos JSON,
    instant_booking BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active',
    average_rating DECIMAL(3, 2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Custom pricing table for date-specific pricing
CREATE TABLE custom_pricing (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(property_id, date)
);

-- Bookings table
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    guests INTEGER NOT NULL,
    adults INTEGER DEFAULT 1,
    children INTEGER DEFAULT 0,
    infants INTEGER DEFAULT 0,
    pets INTEGER DEFAULT 0,
    special_requests TEXT,
    subtotal DECIMAL(10, 2) NOT NULL,
    cleaning_fee DECIMAL(10, 2) DEFAULT 0,
    extra_guest_fee DECIMAL(10, 2) DEFAULT 0,
    pet_fee DECIMAL(10, 2) DEFAULT 0,
    security_deposit DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    payment_status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(50),
    confirmation_code VARCHAR(20) UNIQUE,
    check_in_instructions TEXT,
    check_out_instructions TEXT,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    payment_provider VARCHAR(50) NOT NULL,
    provider_transaction_id VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ZAR',
    status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(50),
    webhook_data JSON,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table for guest communication
CREATE TABLE messages (
    id SERIAL PRIMARY KEY