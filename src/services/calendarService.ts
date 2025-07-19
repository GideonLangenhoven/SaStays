export interface BookingEvent {
  id: number;
  propertyId: number;
  startDate: Date;
  endDate: Date;
  type: 'booked' | 'blocked' | 'pending';
  guestName?: string;
  guestEmail?: string;
  reason?: string;
  price?: number;
}

export interface AvailabilityCheck {
  date: Date;
  isAvailable: boolean;
  price: number;
  reason?: string;
}

export interface PricingRule {
  id: number;
  propertyId: number;
  startDate: Date;
  endDate: Date;
  price: number;
  type: 'weekend' | 'holiday' | 'custom';
}

class CalendarService {
  private baseUrl = '/api';

  // Get all bookings for a property in a date range
  async getBookings(propertyId: number, startDate: Date, endDate: Date): Promise<BookingEvent[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/properties/${propertyId}/bookings?start=${startDate.toISOString()}&end=${endDate.toISOString()}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch bookings');
      
      const data = await response.json();
      return data.map(this.transformBookingData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // Return mock data for demo
      return this.getMockBookings(propertyId);
    }
  }

  // Check availability for specific dates
  async checkAvailability(propertyId: number, dates: Date[]): Promise<AvailabilityCheck[]> {
    try {
      const response = await fetch(`${this.baseUrl}/properties/${propertyId}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dates: dates.map(d => d.toISOString()) })
      });

      if (!response.ok) throw new Error('Failed to check availability');
      
      return await response.json();
    } catch (error) {
      console.error('Error checking availability:', error);
      return this.getMockAvailability(dates);
    }
  }

  // Get dynamic pricing for a date range
  async getPricing(propertyId: number, startDate: Date, endDate: Date, guests: number = 2): Promise<{
    basePrice: number;
    totalNights: number;
    subtotal: number;
    cleaningFee: number;
    serviceFee: number;
    taxes: number;
    total: number;
    breakdown: Array<{ date: Date; price: number; type: string }>;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/properties/${propertyId}/pricing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          guests
        })
      });

      if (!response.ok) throw new Error('Failed to get pricing');
      
      return await response.json();
    } catch (error) {
      console.error('Error getting pricing:', error);
      return this.calculateMockPricing(startDate, endDate, guests);
    }
  }

  // Block dates (for maintenance, etc.)
  async blockDates(propertyId: number, startDate: Date, endDate: Date, reason: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/properties/${propertyId}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          reason
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error blocking dates:', error);
      return false;
    }
  }

  // Sync with external calendars (Airbnb, Booking.com, etc.)
  async syncExternalCalendars(propertyId: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/properties/${propertyId}/sync-calendars`, {
        method: 'POST'
      });

      return response.ok;
    } catch (error) {
      console.error('Error syncing calendars:', error);
      return false;
    }
  }

  // Get calendar export URL (for importing into other platforms)
  getCalendarExportUrl(propertyId: number): string {
    return `${this.baseUrl}/properties/${propertyId}/calendar.ics`;
  }

  // Private helper methods
  private transformBookingData(data: Record<string, unknown>): BookingEvent {
    return {
      id: data.id as number,
      propertyId: data.property_id as number,
      startDate: new Date(data.start_date as string),
      endDate: new Date(data.end_date as string),
      type: data.type as 'booked' | 'blocked' | 'pending',
      guestName: data.guest_name as string | undefined,
      guestEmail: data.guest_email as string | undefined,
      reason: data.reason as string | undefined,
      price: data.price as number | undefined
    };
  }

  private getMockBookings(propertyId: number): BookingEvent[] {
    const today = new Date();
    return [
      {
        id: 1,
        propertyId,
        startDate: new Date(2025, 6, 15),
        endDate: new Date(2025, 6, 18),
        type: 'booked',
        guestName: 'John Smith',
        guestEmail: 'john@example.com',
        price: 7500
      },
      {
        id: 2,
        propertyId,
        startDate: new Date(2025, 6, 22),
        endDate: new Date(2025, 6, 25),
        type: 'booked',
        guestName: 'Sarah Johnson',
        guestEmail: 'sarah@example.com',
        price: 9000
      },
      {
        id: 3,
        propertyId,
        startDate: new Date(2025, 6, 30),
        endDate: new Date(2025, 7, 2),
        type: 'blocked',
        reason: 'Maintenance'
      }
    ];
  }

  private getMockAvailability(dates: Date[]): AvailabilityCheck[] {
    const bookedDates = [
      new Date(2025, 6, 15),
      new Date(2025, 6, 16),
      new Date(2025, 6, 17),
      new Date(2025, 6, 22),
      new Date(2025, 6, 23),
      new Date(2025, 6, 24)
    ];

    return dates.map(date => {
      const isBooked = bookedDates.some(booked => 
        date.toDateString() === booked.toDateString()
      );
      
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const basePrice = 2500;
      
      return {
        date,
        isAvailable: !isBooked,
        price: isWeekend ? basePrice + 500 : basePrice,
        reason: isBooked ? 'Already booked' : undefined
      };
    });
  }

  private calculateMockPricing(startDate: Date, endDate: Date, guests: number) {
    const msPerDay = 24 * 60 * 60 * 1000;
    const totalNights = Math.ceil((endDate.getTime() - startDate.getTime()) / msPerDay);
    const basePrice = 2500;
    
    // Calculate breakdown by date
    const breakdown = [];
    for (let i = 0; i < totalNights; i++) {
      const date = new Date(startDate.getTime() + i * msPerDay);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const price = isWeekend ? basePrice + 500 : basePrice;
      
      breakdown.push({
        date,
        price,
        type: isWeekend ? 'weekend' : 'weekday'
      });
    }

    const subtotal = breakdown.reduce((sum, day) => sum + day.price, 0);
    const cleaningFee = 500;
    const serviceFee = Math.round(subtotal * 0.12);
    const taxes = Math.round((subtotal + cleaningFee + serviceFee) * 0.15);
    const total = subtotal + cleaningFee + serviceFee + taxes;

    return {
      basePrice,
      totalNights,
      subtotal,
      cleaningFee,
      serviceFee,
      taxes,
      total,
      breakdown
    };
  }
}

// Export singleton instance
export const calendarService = new CalendarService(); 