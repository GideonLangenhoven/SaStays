// server/routes.js

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const pool = require('./db');
const { sendCustomerConfirmation, sendOwnerNotification, sendOwnerConfirmationEmail } = require('./emailService');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// --- Helper function for PayFast Signature (already exists) ---
const createSignature = (data) => {
    let dataString = '';
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            dataString += `${key}=${encodeURIComponent(data[key].toString().replace(/ /g, '+'))}&`;
        }
    }
    dataString = dataString.slice(0, -1);
    return crypto.createHash('md5').update(dataString).digest('hex');
};

// --- Main Booking Endpoint (UPDATED) ---
router.post('/bookings', async (req, res) => {
    console.log('[SERVER LOG] --- Received new request to /api/bookings ---');
    const { property_id, start_date, end_date, total_price, fullName, email, phone, payment_provider } = req.body;
    console.log('[SERVER LOG] Request Body:', req.body);

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        console.log('[SERVER LOG] Database transaction started.');

        const propertyResult = await client.query('SELECT * FROM properties WHERE id = $1', [property_id]);
        if (propertyResult.rows.length === 0) throw new Error("Property not found");

        let customerResult = await client.query('SELECT * FROM customers WHERE email = $1', [email]);
        let customer;
        if (customerResult.rows.length > 0) {
            customer = customerResult.rows[0];
        } else {
            const newCustomer = await client.query('INSERT INTO customers (full_name, email, phone_number) VALUES ($1, $2, $3) RETURNING *', [fullName, email, phone]);
            customer = newCustomer.rows[0];
        }
        const customerId = customer.id;

        const bookingResult = await client.query(
            'INSERT INTO bookings (property_id, customer_id, start_date, end_date, total_price, status, payment_provider) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [property_id, customerId, start_date, end_date, total_price, 'pending', payment_provider]
        );
        const booking = bookingResult.rows[0];

        await client.query('COMMIT');

        // We will now handle payment initiation separately
        res.status(201).json({ success: true, bookingId: booking.id, propertyName: propertyResult.rows[0].name, totalPrice: booking.total_price });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('--- !!! BOOKING CREATION FAILED !!! ---');
        console.error(err);
        res.status(500).json({ error: 'Server failed to create booking', details: err.message });
    } finally {
        client.release();
    }
});


// --- PayFast Endpoint (already exists) ---
router.post('/generate-signature', (req, res) => {
    console.log('[SERVER LOG] Received new request to /api/generate-signature');
    const { total_price, bookingId, propertyName } = req.body;
    const passphrase = process.env.PAYFAST_PASSPHRASE;

    const paymentData = {
        merchant_id: process.env.PAYFAST_MERCHANT_ID,
        merchant_key: process.env.PAYFAST_MERCHANT_KEY,
        return_url: 'http://localhost:8080/booking?payment=success',
        cancel_url: 'http://localhost:8080/booking?payment=cancelled',
        notify_url: 'http://localhost:5001/api/payment-notify',
        m_payment_id: bookingId.toString(),
        amount: total_price.toFixed(2),
        item_name: `Booking for ${propertyName}`,
    };

    const dataForSignature = { ...paymentData };
    if (passphrase) {
        dataForSignature.passphrase = passphrase;
    }

    const signature = createSignature(dataForSignature);
    console.log('[SERVER LOG] Signature generated successfully.');

    res.json({ ...paymentData, signature });
});


// --- NEW: Ozow Payment Initiation Endpoint ---
router.post('/payments/ozow/initiate', (req, res) => {
    const { bookingId, totalPrice, propertyName } = req.body;
    console.log(`[OZOW] Initiating payment for Booking ID: ${bookingId}`);

    // TODO: Replace with actual Ozow API call
    // You'll need to get your SiteCode, PrivateKey, and ApiKey from your Ozow dashboard.
    // const ozowData = {
    //     SiteCode: process.env.OZOW_SITE_CODE,
    //     CountryCode: "ZA",
    //     CurrencyCode: "ZAR",
    //     Amount: totalPrice,
    //     TransactionReference: `booking_${bookingId}`,
    //     BankReference: `SAStays-${bookingId}`,
    //     // ... other required fields
    // };
    // const hash = generateOzowHash(ozowData, process.env.OZOW_PRIVATE_KEY);
    // ozowData.HashCheck = hash;

    // This is a placeholder. The actual Ozow API will return a redirect URL.
    const redirectUrl = `https://pay.ozow.com/....`; // Replace with the actual URL from Ozow's API response

    res.json({ success: true, redirectUrl });
});

// --- NEW: QR Code Payment Initiation Endpoint (for Zapper/SnapScan) ---
router.post('/payments/qrcode', (req, res) => {
    const { bookingId, totalPrice, propertyName, provider } = req.body;
    console.log(`[${provider.toUpperCase()}] Initiating QR payment for Booking ID: ${bookingId}`);

    // TODO: Replace with actual Zapper or SnapScan API call
    // This will vary depending on the provider's API.
    // They will typically return a deeplink URL or data to generate a QR code.
    let qrData = '';
    if (provider === 'zapper') {
        qrData = `zapper://payment?amount=${totalPrice}&ref=SAStays-${bookingId}`;
    } else if (provider === 'snapscan') {
        qrData = `snapscan://payment?amount=${totalPrice*100}&ref=SAStays-${bookingId}`; // SnapScan often uses cents
    }

    res.json({ success: true, qrData });
});


// --- Availability Endpoint (already exists) ---
router.get('/properties/:id/availability', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT date FROM property_availability WHERE property_id = $1 AND is_available = false', [id]);
        res.json(result.rows.map(row => row.date));
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch availability', details: err.message });
    }
});

// Payment redirect logic for Ozow, Zapper, SnapScan
router.post('/initiate-payment', (req, res) => {
    const { bookingId, payment_provider, total_price, propertyName } = req.body;

    let paymentUrl = '';
    switch (payment_provider) {
        case 'ozow':
            // Example Ozow URL (replace with real integration as needed)
            paymentUrl = `https://pay.ozow.com/?siteCode=DEMO&amount=${total_price}&reference=${bookingId}&currency=ZAR&description=Booking for ${encodeURIComponent(propertyName)}`;
            break;
        case 'zapper':
            // Example Zapper URL (replace with real integration as needed)
            paymentUrl = `https://www.zapper.com/url/qr?amount=${total_price}&reference=${bookingId}&description=Booking for ${encodeURIComponent(propertyName)}`;
            break;
        case 'snapscan':
            // Example SnapScan URL (replace with real integration as needed)
            paymentUrl = `https://pos.snapscan.io/qr/DEMO?amount=${total_price}&reference=${bookingId}&description=Booking for ${encodeURIComponent(propertyName)}`;
            break;
        default:
            return res.status(400).json({ error: 'Unsupported payment provider' });
    }

    res.json({ paymentUrl });
});

// --- Submit a rating and review for a booking ---
router.post('/ratings', async (req, res) => {
    const { booking_id, customer_id, property_id, rating, review } = req.body;
    if (!booking_id || !customer_id || !property_id || !rating) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }
    try {
        const result = await pool.query(
            'INSERT INTO ratings (booking_id, customer_id, property_id, rating, review) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [booking_id, customer_id, property_id, rating, review]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error submitting rating:', err);
        res.status(500).json({ error: 'Failed to submit rating.' });
    }
});

// --- Fetch all ratings for a property ---
router.get('/properties/:id/ratings', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT r.rating, r.review, c.full_name, r.created_at
             FROM ratings r
             JOIN customers c ON r.customer_id = c.id
             WHERE r.property_id = $1
             ORDER BY r.created_at DESC`,
            [id]
        );
        // Format name as "FirstName L."
        const ratings = result.rows.map(row => {
            const [first, ...rest] = row.full_name.split(' ');
            const lastInitial = rest.length > 0 ? rest[rest.length - 1][0] : '';
            return {
                rating: row.rating,
                review: row.review,
                name: lastInitial ? `${first} ${lastInitial}.` : first,
                created_at: row.created_at
            };
        });
        res.json(ratings);
    } catch (err) {
        console.error('Error fetching ratings:', err);
        res.status(500).json({ error: 'Failed to fetch ratings.' });
    }
});

// --- Owner Auth Middleware ---
function ownerAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.OWNER_JWT_SECRET || 'demo_secret');
        req.owner = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

// --- Owner Registration ---
router.post('/owner/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }
    try {
        const password_hash = await bcrypt.hash(password, 10);
        const confirmation_token = crypto.randomBytes(32).toString('hex');
        const result = await pool.query(
            'INSERT INTO owners (email, password_hash, confirmation_token) VALUES ($1, $2, $3) RETURNING *',
            [email, password_hash, confirmation_token]
        );
        // Send confirmation email
        await sendOwnerConfirmationEmail(email, confirmation_token);
        res.status(201).json({ message: 'Registration successful. Please check your email to confirm your account.' });
    } catch (err) {
        if (err.code === '23505') {
            res.status(409).json({ error: 'Email already registered.' });
        } else {
            console.error('Error registering owner:', err);
            res.status(500).json({ error: 'Failed to register owner.' });
        }
    }
});

// --- Owner Email Confirmation ---
router.get('/owner/confirm/:token', async (req, res) => {
    const { token } = req.params;
    try {
        const result = await pool.query(
            'UPDATE owners SET status = $1, confirmation_token = NULL WHERE confirmation_token = $2 RETURNING *',
            ['active', token]
        );
        if (result.rowCount === 0) {
            return res.status(400).send('Invalid or expired confirmation token.');
        }
        res.send('Your account has been confirmed! You can now log in.');
    } catch (err) {
        console.error('Error confirming owner:', err);
        res.status(500).send('Failed to confirm account.');
    }
});

// --- Update Owner Login to check status ---
router.post('/owner/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM owners WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const owner = result.rows[0];
        if (owner.status !== 'active') {
            return res.status(403).json({ error: 'Account not confirmed. Please check your email.' });
        }
        const valid = await bcrypt.compare(password, owner.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ email }, process.env.OWNER_JWT_SECRET || 'demo_secret', { expiresIn: '12h' });
        return res.json({ token });
    } catch (err) {
        console.error('Error during owner login:', err);
        return res.status(500).json({ error: 'Login failed' });
    }
});

// --- Fetch all bookings with customer and property info (Owner Dashboard, now protected) ---
router.get('/bookings/all', ownerAuth, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT b.*, c.full_name AS customer_name, c.email AS customer_email, c.phone_number AS customer_phone, p.name AS property_name
            FROM bookings b
            JOIN customers c ON b.customer_id = c.id
            JOIN properties p ON b.property_id = p.id
            ORDER BY b.start_date DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching all bookings:', err);
        res.status(500).json({ error: 'Failed to fetch bookings.' });
    }
});

// --- Payment Notification Endpoint (Generic for all providers) ---
router.post('/payment-notify', async (req, res) => {
    // 1. Parse and validate payment notification (PayFast, Ozow, SnapScan, Zapper)
    // 2. Extract bookingId (m_payment_id, TransactionReference, etc.)
    // 3. Check payment status (success/cancel/fail)
    // 4. If success: confirm booking, block dates, send emails/SMS
    // 5. If fail/cancel: cancel booking
    //
    // NOTE: This is a generic handler. You may want to add provider-specific validation for production.
    const client = await pool.connect();
    try {
        let provider = 'unknown';
        let bookingId;
        let paymentStatus = 'unknown';
        // --- PayFast ---
        if (req.body.m_payment_id) {
            provider = 'payfast';
            bookingId = parseInt(req.body.m_payment_id, 10);
            paymentStatus = req.body.payment_status; // 'COMPLETE', 'CANCELLED', etc.
        }
        // --- Ozow ---
        else if (req.body.TransactionReference) {
            provider = 'ozow';
            // TransactionReference: 'booking_123'
            bookingId = parseInt((req.body.TransactionReference || '').replace('booking_', ''), 10);
            paymentStatus = req.body.Status; // 'Complete', 'Cancelled', etc.
        }
        // --- SnapScan/Zapper (example, adapt as needed) ---
        else if (req.body.reference) {
            provider = req.body.provider || 'snapscan/zapper';
            bookingId = parseInt(req.body.reference.replace('SAStays-', ''), 10);
            paymentStatus = req.body.status; // 'success', 'cancelled', etc.
        }
        if (!bookingId) {
            return res.status(400).json({ error: 'Missing or invalid booking reference.' });
        }
        // Fetch booking
        const bookingRes = await client.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
        if (bookingRes.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found.' });
        }
        const booking = bookingRes.rows[0];
        // Only process if still pending
        if (booking.status !== 'pending') {
            return res.status(200).json({ message: 'Booking already processed.' });
        }
        // Handle payment status
        if (['COMPLETE', 'Complete', 'success'].includes(paymentStatus)) {
            // Confirm booking, block dates
            await client.query('BEGIN');
            // Block dates in property_availability
            const startDate = new Date(booking.start_date);
            const endDate = new Date(booking.end_date);
            let currentDate = new Date(startDate);
            while (currentDate < endDate) {
                await client.query(
                    'INSERT INTO property_availability (property_id, date, is_available, booking_id) VALUES ($1, $2, false, $3) ON CONFLICT (property_id, date) DO NOTHING',
                    [booking.property_id, currentDate, booking.id]
                );
                currentDate.setDate(currentDate.getDate() + 1);
            }
            // Update booking status
            await client.query('UPDATE bookings SET status = $1 WHERE id = $2', ['confirmed', bookingId]);
            await client.query('COMMIT');
            // Send confirmation emails/SMS
            // Fetch customer and property
            const customerRes = await client.query('SELECT * FROM customers WHERE id = $1', [booking.customer_id]);
            const propertyRes = await client.query('SELECT * FROM properties WHERE id = $1', [booking.property_id]);
            if (customerRes.rows.length && propertyRes.rows.length) {
                const bookingDetails = {
                    customer: customerRes.rows[0],
                    property: propertyRes.rows[0],
                    booking: booking,
                };
                sendCustomerConfirmation(bookingDetails);
                sendOwnerNotification(bookingDetails);
            }
            return res.status(200).json({ success: true, message: 'Booking confirmed and dates blocked.' });
        } else {
            // Cancel booking
            await client.query('UPDATE bookings SET status = $1 WHERE id = $2', ['cancelled', bookingId]);
            return res.status(200).json({ success: false, message: 'Booking cancelled due to payment failure.' });
        }
    } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        console.error('Payment notification error:', err);
        return res.status(500).json({ error: 'Failed to process payment notification.' });
    } finally {
        client.release();
    }
});

module.exports = router;