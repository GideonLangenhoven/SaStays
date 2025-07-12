const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const pool = require('./db');
const { sendCustomerConfirmation, sendOwnerNotification, sendOwnerConfirmationEmail } = require('./emailService');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { addDays, eachDayOfInterval, format, parseISO, differenceInDays } = require('date-fns');
const { createClient } = require('@supabase/supabase-js');

// This needs to be configured on the server. In a real deployment,
// you would initialize this once and share it, not re-initialize it here.
// For this project structure, we will assume the env vars are available.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);


// --- Middleware to get user from Supabase JWT ---
const getUserFromToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const token = authHeader.split(' ')[1];
        
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Authentication failed' });
    }
};

// --- NEW CO-HOSTING ENDPOINTS ---

// Invite a co-host to a property
router.post('/properties/:propertyId/cohosts', getUserFromToken, async (req, res) => {
    const ownerId = req.user.id;
    const { propertyId } = req.params;
    const { cohost_email } = req.body;

    if (!cohost_email) {
        return res.status(400).json({ error: 'Co-host email is required.' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // 1. Verify the requester is the owner of the property
        const propRes = await client.query('SELECT owner_id FROM properties WHERE id = $1', [propertyId]);
        if (propRes.rows.length === 0 || propRes.rows[0].owner_id !== ownerId) {
            await client.query('ROLLBACK');
            return res.status(403).json({ error: "You are not authorized to add co-hosts to this property." });
        }

        // 2. Find the user to be invited by email
        const userToInviteRes = await client.query('SELECT id FROM profiles WHERE email = $1', [cohost_email]);
        if (userToInviteRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "User with this email does not exist." });
        }
        const cohostId = userToInviteRes.rows[0].id;

        // 3. Add the user to the co_hosts table
        const { rows } = await client.query(
            `INSERT INTO co_hosts (property_id, user_id, permissions) VALUES ($1, $2, $3) RETURNING *`,
            [propertyId, cohostId, JSON.stringify({ can_edit: true })] // Default permissions
        );

        await client.query('COMMIT');
        res.status(201).json({ success: true, cohost: rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        if (error.code === '23505') { // unique_violation
            return res.status(409).json({ error: 'This user is already a co-host for this property.' });
        }
        console.error("Error adding co-host:", error);
        res.status(500).json({ error: "Failed to add co-host." });
    } finally {
        client.release();
    }
});

// Remove a co-host from a property
router.delete('/properties/:propertyId/cohosts/:cohostId', getUserFromToken, async (req, res) => {
    const ownerId = req.user.id;
    const { propertyId, cohostId } = req.params;

     try {
        const propRes = await pool.query('SELECT owner_id FROM properties WHERE id = $1', [propertyId]);
        if (propRes.rows.length === 0 || propRes.rows[0].owner_id !== ownerId) {
            return res.status(403).json({ error: "You are not authorized to manage co-hosts for this property." });
        }

        await pool.query('DELETE FROM co_hosts WHERE property_id = $1 AND user_id = $2', [propertyId, cohostId]);
        res.json({ success: true, message: "Co-host removed successfully." });
    } catch (error) {
        console.error("Error removing co-host:", error);
        res.status(500).json({ error: "Failed to remove co-host." });
    }
});


// --- Helper function for PayFast Signature ---
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

// --- Endpoint to get all booked dates for a property ---
router.get('/properties/:id/booked-dates', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            "SELECT start_date, end_date FROM bookings WHERE property_id = $1 AND status = 'confirmed'",
            [id]
        );
        let bookedDates = [];
        result.rows.forEach(booking => {
            const interval = { start: new Date(booking.start_date), end: addDays(new Date(booking.end_date), -1) };
            bookedDates.push(...eachDayOfInterval(interval));
        });
        res.json(bookedDates);
    } catch (err) {
        console.error('Error fetching booked dates:', err);
        res.status(500).json({ error: 'Failed to fetch booked dates.', details: err.message });
    }
});


// --- Pricing Engine Endpoint ---
router.post('/properties/:id/calculate-price', async (req, res) => {
    const { id } = req.params;
    const { start_date, end_date } = req.body;
    if (!start_date || !end_date) return res.status(400).json({ error: 'Start date and end date are required.' });
    try {
        const startDate = parseISO(start_date);
        const endDate = parseISO(end_date);
        const nights = differenceInDays(endDate, startDate);
        if (nights <= 0) return res.status(400).json({ error: 'End date must be after start date.' });
        
        const propertyRes = await pool.query('SELECT base_price_per_night FROM properties WHERE id = $1', [id]);
        if (propertyRes.rows.length === 0) return res.status(404).json({ error: 'Property not found.' });
        const basePrice = parseFloat(propertyRes.rows[0].base_price_per_night);

        const rulesRes = await pool.query('SELECT * FROM pricing_rules WHERE property_id = $1 ORDER BY start_date', [id]);
        const rules = rulesRes.rows;
        
        let totalPrice = 0;
        const stayDates = eachDayOfInterval({ start: startDate, end: addDays(endDate, -1) });
        const priceBreakdown = stayDates.map(date => {
            let dailyPrice = basePrice;
            const applicableRule = rules.find(rule => date >= new Date(rule.start_date) && date <= new Date(rule.end_date) && rule.type === 'nightly_override');
            if (applicableRule) dailyPrice = parseFloat(applicableRule.value);
            totalPrice += dailyPrice;
            return { date: format(date, 'yyyy-MM-dd'), price: dailyPrice };
        });

        const weeklyDiscountRule = rules.find(rule => rule.type === 'weekly_discount_percent' && nights >= 7);
        if (weeklyDiscountRule) {
            const discountPercentage = parseFloat(weeklyDiscountRule.value);
            totalPrice = totalPrice * (1 - discountPercentage / 100);
        }

        res.json({ totalPrice: totalPrice.toFixed(2), nights: nights, breakdown: priceBreakdown });
    } catch (err) {
        console.error('Error calculating price:', err);
        res.status(500).json({ error: 'Failed to calculate price.', details: err.message });
    }
});

// --- Main Booking Endpoint ---
router.post('/bookings', getUserFromToken, async (req, res) => {
    const { property_id, start_date, end_date, total_price } = req.body;
    const guest_id = req.user.id;
    if (!property_id || !guest_id || !start_date || !end_date || !total_price) return res.status(400).json({ error: "Missing required booking information." });
    
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const propertyResult = await client.query('SELECT booking_type, title FROM properties WHERE id = $1', [property_id]);
        if (propertyResult.rows.length === 0) throw new Error("Property not found");
        const property = propertyResult.rows[0];
        
        const initialStatus = property.booking_type === 'instant' ? 'pending' : 'pending_approval';

        const bookingResult = await client.query('INSERT INTO bookings (property_id, guest_id, start_date, end_date, total_price, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [property_id, guest_id, start_date, end_date, total_price, initialStatus]);
        const newBooking = bookingResult.rows[0];
        newBooking.propertyName = property.title;
        await client.query('COMMIT');
        res.status(201).json({ success: true, booking: newBooking, message: initialStatus === 'pending' ? 'Booking created and awaiting payment.' : 'Booking request sent for owner approval.' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error creating booking:', err);
        res.status(500).json({ error: 'Server failed to create booking', details: err.message });
    } finally {
        client.release();
    }
});

// --- PayFast Endpoint ---
router.post('/generate-signature', (req, res) => {
    const { total_price, bookingId, propertyName } = req.body;
    const passphrase = process.env.PAYFAST_PASSPHRASE;

    const paymentData = {
        merchant_id: process.env.PAYFAST_MERCHANT_ID,
        merchant_key: process.env.PAYFAST_MERCHANT_KEY,
        return_url: `http://localhost:8080/booking-confirmation?booking_id=${bookingId}&status=success`,
        cancel_url: `http://localhost:8080/booking-confirmation?booking_id=${bookingId}&status=cancelled`,
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
    res.json({ ...paymentData, signature });
});

// --- Owner Dashboard: Endpoint to approve/decline bookings ---
router.post('/bookings/:id/update-status', getUserFromToken, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const ownerId = req.user.id;
    if (!['confirmed', 'cancelled'].includes(status)) return res.status(400).json({ error: "Invalid status provided." });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const bookingRes = await pool.query('SELECT b.*, p.owner_id FROM bookings b JOIN properties p ON b.property_id = p.id WHERE b.id = $1', [id]);
        if (bookingRes.rows.length === 0) return res.status(404).json({ error: "Booking not found." });
        if (bookingRes.rows[0].owner_id !== ownerId) return res.status(403).json({ error: "You are not authorized to update this booking." });

        const { rows } = await client.query("UPDATE bookings SET status = $1 WHERE id = $2 AND status = 'pending_approval' RETURNING *", [status, id]);
        if (rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "Booking not found or cannot be updated." });
        }
        const updatedBooking = rows[0];

        if (updatedBooking.status === 'confirmed') {
            const propertyRes = await client.query('SELECT * FROM properties WHERE id = $1', [updatedBooking.property_id]);
            const guestRes = await client.query('SELECT * FROM profiles WHERE id = $1', [updatedBooking.guest_id]);
            if (propertyRes.rows.length > 0 && guestRes.rows.length > 0) {
                const notificationDetails = { property: propertyRes.rows[0], booking: updatedBooking, guest: guestRes.rows[0] };
                await sendCustomerConfirmation(notificationDetails);
                await sendOwnerNotification(notificationDetails);
            }
        }
        
        await client.query('COMMIT');
        res.json({ success: true, booking: updatedBooking });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error updating booking status:", error);
        res.status(500).json({ error: "Failed to update booking status." });
    } finally {
        client.release();
    }
});


// --- Payment Notification Endpoint (ITN) ---
router.post('/payment-notify', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { m_payment_id: bookingId, pf_payment_id: providerTransactionId, amount_gross: amount, payment_status: paymentStatus } = req.body;
        if (!bookingId) return res.status(400).send('Error: Missing booking ID.');

        await client.query(`INSERT INTO transactions (booking_id, payment_provider, provider_transaction_id, amount, status, raw_response) VALUES ($1, $2, $3, $4, $5, $6)`, [bookingId, 'payfast', providerTransactionId, amount, paymentStatus, req.body]);

        if (paymentStatus === 'COMPLETE') {
            const { rows } = await client.query("UPDATE bookings SET status = 'confirmed' WHERE id = $1 AND status = 'pending' RETURNING *", [bookingId]);
            if (rows.length > 0) {
                const confirmedBooking = rows[0];
                const propertyRes = await client.query('SELECT * FROM properties WHERE id = $1', [confirmedBooking.property_id]);
                const guestRes = await client.query('SELECT * FROM profiles WHERE id = $1', [confirmedBooking.guest_id]);
                if (propertyRes.rows.length > 0 && guestRes.rows.length > 0) {
                    const notificationDetails = { property: propertyRes.rows[0], booking: confirmedBooking, guest: guestRes.rows[0] };
                    await sendCustomerConfirmation(notificationDetails);
                    await sendOwnerNotification(notificationDetails);
                }
            }
        } else {
             await client.query("UPDATE bookings SET status = 'cancelled' WHERE id = $1 AND status = 'pending'", [bookingId]);
        }
        await client.query('COMMIT');
        res.status(200).send('OK');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error in payment-notify webhook:', err);
        res.status(500).send('Error processing notification.');
    } finally {
        client.release();
    }
});

module.exports = router;