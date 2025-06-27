// server/routes.js

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const pool = require('./db');
const { sendCustomerConfirmation, sendOwnerNotification } = require('./emailService');

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

router.post('/bookings', async (req, res) => {
    console.log('[SERVER LOG] --- Received new request to /api/bookings ---');
    const { property_id, start_date, end_date, total_price, fullName, email, phone } = req.body;
    console.log('[SERVER LOG] Request Body:', req.body);
    
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        console.log('[SERVER LOG] Database transaction started.');

        const propertyResult = await client.query('SELECT * FROM properties WHERE id = $1', [property_id]);
        if (propertyResult.rows.length === 0) throw new Error("Property not found");
        
        console.log('[SERVER LOG] Found property. Now finding or creating customer.');
        let customerResult = await client.query('SELECT * FROM customers WHERE email = $1', [email]);
        let customer;
        if (customerResult.rows.length > 0) {
            customer = customerResult.rows[0];
        } else {
            const newCustomer = await client.query('INSERT INTO customers (full_name, email, phone_number) VALUES ($1, $2, $3) RETURNING *', [fullName, email, phone]);
            customer = newCustomer.rows[0];
        }
        const customerId = customer.id;
        console.log(`[SERVER LOG] Customer ID is: ${customerId}`);

        console.log('[SERVER LOG] Now creating the booking record...');
        const bookingResult = await client.query(
            'INSERT INTO bookings (property_id, customer_id, start_date, end_date, total_price, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [property_id, customerId, start_date, end_date, total_price, 'pending']
        );
        const booking = bookingResult.rows[0];
        console.log(`[SERVER LOG] Booking record created with ID: ${booking.id}`);

        await client.query('COMMIT');
        console.log('[SERVER LOG] Transaction committed successfully.');
        
        res.status(201).json({ success: true, bookingId: booking.id });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('--- !!! SERVER CRASHED HERE !!! ---');
        console.error(err); // This will print the exact error to your terminal
        res.status(500).json({ error: 'Server failed to create booking', details: err.message });
    } finally {
        client.release();
    }
});

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

// The availability route is unchanged
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