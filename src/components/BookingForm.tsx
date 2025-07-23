import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  User, Mail, Phone, CreditCard, Calendar, Clock,
  Shield, CheckCircle, AlertCircle, Users, MapPin,
  Star, ChevronRight, Lock, Heart, Camera
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data for development
const mockBookingData = {
  property: {
    id: 1,
    title: "Stunning Beachfront Villa",
    location: "Camps Bay, Cape Town",
    rating: 4.9,
    reviews: 127,
    image: "https://images.unsplash.com/photo-1505873242700-f289a29e1e0f?auto=format&fit=crop&w=400&q=80",
    host: {
      name: "Sarah Williams",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b7bd?auto=format&fit=crop&w=100&q=80",
      responseTime: "within an hour",
      superhost: true
    }
  },
  dates: {
    checkIn: new Date(2025, 6, 20),
    checkOut: new Date(2025, 6, 25),
    nights: 5
  },
  guests: 4,
  pricing: {
    basePrice: 2500,
    subtotal: 12500,
    cleaningFee: 500,
    serviceFee: 1560,
    taxes: 2190,
    total: 16750
  }
};

// Helper functions
const formatCurrency = (amount: number) => new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  minimumFractionDigits: 0,
}).format(amount);

const formatDate = (date: Date) => date.toLocaleDateString('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric'
});

// Sub-components for better structure
const ProgressHeader = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { number: 1, title: 'Your Details', icon: User },
    { number: 2, title: 'Review Booking', icon: Calendar },
    { number: 3, title: 'Payment', icon: CreditCard }
  ];

  return (
    <Card className="shadow-lg border-0">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Complete Your Booking</h1>
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            Step {currentStep} of 3
          </Badge>
        </div>
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep >= step.number;
            const isComplete = currentStep > step.number;
            return (
              <React.Fragment key={step.number}>
                <div className="flex items-center">
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                    isComplete ? "bg-green-500 border-green-500 text-white" :
                    isActive ? "bg-blue-500 border-blue-500 text-white" :
                    "border-gray-300 text-gray-400"
                  )}>
                    {isComplete ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className={cn("ml-3 text-sm font-medium", isActive ? "text-gray-900" : "text-gray-500")}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={cn("flex-1 h-1 rounded-full transition-all duration-300", currentStep > step.number ? "bg-green-500" : "bg-gray-200")} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

const GuestDetailsStep = ({ formData, handleInputChange, errors, handleNext }: any) => (
  <Card className="shadow-lg border-0">
    <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
      <CardTitle className="flex items-center gap-2 text-xl">
        <User className="h-6 w-6 text-blue-600" />
        Guest Information
      </CardTitle>
    </CardHeader>
    <CardContent className="p-8 space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700 mb-2 block">First Name *</Label>
          <Input id="firstName" value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} className={cn("h-12 text-lg border-2 rounded-xl", errors.firstName ? "border-red-500" : "border-gray-200 focus:border-blue-500")} placeholder="Enter your first name" />
          {errors.firstName && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle className="h-4 w-4" />{errors.firstName}</p>}
        </div>
        <div>
          <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700 mb-2 block">Last Name *</Label>
          <Input id="lastName" value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} className={cn("h-12 text-lg border-2 rounded-xl", errors.lastName ? "border-red-500" : "border-gray-200 focus:border-blue-500")} placeholder="Enter your last name" />
          {errors.lastName && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle className="h-4 w-4" />{errors.lastName}</p>}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-2 block">Email Address *</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className={cn("h-12 text-lg border-2 rounded-xl pl-12", errors.email ? "border-red-500" : "border-gray-200 focus:border-blue-500")} placeholder="your.email@example.com" />
          </div>
          {errors.email && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle className="h-4 w-4" />{errors.email}</p>}
        </div>
        <div>
          <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 mb-2 block">Phone Number *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input id="phone" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} className={cn("h-12 text-lg border-2 rounded-xl pl-12", errors.phone ? "border-red-500" : "border-gray-200 focus:border-blue-500")} placeholder="+27 12 345 6789" />
          </div>
          {errors.phone && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle className="h-4 w-4" />{errors.phone}</p>}
        </div>
      </div>
      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-3 block">Purpose of Visit</Label>
        <div className="grid grid-cols-3 gap-3">
          {[{ value: 'leisure', label: 'Leisure', icon: '🏖️' }, { value: 'business', label: 'Business', icon: '💼' }, { value: 'other', label: 'Other', icon: '✨' }].map((option) => (
            <button key={option.value} type="button" onClick={() => handleInputChange('purpose', option.value)} className={cn("p-4 rounded-xl border-2 transition-all duration-200 text-center hover:scale-105", formData.purpose === option.value ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300")}>
              <div className="text-2xl mb-2">{option.icon}</div>
              <div className="font-medium">{option.label}</div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="specialRequests" className="text-sm font-semibold text-gray-700 mb-2 block">Special Requests (Optional)</Label>
        <Textarea id="specialRequests" value={formData.specialRequests} onChange={(e) => handleInputChange('specialRequests', e.target.value)} className="border-2 border-gray-200 rounded-xl focus:border-blue-500" placeholder="Any special requests or accessibility needs?" rows={3} />
      </div>
      <div className="space-y-4 pt-4 border-t border-gray-200">
        <h3 className="font-semibold text-gray-800">Required Agreements</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Checkbox id="agreeTerms" checked={formData.agreeTerms} onCheckedChange={(checked) => handleInputChange('agreeTerms', checked as boolean)} className="mt-1" />
            <Label htmlFor="agreeTerms" className="text-sm text-gray-700 leading-relaxed">I agree to the <span className="text-blue-600 underline cursor-pointer">Terms of Service</span> and <span className="text-blue-600 underline cursor-pointer">Cancellation Policy</span></Label>
          </div>
          {errors.agreeTerms && <p className="text-red-500 text-sm ml-6">{errors.agreeTerms}</p>}
          <div className="flex items-start gap-3">
            <Checkbox id="agreePrivacy" checked={formData.agreePrivacy} onCheckedChange={(checked) => handleInputChange('agreePrivacy', checked as boolean)} className="mt-1" />
            <Label htmlFor="agreePrivacy" className="text-sm text-gray-700 leading-relaxed">I agree to the <span className="text-blue-600 underline cursor-pointer">Privacy Policy</span> and consent to data processing in accordance with POPIA</Label>
          </div>
          {errors.agreePrivacy && <p className="text-red-500 text-sm ml-6">{errors.agreePrivacy}</p>}
          <div className="flex items-start gap-3">
            <Checkbox id="agreeRules" checked={formData.agreeRules} onCheckedChange={(checked) => handleInputChange('agreeRules', checked as boolean)} className="mt-1" />
            <Label htmlFor="agreeRules" className="text-sm text-gray-700 leading-relaxed">I agree to follow the <span className="text-blue-600 underline cursor-pointer">House Rules</span> and understand that violations may result in booking cancellation</Label>
          </div>
          {errors.agreeRules && <p className="text-red-500 text-sm ml-6">{errors.agreeRules}</p>}
        </div>
      </div>
      <Button onClick={handleNext} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-4 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 text-lg" size="lg">
        Continue to Review <ChevronRight className="ml-2 h-5 w-5" />
      </Button>
    </CardContent>
  </Card>
);

const ReviewBookingStep = ({ formData, setCurrentStep, handleNext }: any) => (
  <Card className="shadow-lg border-0">
    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
      <CardTitle className="flex items-center gap-2 text-xl">
        <Calendar className="h-6 w-6 text-green-600" />
        Review Your Booking
      </CardTitle>
    </CardHeader>
    <CardContent className="p-8 space-y-6">
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><User className="h-5 w-5" />Guest Information</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-600">Name:</span><p className="font-medium">{formData.firstName} {formData.lastName}</p></div>
          <div><span className="text-gray-600">Email:</span><p className="font-medium">{formData.email}</p></div>
          <div><span className="text-gray-600">Phone:</span><p className="font-medium">{formData.phone}</p></div>
          <div><span className="text-gray-600">Purpose:</span><p className="font-medium capitalize">{formData.purpose}</p></div>
        </div>
        <Button variant="ghost" onClick={() => setCurrentStep(1)} className="mt-4 text-blue-600 hover:text-blue-700">Edit Details</Button>
      </div>
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2"><Calendar className="h-5 w-5" />Booking Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between"><span className="text-blue-700">Dates:</span><span className="font-medium text-blue-900">{formatDate(mockBookingData.dates.checkIn)} - {formatDate(mockBookingData.dates.checkOut)}</span></div>
          <div className="flex justify-between"><span className="text-blue-700">Nights:</span><span className="font-medium text-blue-900">{mockBookingData.dates.nights}</span></div>
          <div className="flex justify-between"><span className="text-blue-700">Guests:</span><span className="font-medium text-blue-900">{mockBookingData.guests}</span></div>
        </div>
      </div>
      <Alert className="border-amber-200 bg-amber-50">
        <Clock className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>Check-in:</strong> 3:00 PM or later • <strong>Check-out:</strong> 11:00 AM<br />
          Please bring a valid ID for verification upon arrival.
        </AlertDescription>
      </Alert>
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1 py-3 rounded-xl border-2">Back to Details</Button>
        <Button onClick={handleNext} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300">
          Proceed to Payment <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

const PaymentStep = ({ handleSubmit, loading }: any) => (
  <Card className="shadow-lg border-0">
    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
      <CardTitle className="flex items-center gap-2 text-xl">
        <CreditCard className="h-6 w-6 text-purple-600" />
        Secure Payment
      </CardTitle>
    </CardHeader>
    <CardContent className="p-8 space-y-6">
      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
        <Shield className="h-6 w-6 text-green-600" />
        <div>
          <p className="font-semibold text-green-800">Your payment is secure</p>
          <p className="text-sm text-green-700">Protected by industry-leading encryption</p>
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-gray-800 mb-4">Choose Payment Method</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[{ name: 'PayFast', logo: '💳', desc: 'Card Payment' }, { name: 'Ozow', logo: '🏦', desc: 'Instant EFT' }, { name: 'Zapper', logo: '📱', desc: 'QR Code' }, { name: 'SnapScan', logo: '📲', desc: 'QR Code' }].map((method) => (
            <button key={method.name} className="p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 text-center">
              <div className="text-2xl mb-2">{method.logo}</div>
              <div className="font-medium text-sm">{method.name}</div>
              <div className="text-xs text-gray-600">{method.desc}</div>
            </button>
          ))}
        </div>
      </div>
      <Button onClick={handleSubmit} disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 rounded-xl shadow-xl transition-all duration-300 transform hover:scale-105 text-lg" size="lg">
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Processing Payment...
          </div>
        ) : (
          <><Lock className="mr-2 h-5 w-5" /> Pay {formatCurrency(mockBookingData.pricing.total)}</>
        )}
      </Button>
      <p className="text-xs text-gray-500 text-center">By completing this booking, you agree to our terms and conditions</p>
    </CardContent>
  </Card>
);

const SuccessStep = ({ formData }: any) => (
  <Card className="shadow-lg border-0">
    <CardContent className="p-8 text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600">Your reservation has been successfully processed</p>
      </div>
      <div className="bg-green-50 rounded-xl p-6 text-left">
        <h3 className="font-semibold text-green-800 mb-3">What's Next?</h3>
        <ul className="space-y-2 text-sm text-green-700">
          <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4" />Confirmation email sent to {formData.email}</li>
          <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4" />Host will be notified immediately</li>
          <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4" />Check-in instructions will be sent 24 hours before arrival</li>
        </ul>
      </div>
      <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500">View Booking Details</Button>
    </CardContent>
  </Card>
);

import BookingSummarySidebar from './BookingSummarySidebar';

export default function BookingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
    purpose: 'leisure',
    agreeTerms: false,
    agreePrivacy: false,
    agreeRules: false,
    emergencyContact: '',
    specialRequests: ''
  });

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the terms';
      if (!formData.agreePrivacy) newErrors.agreePrivacy = 'You must agree to the privacy policy';
      if (!formData.agreeRules) newErrors.agreeRules = 'You must agree to the house rules';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCurrentStep(4);
    }, 2000);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <GuestDetailsStep formData={formData} handleInputChange={handleInputChange} errors={errors} handleNext={handleNext} />;
      case 2:
        return <ReviewBookingStep formData={formData} setCurrentStep={setCurrentStep} handleNext={handleNext} />;
      case 3:
        return <PaymentStep handleSubmit={handleSubmit} loading={loading} />;
      case 4:
        return <SuccessStep formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <ProgressHeader currentStep={currentStep} />
          {renderStep()}
        </div>
        <BookingSummarySidebar />
      </div>
    </div>
  );
}