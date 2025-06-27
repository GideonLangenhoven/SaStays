// server/emailService.js
const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;


// Create a "transporter" object using the Ethereal credentials from our .env file
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Sends a booking confirmation email to the customer.
 * @param {object} bookingDetails - Contains customer email, name, booking info.
 */
const sendCustomerConfirmation = async (bookingDetails) => {
    const { customer, property, booking } = bookingDetails;

    const mailOptions = {
        from: '"SA Coastal Stays" <no-reply@sacoastalstays.co.za>',
        to: customer.email,
        subject: `Your Booking is Confirmed! (Ref: #${booking.id})`,
        html: `
            <h1>Booking Confirmed!</h1>
            <p>Hi ${customer.full_name},</p>
            <p>Thank you for your booking at <strong>${property.name}</strong>.</p>
            <p><strong>Check-in:</strong> ${booking.start_date}</p>
            <p><strong>Check-out:</strong> ${booking.end_date}</p>
            <p><strong>Total Price:</strong> R${booking.total_price}</p>
            <p>We look forward to welcoming you!</p>
        `,
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("Customer confirmation email sent: %s", info.messageId);
        // You can view the email preview URL in the console when using Ethereal
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error("Error sending customer email:", error);
    }
};

/**
 * Sends a new booking notification email and SMS to the property owner.
 * @param {object} bookingDetails - Contains all booking details.
 */
const sendOwnerNotification = async (bookingDetails) => {
    const { customer, property, booking } = bookingDetails;
    const ownerEmail = "owner@sacoastalstays.co.za"; // In a real app, this would come from the property owner's profile
    const ownerPhone = process.env.OWNER_PHONE_NUMBER; // Add owner's phone number to .env

    // Email Notification
    const mailOptions = {
        from: '"Booking System" <system@sacoastalstays.co.za>',
        to: ownerEmail,
        subject: `New Booking at ${property.name}!`,
        html: `
            <h1>New Booking Received!</h1>
            <p><strong>Property:</strong> ${property.name}</p>
            <p><strong>Customer Name:</strong> ${customer.full_name}</p>
            <p><strong>Customer Email:</strong> ${customer.email}</p>
            <p><strong>Check-in:</strong> ${booking.start_date}</p>
            <p><strong>Check-out:</strong> ${booking.end_date}</p>
            <p><strong>Amount Paid:</strong> R${booking.total_price}</p>
        `,
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("Owner notification email sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error("Error sending owner email:", error);
    }

    // SMS Notification
    if (ownerPhone) {
        try {
            await twilioClient.messages.create({
                body: `New booking at ${property.name} from ${customer.full_name} for ${booking.start_date} to ${booking.end_date}.`,
                from: twilioPhoneNumber,
                to: ownerPhone
            });
            console.log('Owner notification SMS sent.');
        } catch (error) {
            console.error('Error sending owner SMS:', error);
        }
    }
};

/**
 * Sends a post-stay rating request email to the customer.
 * @param {object} bookingDetails - Contains all booking details.
 */

const sendPostStayRatingRequest = async (bookingDetails) => {
    const { customer, property, booking } = bookingDetails;

    const mailOptions = {
        from: '"SA Coastal Stays" <no-reply@sacoastalstays.co.za>',
        to: customer.email,
        subject: `We hope you enjoyed your stay at ${property.name}!`,
        html: `
            <h1>Rate Your Stay!</h1>
            <p>Hi ${customer.full_name},</p>
            <p>Thank you for staying with us at <strong>${property.name}</strong>. We'd love to hear about your experience.</p>
            <p><a href="http://localhost:8080/rate-your-stay?booking_id=${booking.id}">Click here to leave a rating and review.</a></p>
        `,
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("Post-stay rating request email sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error("Error sending post-stay rating request email:", error);
    }
}


module.exports = { sendCustomerConfirmation, sendOwnerNotification, sendPostStayRatingRequest };