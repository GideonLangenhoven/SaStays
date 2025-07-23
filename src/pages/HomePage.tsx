// src/pages/HomePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, MapPin, Calendar, Users } from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Discover Amazing Places to Stay
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Find the perfect accommodation for your next getaway. From cozy apartments to luxury villas.
          </p>
          <Button size="lg" asChild className="bg-white text-blue-700 hover:bg-gray-100">
            <Link to="/properties">
              Start Exploring
            </Link>
          </Button>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Find Your Perfect Stay</h2>
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Where to?"
                      className="flex-1 outline-none"
                    />
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      placeholder="Check-in"
                      className="flex-1 outline-none"
                    />
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      placeholder="Check-out"
                      className="flex-1 outline-none"
                    />
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Users className="w-5 h-5 text-gray-400" />
                    <select className="flex-1 outline-none">
                      <option>1 Guest</option>
                      <option>2 Guests</option>
                      <option>3 Guests</option>
                      <option>4+ Guests</option>
                    </select>
                  </div>
                </div>
                <Button className="w-full mt-4" size="lg">
                  <Search className="w-5 h-5 mr-2" />
                  Search Properties
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose SaStays?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
                <p className="text-gray-600">
                  Simple and secure booking process with instant confirmation
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Prime Locations</h3>
                <p className="text-gray-600">
                  Handpicked properties in the best locations across South Africa
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
                <p className="text-gray-600">
                  Round-the-clock customer support for a worry-free experience
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};