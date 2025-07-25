// server/routes/payments.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const axios = require('axios');
const pool = require('../db');

// Payment gateway configurations
const PAYMENT_CONFIGS = {
  payfast: {
    merchant_id: process.env.PAYFAST_MERCHANT_ID,
    merchant_key: process.env.PAYFAST_MERCHANT_KEY,
    passphrase: process.env.PAYFAST_PASSPHRASE,
    sandbox: process.env.NODE_ENV !== 'production'
  },
  ozow: {
    site_code: process.env.OZOW_SITE_CODE,
    private_key: process.env.OZOW_PRIVATE_KEY,
    api_key: process.env.OZOW_API_KEY,
    sandbox: process.env.NODE_ENV !== 'production'
  },
  zapper: {
    merchant_id: process.env.ZAPPER_MERCHANT_ID,
    site_key: process.env.ZAPPER_SITE_KEY,
    sandbox: process.env.NODE_ENV !== 'production'
  },
  snapscan: {
    snapcode_id: process.env.SNAPSCAN_SNAPCODE_ID,
    api_key: process.env.SNAPSCAN_API_KEY,
    sandbox: process.env.NODE_ENV !== 'production'
  }
};

// Generate PayFast signature
const generatePayFastSignature = (data, passphrase = '') => {
  const params = new URLSearchParams();
  Object.keys(data).sort().forEach(key => {
    if (data[key] !== '' && data[key] !== null && data[key] !== undefined) {
      params.append(key, data[key]);
    }
  });
  
  let signature = params.toString();
  if (passphrase) {
    signature += `&passphrase=${encodeURIComponent(passphrase)}`;
  }
  
  return crypto.createHash('md5').update(signature).digest('hex');
};

// Initiate payment
router.post('/initiate', async (req, res) => {
  try {
    const { booking_id, payment_method } = req.body;
    
    // Get booking details
    const bookingResult = await pool.query(
      'SELECT * FROM bookings WHERE id = $1', 
      [booking_id]
    );
    
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Booking not found' 
      });
    }
    
    const booking = bookingResult.rows[0];
    const reference = `SAS${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    // Create payment record
    const paymentResult = await pool.query(
      `INSERT INTO payments (booking_id, amount, currency, method, status, reference, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`,
      [booking_id, booking.total_price, 'ZAR', payment_method, 'pending', reference]
    );
    
    const payment = paymentResult.rows[0];
    let paymentResponse = {};
    
    switch (payment_method) {
      case 'payfast':
        paymentResponse = await initiatePayFast(booking, payment);
        break;
      case 'ozow':
        paymentResponse = await initiateOzow(booking, payment);
        break;
      case 'zapper':
        paymentResponse = await initiateZapper(booking, payment);
        break;
      case 'snapscan':
        paymentResponse = await initiateSnapScan(booking, payment);
        break;
      default:
        return res.status(400).json({ 
          success: false, 
          error: 'Unsupported payment method' 
        });
    }
    
    res.json({
      success: true,
      data: {
        reference: payment.reference,
        paymentUrl: paymentResponse.paymentUrl,
        ...paymentResponse
      }
    });
    
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to initiate payment' 
    });
  }
});

// PayFast payment initiation
const initiatePayFast = async (booking, payment) => {
  const config = PAYMENT_CONFIGS.payfast;
  const baseUrl = config.sandbox ? 'https://sandbox.payfast.co.za' : 'https://www.payfast.co.za';
  
  const paymentData = {
    merchant_id: config.merchant_id,
    merchant_key: config.merchant_key,
    return_url: `${process.env.FRONTEND_URL}/booking-confirmation?status=success&ref=${payment.reference}`,
    cancel_url: `${process.env.FRONTEND_URL}/booking-confirmation?status=cancelled&ref=${payment.reference}`,
    notify_url: `${process.env.API_URL}/payments/payfast/notify`,
    name_first: booking.guest_name?.split(' ')[0] || 'Guest',
    name_last: booking.guest_name?.split(' ').slice(1).join(' ') || '',
    email_address: booking.guest_email,
    m_payment_id: payment.reference,
    amount: parseFloat(booking.total_price).toFixed(2),
    item_name: `Booking ${booking.id}`,
    item_description: `Accommodation booking`,
    email_confirmation: 1,
    confirmation_address: booking.guest_email
  };
  
  paymentData.signature = generatePayFastSignature(paymentData, config.passphrase);
  
  const formData = new URLSearchParams(paymentData);
  const paymentUrl = `${baseUrl}/eng/process?${formData.toString()}`;
  
  return { paymentUrl };
};

// Ozow payment initiation
const initiateOzow = async (booking, payment) => {
  const config = PAYMENT_CONFIGS.ozow;
  const baseUrl = config.sandbox ? 'https://staging.ozow.com' : 'https://pay.ozow.com';
  
  const paymentData = {
    SiteCode: config.site_code,
    CountryCode: 'ZA',
    CurrencyCode: 'ZAR',
    Amount: parseFloat(booking.total_price).toFixed(2),
    TransactionReference: payment.reference,
    BankReference: `SaStays-${booking.id}`,
    Customer: booking.guest_name || 'Guest',
    CustomerEmail: booking.guest_email,
    CustomerPhone: booking.guest_phone || '',
    SuccessUrl: `${process.env.FRONTEND_URL}/booking-confirmation?status=success&ref=${payment.reference}`,
    CancelUrl: `${process.env.FRONTEND_URL}/booking-confirmation?status=cancelled&ref=${payment.reference}`,
    ErrorUrl: `${process.env.FRONTEND_URL}/booking-confirmation?status=error&ref=${payment.reference}`,
    NotifyUrl: `${process.env.API_URL}/payments/ozow/notify`,
    IsTest: config.sandbox
  };
  
  // Generate Ozow hash
  const hashString = Object.keys(paymentData)
    .sort()
    .map(key => `${key}=${paymentData[key]}`)
    .join('&');
  const hashCheck = crypto
    .createHmac('sha512', config.private_key)
    .update(hashString.toLowerCase())
    .digest('hex');
  
  paymentData.HashCheck = hashCheck;
  
  const formData = new URLSearchParams(paymentData);
  const paymentUrl = `${baseUrl}/?${formData.toString()}`;
  
  return { paymentUrl };
};

// Zapper payment initiation
const initiateZapper = async (booking, payment) => {
  const config = PAYMENT_CONFIGS.zapper;
  const baseUrl = config.sandbox ? 'https://sandbox.zapper.com' : 'https://api.zapper.com';
  
  try {
    const response = await axios.post(`${baseUrl}/v2/merchant/payment`, {
      merchantId: config.merchant_id,
      siteKey: config.site_key,
      amount: Math.round(parseFloat(booking.total_price) * 100), // Convert to cents
      reference: payment.reference,
      description: `SaStays Booking ${booking.id}`,
      customerEmail: booking.guest_email,
      customerName: booking.guest_name,
      successUrl: `${process.env.FRONTEND_URL}/booking-confirmation?status=success&ref=${payment.reference}`,
      errorUrl: `${process.env.FRONTEND_URL}/booking-confirmation?status=error&ref=${payment.reference}`,
      notifyUrl: `${process.env.API_URL}/payments/zapper/notify`
    }, {
      headers: {
        'Authorization': `Bearer ${config.site_key}`,
        'Content-Type': 'application/json'
      }
    });
    
    return { 
      paymentUrl: response.data.qrCodeUrl,
      qrCode: response.data.qrCode
    };
  } catch (error) {
    console.error('Zapper API error:', error);
    throw new Error('Failed to create Zapper payment');
  }
};

// SnapScan payment initiation
const initiateSnapScan = async (booking, payment) => {
  const config = PAYMENT_CONFIGS.snapscan;
  const baseUrl = config.sandbox ? 'https://pos.snapscan.co.za' : 'https://pos.snapscan.co.za';
  
  try {
    const response = await axios.post(`${baseUrl}/merchant/api/v1/payments`, {
      snapCodeId: config.snapcode_id,
      amount: Math.round(parseFloat(booking.total_price) * 100), // Convert to cents
      merchantReference: payment.reference,
      userReference: `SaStays-${booking.id}`,
      description: `Accommodation booking for ${booking.guest_name}`,
      successUrl: `${process.env.FRONTEND_URL}/booking-confirmation?status=success&ref=${payment.reference}`,
      errorUrl: `${process.env.FRONTEND_URL}/booking-confirmation?status=error&ref=${payment.reference}`,
      notifyUrl: `${process.env.API_URL}/payments/snapscan/notify`
    }, {
      headers: {
        'Authorization': `Bearer ${config.api_key}`,
        'Content-Type': 'application/json'
      }
    });
    
    return { 
      paymentUrl: response.data.qrCodeUrl,
      qrCode: response.data.qrCode
    };
  } catch (error) {
    console.error('SnapScan API error:', error);
    throw new Error('Failed to create SnapScan payment');
  }
};

// Verify payment status
router.get('/verify/:reference', async (req, res) => {
  try {
    const { reference } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM payments WHERE reference = $1',
      [reference]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Payment not found' 
      });
    }
    
    const payment = result.rows[0];
    
    res.json({
      success: true,
      data: {
        reference: payment.reference,
        status: payment.status,
        amount: payment.amount,
        method: payment.method,
        createdAt: payment.created_at,
        completedAt: payment.completed_at
      }
    });
    
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to verify payment' 
    });
  }
});

// PayFast notification webhook
router.post('/payfast/notify', express.raw({ type: 'application/x-www-form-urlencoded' }), async (req, res) => {
  try {
    const data = new URLSearchParams(req.body.toString());
    const paymentData = Object.fromEntries(data);
    
    // Verify signature
    const receivedSignature = paymentData.signature;
    delete paymentData.signature;
    
    const calculatedSignature = generatePayFastSignature(paymentData, PAYMENT_CONFIGS.payfast.passphrase);
    
    if (receivedSignature !== calculatedSignature) {
      return res.status(400).send('Invalid signature');
    }
    
    // Update payment status
    await updatePaymentStatus(paymentData.m_payment_id, paymentData.payment_status, paymentData.pf_payment_id);
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('PayFast notification error:', error);
    res.status(500).send('Error');
  }
});

// Ozow notification webhook
router.post('/ozow/notify', express.json(), async (req, res) => {
  try {
    const { TransactionReference, Status, TransactionId } = req.body;
    
    // Map Ozow status to our status
    const statusMap = {
      'Complete': 'completed',
      'Cancelled': 'cancelled',
      'Error': 'failed',
      'Pending': 'pending'
    };
    
    await updatePaymentStatus(TransactionReference, statusMap[Status] || 'failed', TransactionId);
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Ozow notification error:', error);
    res.status(500).send('Error');
  }
});

// Update payment status helper function
const updatePaymentStatus = async (reference, status, transactionId) => {
  try {
    const statusMap = {
      'COMPLETE': 'completed',
      'Complete': 'completed',
      'completed': 'completed',
      'paid': 'completed',
      'CANCELLED': 'cancelled',
      'Cancelled': 'cancelled',
      'cancelled': 'cancelled',
      'FAILED': 'failed',
      'Error': 'failed',
      'failed': 'failed'
    };
    
    const mappedStatus = statusMap[status] || 'failed';
    
    // Update payment record
    await pool.query(
      `UPDATE payments 
       SET status = $1, transaction_id = $2, completed_at = NOW(), updated_at = NOW()
       WHERE reference = $3`,
      [mappedStatus, transactionId, reference]
    );
    
    // If payment completed, update booking status
    if (mappedStatus === 'completed') {
      await pool.query(
        `UPDATE bookings 
         SET status = 'confirmed', payment_status = 'paid', updated_at = NOW()
         WHERE id = (SELECT booking_id FROM payments WHERE reference = $1)`,
        [reference]
      );
    }
    
    console.log(`Payment ${reference} updated to status: ${mappedStatus}`);
  } catch (error) {
    console.error('Error updating payment status:', error);
  }
};

// Get payment history
router.get('/history', async (req, res) => {
  try {
    const { booking_id } = req.query;
    
    let query = 'SELECT * FROM payments';
    let params = [];
    
    if (booking_id) {
      query += ' WHERE booking_id = $1';
      params.push(booking_id);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows
    });
    
  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch payment history' 
    });
  }
});

module.exports = router;