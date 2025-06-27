// server/emailService.js
const nodemailer = require('nodemailer');

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
            <p>Hi ${customer.fullName},</p>
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
 * Sends a new booking notification email to the property owner.
 * @param {object} bookingDetails - Contains all booking details.
 */
const sendOwnerNotification = async (bookingDetails) => {
    const { customer, property, booking } = bookingDetails;
    const ownerEmail = "owner@sacoastalstays.co.za"; // In a real app, this would come from the property owner's profile

    const mailOptions = {
        from: '"Booking System" <system@sacoastalstays.co.za>',
        to: ownerEmail,
        subject: `New Booking at ${property.name}!`,
        html: `
            <h1>New Booking Received!</h1>
            <p><strong>Property:</strong> ${property.name}</p>
            <p><strong>Customer Name:</strong> ${customer.fullName}</p>
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
};

module.exports = { sendCustomerConfirmation, sendOwnerNotification };