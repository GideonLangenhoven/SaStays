// server/smsService.js - SMS Service for sending notifications via Twilio

const twilio = require('twilio');

// Twilio credentials from .env
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client only if credentials are provided and valid
let twilioClient = null;
if (accountSid && authToken && accountSid.startsWith('AC')) {
    try {
        twilioClient = twilio(accountSid, authToken);
        console.log('Twilio client initialized successfully');
    } catch (error) {
        console.error('Error initializing Twilio client:', error.message);
    }
} else {
    console.log('Twilio credentials not provided or invalid. SMS functionality disabled.');
}

/**
 * Sends an SMS to the property owner about a new booking
 * @param {object} bookingDetails - Contains property, booking, and guest info
 */
const sendOwnerSMS = async (bookingDetails) => {
    const { property, booking, guest } = bookingDetails;
    const ownerPhone = process.env.OWNER_PHONE_NUMBER;

    if (!twilioClient) {
        console.log('Twilio client not initialized. Skipping SMS notification.');
        return { success: false, message: 'SMS service not available' };
    }

    if (!ownerPhone) {
        console.log('OWNER_PHONE_NUMBER not set in .env. Skipping SMS notification.');
        return { success: false, message: 'Owner phone number not configured' };
    }

    if (!twilioPhoneNumber) {
        console.log('TWILIO_PHONE_NUMBER not set in .env. Skipping SMS notification.');
        return { success: false, message: 'Twilio phone number not configured' };
    }

    try {
        const smsMessage = `New booking at ${property.title} from ${guest.full_name} for ${booking.start_date} to ${booking.end_date}. Total: R${booking.total_amount}. Ref: ${booking.confirmation_code}`;
        
        const message = await twilioClient.messages.create({
            body: smsMessage,
            from: twilioPhoneNumber,
            to: ownerPhone
        });

        console.log('Owner SMS notification sent:', message.sid);
        return { success: true, messageId: message.sid };
    } catch (error) {
        console.error('Error sending owner SMS:', error.message);
        return { success: false, message: error.message };
    }
};

/**
 * Sends a booking confirmation SMS to the guest
 * @param {object} bookingDetails - Contains property, booking, and guest info
 */
const sendGuestConfirmationSMS = async (bookingDetails) => {
    const { property, booking, guest } = bookingDetails;

    if (!twilioClient) {
        console.log('Twilio client not initialized. Skipping SMS confirmation.');
        return { success: false, message: 'SMS service not available' };
    }

    if (!guest.phone_number) {
        console.log('Guest phone number not provided. Skipping SMS confirmation.');
        return { success: false, message: 'Guest phone number not available' };
    }

    if (!twilioPhoneNumber) {
        console.log('TWILIO_PHONE_NUMBER not set in .env. Skipping SMS confirmation.');
        return { success: false, message: 'Twilio phone number not configured' };
    }

    try {
        const smsMessage = `Your booking at ${property.title} is confirmed! Check-in: ${booking.start_date}, Total: R${booking.total_amount}. Ref: ${booking.confirmation_code}`;
        
        const message = await twilioClient.messages.create({
            body: smsMessage,
            from: twilioPhoneNumber,
            to: guest.phone_number
        });

        console.log('Guest confirmation SMS sent:', message.sid);
        return { success: true, messageId: message.sid };
    } catch (error) {
        console.error('Error sending guest confirmation SMS:', error.message);
        return { success: false, message: error.message };
    }
};

/**
 * Sends a booking reminder SMS to the guest
 * @param {object} bookingDetails - Contains property, booking, and guest info
 */
const sendBookingReminderSMS = async (bookingDetails) => {
    const { property, booking, guest } = bookingDetails;

    if (!twilioClient) {
        console.log('Twilio client not initialized. Skipping reminder SMS.');
        return { success: false, message: 'SMS service not available' };
    }

    if (!guest.phone_number) {
        console.log('Guest phone number not provided. Skipping reminder SMS.');
        return { success: false, message: 'Guest phone number not available' };
    }

    try {
        const smsMessage = `Reminder: Your stay at ${property.title} starts tomorrow (${booking.start_date}). We look forward to welcoming you! Ref: ${booking.confirmation_code}`;
        
        const message = await twilioClient.messages.create({
            body: smsMessage,
            from: twilioPhoneNumber,
            to: guest.phone_number
        });

        console.log('Booking reminder SMS sent:', message.sid);
        return { success: true, messageId: message.sid };
    } catch (error) {
        console.error('Error sending booking reminder SMS:', error.message);
        return { success: false, message: error.message };
    }
};

module.exports = {
    sendOwnerSMS,
    sendGuestConfirmationSMS,
    sendBookingReminderSMS
};