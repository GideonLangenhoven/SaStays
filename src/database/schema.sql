-- Complete Database Schema for SaStays MVP
-- File: server/database/schema.sql

-- Drop existing tables if they exist
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS property_amenities CASCADE;
DROP TABLE IF EXISTS amenities CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS payout_methods CASCADE;
DROP TABLE IF EXISTS owners CASCADE;

-- Owners table
CREATE TABLE owners (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payout methods table
CREATE TABLE payout_methods (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER REFERENCES owners(id) ON DELETE CASCADE,
    method_type VARCHAR(50) NOT NULL, -- 'bank_account', 'paypal', etc.
    bank_name VARCHAR(100),
    account_number VARCHAR(50),
    account_holder_name VARCHAR(100),
    branch_code VARCHAR(20),
    is_primary BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Amenities table
CREATE TABLE amenities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    category VARCHAR(50) -- 'basic', 'entertainment', 'family', 'safety', etc.
);

-- Properties table
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER REFERENCES owners(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    property_type VARCHAR(50), -- 'apartment', 'house', 'room', etc.
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'South Africa',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    max_guests INTEGER NOT NULL,
    bedrooms INTEGER,
    bathrooms INTEGER,
    base_price DECIMAL(10, 2) NOT NULL,
    cleaning_fee DECIMAL(10, 2) DEFAULT 0,
    extra_guest_fee DECIMAL(10, 2) DEFAULT 0,
    pet_fee DECIMAL(10, 2) DEFAULT 0,
    weekly_discount DECIMAL(5, 2) DEFAULT 0, -- percentage
    monthly_discount DECIMAL(5, 2) DEFAULT 0, -- percentage
    instant_book BOOLEAN DEFAULT TRUE,
    minimum_stay INTEGER DEFAULT 1,
    maximum_stay INTEGER DEFAULT 365,
    check_in_time TIME DEFAULT '15:00',
    check_out_time TIME DEFAULT '11:00',
    house_rules TEXT,
    cancellation_policy VARCHAR(50) DEFAULT 'moderate',
    is_active BOOLEAN DEFAULT TRUE,
    rating_average DECIMAL(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    images JSONB, -- Array of image URLs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property amenities junction table
CREATE TABLE property_amenities (
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    amenity_id INTEGER REFERENCES amenities(id) ON DELETE CASCADE,
    PRIMARY KEY (property_id, amenity_id)
);

-- Bookings table
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    guest_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    guest_phone VARCHAR(20),
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    guests_count INTEGER NOT NULL,
    nights INTEGER NOT NULL,
    base_amount DECIMAL(10, 2) NOT NULL,
    cleaning_fee DECIMAL(10, 2) DEFAULT 0,
    extra_guest_fee DECIMAL(10, 2) DEFAULT 0,
    pet_fee DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    booking_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled', 'completed'
    payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
    payment_method VARCHAR(50),
    payment_transaction_id VARCHAR(255),
    special_requests TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL, -- 'owner', 'guest'
    sender_name VARCHAR(255) NOT NULL,
    message_text TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- 'text', 'image', 'video'
    attachment_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    guest_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    owner_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default amenities
INSERT INTO amenities (name, icon, category) VALUES
-- Basic amenities
('WiFi', 'wifi', 'basic'),
('Kitchen', 'chef-hat', 'basic'),
('Washing machine', 'washing-machine', 'basic'),
('Air conditioning', 'snowflake', 'basic'),
('Heating', 'flame', 'basic'),
('Hot water', 'droplets', 'basic'),
('Parking', 'car', 'basic'),
('TV', 'tv', 'entertainment'),
('Netflix', 'monitor', 'entertainment'),
('Sound system', 'volume-2', 'entertainment'),
('Pool', 'waves', 'amenities'),
('Garden', 'trees', 'amenities'),
('Braai/BBQ', 'flame', 'amenities'),
('Pet friendly', 'heart', 'policies'),
('Smoking allowed', 'cigarette', 'policies'),
('Family friendly', 'users', 'family'),
('Crib', 'baby', 'family'),
('High chair', 'baby', 'family'),
-- Safety amenities
('Smoke detector', 'shield-check', 'safety'),
('Security cameras', 'camera', 'safety'),
('Fire extinguisher', 'shield', 'safety'),
('First aid kit', 'plus-square', 'safety');

-- Create indexes for better performance
CREATE INDEX idx_properties_owner_id ON properties(owner_id);
CREATE INDEX idx_properties_location ON properties(city, province);
CREATE INDEX idx_properties_active ON properties(is_active);
CREATE INDEX idx_bookings_property_id ON bookings(property_id);
CREATE INDEX idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX idx_bookings_status ON bookings(booking_status);
CREATE INDEX idx_messages_booking_id ON messages(booking_id);
CREATE INDEX idx_reviews_property_id ON reviews(property_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_owners_updated_at BEFORE UPDATE ON owners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();