export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'booking' | 'blocked' | 'available';
  color?: string;
  metadata?: {
    guestName?: string;
    guestEmail?: string;
    price?: number;
    reason?: string;
  };
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface PricingBreakdown {
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  discounts: number;
  total: number;
  currency: string;
}

export interface CalendarSettings {
  minimumStay: number;
  maximumStay: number;
  advanceNotice: number; // days
  preparationTime: number; // days between bookings
  checkInTime: string;
  checkOutTime: string;
  weekendPricing: boolean;
  instantBook: boolean;
}     

export default CalendarSettings;