import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar as CalendarIcon,
  Users, 
  Bed, 
  Bath, 
  MapPin, 
  Star,
  Clock,
  CreditCard,
  Phone,
  Mail,
  User,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Wifi,
  Car,
  Coffee,
  Tv,
  AirVent,
  Utensils,
  Waves,
  Dumbbell,
  Home,
  Settings,
  BookOpen,
  BarChart,
  MessageSquare,
  DollarSign
} from 'lucide-react';
import { format, addDays, differenceInDays, isBefore, isAfter, parseISO } from 'date-fns';
import { useApp } from './AppContext';
import { propertyApi, bookingApi, paymentApi } from '../services/api';

// Types
interface BookingFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDate: Date | null;
  endDate: Date | null;
  guests: number;
  specialRequests?: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  available: boolean;
}

// Amenity icons mapping
const amenityIcons: Record<string, any> = {
  WiFi: Wifi,
  Parking: Car,
  Kitchen: Utensils,
  TV: Tv,
  'Air Conditioning': AirVent,
  'Coffee Machine': Coffee,
  'Swimming Pool': Waves,
  Gym: Dumbbell,
};

// Payment methods
const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'ozow',
    name: 'Ozow',
    description: 'Instant EFT - Direct from your bank account',
    icon: '🏦',
    available: true,
  },
  {
    id: 'payfast',
    name: 'PayFast',
    description: 'Credit/Debit Cards & other payment options',
    icon: '💳',
    available: true,
  },
  {
    id: 'zapper',
    name: 'Zapper',
    description: 'Scan QR code with your banking app',
    icon: '📱',
    available: true,
  },
  {
    id: 'snapscan',
    name: 'SnapScan',
    description: 'Quick QR code payment',
    icon: '⚡',
    available: true,
  },
];

// Property Gallery Component
const PropertyGallery = ({ images, title }: { images: string[]; title: string }) => {
  const [currentImage, setCurrentImage] = useState(0);

  return (
    <div className="space-y-4">
      <div className="relative aspect-video rounded-lg overflow-hidden">
        <img
          src={images[currentImage] || '/api/placeholder/600/400'}
          alt={`${title} - Image ${currentImage + 1}`}
          className="w-full h-full object-cover"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentImage(prev => prev > 0 ? prev - 1 : images.length - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentImage(prev => prev < images.length - 1 ? prev + 1 : 0)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`w-2 h-2 rounded-full ${
                    index === currentImage ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                index === currentImage ? 'border-blue-500' : 'border-gray-200'
              }`}
            >
              <img
                src={image}
                alt={`${title} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Booking Calendar Component
const BookingCalendar = ({ 
  property, 
  selectedDates, 
  onDateSelect,
  bookedDates = []
}: {
  property: any;
  selectedDates: { startDate: Date | null; endDate: Date | null };
  onDateSelect: (dates: { startDate: Date | null; endDate: Date | null }) => void;
  bookedDates: string[];
}) => {
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectingStart, setSelectingStart] = useState(true);

  const isDateBooked = (date: Date) => {
    return bookedDates.some(bookedDate => {
      const booked = parseISO(bookedDate);
      return format(date, 'yyyy-MM-dd') === format(booked, 'yyyy-MM-dd');
    });
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return isBefore(date, today) || isDateBooked(date);
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;

    if (selectingStart || !selectedDates.startDate) {
      onDateSelect({ startDate: date, endDate: null });
      setSelectingStart(false);
    } else {
      if (isBefore(date, selectedDates.startDate)) {
        onDateSelect({ startDate: date, endDate: selectedDates.startDate });
      } else {
        onDateSelect({ startDate: selectedDates.startDate, endDate: date });
      }
      setSelectingStart(true);
    }
  };

  const clearDates = () => {
    onDateSelect({ startDate: null, endDate: null });
    setSelectingStart(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Select Dates</h3>
        {selectedDates.startDate && (
          <Button variant="outline" size="sm" onClick={clearDates}>
            Clear Dates
          </Button>
        )}
      </div>
      
      <Calendar
        mode="single"
        selected={selectedDates.startDate || undefined}
        onSelect={(date) => date && handleDateClick(date)}
        disabled={isDateDisabled}
        month={calendarMonth}
        onMonthChange={setCalendarMonth}
        className="border rounded-lg"
      />
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-200 rounded" />
          <span>Unavailable</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-200 rounded" />
          <span>Selected</span>
        </div>
      </div>
      
      {selectedDates.startDate && selectedDates.endDate && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Selected Dates:</span>
            <span className="text-sm">
              {differenceInDays(selectedDates.endDate, selectedDates.startDate)} nights
            </span>
          </div>
          <div className="text-sm text-gray-600">
            {format(selectedDates.startDate, 'MMM dd, yyyy')} - {format(selectedDates.endDate, 'MMM dd, yyyy')}
          </div>
        </div>
      )}
    </div>
  );
};

// Booking Form Component
const BookingForm = ({ 
  property, 
  selectedDates, 
  onSubmit, 
  loading 
}: {
  property: any;
  selectedDates: { startDate: Date | null; endDate: Date | null };
  onSubmit: (data: BookingFormData) => void;
  loading: boolean;
}) => {
  const [formData, setFormData] = useState<BookingFormData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    startDate: selectedDates.startDate,
    endDate: selectedDates.endDate,
    guests: 1,
    specialRequests: '',
  });
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      startDate: selectedDates.startDate,
      endDate: selectedDates.endDate,
    }));
  }, [selectedDates]);

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.customerName.trim()) newErrors.customerName = 'Name is required';
    if (!formData.customerEmail.trim()) newErrors.customerEmail = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) newErrors.customerEmail = 'Invalid email';
    if (!formData.customerPhone.trim()) newErrors.customerPhone = 'Phone number is required';
    if (!formData.startDate) newErrors.dates = 'Check-in date is required';
    if (!formData.endDate) newErrors.dates = 'Check-out date is required';
    if (formData.guests < 1 || formData.guests > property.maxGuests) {
      newErrors.guests = `Guests must be between 1 and ${property.maxGuests}`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof BookingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: null }));
    }
  };

  const nights = formData.startDate && formData.endDate 
    ? differenceInDays(formData.endDate, formData.startDate) 
    : 0;
  const totalAmount = nights * property.price;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.customerName}
            onChange={(e) => handleInputChange('customerName', e.target.value)}
            placeholder="John Doe"
            className={errors.customerName ? 'border-red-500' : ''}
          />
          {errors.customerName && <p className="text-sm text-red-500">{errors.customerName}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.customerEmail}
            onChange={(e) => handleInputChange('customerEmail', e.target.value)}
            placeholder="john@example.com"
            className={errors.customerEmail ? 'border-red-500' : ''}
          />
          {errors.customerEmail && <p className="text-sm text-red-500">{errors.customerEmail}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            value={formData.customerPhone}
            onChange={(e) => handleInputChange('customerPhone', e.target.value)}
            placeholder="+27 12 345 6789"
            className={errors.customerPhone ? 'border-red-500' : ''}
          />
          {errors.customerPhone && <p className="text-sm text-red-500">{errors.customerPhone}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="guests">Number of Guests *</Label>
          <Input
            id="guests"
            type="number"
            min="1"
            max={property.maxGuests}
            value={formData.guests}
            onChange={(e) => handleInputChange('guests', Number(e.target.value))}
            className={errors.guests ? 'border-red-500' : ''}
          />
          {errors.guests && <p className="text-sm text-red-500">{errors.guests}</p>}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="requests">Special Requests (Optional)</Label>
        <Input
          id="requests"
          value={formData.specialRequests}
          onChange={(e) => handleInputChange('specialRequests', e.target.value)}
          placeholder="Any special requirements or requests..."
        />
      </div>
      
      {errors.dates && <p className="text-sm text-red-500">{errors.dates}</p>}
      
      {nights > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <h4 className="font-semibold">Booking Summary</h4>
          <div className="flex justify-between text-sm">
            <span>R{property.price} × {nights} nights</span>
            <span>R{totalAmount.toLocaleString()}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>R{totalAmount.toLocaleString()}</span>
          </div>
        </div>
      )}
      
      <Button type="submit" className="w-full" disabled={loading || nights === 0}>
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          `Book Now - R${totalAmount.toLocaleString()}`
        )}
      </Button>
    </form>
  );
};

// Payment Selection Component
const PaymentSelection = ({ 
  totalAmount, 
  onPaymentSelect, 
  loading 
}: {
  totalAmount: number;
  onPaymentSelect: (method: string) => void;
  loading: boolean;
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Choose Payment Method</h3>
      <p className="text-sm text-gray-600">
        Total amount: <span className="font-semibold">R{totalAmount.toLocaleString()}</span>
      </p>
      
      <div className="grid gap-3">
        {PAYMENT_METHODS.map((method) => (
          <button
            key={method.id}
            onClick={() => onPaymentSelect(method.id)}
            disabled={!method.available || loading}
            className="flex items-center gap-3 p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-2xl">{method.icon}</span>
            <div className="flex-1 text-left">
              <div className="font-semibold">{method.name}</div>
              <div className="text-sm text-gray-600">{method.description}</div>
            </div>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          </button>
        ))}
      </div>
    </div>
  );
};

// Booking Confirmation Component
const BookingConfirmation = ({ bookingDetails }: { bookingDetails: any }) => {
  return (
    <div className="text-center space-y-4">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
      <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
      <div className="bg-green-50 p-4 rounded-lg">
        <p className="text-green-800">
          Your booking has been confirmed. You will receive a confirmation email shortly.
        </p>
        <p className="text-sm text-green-600 mt-2">
          Booking ID: {bookingDetails.id}
        </p>
      </div>
      <Button className="mt-4" onClick={() => window.location.reload()}>
        Make Another Booking
      </Button>
    </div>
  );
};

// Owner Dashboard Component
const OwnerDashboard = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'listings' | 'bookings' | 'messages' | 'earnings'>('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const propertiesRes = await propertyApi.getOwnerProperties();
        setProperties(propertiesRes.data);
        
        if (propertiesRes.data.length > 0) {
          setSelectedProperty(propertiesRes.data[0]);
          const bookingsRes = await bookingApi.getPropertyBookings(propertiesRes.data[0].id);
          setBookings(bookingsRes.data);
        }
      } catch (error) {
        console.error('Error loading owner data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 bg-white rounded-lg shadow p-4">
          <div className="space-y-1">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-3 w-full p-3 rounded-lg text-left ${
                activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            <button 
              onClick={() => setActiveTab('listings')}
              className={`flex items-center gap-3 w-full p-3 rounded-lg text-left ${
                activeTab === 'listings' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Listings</span>
            </button>
            <button 
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center gap-3 w-full p-3 rounded-lg text-left ${
                activeTab === 'bookings' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span>Bookings</span>
            </button>
            <button 
              onClick={() => setActiveTab('messages')}
              className={`flex items-center gap-3 w-full p-3 rounded-lg text-left ${
                activeTab === 'messages' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span>Messages</span>
            </button>
            <button 
              onClick={() => setActiveTab('earnings')}
              className={`flex items-center gap-3 w-full p-3 rounded-lg text-left ${
                activeTab === 'earnings' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
              }`}
            >
              <DollarSign className="w-5 h-5" />
              <span>Earnings</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeTab === 'dashboard' && (
            <Card>
              <CardHeader>
                <CardTitle>Owner Dashboard</CardTitle>
                <CardDescription>Overview of your properties and bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold">5</div>
                    <div className="text-gray-600">Properties</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold">12</div>
                    <div className="text-gray-600">Upcoming Bookings</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold">R42,800</div>
                    <div className="text-gray-600">Monthly Earnings</div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
                <div className="space-y-4">
                  {bookings.slice(0, 3).map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-4">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium">{booking.customerName}</div>
                          <div className="text-sm text-gray-600">{booking.customerEmail}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">R{booking.totalAmount}</div>
                          <div className="text-sm text-gray-600">
                            {format(parseISO(booking.startDate), 'MMM dd')} - {format(parseISO(booking.endDate), 'MMM dd')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'listings' && (
            <Card>
              <CardHeader>
                <CardTitle>Manage Listings</CardTitle>
                <CardDescription>Your properties available for booking</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="mb-4">
                  + Add New Property
                </Button>
                
                <div className="space-y-4">
                  {properties.map((property) => (
                    <div key={property.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <img 
                          src={property.images[0] || '/api/placeholder/300/200'} 
                          alt={property.title} 
                          className="w-32 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className="font-semibold">{property.title}</h3>
                            <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
                              {property.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{property.location}</p>
                          <div className="flex items-center gap-4 text-sm mt-2">
                            <div className="flex items-center gap-1">
                              <Bed className="w-4 h-4" />
                              {property.bedrooms} beds
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {property.maxGuests} guests
                            </div>
                            <div className="flex items-center gap-1 font-semibold">
                              <DollarSign className="w-4 h-4" />
                              R{property.price}/night
                            </div>
                          </div>
                        </div>
                        <Button variant="outline">Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'bookings' && (
            <Card>
              <CardHeader>
                <CardTitle>Bookings Management</CardTitle>
                <CardDescription>View and manage upcoming bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bookings.map((booking) => (
                        <tr key={booking.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium">{booking.customerName}</div>
                            <div className="text-sm text-gray-500">{booking.customerEmail}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">{booking.propertyTitle}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              {format(parseISO(booking.startDate), 'MMM dd')} - {format(parseISO(booking.endDate), 'MMM dd')}
                            </div>
                            <div className="text-xs text-gray-500">
                              {differenceInDays(parseISO(booking.endDate), parseISO(booking.startDate))} nights
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            R{booking.totalAmount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                              {booking.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Button variant="outline" size="sm">View</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Other tabs would be implemented similarly */}
        </div>
      </div>
    </div>
  );
};

// Main Booking Engine Component
const BookingEngine = ({ propertyId }: { propertyId?: string }) => {
  const { state, selectProperty, selectDates, clearSelection } = useApp();
  const [currentStep, setCurrentStep] = useState<'property' | 'dates' | 'form' | 'payment' | 'confirmation'>('property');
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [selectedDates, setSelectedDates] = useState<{ startDate: Date | null; endDate: Date | null }>({
    startDate: null,
    endDate: null,
  });
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  // Load property details and booked dates
  useEffect(() => {
    if (propertyId) {
      loadPropertyDetails(propertyId);
    } else if (state.selectedProperty) {
      setSelectedProperty(state.selectedProperty);
      setCurrentStep('dates');
      loadBookedDates(state.selectedProperty.id);
    }
  }, [propertyId, state.selectedProperty]);

  const loadPropertyDetails = async (id: string) => {
    setLoading(true);
    try {
      const property = await propertyApi.getProperty(id);
      setSelectedProperty(property.data);
      setCurrentStep('dates');
      await loadBookedDates(id);
    } catch (error) {
      setError('Failed to load property details');
      console.error('Error loading property:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBookedDates = async (id: string) => {
    try {
      const response = await propertyApi.getPropertyBookedDates(id);
      setBookedDates(response.data || []);
    } catch (error) {
      console.error('Error loading booked dates:', error);
    }
  };

  const handleDateSelect = (dates: { startDate: Date | null; endDate: Date | null }) => {
    setSelectedDates(dates);
    if (dates.startDate && dates.endDate) {
      setCurrentStep('form');
    }
  };

  const handleBookingSubmit = async (formData: BookingFormData) => {
    if (!selectedProperty || !selectedDates.startDate || !selectedDates.endDate) return;

    setLoading(true);
    try {
      const nights = differenceInDays(selectedDates.endDate, selectedDates.startDate);
      const totalAmount = nights * selectedProperty.price;

      const bookingData = {
        propertyId: selectedProperty.id,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        startDate: format(selectedDates.startDate, 'yyyy-MM-dd'),
        endDate: format(selectedDates.endDate, 'yyyy-MM-dd'),
        totalAmount,
        paymentMethod: '', // Will be set in payment step
      };

      // Store booking data temporarily
      setBookingDetails(bookingData);
      setCurrentStep('payment');
    } catch (error) {
      setError('Failed to process booking');
      console.error('Error creating booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSelect = async (paymentMethod: string) => {
    if (!bookingDetails) return;

    setLoading(true);
    try {
      // Create booking
      const booking = await bookingApi.createBooking({
        ...bookingDetails,
        paymentMethod,
      });

      // Initiate payment
      const payment = await paymentApi.initiatePayment({
        bookingId: booking.data.id,
        amount: bookingDetails.totalAmount,
        paymentMethod: paymentMethod as any,
        customerEmail: bookingDetails.customerEmail,
      });

      if (payment.data.redirectUrl) {
        // Redirect to payment gateway
        window.location.href = payment.data.redirectUrl;
      } else {
        // Payment completed (e.g., QR code payments)
        setCurrentStep('confirmation');
      }
    } catch (error) {
      setError('Failed to initiate payment');
      console.error('Error processing payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetBooking = () => {
    setCurrentStep('property');
    setSelectedProperty(null);
    setSelectedDates({ startDate: null, endDate: null });
    setBookingDetails(null);
    setError(null);
    clearSelection();
  };

  if (!selectedProperty && currentStep !== 'property') {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h2 className="text-xl font-semibold mb-2">Property Not Found</h2>
        <p className="text-gray-600">The requested property could not be found.</p>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[
          { key: 'dates', label: 'Select Dates', icon: CalendarIcon },
          { key: 'form', label: 'Guest Details', icon: User },
          { key: 'payment', label: 'Payment', icon: CreditCard },
          { key: 'confirmation', label: 'Confirmation', icon: CheckCircle },
        ].map((step, index) => {
          const isActive = currentStep === step.key;
          const isCompleted = 
            (step.key === 'dates' && selectedDates.startDate && selectedDates.endDate) ||
            (step.key === 'form' && currentStep === 'payment') ||
            (step.key === 'payment' && currentStep === 'confirmation');
          
          return (
            <div key={step.key} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                isActive ? 'border-blue-500 bg-blue-500 text-white' :
                isCompleted ? 'border-green-500 bg-green-500 text-white' :
                'border-gray-300 text-gray-300'
              }`}>
                <step.icon className="w-5 h-5" />
              </div>
              <span className={`ml-2 text-sm ${
                isActive ? 'text-blue-600 font-semibold' :
                isCompleted ? 'text-green-600' :
                'text-gray-400'
              }`}>
                {step.label}
              </span>
              {index < 3 && (
                <ArrowRight className="w-4 h-4 mx-2 text-gray-300" />
              )}
            </div>
          );
        })}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Property Details (always visible) */}
      {selectedProperty && currentStep !== 'confirmation' && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Property Images */}
              <div className="lg:col-span-2">
                <PropertyGallery 
                  images={selectedProperty.images || ['/api/placeholder/600/400']} 
                  title={selectedProperty.title} 
                />
              </div>
              
              {/* Property Info */}
              <div className="space-y-4">
                <div>
                  <h1 className="text-2xl font-bold">{selectedProperty.title}</h1>
                  <div className="flex items-center gap-1 text-gray-600 mt-1">
                    <MapPin className="w-4 h-4" />
                    {selectedProperty.location}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Bed className="w-4 h-4" />
                    {selectedProperty.bedrooms} bed{selectedProperty.bedrooms !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="w-4 h-4" />
                    {selectedProperty.bathrooms} bath{selectedProperty.bathrooms !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Up to {selectedProperty.maxGuests} guests
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm">{selectedProperty.description}</p>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProperty.amenities?.map((amenity: string) => {
                      const Icon = amenityIcons[amenity];
                      return (
                        <Badge key={amenity} variant="outline" className="flex items-center gap-1">
                          {Icon && <Icon className="w-3 h-3" />}
                          {amenity}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                
                <div className="text-2xl font-bold text-blue-600">
                  R{selectedProperty.price.toLocaleString()}/night
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        {currentStep === 'dates' && selectedProperty && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Select Your Dates</CardTitle>
              <CardDescription>Choose your check-in and check-out dates</CardDescription>
            </CardHeader>
            <CardContent>
              <BookingCalendar
                property={selectedProperty}
                selectedDates={selectedDates}
                onDateSelect={handleDateSelect}
                bookedDates={bookedDates}
              />
            </CardContent>
          </Card>
        )}

        {/* Booking Form */}
        {currentStep === 'form' && selectedProperty && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Guest Information</CardTitle>
              <CardDescription>Please provide your details for the booking</CardDescription>
            </CardHeader>
            <CardContent>
              <BookingForm
                property={selectedProperty}
                selectedDates={selectedDates}
                onSubmit={handleBookingSubmit}
                loading={loading}
              />
            </CardContent>
          </Card>
        )}

        {/* Payment Selection */}
        {currentStep === 'payment' && selectedProperty && bookingDetails && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Payment</CardTitle>
              <CardDescription>Select your preferred payment method</CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentSelection 
                totalAmount={bookingDetails.totalAmount}
                onPaymentSelect={handlePaymentSelect}
                loading={loading}
              />
            </CardContent>
          </Card>
        )}

        {/* Booking Confirmation */}
        {currentStep === 'confirmation' && bookingDetails && (
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-8">
                <BookingConfirmation bookingDetails={bookingDetails} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

// Export components
export { BookingEngine, OwnerDashboard };