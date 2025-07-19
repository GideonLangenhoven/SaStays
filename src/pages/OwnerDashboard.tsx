import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  DollarSign, 
  Calendar, 
  MessageSquare, 
  Settings, 
  Plus,
  TrendingUp,
  Users,
  Star,
  Eye
} from 'lucide-react';
import DashboardOverview from '@/components/DashboardOverview';
import EarningsAnalytics from '@/components/EarningsAnalytics';

export default function OwnerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Owner Dashboard</h1>
              <p className="text-sm text-gray-500">Manage your properties and track performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Property
              </Button>
              <Button size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-6">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="earnings" className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline">Earnings</span>
              </TabsTrigger>
              <TabsTrigger value="bookings" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Bookings</span>
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Messages</span>
              </TabsTrigger>
              <TabsTrigger value="properties" className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Properties</span>
              </TabsTrigger>
              <TabsTrigger value="guests" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Guests</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="overview" className="space-y-6">
            <DashboardOverview onNavigateToEarnings={() => setActiveTab('earnings')} />
          </TabsContent>

          <TabsContent value="earnings" className="space-y-6">
            <EarningsAnalytics />
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bookings Management</CardTitle>
                <CardDescription>
                  View and manage all your property bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Bookings Management</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This feature is coming soon. You'll be able to manage all your bookings here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Guest Messages</CardTitle>
                <CardDescription>
                  Communicate with your guests and manage inquiries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Messaging System</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This feature is coming soon. You'll be able to message guests here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="properties" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Management</CardTitle>
                <CardDescription>
                  Manage your property listings and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Eye className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Property Management</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This feature is coming soon. You'll be able to manage properties here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Guest Management</CardTitle>
                <CardDescription>
                  View guest profiles and booking history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Guest Management</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This feature is coming soon. You'll be able to manage guests here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}