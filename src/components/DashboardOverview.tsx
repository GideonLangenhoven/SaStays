import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, DollarSign, Users, TrendingUp, Eye, Star, MessageSquare, Clock } from 'lucide-react';

// NOTE: The following dashboardData is mock data for development/testing only.
// Replace with API integration for production use.
const dashboardData = {
  totalEarnings: 45250.00,
  monthlyEarnings: 8750.00,
  totalBookings: 127,
  activeListings: 5,
  occupancyRate: 78,
  averageRating: 4.8,
  responseRate: 95,
  responseTime: '2 hours',
  pendingBookings: 3,
  upcomingCheckIns: 7,
  recentBookings: [
    {
      id: 1,
      propertyName: 'Ocean View Apartment',
      guestName: 'Sarah Johnson',
      checkIn: '2025-07-15',
      checkOut: '2025-07-18',
      amount: 1250.00,
      status: 'confirmed'
    },
    {
      id: 2,
      propertyName: 'Mountain Cabin',
      guestName: 'David Smith',
      checkIn: '2025-07-20',
      checkOut: '2025-07-25',
      amount: 2100.00,
      status: 'pending'
    },
    {
      id: 3,
      propertyName: 'City Center Loft',
      guestName: 'Emma Wilson',
      checkIn: '2025-07-22',
      checkOut: '2025-07-24',
      amount: 850.00,
      status: 'confirmed'
    }
  ],
  performanceMetrics: {
    views: 2840,
    inquiries: 89,
    bookings: 34,
    conversionRate: 38.2
  }
};

interface DashboardOverviewProps {
  onNavigateToEarnings?: () => void;
}

const DashboardOverview = ({ onNavigateToEarnings }: DashboardOverviewProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      confirmed: 'default',
      pending: 'secondary',
      cancelled: 'destructive'
    };
    return (
      <Badge variant={variants[status] || 'default'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your properties.
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              +{formatCurrency(dashboardData.monthlyEarnings)} from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.pendingBookings} pending approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">
              +5.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.averageRating}</div>
            <p className="text-xs text-muted-foreground">
              Based on 89 reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.performanceMetrics.views}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.performanceMetrics.inquiries}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.responseRate}% response rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.performanceMetrics.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Inquiries to bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.responseTime}</div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>
            Your latest booking activity and upcoming check-ins
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{booking.propertyName}</p>
                  <p className="text-sm text-muted-foreground">
                    Guest: {booking.guestName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right space-y-2">
                  <p className="font-semibold">{formatCurrency(booking.amount)}</p>
                  {getStatusBadge(booking.status)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" className="w-full">
              View All Bookings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks to manage your properties
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button className="h-20 flex-col space-y-2">
              <CalendarDays className="h-6 w-6" />
              <span>Manage Calendar</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Users className="h-6 w-6" />
              <span>Guest Messages</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Star className="h-6 w-6" />
              <span>Reviews</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={onNavigateToEarnings}
            >
              <DollarSign className="h-6 w-6" />
              <span>Earnings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview; 