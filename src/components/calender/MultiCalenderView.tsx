// src/components/calendar/MultiCalendarView.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, addMonths, subMonths } from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  Home, 
  Users, 
  DollarSign, 
  ChevronLeft, 
  ChevronRight,
  Grid3X3,
  List,
  Filter,
  Download
} from 'lucide-react';

interface Property {
  id: string;
  title: string;
  location: string;
  color: string;
}

interface Booking {
  id: string;
  propertyId: string;
  propertyTitle: string;
  guestName: string;
  guestCount: number;
  startDate: Date;
  endDate: Date;
  status: 'confirmed' | 'pending' | 'cancelled';
  amount: number;
  checkInTime?: string;
  checkOutTime?: string;
}

interface CalendarDay {
  date: Date;
  bookings: Booking[];
  isCurrentMonth: boolean;
  isToday: boolean;
}

export const MultiCalendarView: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch properties and bookings
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [propertiesRes, bookingsRes] = await Promise.all([
          fetch('/api/properties'),
          fetch('/api/bookings')
        ]);

        const [propertiesData, bookingsData] = await Promise.all([
          propertiesRes.json(),
          bookingsRes.json()
        ]);

        const propertiesWithColors = propertiesData.map((property: any, index: number) => ({
          ...property,
          color: getPropertyColor(index)
        }));

        setProperties(propertiesWithColors);
        setSelectedProperties(propertiesWithColors.map((p: Property) => p.id));
        
        setBookings(bookingsData.map((booking: any) => ({
          ...booking,
          startDate: new Date(booking.startDate),
          endDate: new Date(booking.endDate)
        })));
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load calendar data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const getPropertyColor = (index: number): string => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-yellow-500'
    ];
    return colors[index % colors.length];
  };

  // Generate calendar days for current month
  const generateCalendarDays = (): CalendarDay[] => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    return daysInMonth.map(date => {
      const dayBookings = bookings.filter(booking => 
        selectedProperties.includes(booking.propertyId) &&
        (isSameDay(booking.startDate, date) || 
         isSameDay(booking.endDate, date) ||
         isWithinInterval(date, { start: booking.startDate, end: booking.endDate }))
      );

      return {
        date,
        bookings: dayBookings,
        isCurrentMonth: true,
        isToday: isSameDay(date, new Date())
      };
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1)
    );
  };

  const togglePropertySelection = (propertyId: string) => {
    setSelectedProperties(prev => 
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const selectAllProperties = () => {
    setSelectedProperties(properties.map(p => p.id));
  };

  const deselectAllProperties = () => {
    setSelectedProperties([]);
  };

  const getBookingsByProperty = (propertyId: string) => {
    return bookings.filter(booking => 
      booking.propertyId === propertyId && 
      selectedProperties.includes(propertyId)
    );
  };

  const exportCalendar = async () => {
    try {
      const response = await fetch('/api/calendar/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          properties: selectedProperties,
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear()
        })
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `calendar-${format(currentDate, 'yyyy-MM')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Calendar exported",
        description: "Your calendar has been downloaded as CSV"
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export calendar",
        variant: "destructive"
      });
    }
  };

  const renderGridView = () => {
    const calendarDays = generateCalendarDays();
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Week headers */}
        {weekDays.map(day => (
          <div key={day} className="p-2 text-center font-medium text-gray-500 bg-gray-50">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`min-h-[120px] p-1 border border-gray-200 ${
              day.isToday ? 'bg-blue-50 border-blue-200' : 'bg-white'
            }`}
          >
            <div className={`text-sm font-medium mb-1 ${
              day.isToday ? 'text-blue-600' : 'text-gray-900'
            }`}>
              {format(day.date, 'd')}
            </div>
            
            <div className="space-y-1">
              {day.bookings.slice(0, 3).map((booking) => {
                const property = properties.find(p => p.id === booking.propertyId);
                const isCheckIn = isSameDay(booking.startDate, day.date);
                const isCheckOut = isSameDay(booking.endDate, day.date);
                
                return (
                  <div
                    key={booking.id}
                    className={`text-xs p-1 rounded cursor-pointer ${property?.color || 'bg-gray-500'} text-white`}
                    onClick={() => setSelectedBooking(booking)}
                    title={`${booking.guestName} - ${property?.title}`}
                  >
                    <div className="truncate">
                      {isCheckIn && '→ '}{isCheckOut && '← '}
                      {booking.guestName}
                    </div>
                  </div>
                );
              })}
              
              {day.bookings.length > 3 && (
                <div className="text-xs text-gray-500 text-center">
                  +{day.bookings.length - 3} more
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderListView = () => {
    const calendarDays = generateCalendarDays();
    const daysWithBookings = calendarDays.filter(day => day.bookings.length > 0);

    return (
      <div className="space-y-4">
        {daysWithBookings.map((day, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {format(day.date, 'EEEE, MMMM d, yyyy')}
                {day.isToday && <Badge variant="default">Today</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {day.bookings.map((booking) => {
                  const property = properties.find(p => p.id === booking.propertyId);
                  const isCheckIn = isSameDay(booking.startDate, day.date);
                  const isCheckOut = isSameDay(booking.endDate, day.date);
                  
                  return (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${property?.color || 'bg-gray-500'}`} />
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {booking.guestName}
                            {isCheckIn && <Badge variant="outline">Check-in</Badge>}
                            {isCheckOut && <Badge variant="outline">Check-out</Badge>}
                          </div>
                          <div className="text-sm text-gray-600">
                            {property?.title} • {booking.guestCount} guest{booking.guestCount !== 1 ? 's' : ''}
                          </div>
                          <div className="text-sm text-gray-500">
                            {format(booking.startDate, 'MMM d')} - {format(booking.endDate, 'MMM d')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">R{booking.amount.toLocaleString()}</div>
                        <Badge variant={
                          booking.status === 'confirmed' ? 'default' :
                          booking.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderPropertyStats = () => {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {properties.filter(p => selectedProperties.includes(p.id)).map((property) => {
          const propertyBookings = getBookingsByProperty(property.id);
          const monthRevenue = propertyBookings.reduce((sum, booking) => sum + booking.amount, 0);
          const occupiedDays = propertyBookings.reduce((sum, booking) => {
            const start = booking.startDate > startOfMonth(currentDate) ? booking.startDate : startOfMonth(currentDate);
            const end = booking.endDate < endOfMonth(currentDate) ? booking.endDate : endOfMonth(currentDate);
            return sum + Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
          }, 0);
          const daysInMonth = endOfMonth(currentDate).getDate();
          const occupancyRate = Math.round((occupiedDays / daysInMonth) * 100);

          return (
            <Card key={property.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-3 h-3 rounded-full ${property.color}`} />
                  <h3 className="font-medium truncate">{property.title}</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bookings:</span>
                    <span className="font-medium">{propertyBookings.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Revenue:</span>
                    <span className="font-medium">R{monthRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Occupancy:</span>
                    <span className="font-medium">{occupancyRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Multi-Property Calendar</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-medium min-w-[200px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={viewMode} onValueChange={(value: 'grid' | 'list') => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid">
                <div className="flex items-center gap-2">
                  <Grid3X3 className="h-4 w-4" />
                  Grid
                </div>
              </SelectItem>
              <SelectItem value="list">
                <div className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  List
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={exportCalendar}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Property Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Property Filters
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAllProperties}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAllProperties}>
                Clear All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {properties.map((property) => (
              <Badge
                key={property.id}
                variant={selectedProperties.includes(property.id) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => togglePropertySelection(property.id)}
              >
                <div className={`w-2 h-2 rounded-full mr-2 ${property.color}`} />
                {property.title}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Property Stats */}
      {selectedProperties.length > 0 && renderPropertyStats()}

      {/* Calendar Content */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading calendar...</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            {viewMode === 'grid' ? renderGridView() : renderListView()}
          </CardContent>
        </Card>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          property={properties.find(p => p.id === selectedBooking.propertyId)}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
};

// Booking Details Modal Component
interface BookingDetailsModalProps {
  booking: Booking;
  property?: Property;
  onClose: () => void;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  booking,
  property,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Booking Details</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Guest Information</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span>{booking.guestName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Guests:</span>
                <span>{booking.guestCount}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Property & Dates</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Property:</span>
                <span>{property?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Check-in:</span>
                <span>{format(booking.startDate, 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Check-out:</span>
                <span>{format(booking.endDate, 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nights:</span>
                <span>
                  {Math.ceil((booking.endDate.getTime() - booking.startDate.getTime()) / (1000 * 60 * 60 * 24))}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Booking Status</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge variant={
                  booking.status === 'confirmed' ? 'default' :
                  booking.status === 'pending' ? 'secondary' : 'destructive'
                }>
                  {booking.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold">R{booking.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Booking ID:</span>
                <span className="font-mono text-xs">{booking.id}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button className="flex-1" size="sm">
              View Full Details
            </Button>
            <Button variant="outline" className="flex-1" size="sm">
              Contact Guest
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiCalendarView;