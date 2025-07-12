// server/scheduler.js
const cron = require('node-cron');
const pool = require('./db');
const { sendPostStayRatingRequest } = require('./emailService');

const checkCompletedStaysAndSendEmails = async () => {
    console.log('Scheduler: Running job to check for completed stays...');
    const client = await pool.connect();
    try {
        // Find bookings that ended yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const formattedYesterday = yesterday.toISOString().split('T')[0];

        const res = await client.query(
            `SELECT b.id, b.start_date, b.end_date, b.total_price, c.full_name, c.email, p.name AS property_name
             FROM bookings b
             JOIN customers c ON b.customer_id = c.id
             JOIN properties p ON b.property_id = p.id
             WHERE b.end_date = $1 AND b.status = 'confirmed'`,
            [formattedYesterday]
        );

        if (res.rows.length > 0) {
            console.log(`Scheduler: Found ${res.rows.length} completed stays. Sending rating request emails.`);
            for (const row of res.rows) {
                const bookingDetails = {
                    customer: {
                        full_name: row.full_name,
                        email: row.email,
                    },
                    property: {
                        name: row.property_name,
                    },
                    booking: {
                        id: row.id,
                    },
                };
                await sendPostStayRatingRequest(bookingDetails);
            }
        } else {
            console.log('Scheduler: No completed stays found for yesterday.');
        }

    } catch (err) {
        console.error('Scheduler: Error during job execution:', err);
    } finally {
        client.release();
    }
};

// Schedule the task to run once every day at 10:00 AM
cron.schedule('0 10 * * *', () => {
    checkCompletedStaysAndSendEmails();
});

console.log('✅ Cron job for post-stay ratings scheduled. Will run every day at 10:00 AM.');