-- Test data for SaStays application
-- This file contains sample data for testing the application

-- Insert test owners
INSERT INTO owners (email, password, full_name, phone_number, verification_status) VALUES
('owner1@sastays.com', '$2b$10$8K4P0yX5zJ2uY1QwN4oZZOHzGXyX5RzY1qGjZZ5QwN4oZZOHzGXyX5', 'John Smith', '+27123456789', 'verified'),
('owner2@sastays.com', '$2b$10$8K4P0yX5zJ2uY1QwN4oZZOHzGXyX5RzY1qGjZZ5QwN4oZZOHzGXyX5', 'Sarah Johnson', '+27123456790', 'verified'),
('owner3@sastays.com', '$2b$10$8K4P0yX5zJ2uY1QwN4oZZOHzGXyX5RzY1qGjZZ5QwN4oZZOHzGXyX5', 'Michael Brown', '+27123456791', 'pending');

-- Insert test customers
INSERT INTO customers (email, full_name, phone_number, date_of_birth) VALUES
('guest1@example.com', 'Alice Williams', '+27123456792', '1990-05-15'),
('guest2@example.com', 'Bob Davis', '+27123456793', '1985-12-20'),
('guest3@example.com', 'Carol Miller', '+27123456794', '1988-03-10');

-- Insert test properties
INSERT INTO properties (owner_id, title, description, location, property_type, bedrooms, bathrooms, max_guests, nightly_price, cleaning_fee, amenities, house_rules, guest_requirements, images, instant_booking, status) VALUES
(1, 'Luxury Ocean View Apartment', 'Beautiful 2-bedroom apartment with stunning ocean views in Camps Bay. Perfect for couples or small families looking for a luxurious stay near the beach.', 'Camps Bay, Cape Town', 'apartment', 2, 2, 4, 850.00, 150.00, 
'["wifi", "kitchen", "pool", "parking", "ocean_view", "air_conditioning", "tv", "washing_machine"]',
'["no_smoking", "no_pets", "no_parties", "quiet_hours_10pm_8am"]',
'["id_required", "min_age_21", "security_deposit"]',
'["https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"]',
true, 'active'),

(1, 'Cozy Studio in City Center', 'Modern studio apartment in the heart of Cape Town CBD. Walking distance to restaurants, shops, and attractions.', 'Cape Town CBD', 'studio', 1, 1, 2, 450.00, 100.00,
'["wifi", "kitchen", "tv", "air_conditioning", "elevator"]',
'["no_smoking", "no_pets", "quiet_hours_10pm_8am"]',
'["id_required", "min_age_18"]',
'["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", "https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800"]',
true, 'active'),

(2, 'Spacious Family House', 'Large 4-bedroom house with garden, perfect for families. Located in a quiet residential area with easy access to attractions.', 'Constantia, Cape Town', 'house', 4, 3, 8, 1200.00, 200.00,
'["wifi", "kitchen", "pool", "parking", "garden", "bbq", "tv", "washing_machine", "dishwasher"]',
'["no_smoking", "pets_allowed", "no_parties", "quiet_hours_9pm_8am"]',
'["id_required", "min_age_25", "security_deposit"]',
'["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800", "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800", "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800"]',
false, 'active'),

(2, 'Mountain View Cottage', 'Charming cottage with beautiful mountain views. Quiet location perfect for a peaceful getaway.', 'Hout Bay, Cape Town', 'cottage', 2, 1, 4, 650.00, 120.00,
'["wifi", "kitchen", "fireplace", "mountain_view", "parking", "tv"]',
'["no_smoking", "no_pets", "no_parties"]',
'["id_required", "min_age_21"]',
'["https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800"]',
true, 'active'),

(3, 'Beachfront Villa', 'Exclusive beachfront villa with private beach access. Ultimate luxury accommodation for special occasions.', 'Clifton, Cape Town', 'villa', 5, 4, 10, 2500.00, 500.00,
'["wifi", "kitchen", "pool", "beach_access", "parking", "air_conditioning", "tv", "washing_machine", "dishwasher", "gym", "spa"]',
'["no_smoking", "no_pets", "events_allowed", "quiet_hours_11pm_8am"]',
'["id_required", "min_age_25", "security_deposit", "credit_check"]',
'["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800"]',
false, 'active');

-- Insert test bookings
INSERT INTO bookings (property_id, customer_id, start_date, end_date, guests, adults, children, subtotal, cleaning_fee, total_amount, status, payment_status, confirmation_code) VALUES
(1, 1, '2025-08-15', '2025-08-20', 2, 2, 0, 4250.00, 150.00, 4400.00, 'confirmed', 'paid', 'SAB001'),
(2, 2, '2025-08-25', '2025-08-28', 2, 2, 0, 1350.00, 100.00, 1450.00, 'confirmed', 'paid', 'SAB002'),
(3, 3, '2025-09-10', '2025-09-15', 6, 4, 2, 6000.00, 200.00, 6200.00, 'pending', 'pending', 'SAB003'),
(1, 2, '2025-09-20', '2025-09-25', 3, 2, 1, 4250.00, 150.00, 4400.00, 'confirmed', 'paid', 'SAB004');

-- Insert test payments
INSERT INTO payments (booking_id, payment_provider, amount, currency, status, payment_method) VALUES
(1, 'payfast', 4400.00, 'ZAR', 'completed', 'card'),
(2, 'ozow', 1450.00, 'ZAR', 'completed', 'eft'),
(4, 'payfast', 4400.00, 'ZAR', 'completed', 'card');

-- Insert test messages
INSERT INTO messages (booking_id, sender_type, sender_id, message, message_type) VALUES
(1, 'customer', 1, 'Hi, what time is check-in?', 'text'),
(1, 'owner', 1, 'Check-in is from 3 PM. I will send you the access code closer to your arrival date.', 'text'),
(2, 'customer', 2, 'Is parking available?', 'text'),
(2, 'owner', 1, 'Yes, there is one dedicated parking space included with your booking.', 'text'),
(3, 'customer', 3, 'Can we arrange early check-in?', 'text');

-- Insert test reviews
INSERT INTO reviews (booking_id, customer_id, property_id, rating, title, comment, status) VALUES
(1, 1, 1, 5, 'Amazing stay!', 'The apartment was exactly as described. Beautiful ocean views and very clean. John was a great host!', 'approved'),
(2, 2, 2, 4, 'Great location', 'Perfect location in the city center. The studio was cozy and had everything we needed.', 'approved');

-- Insert custom pricing for peak season
INSERT INTO custom_pricing (property_id, date, price) VALUES
(1, '2025-12-15', 1200.00),
(1, '2025-12-16', 1200.00),
(1, '2025-12-17', 1200.00),
(1, '2025-12-18', 1200.00),
(1, '2025-12-19', 1200.00),
(2, '2025-12-15', 650.00),
(2, '2025-12-16', 650.00),
(3, '2025-12-20', 1800.00),
(3, '2025-12-21', 1800.00),
(3, '2025-12-22', 1800.00);

-- Update property ratings based on reviews
UPDATE properties SET 
    average_rating = 5.0,
    total_reviews = 1
WHERE id = 1;

UPDATE properties SET 
    average_rating = 4.0,
    total_reviews = 1
WHERE id = 2;