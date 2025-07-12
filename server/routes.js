const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const pool = require('./db');
const { sendCustomerConfirmation, sendOwnerNotification, sendOwnerConfirmationEmail } = require('./emailService');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { addDays, eachDayOfInterval, format, parseISO, differenceInDays } = require('date-fns');
const { sendOwnerSMS } = require('./smsService');

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


// --- Booking Management ---

// Create a booking (instant or pending approval)
router.post('/bookings', async (req, res) => {
    const {
        property_id, customer_id, start_date, end_date, total_price, status, payment_provider
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
            (property_id, customer_id, start_date, end_date, total_price, status, payment_provider)
            VALUES ($1,$2,$3,$4,$5,$6,$7)
            RETURNING *`,
            [property_id, customer_id, start_date, end_date, total_price, status, payment_provider]
        );

        // Block out dates in property_availability
        const days = [];
        let d = new Date(start_date);
        const end = new Date(end_date);
        while (d < end) {
            days.push(new Date(d));
            d.setDate(d.getDate() + 1);
        }
        for (const day of days) {
            await pool.query(
                `INSERT INTO property_availability (property_id, date, is_available, booking_id)
                 VALUES ($1, $2, false, $3)
                 ON CONFLICT (property_id, date) DO UPDATE SET is_available = false, booking_id = $3`,
                [property_id, day.toISOString().slice(0, 10), newBooking.rows[0].id]
            );
        }

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
            `SELECT date FROM property_availability WHERE property_id = $1 AND is_available = false`,
            [id]
        );
        res.json(result.rows.map(r => r.date));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


// --- Other routes from previous steps ---
// ... (The rest of the routes.js code remains the same as provided in the previous turn)

// Payment Webhook (generic for all providers)
router.post('/webhook/payment', async (req, res) => {
    // You will need to parse and verify the payload according to each provider's docs
    const { provider, booking_id, payment_status, provider_transaction_id, amount, raw_response } = req.body;

    try {
        if (payment_status === 'SUCCESS') {
            // Update booking status
            await pool.query(
                'UPDATE bookings SET status = $1 WHERE id = $2',
                ['confirmed', booking_id]
            );
            // Log transaction
            await pool.query(
                `INSERT INTO transactions (booking_id, payment_provider, provider_transaction_id, amount, status, raw_response)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [booking_id, provider, provider_transaction_id, amount, 'success', raw_response]
            );
            // (Optional) Send notifications here
        }
        res.status(200).json({ ok: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.post('/webhook/ozow', async (req, res) => {
  const { Reference, Status, TransactionId, Amount } = req.body;
  try {
    if (Status === 'Complete') {
      // Find booking by Reference
      const bookingRes = await pool.query('SELECT * FROM bookings WHERE id = $1', [Reference]);
      if (bookingRes.rows.length === 0) return res.status(404).send('Booking not found');
      // Update booking status
      await pool.query('UPDATE bookings SET status = $1 WHERE id = $2', ['confirmed', Reference]);
      // Log transaction
      await pool.query(
        `INSERT INTO transactions (booking_id, payment_provider, provider_transaction_id, amount, status, raw_response)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [Reference, 'ozow', TransactionId, Amount, 'success', JSON.stringify(req.body)]
      );
      // Notify owner (email + SMS)
      const property = await pool.query('SELECT * FROM properties WHERE id = $1', [bookingRes.rows[0].property_id]);
      const owner = await pool.query('SELECT * FROM owners WHERE id = $1', [property.rows[0].owner_id]);
      await sendOwnerNotification(owner.rows[0].email, bookingRes.rows[0]);
      await sendOwnerSMS(owner.rows[0].phone, `New booking confirmed for property: ${property.rows[0].name}`);
    }
    res.status(200).send('OK');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// --- Guest Messaging ---
router.post('/messages', async (req, res) => {
  const { booking_id, sender_id, message } = req.body;
  const result = await pool.query(
    'INSERT INTO messages (booking_id, sender_id, message) VALUES ($1, $2, $3) RETURNING *',
    [booking_id, sender_id, message]
  );
  res.json(result.rows[0]);
});
router.get('/messages/:booking_id', async (req, res) => {
  const { booking_id } = req.params;
  const result = await pool.query(
    'SELECT * FROM messages WHERE booking_id = $1 ORDER BY created_at ASC',
    [booking_id]
  );
  res.json(result.rows);
});

// Get dashboard stats for an owner
router.get('/owner/:ownerId/dashboard', async (req, res) => {
  const { ownerId } = req.params;
  try {
    // Total bookings
    const bookings = await pool.query(
      `SELECT * FROM bookings WHERE property_id IN (SELECT id FROM properties WHERE owner_id = $1)`, [ownerId]
    );
    // Occupancy rate (booked nights / total nights in range)
    const occupancy = await pool.query(
      `SELECT COUNT(*) AS booked_nights FROM property_availability WHERE property_id IN (SELECT id FROM properties WHERE owner_id = $1) AND is_available = false`, [ownerId]
    );
    // Earnings
    const earnings = await pool.query(
      `SELECT SUM(amount) AS total_earnings FROM transactions WHERE booking_id IN (SELECT id FROM bookings WHERE property_id IN (SELECT id FROM properties WHERE owner_id = $1)) AND status = 'success'`, [ownerId]
    );
    // Reviews
    const reviews = await pool.query(
      `SELECT * FROM reviews WHERE property_id IN (SELECT id FROM properties WHERE owner_id = $1)`, [ownerId]
    );
    // Transactions
    const transactions = await pool.query(
      `SELECT * FROM transactions WHERE booking_id IN (SELECT id FROM bookings WHERE property_id IN (SELECT id FROM properties WHERE owner_id = $1))`, [ownerId]
    );
    res.json({
      bookings: bookings.rows,
      occupancy: occupancy.rows[0].booked_nights,
      earnings: earnings.rows[0].total_earnings,
      reviews: reviews.rows,
      transactions: transactions.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.post('/reviews', async (req, res) => {
  const { booking_id, property_id, rating, review } = req.body;
  await pool.query(
    'INSERT INTO reviews (booking_id, property_id, rating, review) VALUES ($1, $2, $3, $4)',
    [booking_id, property_id, rating, review]
  );
  res.json({ ok: true });
});

// Add or update payout method
router.post('/payout-method', async (req, res) => {
  const { owner_id, bank_name, account_number, account_type, branch_code } = req.body;
  // Upsert logic: if exists, update; else, insert
  const existing = await pool.query('SELECT * FROM payout_methods WHERE owner_id = $1', [owner_id]);
  let result;
  if (existing.rows.length > 0) {
    result = await pool.query(
      `UPDATE payout_methods SET bank_name=$1, account_number=$2, account_type=$3, branch_code=$4 WHERE owner_id=$5 RETURNING *`,
      [bank_name, account_number, account_type, branch_code, owner_id]
    );
  } else {
    result = await pool.query(
      `INSERT INTO payout_methods (owner_id, bank_name, account_number, account_type, branch_code) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [owner_id, bank_name, account_number, account_type, branch_code]
    );
  }
  res.json(result.rows[0]);
});

// Get payout method for owner
router.get('/payout-method/:owner_id', async (req, res) => {
  const { owner_id } = req.params;
  const result = await pool.query('SELECT * FROM payout_methods WHERE owner_id = $1', [owner_id]);
  res.json(result.rows[0]);
});

module.exports = router;