
import axios from 'axios';
import { supabase } from '@/supabaseClient';

const API_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to include the Supabase auth token
api.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});


/**
 * Fetches all properties from the backend.
 */
export const getProperties = () => api.get('/properties');

/**
 * Fetches a single property by its ID.
 */
export const getPropertyById = (id) => api.get(`/properties/${id}`);

/**
 * Fetches all booked dates for a specific property.
 */
export const getBookedDates = (propertyId) => api.get(`/properties/${propertyId}/booked-dates`);


/**
 * Creates a new booking.
 */
export const createBooking = (bookingData) => api.post('/bookings', bookingData);

/**
 * Generates a payment signature for PayFast.
 */
export const generatePaymentSignature = (paymentData) => api.post('/generate-signature', paymentData);

/**
 * Initiates an Ozow payment.
 */
export const initiateOzowPayment = (paymentData) => api.post('/payments/ozow/initiate', paymentData);

/**
 * Initiates a QR Code payment.
 */
export const initiateQrCodePayment = (paymentData) => api.post('/payments/qrcode', paymentData);