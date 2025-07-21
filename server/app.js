// server/app.js - Main Express Application
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const redis = require('redis');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

const app = express();

// Database connection
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

// Redis connection
const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer storage for image uploads
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sastays-properties',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 800, crop: 'limit' }]
  },
});

const upload = multer({ storage: storage });

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Auth Routes
app.post('/api/auth/owner/register', async (req, res) => {
  try {
    const { email, password, fullName, phoneNumber } = req.body;
    
    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM owners WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const result = await pool.query(
      'INSERT INTO owners (email, password, full_name, phone_number) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name',
      [email, hashedPassword, fullName, phoneNumber]
    );
    
    const user = result.rows[0];
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'Owner registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/owner/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const result = await pool.query(
      'SELECT id, email, password, full_name, phone_number FROM owners WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phoneNumber: user.phone_number
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Property Routes
app.post('/api/properties', authenticateToken, upload.array('images', 10), async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      amenities,
      houseRules,
      guestRequirements,
      nightly_price,
      cleaning_fee,
      extra_guest_fee,
      pet_fee,
      max_guests,
      bedrooms,
      bathrooms,
      property_type
    } = req.body;
    
    // Upload images to Cloudinary
    const imageUrls = req.files ? req.files.map(file => file.path) : [];
    
    // Create property
    const result = await pool.query(`
      INSERT INTO properties (
        owner_id, title, description, location, amenities, house_rules, 
        guest_requirements, nightly_price, cleaning_fee, extra_guest_fee, 
        pet_fee, max_guests, bedrooms, bathrooms, property_type, images, 
        status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW())
      RETURNING *
    `, [
      req.user.userId, title, description, location, 
      JSON.stringify(amenities), JSON.stringify(houseRules), 
      JSON.stringify(guestRequirements), nightly_price, cleaning_fee, 
      extra_guest_fee, pet_fee, max_guests, bedrooms, bathrooms, 
      property_type, JSON.stringify(imageUrls), 'active'
    ]);
    
    res.status(201).json({
      message: 'Property created successfully',
      property: result.rows[0]
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/properties', async (req, res) => {
  try {
    const { location, start_date, end_date, guests } = req.query;
    
    let query = `
      SELECT p.*, o.full_name as owner_name 
      FROM properties p 
      JOIN owners o ON p.owner_id = o.id 
      WHERE p.status = 'active'
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (location) {
      paramCount++;
      query += ` AND LOWER(p.location) LIKE LOWER($${paramCount})`;
      params.push(`%${location}%`);
    }
    
    if (guests) {
      paramCount++;
      query += ` AND p.max_guests >= $${paramCount}`;
      params.push(guests);
    }
    
    // Check availability if dates provided
    if (start_date && end_date) {
      query += ` AND p.id NOT IN (
        SELECT DISTINCT property_id FROM bookings 
        WHERE status IN ('confirmed', 'checked_in') 
        AND (
          (start_date <= $${paramCount + 1} AND end_date > $${paramCount + 1}) OR
          (start_date < $${paramCount + 2} AND end_date >= $${paramCount + 2}) OR
          (start_date >= $${paramCount + 1} AND end_date <= $${paramCount + 2})
        )
      )`;
      params.push(start_date, end_date);
    }
    
    query += ' ORDER BY p.created_at DESC';
    
    const result = await pool.query(query, params);
    
    res.json({
      properties: result.rows
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/properties/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, o.full_name as owner_name, o.email as owner_email
      FROM properties p 
      JOIN owners o ON p.owner_id = o.id 
      WHERE p.id = $1 AND p.status = 'active'
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    // Get reviews for this property
    const reviewsResult = await pool.query(`
      SELECT r.*, c.full_name as customer_name
      FROM reviews r
      JOIN customers c ON r.customer_id = c.id
      WHERE r.property_id = $1 AND r.status = 'published'
      ORDER BY r.created_at DESC
    `, [req.params.id]);
    
    const property = result.rows[0];
    property.reviews = reviewsResult.rows;
    
    res.json({ property });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/properties/:id/booked-dates', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT start_date, end_date 
      FROM bookings 
      WHERE property_id = $1 AND status IN ('confirmed', 'checked_in')
      ORDER BY start_date
    `, [req.params.id]);
    
    const bookedDates = [];
    result.rows.forEach(booking => {
      const start = new Date(booking.start_date);
      const end = new Date(booking.end_date);
      
      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        bookedDates.push(new Date(d).toISOString().split('T')[0]);
      }
    });
    
    res.json({ bookedDates });
  } catch (error) {
    console.error('Get booked dates error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Booking Routes
app.post('/api/bookings', async (req, res) => {
  try {
    const {
      property_id,
      customer_email,
      customer_name,
      customer_phone,
      start_date,
      end_date,
      guests,
      special_requests
    } = req.body;
    
    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const today = new Date();
    
    if (startDate < today || endDate <= startDate) {
      return res.status(400).json({ error: 'Invalid dates' });
    }
    
    // Check availability
    const availabilityCheck = await pool.query(`
      SELECT COUNT(*) as booking_count 
      FROM bookings 
      WHERE property_id = $1 
      AND status IN ('confirmed', 'checked_in')
      AND (
        (start_date <= $2 AND end_date > $2) OR
        (start_date < $3 AND end_date >= $3) OR
        (start_date >= $2 AND end_date <= $3)
      )
    `, [property_id, start_date, end_date]);
    
    if (parseInt(availabilityCheck.rows[0].booking_count) > 0) {
      return res.status(400).json({ error: 'Property not available for selected dates' });
    }
    
    // Get property details for pricing
    const propertyResult = await pool.query(`
      SELECT nightly_price, cleaning_fee, extra_guest_fee, pet_fee, max_guests, owner_id
      FROM properties 
      WHERE id = $1 AND status = 'active'
    `, [property_id]);
    
    if (propertyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    const property = propertyResult.rows[0];
    
    if (guests > property.max_guests) {
      return res.status(400).json({ error: 'Too many guests for this property' });
    }
    
    // Calculate total price
    const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const subtotal = nights * property.nightly_price;
    const cleaningFee = property.cleaning_fee || 0;
    const extraGuestFee = guests > 2 ? (guests - 2) * (property.extra_guest_fee || 0) : 0;
    const totalAmount = subtotal + cleaningFee + extraGuestFee;
    
    // Create or get customer
    let customer;
    const existingCustomer = await pool.query(
      'SELECT id FROM customers WHERE email = $1',
      [customer_email]
    );
    
    if (existingCustomer.rows.length > 0) {
      customer = existingCustomer.rows[0];
    } else {
      const newCustomer = await pool.query(
        'INSERT INTO customers (email, full_name, phone_number) VALUES ($1, $2, $3) RETURNING id',
        [customer_email, customer_name, customer_phone]
      );
      customer = newCustomer.rows[0];
    }
    
    // Create booking
    const booking = await pool.query(`
      INSERT INTO bookings (
        property_id, customer_id, start_date, end_date, guests, 
        special_requests, subtotal, cleaning_fee, extra_guest_fee, 
        total_amount, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', NOW())
      RETURNING *
    `, [
      property_id, customer.id, start_date, end_date, guests,
      special_requests, subtotal, cleaningFee, extraGuestFee, totalAmount
    ]);
    
    res.status(201).json({
      message: 'Booking created successfully',
      booking: booking.rows[0],
      paymentRequired: true
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0'
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;