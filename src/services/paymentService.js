// server/services/paymentService.js - Payment Service
const crypto = require('crypto');
const axios = require('axios');
const pool = require('../db');
const notificationService = require('./notificationService');

class PaymentService {
  // Ozow Payment Integration
  async createOzowPayment(bookingId, amount, customerEmail, customerName) {
    try {
      const booking = await this.getBookingDetails(bookingId);
      
      const transactionData = {
        SiteCode: process.env.OZOW_SITE_CODE,
        CountryCode: 'ZA',
        CurrencyCode: 'ZAR',
        Amount: amount,
        TransactionReference: `SAStays-${bookingId}-${Date.now()}`,
        BankReference: `Booking-${bookingId}`,
        Customer: customerEmail,
        NotifyUrl: `${process.env.API_URL}/api/webhook/ozow`,
        SuccessUrl: `${process.env.FRONTEND_URL}/payment/success/${bookingId}`,
        CancelUrl: `${process.env.FRONTEND_URL}/payment/cancel/${bookingId}`,
        ErrorUrl: `${process.env.FRONTEND_URL}/payment/error/${bookingId}`,
        IsTest: process.env.OZOW_SANDBOX === 'true',
        Optional1: customerName,
        Optional2: booking.property_id.toString(),
        Optional3: booking.confirmation_code
      };

      // Generate hash for Ozow
      const hashString = [
        transactionData.SiteCode,
        transactionData.CountryCode,
        transactionData.CurrencyCode,
        transactionData.Amount,
        transactionData.TransactionReference,
        transactionData.BankReference,
        transactionData.Customer,
        transactionData.NotifyUrl,
        transactionData.SuccessUrl,
        transactionData.CancelUrl,
        transactionData.ErrorUrl,
        transactionData.IsTest,
        transactionData.Optional1,
        transactionData.Optional2,
        transactionData.Optional3,
        process.env.OZOW_PRIVATE_KEY
      ].join('');

      transactionData.HashCheck = crypto.createHash('sha512').update(hashString, 'utf8').digest('hex');

      // Save payment record
      await pool.query(
        'INSERT INTO payments (booking_id, payment_provider, amount, status, provider_transaction_id) VALUES ($1, $2, $3, $4, $5)',
        [bookingId, 'ozow', amount, 'pending', transactionData.TransactionReference]
      );

      return {
        paymentUrl: `${process.env.OZOW_BASE_URL}/api/postpaymentrequest`,
        paymentData: transactionData
      };
    } catch (error) {
      console.error('Ozow payment creation error:', error);
      throw error;
    }
  }

  // PayFast Payment Integration
  async createPayFastPayment(bookingId, amount, customerEmail, customerName) {
    try {
      const booking = await this.getBookingDetails(bookingId);
      
      const paymentData = {
        merchant_id: process.env.PAYFAST_MERCHANT_ID,
        merchant_key: process.env.PAYFAST_MERCHANT_KEY,
        return_url: `${process.env.FRONTEND_URL}/payment/success/${bookingId}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel/${bookingId}`,
        notify_url: `${process.env.API_URL}/api/webhook/payfast`,
        name_first: customerName.split(' ')[0],
        name_last: customerName.split(' ').slice(1).join(' '),
        email_address: customerEmail,
        m_payment_id: `SAStays-${bookingId}`,
        amount: amount.toFixed(2),
        item_name: `Booking for ${booking.property_title}`,
        item_description: `${booking.start_date} to ${booking.end_date}`,
        custom_str1: bookingId.toString(),
        custom_str2: booking.property_id.toString(),
        custom_str3: booking.confirmation_code
      };

      // Generate signature for PayFast
      const signatureString = Object.keys(paymentData)
        .sort()
        .map(key => `${key}=${encodeURIComponent(paymentData[key])}`)
        .join('&');
      
      if (process.env.PAYFAST_PASSPHRASE) {
        signatureString += `&passphrase=${encodeURIComponent(process.env.PAYFAST_PASSPHRASE)}`;
      }

      paymentData.signature = crypto.createHash('md5').update(signatureString).digest('hex');

      // Save payment record
      await pool.query(
        'INSERT INTO payments (booking_id, payment_provider, amount, status, provider_transaction_id) VALUES ($1, $2, $3, $4, $5)',
        [bookingId, 'payfast', amount, 'pending', paymentData.m_payment_id]
      );

      const baseUrl = process.env.PAYFAST_SANDBOX === 'true' 
        ? 'https://sandbox.payfast.co.za/eng/process' 
        : 'https://www.payfast.co.za/eng/process';

      return {
        paymentUrl: baseUrl,
        paymentData
      };
    } catch (error) {
      console.error('PayFast payment creation error:', error);
      throw error;
    }
  }

  // Zapper QR Code Payment
  async createZapperPayment(bookingId, amount, customerEmail) {
    try {
      const booking = await this.getBookingDetails(bookingId);
      
      const paymentData = {
        merchantId: process.env.ZAPPER_MERCHANT_ID,
        siteId: process.env.ZAPPER_SITE_ID,
        amount: amount * 100, // Zapper uses cents
        reference: `SAStays-${bookingId}`,
        customer: {
          email: customerEmail,
          mobile: booking.customer_phone
        },
        extras: {
          bookingId: bookingId.toString(),
          propertyId: booking.property_id.toString(),
          confirmationCode: booking.confirmation_code
        }
      };

      const response = await axios.post(`${process.env.ZAPPER_API_URL}/v2/payment`, paymentData, {
        headers: {
          'Authorization': `Bearer ${process.env.ZAPPER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      // Save payment record
      await pool.query(
        'INSERT INTO payments (booking_id, payment_provider, amount, status, provider_transaction_id) VALUES ($1, $2, $3, $4, $5)',
        [bookingId, 'zapper', amount, 'pending', response.data.id]
      );

      return {
        qrCode: response.data.qrCode,
        paymentId: response.data.id,
        pollUrl: response.data.pollUrl
      };
    } catch (error) {
      console.error('Zapper payment creation error:', error);
      throw error;
    }
  }

  // SnapScan QR Code Payment
  async createSnapScanPayment(bookingId, amount, customerEmail) {
    try {
      const booking = await this.getBookingDetails(bookingId);
      
      const paymentData = {
        snapcode_id: process.env.SNAPSCAN_SNAPCODE_ID,
        amount: amount * 100, // SnapScan uses cents
        merchant_reference: `SAStays-${bookingId}`,
        user_reference: booking.confirmation_code,
        webhook_url: `${process.env.API_URL}/api/webhook/snapscan`,
        success_url: `${process.env.FRONTEND_URL}/payment/success/${bookingId}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel/${bookingId}`
      };

      const response = await axios.post(`${process.env.SNAPSCAN_API_URL}/payment`, paymentData, {
        headers: {
          'Authorization': `Bearer ${process.env.SNAPSCAN_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      // Save payment record
      await pool.query(
        'INSERT INTO payments (booking_id, payment_provider, amount, status, provider_transaction_id) VALUES ($1, $2, $3, $4, $5)',
        [bookingId, 'snapscan', amount, 'pending', response.data.id]
      );

      return {
        qrCode: response.data.qr_code,
        paymentId: response.data.id,
        snapcode: response.data.snapcode
      };
    } catch (error) {
      console.error('SnapScan payment creation error:', error);
      throw error;
    }
  }

  // Webhook Handlers
  async handleOzowWebhook(webhookData) {
    try {
      const { TransactionReference, Status, Amount, HashCheck } = webhookData;
      
      // Verify hash
      const expectedHash = this.generateOzowHash(webhookData);
      if (HashCheck !== expectedHash) {
        throw new Error('Invalid hash verification');
      }

      // Update payment status
      const payment = await pool.query(
        'SELECT * FROM payments WHERE provider_transaction_id = $1',
        [TransactionReference]
      );

      if (payment.rows.length === 0) {
        throw new Error('Payment not found');
      }

      const status = Status === 'Complete' ? 'completed' : 'failed';
      
      await pool.query(
        'UPDATE payments SET status = $1, processed_at = NOW(), webhook_data = $2 WHERE id = $3',
        [status, JSON.stringify(webhookData), payment.rows[0].id]
      );

      if (status === 'completed') {
        await this.confirmBooking(payment.rows[0].booking_id);
      }

      return { success: true };
    } catch (error) {
      console.error('PayFast webhook error:', error);
      throw error;
    }
  }

  async handlePayFastWebhook(webhookData) {
    try {
      const { payment_status, m_payment_id, amount_gross } = webhookData;
      
      // Verify signature
      if (!this.verifyPayFastSignature(webhookData)) {
        throw new Error('Invalid signature verification');
      }

      // Update payment status
      const payment = await pool.query(
        'SELECT * FROM payments WHERE provider_transaction_id = $1',
        [m_payment_id]
      );

      if (payment.rows.length === 0) {
        throw new Error('Payment not found');
      }

      const status = payment_status === 'COMPLETE' ? 'completed' : 'failed';
      await pool.query(
        'UPDATE payments SET status = $1, processed_at = NOW(), webhook_data = $2 WHERE id = $3',
        [status, JSON.stringify(webhookData), payment.rows[0].id]
      );
      if (status === 'completed') {
        await this.confirmBooking(payment.rows[0].booking_id);
      }
      return { success: true };
    } catch (error) {
      console.error('PayFast webhook error:', error);
      throw error;
    }
  }

  async confirmBooking(bookingId) {
    try {
      // Update booking status
      await pool.query(
        'UPDATE bookings SET status = $1, payment_status = $2 WHERE id = $3',
        ['confirmed', 'paid', bookingId]
      );

      // Get booking details for notifications
      const booking = await this.getBookingDetails(bookingId);
      
      // Send notifications
      await notificationService.sendBookingConfirmation(booking);
      await notificationService.sendOwnerNotification(booking);

      return booking;
    } catch (error) {
      console.error('Booking confirmation error:', error);
      throw error;
    }
  }

  async getBookingDetails(bookingId) {
    const result = await pool.query(`
      SELECT 
        b.*,
        p.title as property_title,
        p.owner_id,
        c.email as customer_email,
        c.full_name as customer_name,
        c.phone_number as customer_phone,
        o.email as owner_email,
        o.full_name as owner_name,
        o.phone_number as owner_phone
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN customers c ON b.customer_id = c.id
      JOIN owners o ON p.owner_id = o.id
      WHERE b.id = $1
    `, [bookingId]);

    if (result.rows.length === 0) {
      throw new Error('Booking not found');
    }

    return result.rows[0];
  }

  generateOzowHash(data) {
    const hashString = [
      data.SiteCode || process.env.OZOW_SITE_CODE,
      data.CountryCode,
      data.CurrencyCode,
      data.Amount,
      data.TransactionReference,
      data.BankReference,
      data.Customer,
      data.NotifyUrl,
      data.SuccessUrl,
      data.CancelUrl,
      data.ErrorUrl,
      data.IsTest,
      data.Optional1,
      data.Optional2,
      data.Optional3,
      process.env.OZOW_PRIVATE_KEY
    ].join('');

    return crypto.createHash('sha512').update(hashString, 'utf8').digest('hex');
  }

  verifyPayFastSignature(data) {
    const { signature, ...params } = data;
    
    const signatureString = Object.keys(params)
      .sort()
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    if (process.env.PAYFAST_PASSPHRASE) {
      signatureString += `&passphrase=${encodeURIComponent(process.env.PAYFAST_PASSPHRASE)}`;
    }

    const expectedSignature = crypto.createHash('md5').update(signatureString).digest('hex');
    return signature === expectedSignature;
  }
}

module.exports = new PaymentService();

// server/services/notificationService.js - Notification Service
const twilio = require('twilio');
const sgMail = require('@sendgrid/mail');

class NotificationService {
  constructor() {
    // Initialize Twilio
    this.twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // Initialize SendGrid
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async sendBookingConfirmation(booking) {
    try {
      // Send email confirmation
      await this.sendEmail({
        to: booking.customer_email,
        subject: `Booking Confirmation - ${booking.property_title}`,
        template: 'booking-confirmation',
        data: {
          customerName: booking.customer_name,
          propertyTitle: booking.property_title,
          confirmationCode: booking.confirmation_code,
          startDate: booking.start_date,
          endDate: booking.end_date,
          guests: booking.guests,
          totalAmount: booking.total_amount
        }
      });

      console.log(`Booking confirmation email sent to ${booking.customer_email}`);
    } catch (error) {
      console.error('Failed to send booking confirmation:', error);
    }
  }

  async sendOwnerNotification(booking) {
    try {
      // Send email notification to owner
      await this.sendEmail({
        to: booking.owner_email,
        subject: `New Booking - ${booking.property_title}`,
        template: 'owner-notification',
        data: {
          ownerName: booking.owner_name,
          propertyTitle: booking.property_title,
          customerName: booking.customer_name,
          confirmationCode: booking.confirmation_code,
          startDate: booking.start_date,
          endDate: booking.end_date,
          guests: booking.guests,
          totalAmount: booking.total_amount
        }
      });

      // Send SMS notification to owner
      await this.sendSMS(
        booking.owner_phone,
        `New booking for ${booking.property_title}! ${booking.customer_name} - ${booking.start_date} to ${booking.end_date}. Confirmation: ${booking.confirmation_code}`
      );

      console.log(`Owner notifications sent for booking ${booking.id}`);
    } catch (error) {
      console.error('Failed to send owner notification:', error);
    }
  }

  async sendEmail({ to, subject, template, data }) {
    const emailContent = this.generateEmailContent(template, data);
    
    const msg = {
      to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: process.env.SENDGRID_FROM_NAME
      },
      subject,
      html: emailContent
    };

    await sgMail.send(msg);
  }

  async sendSMS(to, message) {
    if (!to || !to.startsWith('+')) {
      console.warn('Invalid phone number for SMS:', to);
      return;
    }

    await this.twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });
  }

  generateEmailContent(template, data) {
    switch (template) {
      case 'booking-confirmation':
        return `
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #1E88E5; color: white; padding: 20px; text-align: center;">
                <h1>Booking Confirmed!</h1>
              </div>
              <div style="padding: 20px;">
                <h2>Hello ${data.customerName},</h2>
                <p>Your booking has been confirmed! Here are your details:</p>
                
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <h3>${data.propertyTitle}</h3>
                  <p><strong>Confirmation Code:</strong> ${data.confirmationCode}</p>
                  <p><strong>Check-in:</strong> ${data.startDate}</p>
                  <p><strong>Check-out:</strong> ${data.endDate}</p>
                  <p><strong>Guests:</strong> ${data.guests}</p>
                  <p><strong>Total Amount:</strong> R${data.totalAmount}</p>
                </div>
                
                <p>We're excited to host you! You'll receive check-in instructions closer to your arrival date.</p>
                
                <p>Best regards,<br>The SaStays Team</p>
              </div>
            </body>
          </html>
        `;

      case 'owner-notification':
        return `
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #1E88E5; color: white; padding: 20px; text-align: center;">
                <h1>New Booking Received!</h1>
              </div>
              <div style="padding: 20px;">
                <h2>Hello ${data.ownerName},</h2>
                <p>You have received a new booking for your property:</p>
                
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <h3>${data.propertyTitle}</h3>
                  <p><strong>Guest:</strong> ${data.customerName}</p>
                  <p><strong>Confirmation Code:</strong> ${data.confirmationCode}</p>
                  <p><strong>Check-in:</strong> ${data.startDate}</p>
                  <p><strong>Check-out:</strong> ${data.endDate}</p>
                  <p><strong>Guests:</strong> ${data.guests}</p>
                  <p><strong>Total Amount:</strong> R${data.totalAmount}</p>
                </div>
                
                <p>Login to your dashboard to manage this booking and communicate with your guest.</p>
                
                <p>Best regards,<br>The SaStays Team</p>
              </div>
            </body>
          </html>
        `;

      default:
        return '<p>Email content not found</p>';
    }
  }

  async sendReviewRequest(booking) {
    try {
      await this.sendEmail({
        to: booking.customer_email,
        subject: `How was your stay? Leave a review`,
        template: 'review-request',
        data: {
          customerName: booking.customer_name,
          propertyTitle: booking.property_title,
          reviewUrl: `${process.env.FRONTEND_URL}/review/${booking.id}`
        }
      });

      console.log(`Review request sent to ${booking.customer_email}`);
    } catch (error) {
      console.error('Failed to send review request:', error);
    }
  }
}

module.exports = new NotificationService();

// server/routes/webhooks.js - Webhook Routes
const express = require('express');
const router = express.Router();
const paymentService = require('../services/paymentService');

// Ozow webhook
router.post('/ozow', async (req, res) => {
  try {
    await paymentService.handleOzowWebhook(req.body);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Ozow webhook error:', error);
    res.status(500).send('Error processing webhook');
  }
});

// PayFast webhook
router.post('/payfast', async (req, res) => {
  try {
    await paymentService.handlePayFastWebhook(req.body);
    res.status(200).send('OK');
  } catch (error) {
    console.error('PayFast webhook error:', error);
    res.status(500).send('Error processing webhook');
  }
});

// Zapper webhook
router.post('/zapper', async (req, res) => {
  try {
    // Handle Zapper webhook
    const { id, status, amount, reference } = req.body;
    
    if (status === 'completed') {
      const payment = await pool.query(
        'SELECT * FROM payments WHERE provider_transaction_id = $1',
        [id]
      );

      if (payment.rows.length > 0) {
        await pool.query(
          'UPDATE payments SET status = $1, processed_at = NOW() WHERE id = $2',
          ['completed', payment.rows[0].id]
        );

        await paymentService.confirmBooking(payment.rows[0].booking_id);
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Zapper webhook error:', error);
    res.status(500).send('Error processing webhook');
  }
});

// SnapScan webhook
router.post('/snapscan', async (req, res) => {
  try {
    // Handle SnapScan webhook
    const { id, status, amount, merchant_reference } = req.body;
    
    if (status === 'completed') {
      const payment = await pool.query(
        'SELECT * FROM payments WHERE provider_transaction_id = $1',
        [id]
      );

      if (payment.rows.length > 0) {
        await pool.query(
          'UPDATE payments SET status = $1, processed_at = NOW() WHERE id = $2',
          ['completed', payment.rows[0].id]
        );

        await paymentService.confirmBooking(payment.rows[0].booking_id);
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('SnapScan webhook error:', error);
    res.status(500).send('Error processing webhook');
  }
});

module.exports = router;