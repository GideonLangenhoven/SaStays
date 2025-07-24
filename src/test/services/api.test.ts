// src/test/services/api.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { propertyApi, bookingApi, paymentApi } from '../../services/api';

// Mock fetch globally
global.fetch = vi.fn();

describe('API Services', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('propertyApi', () => {
    it('fetches properties successfully', async () => {
      const mockProperties = [
        { id: 1, title: 'Test Property', price: 850 },
        { id: 2, title: 'Another Property', price: 1200 },
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProperties,
      });

      const result = await propertyApi.getAll();
      
      expect(fetch).toHaveBeenCalledWith('/api/properties');
      expect(result).toEqual(mockProperties);
    });

    it('handles API errors gracefully', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(propertyApi.getAll()).rejects.toThrow();
    });

    it('fetches single property by id', async () => {
      const mockProperty = { id: 1, title: 'Test Property', price: 850 };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProperty,
      });

      const result = await propertyApi.getById('1');
      
      expect(fetch).toHaveBeenCalledWith('/api/properties/1');
      expect(result).toEqual(mockProperty);
    });
  });

  describe('bookingApi', () => {
    it('creates booking successfully', async () => {
      const bookingData = {
        property_id: 1,
        customer_email: 'test@example.com',
        start_date: '2024-03-01',
        end_date: '2024-03-05',
        guests: 2,
      };

      const mockResponse = { id: 1, ...bookingData, status: 'confirmed' };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await bookingApi.create(bookingData);
      
      expect(fetch).toHaveBeenCalledWith('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
      expect(result).toEqual(mockResponse);
    });

    it('fetches bookings with authentication', async () => {
      // Mock localStorage
      const mockToken = 'test-token';
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(mockToken);

      const mockBookings = [
        { id: 1, property_id: 1, status: 'confirmed' },
        { id: 2, property_id: 2, status: 'pending' },
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBookings,
      });

      const result = await bookingApi.getAll();
      
      expect(fetch).toHaveBeenCalledWith('/api/bookings', {
        headers: { 'Authorization': `Bearer ${mockToken}` },
      });
      expect(result).toEqual(mockBookings);
    });
  });

  describe('paymentApi', () => {
    it('initiates payment successfully', async () => {
      const paymentData = {
        booking_id: 1,
        amount: 3400,
        payment_method: 'ozow',
      };

      const mockResponse = {
        payment_id: 'pay_123',
        redirect_url: 'https://payment.ozow.com/pay/123',
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await paymentApi.initiate(paymentData);
      
      expect(fetch).toHaveBeenCalledWith('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });
      expect(result).toEqual(mockResponse);
    });

    it('verifies payment status', async () => {
      const paymentId = 'pay_123';
      const mockStatus = { status: 'completed', verified: true };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatus,
      });

      const result = await paymentApi.verify(paymentId);
      
      expect(fetch).toHaveBeenCalledWith(`/api/payments/verify/${paymentId}`);
      expect(result).toEqual(mockStatus);
    });
  });
}); 

export default API;