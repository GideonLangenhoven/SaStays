// server/routes.js

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const pool = require('./db');
const { sendCustomerConfirmation, sendOwnerNotification } = require('./emailService');

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

// --- Main Booking Endpoint (already exists, no changes needed here) ---
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
        return_url: 'http://localhost:8080/booking-success',
        cancel_url: 'http://localhost:8080/booking-cancelled',
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

module.exports = router;