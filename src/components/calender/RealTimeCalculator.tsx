// src/components/calendar/RealTimeCalendar.tsx
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format, isSameDay, isWithinInterval } from 'date-fns';
import { CalendarDays, Clock, Users } from 'lucide-react';

interface Booking {
  id: string;
  propertyId: string;
  startDate: Date;
  endDate: Date;
  guestName: string;
  guestCount: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  amount: number;
}

interface RealTimeCalendarProps {
  propertyId?: string;
  onDateSelect?: (date: Date) => void;
  onBookingSelect?: (booking: Booking) => void;
  showBookingDetails?: boolean;
}

export const RealTimeCalendar: React.FC<RealTimeCalendarProps> = ({
  propertyId,
  onDateSelect,
  onBookingSelect,
  showBookingDetails = true
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Real-time booking data fetching
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/bookings${propertyId ? `?propertyId=${propertyId}` : ''}`);
        const data = await response.json();
        setBookings(data.map((booking: any) => ({
          ...booking,
          startDate: new Date(booking.startDate),
          endDate: new Date(booking.endDate)
        })));
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load bookings",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();

    // Set up real-time updates using WebSocket or polling
    const interval = setInterval(fetchBookings, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [propertyId, toast]);

  // Check if a date is booked
  const isDateBooked = (date: Date): boolean => {
    return bookings.some(booking => 
      booking.status === 'confirmed' &&
      isWithinInterval(date, { start: booking.startDate, end: booking.endDate })
    );
  };

  // Get booking for a specific date
  const getBookingForDate = (date: Date): Booking | undefined => {
    return bookings.find(booking => 
      booking.status === 'confirmed' &&
      isWithinInterval(date, { start: booking.startDate, end: booking.endDate })
    );
  };

  // Get bookings for selected date
  const selectedDateBookings = selectedDate ? 
    bookings.filter(booking => 
      isSameDay(booking.startDate, selectedDate) || 
      isSameDay(booking.endDate, selectedDate) ||
      isWithinInterval(selectedDate, { start: booking.startDate, end: booking.endDate })
    ) : [];

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date && onDateSelect) {
      onDateSelect(date);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Availability Calendar
            {loading && <Clock className="h-4 w-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => isDateBooked(date)}
            modifiers={{
              booked: (date) => isDateBooked(date),
              today: new Date()
            }}
            modifiersStyles={{
              booked: {
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                textDecoration: 'line-through'
              }
            }}
            className="rounded-md border"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              Available
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <div className="h-2 w-2 bg-red-500 rounded-full"></div>
              Booked
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Booking Details */}
      {showBookingDetails && (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a Date'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateBookings.length > 0 ? (
              <div className="space-y-4">
                {selectedDateBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => onBookingSelect?.(booking)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{booking.guestName}</h4>
                      <Badge variant={
                        booking.status === 'confirmed' ? 'default' :
                        booking.status === 'pending' ? 'secondary' : 'destructive'
                      }>
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        {format(booking.startDate, 'MMM d')} - {format(booking.endDate, 'MMM d')}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {booking.guestCount} guest{booking.guestCount !== 1 ? 's' : ''}
                      </div>
                      <div className="font-semibold">
                        R{booking.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {selectedDate ? (
                  isDateBooked(selectedDate) ? (
                    <div>
                      <CalendarDays className="h-12 w-12 mx-auto mb-4 text-red-300" />
                      <p>This date is not available</p>
                    </div>
                  ) : (
                    <div>
                      <CalendarDays className="h-12 w-12 mx-auto mb-4 text-green-300" />
                      <p>Available for booking</p>
                      <Button className="mt-2" size="sm">
                        Block Date
                      </Button>
                    </div>
                  )
                ) : (
                  <p>Select a date to view details</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RealTimeCalendar;