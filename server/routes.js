// server/routes.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const pool = require('./db');
const { sendCustomerConfirmation, sendOwnerNotification, sendOwnerConfirmationEmail } = require('./emailService');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { addDays, eachDayOfInterval, format, parseISO, differenceInDays } = require('date-fns');
const { sendOwnerSMS } = require('./smsService');

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test database connection
router.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT COUNT(*) FROM properties');
        res.json({ 
            status: 'Database connected', 
            properties_count: result.rows[0].count,
            timestamp: new Date().toISOString() 
        });
    } catch (err) {
        console.error('Database connection error:', err.message);
        res.status(500).json({ error: 'Database connection failed', message: err.message });
    }
});

// Get all properties (public endpoint)
router.get('/properties', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM properties WHERE status = $1 ORDER BY created_at DESC', ['active']);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching properties:', err.message);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
});

// Middleware to verify JWT
const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).send('Access denied. No token provided.');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.owner = decoded;
        next();
    } catch (ex) {
        res.status(400).send('Invalid token.');
    }
};


// --- Property Management ---
router.post('/properties', auth, async (req, res) => {
    const {
        name, description, price_per_night, capacity, location,
        amenities, house_rules, guest_requirements, status, images
    } = req.body;
    const owner_id = req.owner.id;

    try {
        const newProperty = await pool.query(
            `INSERT INTO properties
            (owner_id, name, description, price_per_night, capacity, location, amenities, house_rules, guest_requirements, status, images)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
            RETURNING *`,
            [owner_id, name, description, price_per_night, capacity, location, amenities, house_rules, guest_requirements, status, images]
        );
        res.json(newProperty.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.put('/properties/:id', auth, async (req, res) => {
    const { id } = req.params;
    const {
        name, description, price_per_night, capacity, location,
        amenities, house_rules, guest_requirements, status, images
    } = req.body;
    const owner_id = req.owner.id;

    try {
        const updatedProperty = await pool.query(
            `UPDATE properties SET
            name = $1, description = $2, price_per_night = $3, capacity = $4, location = $5,
            amenities = $6, house_rules = $7, guest_requirements = $8, status = $9, images = $10
            WHERE id = $11 AND owner_id = $12 RETURNING *`,
            [name, description, price_per_night, capacity, location, amenities, house_rules, guest_requirements, status, images, id, owner_id]
        );

        if (updatedProperty.rows.length === 0) {
            return res.status(404).json({ msg: 'Property not found or you are not the owner' });
        }

        res.json(updatedProperty.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// GET endpoint for a single property (all fields)
router.get('/properties/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const property = await pool.query(
            'SELECT * FROM properties WHERE id = $1',
            [id]
        );
        if (property.rows.length === 0) {
            return res.status(404).json({ msg: 'Property not found' });
        }
        res.json(property.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.delete('/properties/:id', auth, async (req, res) => {
    const { id } = req.params;
    const owner_id = req.owner.id;

    try {
        const deleteOp = await pool.query('DELETE FROM properties WHERE id = $1 AND owner_id = $2', [id, owner_id]);

        if (deleteOp.rowCount === 0) {
            return res.status(404).json({ msg: 'Property not found or you are not the owner' });
        }

        res.json({ msg: 'Property removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


// --- Co-hosting ---
router.post('/properties/:id/co-hosts', auth, async (req, res) => {
    const { id } = req.params;
    const { coHostEmail, permissions } = req.body;
    const owner_id = req.owner.id;

    try {
        // Find the co-host by email
        const coHost = await pool.query('SELECT id FROM owners WHERE email = $1', [coHostEmail]);
        if (coHost.rows.length === 0) {
            return res.status(404).json({ msg: 'Co-host not found' });
        }
        const coHostId = coHost.rows[0].id;

        // Add the co-host to the property
        const newCoHost = await pool.query(
            'INSERT INTO co_hosts (property_id, owner_id, co_host_id, permissions) VALUES ($1, $2, $3, $4) RETURNING *',
            [id, owner_id, coHostId, permissions]
        );
        res.json(newCoHost.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// --- External Calendar Sync ---
router.post('/properties/:id/sync-calendar', auth, async (req, res) => {
    const { id } = req.params;
    const { externalCalendarUrl } = req.body;

    // In a real application, you would parse the iCal file from the URL and update your calendar
    console.log(`Syncing calendar for property ${id} with URL: ${externalCalendarUrl}`);

    res.json({ msg: 'Calendar sync initiated' });
});

// --- Booking Management ---

// Create a booking (instant or pending approval)
router.post('/bookings', async (req, res) => {
    const {
        property_id, customer_id, start_date, end_date, total_price, status, payment_provider,
        guest_name, guest_email, guest_phone, guest_count, adults, children
    } = req.body;

    try {
        // Check for double booking
        const overlap = await pool.query(
            `SELECT * FROM bookings
             WHERE property_id = $1
             AND status IN ('pending', 'confirmed')
             AND NOT (end_date <= $2 OR start_date >= $3)`,
            [property_id, start_date, end_date]
        );
        if (overlap.rows.length > 0) {
            return res.status(409).json({ msg: 'Property is already booked for these dates.' });
        }

        // Create booking
        const newBooking = await pool.query(
            `INSERT INTO bookings
            (property_id, customer_id, start_date, end_date, total_amount, status, payment_provider, guest_name, guest_email, guest_phone, guests, adults, children)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
            RETURNING *`,
            [property_id, customer_id, start_date, end_date, total_price, status || 'pending', payment_provider || 'pending', 
             guest_name, guest_email, guest_phone, guest_count || (adults + children), adults || 1, children || 0]
        );

        res.json(newBooking.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get booked dates for a property
router.get('/properties/:id/booked-dates', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT start_date, end_date FROM bookings WHERE property_id = $1 AND status = 'confirmed'`,
            [id]
        );
        const bookedDates = [];
        result.rows.forEach(row => {
            const dates = eachDayOfInterval({ start: parseISO(row.start_date), end: parseISO(row.end_date) });
            dates.forEach(date => bookedDates.push(format(date, 'yyyy-MM-dd')));
        });
        res.json(bookedDates);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// --- Guest Messaging ---
router.post('/messages', auth, async (req, res) => {
  const { booking_id, message } = req.body;
  const sender_id = req.owner.id;
  const result = await pool.query(
    'INSERT INTO messages (booking_id, sender_id, message, sender_type) VALUES ($1, $2, $3, $4) RETURNING *',
    [booking_id, sender_id, message, 'owner']
  );
  res.json(result.rows[0]);
});

router.get('/messages/:booking_id', auth, async (req, res) => {
  const { booking_id } = req.params;
  const result = await pool.query(
    'SELECT * FROM messages WHERE booking_id = $1 ORDER BY created_at ASC',
    [booking_id]
  );
  res.json(result.rows);
});

// --- Authentication Routes ---

// Owner Login
router.post('/owner/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if owner exists
    const ownerResult = await pool.query('SELECT * FROM owners WHERE email = $1', [email]);
    
    if (ownerResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const owner = ownerResult.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const payload = {
      id: owner.id,
      email: owner.email,
      role: 'owner'
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });

    res.json({
      token,
      owner: {
        id: owner.id,
        email: owner.email,
        first_name: owner.full_name?.split(' ')[0] || 'Owner',
        last_name: owner.full_name?.split(' ').slice(1).join(' ') || '',
        full_name: owner.full_name,
        role: 'owner'
      }
    });

  } catch (err) {
    console.error('Owner login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Guest Login  
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if guest exists
    const guestResult = await pool.query('SELECT * FROM guests WHERE email = $1', [email]);
    
    if (guestResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const guest = guestResult.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, guest.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const payload = {
      id: guest.id,
      email: guest.email,
      role: 'guest'
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });

    res.json({
      token,
      user: {
        id: guest.id,
        email: guest.email,
        first_name: guest.first_name,
        last_name: guest.last_name,
        role: 'guest'
      }
    });

  } catch (err) {
    console.error('Guest login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get User Profile (works for both owners and guests)
router.get('/auth/profile', auth, async (req, res) => {
  try {
    const userId = req.owner.id;
    const userRole = req.owner.role;

    let user;
    if (userRole === 'owner') {
      const result = await pool.query('SELECT * FROM owners WHERE id = $1', [userId]);
      const owner = result.rows[0];
      if (owner) {
        user = {
          id: owner.id,
          email: owner.email,
          first_name: owner.full_name?.split(' ')[0] || 'Owner',
          last_name: owner.full_name?.split(' ').slice(1).join(' ') || '',
          full_name: owner.full_name,
          role: 'owner'
        };
      }
    } else if (userRole === 'guest') {
      const result = await pool.query('SELECT * FROM guests WHERE id = $1', [userId]);
      const guest = result.rows[0];
      if (guest) {
        user = {
          id: guest.id,
          email: guest.email,
          first_name: guest.first_name,
          last_name: guest.last_name,
          role: 'guest'
        };
      }
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });

  } catch (err) {
    console.error('Profile fetch error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;