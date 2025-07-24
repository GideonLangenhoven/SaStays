
// src/components/booking/InstantBookingFlow.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays } from 'date-fns';
import { CalendarDays, Users, CreditCard, Shield, Clock, MapPin } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  location: string;
  pricePerNight: number;
  maxGuests: number;
  amenities: string[];
  images: string[];
  instantBooking: boolean;
}

interface BookingData {
  propertyId: string;
  startDate: Date;
  endDate: Date;
  guestCount: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests: string;
}

interface InstantBookingFlowProps {
  property: Property;
  onBookingComplete?: (bookingId: string) => void;
  onCancel?: () => void;
}

export const InstantBookingFlow: React.FC<InstantBookingFlowProps> = ({
  property,
  onBookingComplete,
  onCancel
}) => {
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState<Partial<BookingData>>({
    propertyId: property.id,
    guestCount: 1
  });
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const { toast } = useToast();

  // Fetch booked dates for the property
  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        const response = await fetch(`/api/properties/${property.id}/booked-dates`);
        const dates = await response.json();
        setBookedDates(dates.map((date: string) => new Date(date)));
      } catch (error) {
        console.error('Failed to fetch booked dates:', error);
      }
    };

    fetchBookedDates();
  }, [property.id]);

  // Calculate total cost when dates change
  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      const nights = differenceInDays(dateRange.to, dateRange.from);
      const baseCost = nights * property.pricePerNight;
      const cleaningFee = 150; // Fixed cleaning fee
      const serviceFee = baseCost * 0.05; // 5% service fee
      setTotalCost(baseCost + cleaningFee + serviceFee);
      
      setBookingData(prev => ({
        ...prev,
        startDate: dateRange.from,
        endDate: dateRange.to
      }));
    }
  }, [dateRange, property.pricePerNight]);

  const isDateUnavailable = (date: Date) => {
    return bookedDates.some(bookedDate => 
      date.toDateString() === bookedDate.toDateString()
    );
  };

  const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range) {
      setDateRange(range);
    }
  };

  const handleGuestInfoSubmit = () => {
    if (!bookingData.guestName || !bookingData.guestEmail || !bookingData.guestPhone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    setStep(3);
  };

  const handlePayment = async (paymentMethod: string) => {
    setLoading(true);
    try {
      // Create booking
      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookingData,
          totalAmount: totalCost,
          paymentMethod
        })
      });

      const booking = await bookingResponse.json();

      if (!bookingResponse.ok) {
        throw new Error(booking.message || 'Failed to create booking');
      }

      // Redirect to payment gateway
      const paymentResponse = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: totalCost,
          paymentMethod,
          customerEmail: bookingData.guestEmail,
          customerName: bookingData.guestName
        })
      });

      const paymentData = await paymentResponse.json();

      if (paymentData.redirectUrl) {
        // Redirect to payment gateway
        window.location.href = paymentData.redirectUrl;
      } else {
        throw new Error('Payment initialization failed');
      }

    } catch (error) {
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Select your dates
              </h3>
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={handleDateSelect}
                disabled={isDateUnavailable}
                numberOfMonths={2}
                className="rounded-md border"
              />
            </div>

            <div>
              <Label htmlFor="guests">Number of guests</Label>
              <Select 
                value={bookingData.guestCount?.toString()} 
                onValueChange={(value) => setBookingData(prev => ({
                  ...prev, 
                  guestCount: parseInt(value)
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select guests" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: property.maxGuests }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {i + 1} guest{i > 0 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={() => setStep(2)} 
              className="w-full"
              disabled={!dateRange.from || !dateRange.to || !bookingData.guestCount}
            >
              Continue
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Guest Information
            </h3>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="guestName">Full Name *</Label>
                <Input
                  id="guestName"
                  value={bookingData.guestName || ''}
                  onChange={(e) => setBookingData(prev => ({
                    ...prev,
                    guestName: e.target.value
                  }))}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label htmlFor="guestEmail">Email Address *</Label>
                <Input
                  id="guestEmail"
                  type="email"
                  value={bookingData.guestEmail || ''}
                  onChange={(e) => setBookingData(prev => ({
                    ...prev,
                    guestEmail: e.target.value
                  }))}
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <Label htmlFor="guestPhone">Phone Number *</Label>
                <Input
                  id="guestPhone"
                  value={bookingData.guestPhone || ''}
                  onChange={(e) => setBookingData(prev => ({
                    ...prev,
                    guestPhone: e.target.value
                  }))}
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                <Textarea
                  id="specialRequests"
                  value={bookingData.specialRequests || ''}
                  onChange={(e) => setBookingData(prev => ({
                    ...prev,
                    specialRequests: e.target.value
                  }))}
                  placeholder="Any special requests or requirements"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleGuestInfoSubmit} className="flex-1">
                Continue to Payment
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment & Confirmation
            </h3>

            {/* Booking Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Dates:</span>
                  <span>
                    {dateRange.from && dateRange.to && 
                      `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d')}`
                    }
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Guests:</span>
                  <span>{bookingData.guestCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Nights:</span>
                  <span>
                    {dateRange.from && dateRange.to && 
                      differenceInDays(dateRange.to, dateRange.from)
                    }
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>R{totalCost.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <div className="space-y-3">
              <h4 className="font-medium">Choose Payment Method</h4>
              
              <Button
                onClick={() => handlePayment('ozow')}
                disabled={loading}
                className="w-full justify-start bg-blue-600 hover:bg-blue-700"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Ozow - Instant EFT
              </Button>

              <Button
                onClick={() => handlePayment('payfast')}
                disabled={loading}
                variant="outline"
                className="w-full justify-start"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                PayFast - Card Payment
              </Button>

              <Button
                onClick={() => handlePayment('zapper')}
                disabled={loading}
                variant="outline"
                className="w-full justify-start"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Zapper QR Code
              </Button>

              <Button
                onClick={() => handlePayment('snapscan')}
                disabled={loading}
                variant="outline"
                className="w-full justify-start"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                SnapScan QR Code
              </Button>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="h-4 w-4" />
              <span>Secure payment processing. Your data is protected.</span>
            </div>

            <Button variant="outline" onClick={() => setStep(2)} className="w-full">
              Back to Guest Info
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Property Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {property.images[0] && (
              <img 
                src={property.images[0]} 
                alt={property.title}
                className="w-20 h-20 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-1">{property.title}</h2>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{property.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {property.instantBooking ? (
                    <>
                      <Clock className="h-3 w-3 mr-1" />
                      Instant Booking
                    </>
                  ) : (
                    'Request to Book'
                  )}
                </Badge>
                <span className="font-semibold">
                  R{property.pricePerNight.toLocaleString()}/night
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      <div className="flex items-center mb-6">
        {[1, 2, 3].map((stepNumber) => (
          <React.Fragment key={stepNumber}>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              step >= stepNumber 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {stepNumber}
            </div>
            {stepNumber < 3 && (
              <div className={`flex-1 h-0.5 mx-2 ${
                step > stepNumber ? 'bg-primary' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Cancel Button */}
      {onCancel && (
        <div className="mt-4 text-center">
          <Button variant="ghost" onClick={onCancel}>
            Cancel Booking
          </Button>
        </div>
      )}
    </div>
  );
};

export default InstantBookingFlow;