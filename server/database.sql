-- server/database.sql

-- Drop existing tables in reverse order of creation to avoid dependency errors
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS property_availability;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS properties;
DROP TABLE IF EXISTS owners;

-- Create the 'properties' table to store accommodation listings.
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price_per_night DECIMAL(10, 2) NOT NULL,
    capacity INT NOT NULL,
    location VARCHAR(255),
    amenities TEXT[],
    image_url VARCHAR(255)
);

-- Create the 'customers' table to store customer information.
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20)
);

-- Create the 'bookings' table to link properties and customers.
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    property_id INT REFERENCES properties(id) ON DELETE CASCADE,
    customer_id INT REFERENCES customers(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled'
    payment_provider VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_dates CHECK (end_date > start_date)
);

-- Create the 'property_availability' table to track daily availability.
CREATE TABLE property_availability (
    id SERIAL PRIMARY KEY,
    property_id INT REFERENCES properties(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT true,
    booking_id INT REFERENCES bookings(id) ON DELETE SET NULL, -- Optional: link to the booking that blocked this date
    UNIQUE(property_id, date) -- Ensures no duplicate entries for the same day and property
);

-- Create the 'ratings' table to store post-stay ratings and reviews.
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES bookings(id) ON DELETE CASCADE,
    customer_id INT REFERENCES customers(id) ON DELETE CASCADE,
    property_id INT REFERENCES properties(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the 'owners' table for owner registration and email confirmation
CREATE TABLE IF NOT EXISTS owners (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'active'
    confirmation_token VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample data
INSERT INTO properties (name, description, price_per_night, capacity, location, amenities, image_url) VALUES
('Clifton Beachfront Suite', 'Wake up to the sound of the waves...', 4399.00, 2, 'Clifton, Cape Town', '{"Wi-Fi", "Kitchen", "Air Conditioning"}', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop'),
('Umhlanga Family Retreat', 'A spacious family apartment...', 5199.00, 4, 'Umhlanga, Durban', '{"Wi-Fi", "Full Kitchen", "2 Bathrooms"}', 'https://images.unsplash.com/photo-1464983953574-0892a716854b?w=800&h=600&fit=crop');