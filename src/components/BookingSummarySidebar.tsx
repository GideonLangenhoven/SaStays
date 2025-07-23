
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Clock, Shield, CheckCircle, MapPin,
  Star, Heart, Camera
} from 'lucide-react';

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

const BookingSummarySidebar = () => (
  <div className="lg:col-span-1">
    <div className="sticky top-6 space-y-6">
      <Card className="shadow-lg border-0 overflow-hidden">
        <div className="relative h-48">
          <img src={mockBookingData.property.image} alt={mockBookingData.property.title} className="w-full h-full object-cover" />
          <div className="absolute top-3 right-3">
            <Badge className="bg-white/90 text-gray-800"><Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />{mockBookingData.property.rating}</Badge>
          </div>
        </div>
        <CardContent className="p-6">
          <h3 className="font-bold text-lg mb-2">{mockBookingData.property.title}</h3>
          <div className="flex items-center gap-2 text-gray-600 mb-4"><MapPin className="h-4 w-4" /><span className="text-sm">{mockBookingData.property.location}</span></div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <img src={mockBookingData.property.host.avatar} alt={mockBookingData.property.host.name} className="w-10 h-10 rounded-full" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{mockBookingData.property.host.name}</span>
                {mockBookingData.property.host.superhost && <Badge variant="secondary" className="text-xs">Superhost</Badge>}
              </div>
              <p className="text-xs text-gray-600">Responds {mockBookingData.property.host.responseTime}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-lg border-0">
        <CardHeader><CardTitle className="text-lg">Price Breakdown</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between"><span>{formatCurrency(mockBookingData.pricing.basePrice)} × {mockBookingData.dates.nights} nights</span><span>{formatCurrency(mockBookingData.pricing.subtotal)}</span></div>
          <div className="flex justify-between"><span>Cleaning fee</span><span>{formatCurrency(mockBookingData.pricing.cleaningFee)}</span></div>
          <div className="flex justify-between"><span>Service fee</span><span>{formatCurrency(mockBookingData.pricing.serviceFee)}</span></div>
          <div className="flex justify-between"><span>Taxes</span><span>{formatCurrency(mockBookingData.pricing.taxes)}</span></div>
          <Separator />
          <div className="flex justify-between font-bold text-lg"><span>Total</span><span>{formatCurrency(mockBookingData.pricing.total)}</span></div>
        </CardContent>
      </Card>
      <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Heart className="h-5 w-5 text-red-500" />Why Choose Us?</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /><span>Free cancellation for 48 hours</span></div>
            <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-blue-500" /><span>Secure payment processing</span></div>
            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-purple-500" /><span>24/7 customer support</span></div>
            <div className="flex items-center gap-2"><Camera className="h-4 w-4 text-orange-500" /><span>Verified property photos</span></div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default BookingSummarySidebar;
