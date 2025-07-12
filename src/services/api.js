// This file will centralize all our API calls.

import axios from 'axios';

// The base URL of our backend server.
// All requests will be made to this address.
const API_URL = 'http://localhost:5001/api';

/**
 * Creates an instance of axios with a base URL.
 * This means we don't have to type the full URL for every request.
 */
const api = axios.create({
  baseURL: API_URL,
});

/**
 * Fetches all properties from the backend.
 * This makes a GET request to http://localhost:5000/api/properties
 * @returns {Promise<Array>} A promise that resolves to an array of properties.
 */
export const getProperties = () => api.get('/properties');

/**
 * Fetches a single property by its ID.
 * @param {string} id The ID of the property to fetch.
 * @returns {Promise<Object>} A promise that resolves to a single property object.
 */
export const getPropertyById = (id) => api.get(`/properties/${id}`);

/**
 * Fetches all bookings from the backend.
 * @returns {Promise<Array>} A promise that resolves to an array of bookings.
 */
export const getBookings = () => api.get('/bookings');

/**
 * Creates a new booking.
 * @param {Object} bookingData The data for the new booking.
 * @returns {Promise<Object>} A promise that resolves to the newly created booking object.
 */
export const createBooking = (bookingData) => api.post('/bookings', bookingData);

/**
 * Generates a payment signature for PayFast.
 * @param {Object} paymentData The payment data.
 * @returns {Promise<Object>} A promise that resolves to the payment signature.
 */
export const generatePaymentSignature = (paymentData) => api.post('/generate-signature', paymentData);

/**
 * --- NEW: Initiates an Ozow payment ---
 * @param {Object} paymentData The payment data for Ozow.
 * @returns {Promise<Object>} A promise that resolves to the Ozow redirect URL.
 */
export const initiateOzowPayment = (paymentData) => api.post('/payments/ozow/initiate', paymentData);

/**
 * --- NEW: Initiates a QR Code payment ---
 * @param {Object} paymentData The payment data for Zapper/SnapScan.
 * @returns {Promise<Object>} A promise that resolves to the QR code data.
 */
export const initiateQrCodePayment = (paymentData) => api.post('/payments/qrcode', paymentData);


/**
 * Fetches all unavailable dates for a specific property.
 * @param {string} propertyId The ID of the property.
 * @returns {Promise<Array<string>>} A promise that resolves to an array of unavailable date strings (e.g., ['2024-07-20', '2024-07-21']).
 */
export const getUnavailableDates = (propertyId) => api.get(`/properties/${propertyId}/availability`);

// We can add more API functions here as we build out the app.