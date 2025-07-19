import { useState, useEffect, useCallback } from 'react';
import { calendarService, BookingEvent, AvailabilityCheck } from '../services/calendarService';

export function useCalendar(propertyId: number) {
  const [bookings, setBookings] = useState<BookingEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async (startDate: Date, endDate: Date) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await calendarService.getBookings(propertyId, startDate, endDate);
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  return {
    bookings,
    loading,
    error,
    fetchBookings,
    refreshBookings: () => {
      const today = new Date();
      const threeMonthsLater = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
      fetchBookings(today, threeMonthsLater);
    }
  };
}

export function useAvailability(propertyId: number) {
  const [availability, setAvailability] = useState<AvailabilityCheck[]>([]);
  const [checking, setChecking] = useState(false);

  const checkDates = useCallback(async (dates: Date[]) => {
    setChecking(true);
    
    try {
      const result = await calendarService.checkAvailability(propertyId, dates);
      setAvailability(result);
      return result;
    } catch (error) {
      console.error('Failed to check availability:', error);
      return [];
    } finally {
      setChecking(false);
    }
  }, [propertyId]);

  return {
    availability,
    checking,
    checkDates
  };
}

export function usePricing(propertyId: number) {
  const [pricing, setPricing] = useState<{
    basePrice: number;
    totalNights: number;
    subtotal: number;
    cleaningFee: number;
    serviceFee: number;
    taxes: number;
    total: number;
    breakdown: Array<{ date: Date; price: number; type: string }>;
  } | null>(null);
  const [calculating, setCalculating] = useState(false);

  const calculatePrice = useCallback(async (
    startDate: Date, 
    endDate: Date, 
    guests: number = 2
  ) => {
    setCalculating(true);
    
    try {
      const result = await calendarService.getPricing(propertyId, startDate, endDate, guests);
      setPricing(result);
      return result;
    } catch (error) {
      console.error('Failed to calculate pricing:', error);
      return null;
    } finally {
      setCalculating(false);
    }
  }, [propertyId]);

  return {
    pricing,
    calculating,
    calculatePrice
  };
} 