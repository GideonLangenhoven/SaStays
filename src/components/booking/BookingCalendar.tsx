import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { CalendarDays, DollarSign, Clock, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { format, addDays, differenceInDays, isWithinInterval, parseISO, isBefore, isAfter } from 'date-fns';
import { Property, Booking, CustomPricing } from '@/types';
import { bookingsApi, pricingApi } from '@/services/api';
import { toast } from 'sonner';

interface BookingCalendarProps {
  property: Property;
  bookings: Booking[];
  customPricing: CustomPricing[];
  onBookingCreate?: (booking: Booking) => void;
  onPriceUpdate?: (date: string, price: number) => void;
  viewMode?: 'guest' | 'owner';
}

interface DateInfo {
  date: Date;
  isBooked: boolean;
  isBlocked: boolean;
  price: number;
  booking?: Booking;
  customPrice?: CustomPricing;
}

export function BookingCalendar({
  property,
  bookings,
  customPricing,
  onBookingCreate,
  onPriceUpdate,
  viewMode = 'guest'
}: BookingCalendarProps) {
  const [selectedDates, setSelectedDates] = useState<{ from?: Date; to?: Date }>({});
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [selectedDateForPricing, setSelectedDateForPricing] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    guests: 1,
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    specialRequests: ''
  });
  const [pricingForm, setPricingForm] = useState({
    price: property.pricing.baseNightlyRate,
    reason: ''
  });

  const getDateInfo = (date: Date): DateInfo => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Check if date is booked
    const booking = bookings.find(b => 
      isWithinInterval(date, {
        start: parseISO(b.checkIn),
        end: addDays(parseISO(b.checkOut), -1)
      }) && b.status !== 'cancelled'
    );

    // Check custom pricing
    const customPrice = customPricing.find(cp => cp.date === dateStr);
    
    return {
      date,
      isBooked: !!booking,
      isBlocked: false, // Can add blocking logic here
      price: customPrice?.price || property.pricing.baseNightlyRate,
      booking,
      customPrice
    };
  };

  const getDayModifiers = () => {
    const bookedDates: Date[] = [];
    const customPricedDates: Date[] = [];

    bookings.forEach(booking => {
      if (booking.status !== 'cancelled') {
        const start = parseISO(booking.checkIn);
        const end = parseISO(booking.checkOut);
        let current = start;
        
        while (isBefore(current, end)) {
          bookedDates.push(new Date(current));
          current = addDays(current, 1);
        }
      }
    });

    customPricing.forEach(cp => {
      customPricedDates.push(parseISO(cp.date));
    });

    return {
      booked: bookedDates,
      customPriced: customPricedDates,
      selected: selectedDates.from && selectedDates.to 
        ? getDatesInRange(selectedDates.from, selectedDates.to)
        : selectedDates.from ? [selectedDates.from] : []
    };
  };

  const getDatesInRange = (start: Date, end: Date): Date[] => {
    const dates: Date[] = [];
    let current = start;
    
    while (!isAfter(current, end)) {
      dates.push(new Date(current));
      current = addDays(current, 1);
    }
    
    return dates;
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date || viewMode !== 'guest') return;

    const dateInfo = getDateInfo(date);
    if (dateInfo.isBooked || dateInfo.isBlocked) return;

    if (!selectedDates.from || selectedDates.to) {
      // Start new selection
      setSelectedDates({ from: date, to: undefined });
    } else if (isBefore(date, selectedDates.from)) {
      // Selected date is before start date, make it the new start
      setSelectedDates({ from: date, to: undefined });
    } else {
      // Complete the range
      const isRangeValid = checkRangeAvailability(selectedDates.from, date);
      if (isRangeValid) {
        setSelectedDates({ from: selectedDates.from, to: date });
        setShowBookingForm(true);
      } else {
        toast.error('Some dates in this range are not available');
        setSelectedDates({ from: date, to: undefined });
      }
    }
  };

  const handleOwnerDateSelect = (date: Date | undefined) => {
    if (!date || viewMode !== 'owner') return;
    
    setSelectedDateForPricing(date);
    const dateInfo = getDateInfo(date);
    setPricingForm({
      price: dateInfo.price,
      reason: dateInfo.customPrice?.reason || ''
    });
    setShowPricingModal(true);
  };

  const checkRangeAvailability = (start: Date, end: Date): boolean => {
    const dates = getDatesInRange(start, end);
    return dates.every(date => {
      const dateInfo = getDateInfo(date);
      return !dateInfo.isBooked && !dateInfo.isBlocked;
    });
  };

  const calculateTotalPrice = (): number => {
    if (!selectedDates.from || !selectedDates.to) return 0;

    const dates = getDatesInRange(selectedDates.from, selectedDates.to);
    const nights = dates.length;
    
    let totalNightlyRate = 0;
    dates.forEach(date => {
      const dateInfo = getDateInfo(date);
      totalNightlyRate += dateInfo.price;
    });

    let total = totalNightlyRate;
    
    // Add cleaning fee
    if (property.pricing.cleaningFee) {
      total += property.pricing.cleaningFee;
    }

    // Add extra guest fees
    if (bookingForm.guests > 2 && property.pricing.extraGuestFee) {
      total += (bookingForm.guests - 2) * property.pricing.extraGuestFee;
    }

    // Apply discounts
    if (nights >= 28 && property.pricing.monthlyDiscount) {
      total = total * (1 - property.pricing.monthlyDiscount / 100);
    } else if (nights >= 7 && property.pricing.weeklyDiscount) {
      total = total * (1 - property.pricing.weeklyDiscount / 100);
    }

    return Math.round(total * 100) / 100;
  };

  const handleBookingSubmit = async () => {
    if (!selectedDates.from || !selectedDates.to) return;

    setIsSubmitting(true);
    try {
      const booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'> = {
        propertyId: property.id,
        guestId: 'temp-guest-id', // Will be created by API
        checkIn: format(selectedDates.from, 'yyyy-MM-dd'),
        checkOut: format(selectedDates.to, 'yyyy-MM-dd'),
        numberOfGuests: bookingForm.guests,
        totalAmount: calculateTotalPrice(),
        status: property.instantBooking ? 'confirmed' : 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'ozow', // Default, will be selected in payment flow
        guestDetails: {
          name: bookingForm.guestName,
          email: bookingForm.guestEmail,
          phone: bookingForm.guestPhone
        },
        specialRequests: bookingForm.specialRequests || undefined
      };

      const response = await bookingsApi.create(booking);
      
      toast.success(property.instantBooking ? 'Booking confirmed!' : 'Booking request submitted!');
      setShowBookingForm(false);
      setSelectedDates({});
      setBookingForm({
        guests: 1,
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        specialRequests: ''
      });
      
      if (onBookingCreate) {
        onBookingCreate(response.data);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePriceUpdate = async () => {
    if (!selectedDateForPricing) return;

    setIsSubmitting(true);
    try {
      const dateStr = format(selectedDateForPricing, 'yyyy-MM-dd');
      const customPricing: Omit<CustomPricing, 'id'> = {
        propertyId: property.id,
        date: dateStr,
        price: pricingForm.price,
        reason: pricingForm.reason || undefined
      };

      await pricingApi.setCustomPrice(customPricing);
      
      toast.success('Price updated successfully!');
      setShowPricingModal(false);
      
      if (onPriceUpdate) {
        onPriceUpdate(dateStr, pricingForm.price);
      }
    } catch (error) {
      console.error('Error updating price:', error);
      toast.error('Failed to update price. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDayContent = (date: Date) => {
    const dateInfo = getDateInfo(date);
    const isSelected = selectedDates.from && 
      format(date, 'yyyy-MM-dd') === format(selectedDates.from, 'yyyy-MM-dd');
    const isInRange = selectedDates.from && selectedDates.to &&
      isWithinInterval(date, { start: selectedDates.from, end: selectedDates.to });

    return (
      <div className="relative w-full h-full p-1">
        <div
          className={`
            w-full h-full rounded-md flex flex-col items-center justify-center text-xs
            ${dateInfo.isBooked ? 'bg-red-100 text-red-800 cursor-not-allowed' : ''}
            ${isSelected || isInRange ? 'bg-blue-100 text-blue-800' : ''}
            ${dateInfo.customPrice ? 'border-2 border-yellow-400' : ''}
            ${viewMode === 'owner' ? 'cursor-pointer hover:bg-gray-100' : ''}
          `}
          onClick={() => viewMode === 'owner' ? handleOwnerDateSelect(date) : handleDateSelect(date)}
        >
          <span className="font-medium">{format(date, 'd')}</span>
          {viewMode === 'owner' && (
            <span className="text-xs text-green-600">
              R{dateInfo.price}
            </span>
          )}
          {dateInfo.isBooked && (
            <span className="text-xs">Booked</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            {viewMode === 'guest' ? 'Select Your Dates' : 'Manage Availability & Pricing'}
          </CardTitle>
          {viewMode === 'guest' && selectedDates.from && selectedDates.to && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                {format(selectedDates.from, 'MMM d')} - {format(selectedDates.to, 'MMM d')}
              </span>
              <span>
                {differenceInDays(selectedDates.to, selectedDates.from)} nights
              </span>
              <span className="flex items-center gap-1 font-semibold text-green-600">
                <DollarSign className="h-3 w-3" />
                R{calculateTotalPrice()}
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDates.from}
            onSelect={viewMode === 'guest' ? handleDateSelect : handleOwnerDateSelect}
            disabled={viewMode === 'guest' ? (date) => {
              const dateInfo = getDateInfo(date);
              return isBefore(date, new Date()) || dateInfo.isBooked || dateInfo.isBlocked;
            } : (date) => isBefore(date, new Date())}
            modifiers={getDayModifiers()}
            modifiersClassNames={{
              booked: 'bg-red-100 text-red-800',
              customPriced: 'border-2 border-yellow-400',
              selected: 'bg-blue-500 text-white'
            }}
            components={{
              Day: ({ date }) => renderDayContent(date)
            }}
            className="rounded-md border"
          />

          {/* Calendar Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
              <span>Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
              <span>Selected</span>
            </div>
            {viewMode === 'owner' && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-yellow-400 rounded"></div>
                <span>Custom Price</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Bookings Summary */}
      {viewMode === 'owner' && bookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bookings
                .filter(b => b.status !== 'cancelled' && isAfter(parseISO(b.checkIn), new Date()))
                .slice(0, 5)
                .map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                        {booking.status}
                      </Badge>
                      <div>
                        <p className="font-medium">{booking.guestDetails.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(booking.checkIn), 'MMM d')} - {format(parseISO(booking.checkOut), 'MMM d')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">R{booking.totalAmount}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {booking.numberOfGuests} guests
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking Form Modal */}
      {showBookingForm && (
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Booking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guests">Number of Guests</Label>
                <Input
                  id="guests"
                  type="number"
                  min="1"
                  max={property.maxGuests}
                  value={bookingForm.guests}
                  onChange={(e) => setBookingForm({
                    ...bookingForm,
                    guests: parseInt(e.target.value) || 1
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Total Amount</Label>
                <div className="text-2xl font-bold text-green-600">
                  R{calculateTotalPrice()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guestName">Full Name *</Label>
                <Input
                  id="guestName"
                  value={bookingForm.guestName}
                  onChange={(e) => setBookingForm({
                    ...bookingForm,
                    guestName: e.target.value
                  })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guestEmail">Email Address *</Label>
                <Input
                  id="guestEmail"
                  type="email"
                  value={bookingForm.guestEmail}
                  onChange={(e) => setBookingForm({
                    ...bookingForm,
                    guestEmail: e.target.value
                  })}
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guestPhone">Phone Number *</Label>
              <Input
                id="guestPhone"
                value={bookingForm.guestPhone}
                onChange={(e) => setBookingForm({
                  ...bookingForm,
                  guestPhone: e.target.value
                })}
                placeholder="+27 123 456 7890"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
              <Textarea
                id="specialRequests"
                value={bookingForm.specialRequests}
                onChange={(e) => setBookingForm({
                  ...bookingForm,
                  specialRequests: e.target.value
                })}
                placeholder="Any special requests or requirements..."
                rows={3}
              />
            </div>

            {/* Booking Summary */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium mb-2">Booking Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Check-in:</span>
                  <span>{selectedDates.from && format(selectedDates.from, 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-out:</span>
                  <span>{selectedDates.to && format(selectedDates.to, 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nights:</span>
                  <span>{selectedDates.from && selectedDates.to && differenceInDays(selectedDates.to, selectedDates.from)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Guests:</span>
                  <span>{bookingForm.guests}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-1">
                  <span>Total:</span>
                  <span>R{calculateTotalPrice()}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowBookingForm(false);
                  setSelectedDates({});
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBookingSubmit}
                disabled={isSubmitting || !bookingForm.guestName || !bookingForm.guestEmail || !bookingForm.guestPhone}
                className="flex-1"
              >
                {isSubmitting ? 'Processing...' : property.instantBooking ? 'Book Now' : 'Request Booking'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price Management Modal */}
      {showPricingModal && selectedDateForPricing && (
        <Card>
          <CardHeader>
            <CardTitle>
              Set Custom Price for {format(selectedDateForPricing, 'MMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customPrice">Price (ZAR)</Label>
              <Input
                id="customPrice"
                type="number"
                min="1"
                value={pricingForm.price}
                onChange={(e) => setPricingForm({
                  ...pricingForm,
                  price: parseInt(e.target.value) || property.pricing.baseNightlyRate
                })}
              />
              <p className="text-sm text-muted-foreground">
                Base rate: R{property.pricing.baseNightlyRate}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceReason">Reason (Optional)</Label>
              <Input
                id="priceReason"
                value={pricingForm.reason}
                onChange={(e) => setPricingForm({
                  ...pricingForm,
                  reason: e.target.value
                })}
                placeholder="e.g., Holiday premium, Special event"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowPricingModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePriceUpdate}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Updating...' : 'Update Price'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 