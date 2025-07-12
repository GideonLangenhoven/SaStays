-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS properties;

-- Table for properties available for booking
CREATE TABLE properties (
    id SERIAL PRIMARY KEY, -- Unique identifier for each property
    name VARCHAR(255) NOT NULL,
    location TEXT,
    price_per_night DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for customers who make bookings
CREATE TABLE customers (
    id SERIAL PRIMARY KEY, -- Unique identifier for each customer
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL, -- Email must be unique
    phone_number VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table to link properties and customers for a specific booking
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY, -- Unique identifier for each booking
    property_id INT NOT NULL,
    customer_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_price DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'confirmed', -- e.g., 'confirmed', 'cancelled', 'pending'
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Define foreign key constraints
    CONSTRAINT fk_property
        FOREIGN KEY(property_id) 
        REFERENCES properties(id)
        ON DELETE CASCADE, -- If a property is deleted, its bookings are also deleted

    CONSTRAINT fk_customer
        FOREIGN KEY(customer_id) 
        REFERENCES customers(id)
        ON DELETE CASCADE, -- If a customer is deleted, their bookings are also deleted

    -- Ensure that the end date is after the start date
    CONSTRAINT chk_dates CHECK (end_date > start_date)
);

-- Optional: Add some initial data for testing
INSERT INTO properties (name, location, price_per_night) VALUES
('Cozy Beachfront Cottage', 'Malibu, CA', 250.00),
('Modern Downtown Loft', 'New York, NY', 350.50);

INSERT INTO customers (full_name, email, phone_number) VALUES
('John Doe', 'john.doe@example.com', '123-456-7890');