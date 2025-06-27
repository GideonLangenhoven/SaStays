// server/routes.js

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const pool = require('./db');
const { sendCustomerConfirmation, sendOwnerNotification } = require('./emailService'); // Import the email service

// ... (All other routes like GET /properties remain the same) ...

router.post('/bookings', async (req, res) => {
    const {
        property_id,
        start_date,
        end_date,
        total_price,
        fullName,
        email,
        phone
    } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // 1. Get Property details for the email
        const propertyResult = await client.query('SELECT * FROM properties WHERE id = $1', [property_id]);
        if (propertyResult.rows.length === 0) throw new Error("Property not found");
        const property = propertyResult.rows[0];

        // 2. Create or find the customer
        let customerResult = await client.query('SELECT * FROM customers WHERE email = $1', [email]);
        let customer;
        if (customerResult.rows.length > 0) {
            customer = customerResult.rows[0];
        } else {
            const newCustomer = await client.query('INSERT INTO customers (full_name, email, phone_number) VALUES ($1, $2, $3) RETURNING *', [fullName, email, phone]);
            customer = newCustomer.rows[0];
        }
        const customerId = customer.id;

        // 3. Create the booking
        const bookingResult = await client.query(
            'INSERT INTO bookings (property_id, customer_id, start_date, end_date, total_price, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [property_id, customerId, start_date, end_date, total_price, 'confirmed']
        );
        const booking = bookingResult.rows[0];

        // 4. Update availability
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        let currentDate = startDate;
        while (currentDate < endDate) {
            await client.query(
                `INSERT INTO property_availability (property_id, date, is_available, booking_id) VALUES ($1, $2, false, $3) ON CONFLICT (property_id, date) DO UPDATE SET is_available = false, booking_id = $3`,
                [property_id, currentDate.toISOString().split('T')[0], booking.id]
            );
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Commit the transaction
        await client.query('COMMIT');

        // 5. Send emails AFTER the booking is successfully saved
        const bookingDetails = { customer, property, booking };
        await sendCustomerConfirmation(bookingDetails);
        await sendOwnerNotification(bookingDetails);

        res.status(201).json({ success: true, bookingId: booking.id });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error creating booking:', err);
        res.status(500).json({ error: 'Failed to create booking', details: err.message });
    } finally {
        client.release();
    }
});

// ... (Payment route remains the same) ...

module.exports = router;