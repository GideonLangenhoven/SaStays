import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, ChevronLeft, ChevronRight, DollarSign, Ban, Check, Clock, Edit } from 'lucide-react';
import { format, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';

// Mock data for calendar availability
const mockAvailabilityData = {
  basePrice: 850.00,
  properties: [
    { id: 1, name: 'Ocean View Apartment' },
    { id: 2, name: 'Mountain Cabin' },
    { id: 3, name: 'City Center Loft' },
    { id: 4, name: 'Beachfront Villa' }
  ],
  
  // Calendar data with different states
  calendarData: {
    '2025-07-15': { status: 'booked', price: 950, guestName: 'Sarah Johnson', bookingId: 'BK001' },
    '2025-07-16': { status: 'booked', price: 950, guestName: 'Sarah Johnson', bookingId: 'BK001' },
    '2025-07-17': { status: 'booked', price: 950, guestName: 'Sarah Johnson', bookingId: 'BK001' },
    '2025-07-18': { status: 'available', price: 850 },
    '2025-07-19': { status: 'available', price: 1200 }, // Weekend pricing
    '2025-07-20': { status: 'available', price: 1200 },
    '2025-07-21': { status: 'blocked', reason: 'Maintenance' },
    '2025-07-22': { status: 'pending', price: 850, guestName: 'David Smith', bookingId: 'BK002' },
    '2025-07-23': { status: 'pending', price: 850, guestName: 'David Smith', bookingId: 'BK002' },
    '2025-07-24': { status: 'available', price: 850 },
    '2025-07-25': { status: 'available', price: 850 },
    '2025-07-26': { status: 'available', price: 1200 },
    '2025-07-27': { status: 'available', price: 1200 },
    '2025-07-28': { status: 'booked', price: 950, guestName: 'Emma Wilson', bookingId: 'BK003' },
    '2025-07-29': { status: 'booked', price: 950, guestName: 'Emma Wilson', bookingId: 'BK003' },
    '2025-07-30': { status: 'available', price: 850 }
  },
  
  upcomingBookings: [
    {
      id: 'BK001',
      guestName: 'Sarah Johnson',
      checkIn: '2025-07-15',
      checkOut: '2025-07-17',
      nights: 2,
      totalAmount: 1900,
      status: 'confirmed'
    },
    {
      id: 'BK002',
      guestName: 'David Smith',
      checkIn: '2025-07-22',
      checkOut: '2025-07-23',
      nights: 1,
      totalAmount: 850,
      status: 'pending'
    }
  ]
};

const AvailabilityCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedProperty, setSelectedProperty] = useState('1');
  const [selectedDate, setSelectedDate] = useState(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [calendarData, setCalendarData] = useState(mockAvailabilityData.calendarData);
  const [newPrice, setNewPrice] = useState('');
  const [blockReason, setBlockReason] = useState('');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const getDateString = (date) => {
    return format(date, 'yyyy-MM-dd');
  };

  const getDateStatus = (date) => {
    const dateStr = getDateString(date);
    return calendarData[dateStr] || { status: 'available', price: mockAvailabilityData.basePrice };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'booked': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'blocked': return 'bg-red-100 text-red-800 border-red-200';
      case 'available': return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'booked': return <Check className="h-3 w-3" />;
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'blocked': return <Ban className="h-3 w-3" />;
      case 'available': return <DollarSign className="h-3 w-3" />;
      default: return null;
    }
  };

  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  };

  const handleDateClick = (date) => {
    const dateData = getDateStatus(date);
    if (dateData.status === 'available') {
      setSelectedDate(date);
      setNewPrice(dateData.price.toString());
    }
  };

  const handlePriceUpdate = () => {
    if (selectedDate && newPrice) {
      const dateStr = getDateString(selectedDate);
      setCalendarData(prev => ({
        ...prev,
        [dateStr]: {
          ...prev[dateStr],
          price: parseFloat(newPrice),
          status: 'available'
        }
      }));
      setShowPricingModal(false);
      setSelectedDate(null);
      setNewPrice('');
    }
  };

  const handleBlockDate = () => {
    if (selectedDate && blockReason) {
      const dateStr = getDateString(selectedDate);
      setCalendarData(prev => ({
        ...prev,
        [dateStr]: {
          status: 'blocked',
          reason: blockReason
        }
      }));
      setShowBlockModal(false);
      setSelectedDate(null);
      setBlockReason('');
    }
  };

  const handleUnblock = (date) => {
    const dateStr = getDateString(date);
    setCalendarData(prev => ({
      ...prev,
      [dateStr]: {
        status: 'available',
        price: mockAvailabilityData.basePrice
      }
    }));
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar & Availability</h1>
          <p className="text-muted-foreground">
            Manage your property availability, pricing, and bookings
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select property" />
            </SelectTrigger>
            <SelectContent>
              {mockAvailabilityData.properties.map((property) => (
                <SelectItem key={property.id} value={property.id.toString()}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">Base Rate: {formatCurrency(mockAvailabilityData.basePrice)}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Legend */}
          <div className="flex items-center justify-center space-x-6 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-green-100 border border-green-200"></div>
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-blue-100 border border-blue-200"></div>
              <span className="text-sm">Booked</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-200"></div>
              <span className="text-sm">Pending</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-red-100 border border-red-200"></div>
              <span className="text-sm">Blocked</span>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-2 text-center font-medium text-sm text-gray-500">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const dateData = getDateStatus(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div
                  key={index}
                  className={`
                    relative p-2 min-h-[80px] border rounded-lg cursor-pointer transition-all
                    ${isCurrentMonth ? '' : 'opacity-40'}
                    ${isToday ? 'ring-2 ring-blue-500' : ''}
                    ${getStatusColor(dateData.status)}
                  `}
                  onClick={() => handleDateClick(day)}
                >
                  <div className="flex items-start justify-between">
                    <span className={`text-sm font-medium ${isToday ? 'font-bold' : ''}`}>
                      {format(day, 'd')}
                    </span>
                    {getStatusIcon(dateData.status)}
                  </div>
                  
                  {isCurrentMonth && (
                    <div className="mt-1">
                      {dateData.status === 'available' && (
                        <div className="text-xs font-medium">
                          {formatCurrency(dateData.price)}
                        </div>
                      )}
                      
                      {(dateData.status === 'booked' || dateData.status === 'pending') && (
                        <div className="text-xs">
                          <div className="font-medium truncate">{dateData.guestName}</div>
                          <div>{formatCurrency(dateData.price)}</div>
                        </div>
                      )}
                      
                      {dateData.status === 'blocked' && (
                        <div className="text-xs">
                          <div className="font-medium">Blocked</div>
                          <div className="truncate">{dateData.reason}</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 p-0 text-xs mt-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnblock(day);
                            }}
                          >
                            Unblock
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Manage your calendar and pricing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Dialog open={showPricingModal} onOpenChange={setShowPricingModal}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Update Pricing
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Date Pricing</DialogTitle>
                    <DialogDescription>
                      Set custom pricing for {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="price">Price per night (ZAR)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        placeholder="Enter price"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowPricingModal(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handlePriceUpdate}>Update Price</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={showBlockModal} onOpenChange={setShowBlockModal}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Ban className="mr-2 h-4 w-4" />
                    Block Dates
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Block Date</DialogTitle>
                    <DialogDescription>
                      Block {selectedDate && format(selectedDate, 'MMMM d, yyyy')} from booking
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="reason">Reason for blocking</Label>
                      <Input
                        id="reason"
                        value={blockReason}
                        onChange={(e) => setBlockReason(e.target.value)}
                        placeholder="e.g., Maintenance, Personal use"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowBlockModal(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleBlockDate}>Block Date</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Sync External Calendar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
            <CardDescription>
              Your next check-ins and check-outs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockAvailabilityData.upcomingBookings.map((booking) => (
                <div key={booking.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{booking.guestName}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(booking.checkIn), 'MMM d')} - {format(parseISO(booking.checkOut), 'MMM d')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.nights} nights • {formatCurrency(booking.totalAmount)}
                      </p>
                    </div>
                    <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;