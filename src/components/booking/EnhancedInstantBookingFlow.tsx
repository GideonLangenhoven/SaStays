import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CalendarDays,
  Users,
  CreditCard,
  Shield,
  Clock,
  MapPin,
  Star,
  Wifi,
  Car,
  Coffee,
  Tv,
  Wind,
  Waves,
  Camera,
  Check,
  X,
  AlertTriangle,
  Phone,
  Mail,
  User,
  MessageSquare,
  FileText,
  Zap,
  Info,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Calculator,
  Gift,
  Percent,
  Calendar as CalendarIcon
} from 'lucide-react';
import { format, differenceInDays, addDays, isBefore, isAfter, isEqual } from 'date-fns';
import { toast } from 'sonner';

interface Property {
  id: string;
  title: string;
  location: string;
  address: string;
  description: string;
  pricePerNight: number;
  cleaningFee: number;
  serviceFee: number;
  taxRate: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  instantBooking: boolean;
  rating: number;
  reviewCount: number;
  hostName: string;
  hostImage?: string;
  hostResponseTime: string;
  superhost: boolean;
  cancellationPolicy: 'flexible' | 'moderate' | 'strict';
  houseRules: string[];
  safetyFeatures: string[];
  unavailableDates: string[];
  minimumStay: number;
  maximumStay: number;
  advanceNotice: number; // hours
  preparationTime: number; // hours between bookings
  weekendPricing?: number;
  monthlyDiscount?: number;
  weeklyDiscount?: number;
}

interface BookingData {
  propertyId: string;
  checkIn: Date | null;
  checkOut: Date | null;
  guests: {
    adults: number;
    children: number;
    infants: number;
  };
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    countryCode: string;
  };
  purposeOfStay: 'leisure' | 'business' | 'other';
  specialRequests: string;
  agreedToRules: boolean;
  marketingOptIn: boolean;
}

interface PricingBreakdown {
  basePrice: number;
  nights: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  discounts: number;
  total: number;
  weeklyDiscount?: number;
  monthlyDiscount?: number;
}

interface EnhancedInstantBookingFlowProps {
  property: Property;
  preselectedDates?: { checkIn: Date; checkOut: Date };
  preselectedGuests?: number;
  onBookingComplete?: (bookingId: string) => void;
  onCancel?: () => void;
  className?: string;
}

const amenityIcons: { [key: string]: React.ReactNode } = {
  wifi: <Wifi className="h-4 w-4" />,
  parking: <Car className="h-4 w-4" />,
  kitchen: <Coffee className="h-4 w-4" />,
  tv: <Tv className="h-4 w-4" />,
  ac: <Wind className="h-4 w-4" />,
  pool: <Waves className="h-4 w-4" />,
  'hot tub': <Waves className="h-4 w-4" />,
  gym: <Users className="h-4 w-4" />,
  'security cameras': <Camera className="h-4 w-4" />
};

export const EnhancedInstantBookingFlow: React.FC<EnhancedInstantBookingFlowProps> = ({
  property,
  preselectedDates,
  preselectedGuests,
  onBookingComplete,
  onCancel,
  className
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    propertyId: property.id,
    checkIn: preselectedDates?.checkIn || null,
    checkOut: preselectedDates?.checkOut || null,
    guests: {
      adults: preselectedGuests || 1,
      children: 0,
      infants: 0
    },
    guestInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      countryCode: '+27'
    },
    purposeOfStay: 'leisure',
    specialRequests: '',
    agreedToRules: false,
    marketingOptIn: false
  });

  const [pricing, setPricing] = useState<PricingBreakdown | null>(null);
  const [availability, setAvailability] = useState<{ [key: string]: boolean }>({});
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  const totalSteps = 4;
  const progressPercentage = (currentStep / totalSteps) * 100;

  useEffect(() => {
    if (bookingData.checkIn && bookingData.checkOut) {
      calculatePricing();
      checkAvailability();
    }
  }, [bookingData.checkIn, bookingData.checkOut, bookingData.guests]);

  const calculatePricing = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return;

    const nights = differenceInDays(bookingData.checkOut, bookingData.checkIn);
    const basePrice = property.pricePerNight;
    const subtotal = basePrice * nights;
    
    // Apply discounts
    let weeklyDiscount = 0;
    let monthlyDiscount = 0;
    
    if (nights >= 7 && property.weeklyDiscount) {
      weeklyDiscount = subtotal * (property.weeklyDiscount / 100);
    }
    if (nights >= 28 && property.monthlyDiscount) {
      monthlyDiscount = subtotal * (property.monthlyDiscount / 100);
    }
    
    const discounts = Math.max(weeklyDiscount, monthlyDiscount);
    const discountedSubtotal = subtotal - discounts;
    
    const cleaningFee = property.cleaningFee || 0;
    const serviceFee = discountedSubtotal * 0.12; // 12% service fee
    const taxes = (discountedSubtotal + serviceFee) * (property.taxRate || 0.15);
    const total = discountedSubtotal + cleaningFee + serviceFee + taxes;

    setPricing({
      basePrice,
      nights,
      subtotal,
      cleaningFee,
      serviceFee,
      taxes,
      discounts,
      total,
      weeklyDiscount: nights >= 7 ? weeklyDiscount : undefined,
      monthlyDiscount: nights >= 28 ? monthlyDiscount : undefined
    });
  };

  const checkAvailability = async () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return;
    
    setIsCheckingAvailability(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock availability check - mark some dates as unavailable
      const unavailableDates = property.unavailableDates || [];
      const isAvailable = !unavailableDates.some(date => {
        const unavailableDate = new Date(date);
        return (isEqual(unavailableDate, bookingData.checkIn!) || 
                isEqual(unavailableDate, bookingData.checkOut!) ||
                (isAfter(unavailableDate, bookingData.checkIn!) && 
                 isBefore(unavailableDate, bookingData.checkOut!)));
      });
      
      setAvailability({ available: isAvailable });
    } catch (error) {
      console.error('Error checking availability:', error);
      toast.error('Failed to check availability');
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: { [key: string]: string } = {};

    switch (step) {
      case 1:
        if (!bookingData.checkIn) errors.checkIn = 'Please select check-in date';
        if (!bookingData.checkOut) errors.checkOut = 'Please select check-out date';
        if (bookingData.checkIn && bookingData.checkOut && 
            differenceInDays(bookingData.checkOut, bookingData.checkIn) < property.minimumStay) {
          errors.dates = `Minimum stay is ${property.minimumStay} night${property.minimumStay > 1 ? 's' : ''}`;
        }
        if (bookingData.guests.adults + bookingData.guests.children > property.maxGuests) {
          errors.guests = `Maximum ${property.maxGuests} guests allowed`;
        }
        break;
      
      case 2:
        if (!bookingData.guestInfo.firstName.trim()) errors.firstName = 'First name is required';
        if (!bookingData.guestInfo.lastName.trim()) errors.lastName = 'Last name is required';
        if (!bookingData.guestInfo.email.trim()) errors.email = 'Email is required';
        if (!/\S+@\S+\.\S+/.test(bookingData.guestInfo.email)) errors.email = 'Invalid email format';
        if (!bookingData.guestInfo.phone.trim()) errors.phone = 'Phone number is required';
        break;
      
      case 3:
        if (!bookingData.agreedToRules) errors.rules = 'Please agree to the house rules';
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmitBooking = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      // Simulate booking submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const bookingId = `BK-${Date.now()}`;
      toast.success('Booking confirmed successfully!');
      onBookingComplete?.(bookingId);
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast.error('Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDateSelection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5" />
          <span>Select Dates</span>
        </CardTitle>
        <CardDescription>Choose your check-in and check-out dates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="checkin">Check-in</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${
                    !bookingData.checkIn && "text-muted-foreground"
                  }`}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {bookingData.checkIn ? format(bookingData.checkIn, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={bookingData.checkIn || undefined}
                  onSelect={(date) => setBookingData(prev => ({ ...prev, checkIn: date || null }))}
                  disabled={(date) => 
                    isBefore(date, new Date()) || 
                    property.unavailableDates.includes(format(date, 'yyyy-MM-dd'))
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {validationErrors.checkIn && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.checkIn}</p>
            )}
          </div>

          <div>
            <Label htmlFor="checkout">Check-out</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${
                    !bookingData.checkOut && "text-muted-foreground"
                  }`}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {bookingData.checkOut ? format(bookingData.checkOut, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={bookingData.checkOut || undefined}
                  onSelect={(date) => setBookingData(prev => ({ ...prev, checkOut: date || null }))}
                  disabled={(date) => 
                    !bookingData.checkIn || 
                    isBefore(date, addDays(bookingData.checkIn, 1)) ||
                    property.unavailableDates.includes(format(date, 'yyyy-MM-dd'))
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {validationErrors.checkOut && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.checkOut}</p>
            )}
          </div>
        </div>

        {validationErrors.dates && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{validationErrors.dates}</AlertDescription>
          </Alert>
        )}

        {/* Guest Selection */}
        <div>
          <Label>Guests</Label>
          <div className="grid gap-4 mt-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Adults</p>
                <p className="text-sm text-muted-foreground">Ages 13 or above</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setBookingData(prev => ({
                    ...prev,
                    guests: { ...prev.guests, adults: Math.max(1, prev.guests.adults - 1) }
                  }))}
                  disabled={bookingData.guests.adults <= 1}
                >
                  -
                </Button>
                <span className="w-8 text-center">{bookingData.guests.adults}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setBookingData(prev => ({
                    ...prev,
                    guests: { ...prev.guests, adults: prev.guests.adults + 1 }
                  }))}
                  disabled={bookingData.guests.adults + bookingData.guests.children >= property.maxGuests}
                >
                  +
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Children</p>
                <p className="text-sm text-muted-foreground">Ages 2-12</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setBookingData(prev => ({
                    ...prev,
                    guests: { ...prev.guests, children: Math.max(0, prev.guests.children - 1) }
                  }))}
                  disabled={bookingData.guests.children <= 0}
                >
                  -
                </Button>
                <span className="w-8 text-center">{bookingData.guests.children}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setBookingData(prev => ({
                    ...prev,
                    guests: { ...prev.guests, children: prev.guests.children + 1 }
                  }))}
                  disabled={bookingData.guests.adults + bookingData.guests.children >= property.maxGuests}
                >
                  +
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Infants</p>
                <p className="text-sm text-muted-foreground">Under 2</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setBookingData(prev => ({
                    ...prev,
                    guests: { ...prev.guests, infants: Math.max(0, prev.guests.infants - 1) }
                  }))}
                  disabled={bookingData.guests.infants <= 0}
                >
                  -
                </Button>
                <span className="w-8 text-center">{bookingData.guests.infants}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setBookingData(prev => ({
                    ...prev,
                    guests: { ...prev.guests, infants: prev.guests.infants + 1 }
                  }))}
                >
                  +
                </Button>
              </div>
            </div>
          </div>
          {validationErrors.guests && (
            <p className="text-sm text-red-500 mt-1">{validationErrors.guests}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderGuestInfo = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Guest Information</span>
        </CardTitle>
        <CardDescription>Enter your details for the booking</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={bookingData.guestInfo.firstName}
              onChange={(e) => setBookingData(prev => ({
                ...prev,
                guestInfo: { ...prev.guestInfo, firstName: e.target.value }
              }))}
              className={validationErrors.firstName ? 'border-red-500' : ''}
            />
            {validationErrors.firstName && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.firstName}</p>
            )}
          </div>

          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={bookingData.guestInfo.lastName}
              onChange={(e) => setBookingData(prev => ({
                ...prev,
                guestInfo: { ...prev.guestInfo, lastName: e.target.value }
              }))}
              className={validationErrors.lastName ? 'border-red-500' : ''}
            />
            {validationErrors.lastName && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.lastName}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={bookingData.guestInfo.email}
            onChange={(e) => setBookingData(prev => ({
              ...prev,
              guestInfo: { ...prev.guestInfo, email: e.target.value }
            }))}
            className={validationErrors.email ? 'border-red-500' : ''}
          />
          {validationErrors.email && (
            <p className="text-sm text-red-500 mt-1">{validationErrors.email}</p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="countryCode">Country Code</Label>
            <Select
              value={bookingData.guestInfo.countryCode}
              onValueChange={(value) => setBookingData(prev => ({
                ...prev,
                guestInfo: { ...prev.guestInfo, countryCode: value }
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="+27">🇿🇦 +27 (South Africa)</SelectItem>
                <SelectItem value="+1">🇺🇸 +1 (United States)</SelectItem>
                <SelectItem value="+44">🇬🇧 +44 (United Kingdom)</SelectItem>
                <SelectItem value="+33">🇫🇷 +33 (France)</SelectItem>
                <SelectItem value="+49">🇩🇪 +49 (Germany)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={bookingData.guestInfo.phone}
              onChange={(e) => setBookingData(prev => ({
                ...prev,
                guestInfo: { ...prev.guestInfo, phone: e.target.value }
              }))}
              placeholder="123456789"
              className={validationErrors.phone ? 'border-red-500' : ''}
            />
            {validationErrors.phone && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.phone}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="purpose">Purpose of Stay</Label>
          <Select
            value={bookingData.purposeOfStay}
            onValueChange={(value: any) => setBookingData(prev => ({
              ...prev,
              purposeOfStay: value
            }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="leisure">Leisure</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="requests">Special Requests</Label>
          <Textarea
            id="requests"
            value={bookingData.specialRequests}
            onChange={(e) => setBookingData(prev => ({
              ...prev,
              specialRequests: e.target.value
            }))}
            placeholder="Any special requests or notes for the host..."
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderReview = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Review Your Booking</CardTitle>
          <CardDescription>Please review all details before confirming</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Property Summary */}
          <div className="flex space-x-4">
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-24 h-24 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{property.title}</h3>
              <p className="text-muted-foreground flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {property.location}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium ml-1">{property.rating}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  ({property.reviewCount} reviews)
                </span>
                {property.superhost && (
                  <Badge variant="secondary">Superhost</Badge>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Booking Details */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Check-in</h4>
              <p className="text-sm text-muted-foreground">
                {bookingData.checkIn ? format(bookingData.checkIn, 'EEEE, MMMM dd, yyyy') : 'Not selected'}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Check-out</h4>
              <p className="text-sm text-muted-foreground">
                {bookingData.checkOut ? format(bookingData.checkOut, 'EEEE, MMMM dd, yyyy') : 'Not selected'}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Guests</h4>
              <p className="text-sm text-muted-foreground">
                {bookingData.guests.adults} adult{bookingData.guests.adults > 1 ? 's' : ''}
                {bookingData.guests.children > 0 && `, ${bookingData.guests.children} child${bookingData.guests.children > 1 ? 'ren' : ''}`}
                {bookingData.guests.infants > 0 && `, ${bookingData.guests.infants} infant${bookingData.guests.infants > 1 ? 's' : ''}`}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Duration</h4>
              <p className="text-sm text-muted-foreground">
                {pricing ? `${pricing.nights} night${pricing.nights > 1 ? 's' : ''}` : 'Not calculated'}
              </p>
            </div>
          </div>

          <Separator />

          {/* Guest Information */}
          <div>
            <h4 className="font-medium mb-2">Guest Information</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>{bookingData.guestInfo.firstName} {bookingData.guestInfo.lastName}</p>
              <p>{bookingData.guestInfo.email}</p>
              <p>{bookingData.guestInfo.countryCode} {bookingData.guestInfo.phone}</p>
              {bookingData.specialRequests && (
                <div className="mt-2">
                  <p className="font-medium text-gray-700">Special Requests:</p>
                  <p>{bookingData.specialRequests}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Cancellation Policy */}
          <div>
            <h4 className="font-medium mb-2">Cancellation Policy</h4>
            <p className="text-sm text-muted-foreground capitalize">
              {property.cancellationPolicy} cancellation
            </p>
          </div>

          {/* House Rules Agreement */}
          <div className="space-y-3">
            <h4 className="font-medium">House Rules</h4>
            <div className="space-y-2">
              {property.houseRules.map((rule, index) => (
                <div key={index} className="flex items-start space-x-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{rule}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="agreeRules"
                checked={bookingData.agreedToRules}
                onChange={(e) => setBookingData(prev => ({
                  ...prev,
                  agreedToRules: e.target.checked
                }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="agreeRules" className="text-sm">
                I agree to the house rules and cancellation policy
              </Label>
            </div>
            {validationErrors.rules && (
              <p className="text-sm text-red-500">{validationErrors.rules}</p>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="marketing"
                checked={bookingData.marketingOptIn}
                onChange={(e) => setBookingData(prev => ({
                  ...prev,
                  marketingOptIn: e.target.checked
                }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="marketing" className="text-sm">
                I'd like to receive promotional emails from SaStays
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPricingSidebar = () => {
    if (!pricing) return null;

    return (
      <Card className="sticky top-4">
        <CardHeader>
          <CardTitle className="text-lg">Pricing Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span>R{pricing.basePrice.toFixed(2)} × {pricing.nights} night{pricing.nights > 1 ? 's' : ''}</span>
            <span>R{pricing.subtotal.toFixed(2)}</span>
          </div>

          {pricing.weeklyDiscount && pricing.weeklyDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Weekly discount</span>
              <span>-R{pricing.weeklyDiscount.toFixed(2)}</span>
            </div>
          )}

          {pricing.monthlyDiscount && pricing.monthlyDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Monthly discount</span>
              <span>-R{pricing.monthlyDiscount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Cleaning fee</span>
            <span>R{pricing.cleaningFee.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Service fee</span>
            <span>R{pricing.serviceFee.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Taxes</span>
            <span>R{pricing.taxes.toFixed(2)}</span>
          </div>

          <Separator />

          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>R{pricing.total.toFixed(2)}</span>
          </div>

          {isCheckingAvailability && (
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground">Checking availability...</p>
            </div>
          )}

          {availability.available === false && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Sorry, this property is not available for the selected dates.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Select Dates & Guests';
      case 2: return 'Guest Information';
      case 3: return 'Review & Confirm';
      case 4: return 'Payment';
      default: return 'Booking';
    }
  };

  return (
    <div className={`max-w-7xl mx-auto ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Instant Book</h1>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Heart className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>{getStepTitle()}</span>
            <span>Step {currentStep} of {totalSteps}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {currentStep === 1 && renderDateSelection()}
          {currentStep === 2 && renderGuestInfo()}
          {currentStep === 3 && renderReview()}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center space-x-2">
              {currentStep < totalSteps ? (
                <Button
                  onClick={nextStep}
                  disabled={isCheckingAvailability || availability.available === false}
                >
                  Continue
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitBooking}
                  disabled={isSubmitting || !bookingData.agreedToRules}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Confirm Instant Booking
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Pricing Sidebar */}
        <div className="lg:col-span-1">
          {renderPricingSidebar()}
        </div>
      </div>

      {/* Image Gallery Modal */}
      <Dialog open={showImageGallery} onOpenChange={setShowImageGallery}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{property.title}</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <img
              src={property.images[currentImageIndex]}
              alt={property.title}
              className="w-full h-96 object-cover rounded-lg"
            />
            <div className="absolute inset-0 flex items-center justify-between p-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentImageIndex(prev => 
                  prev > 0 ? prev - 1 : property.images.length - 1
                )}
                className="bg-black/50 text-white hover:bg-black/70"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentImageIndex(prev => 
                  prev < property.images.length - 1 ? prev + 1 : 0
                )}
                className="bg-black/50 text-white hover:bg-black/70"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex space-x-2 mt-4 overflow-x-auto">
            {property.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${property.title} ${index + 1}`}
                className={`w-16 h-16 object-cover rounded cursor-pointer ${
                  index === currentImageIndex ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedInstantBookingFlow;