import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Users, 
  Star,
  Eye,
  MessageSquare,
  Clock,
  Target,
  MapPin,
  Percent,
  Download,
  Filter
} from 'lucide-react';

interface AnalyticsData {
  revenue: { month: string; amount: number; bookings: number }[];
  occupancy: { month: string; rate: number; available: number; booked: number }[];
  demographics: { age: string; percentage: number; color: string }[];
  sources: { platform: string; bookings: number; revenue: number; color: string }[];
  performance: {
    totalRevenue: number;
    totalBookings: number;
    averageRating: number;
    occupancyRate: number;
    averageNightlyRate: number;
    totalViews: number;
    conversionRate: number;
    repeatGuests: number;
  };
  trends: {
    revenue: number;
    bookings: number;
    rating: number;
    occupancy: number;
  };
  topRegions: { region: string; bookings: number; percentage: number }[];
  seasonalData: { season: string; revenue: number; bookings: number; avgRate: number }[];
}

const mockData: AnalyticsData = {
  revenue: [
    { month: 'Jan', amount: 12500, bookings: 8 },
    { month: 'Feb', amount: 15200, bookings: 10 },
    { month: 'Mar', amount: 18900, bookings: 12 },
    { month: 'Apr', amount: 22100, bookings: 14 },
    { month: 'May', amount: 19800, bookings: 13 },
    { month: 'Jun', amount: 25400, bookings: 16 },
    { month: 'Jul', amount: 28700, bookings: 18 },
    { month: 'Aug', amount: 31200, bookings: 20 },
    { month: 'Sep', amount: 24600, bookings: 15 },
    { month: 'Oct', amount: 21800, bookings: 14 },
    { month: 'Nov', amount: 18500, bookings: 12 },
    { month: 'Dec', amount: 16900, bookings: 11 }
  ],
  occupancy: [
    { month: 'Jan', rate: 65, available: 31, booked: 20 },
    { month: 'Feb', rate: 71, available: 28, booked: 20 },
    { month: 'Mar', rate: 77, available: 31, booked: 24 },
    { month: 'Apr', rate: 83, available: 30, booked: 25 },
    { month: 'May', rate: 74, available: 31, booked: 23 },
    { month: 'Jun', rate: 87, available: 30, booked: 26 },
    { month: 'Jul', rate: 94, available: 31, booked: 29 },
    { month: 'Aug', rate: 97, available: 31, booked: 30 },
    { month: 'Sep', rate: 80, available: 30, booked: 24 },
    { month: 'Oct', rate: 71, available: 31, booked: 22 },
    { month: 'Nov', rate: 67, available: 30, booked: 20 },
    { month: 'Dec', rate: 58, available: 31, booked: 18 }
  ],
  demographics: [
    { age: '18-25', percentage: 15, color: '#FF6B6B' },
    { age: '26-35', percentage: 35, color: '#4ECDC4' },
    { age: '36-45', percentage: 28, color: '#45B7D1' },
    { age: '46-55', percentage: 15, color: '#96CEB4' },
    { age: '55+', percentage: 7, color: '#FFEAA7' }
  ],
  sources: [
    { platform: 'Direct Booking', bookings: 45, revenue: 89000, color: '#4ECDC4' },
    { platform: 'Google Search', bookings: 32, revenue: 64000, color: '#45B7D1' },
    { platform: 'Social Media', bookings: 18, revenue: 36000, color: '#96CEB4' },
    { platform: 'Referrals', bookings: 12, revenue: 24000, color: '#FFEAA7' },
    { platform: 'Other', bookings: 8, revenue: 16000, color: '#DDA0DD' }
  ],
  performance: {
    totalRevenue: 235600,
    totalBookings: 163,
    averageRating: 4.7,
    occupancyRate: 76,
    averageNightlyRate: 1450,
    totalViews: 2840,
    conversionRate: 5.7,
    repeatGuests: 23
  },
  trends: {
    revenue: 12.5,
    bookings: 8.3,
    rating: 0.2,
    occupancy: -3.1
  },
  topRegions: [
    { region: 'Cape Town', bookings: 45, percentage: 28 },
    { region: 'Johannesburg', bookings: 38, percentage: 23 },
    { region: 'Durban', bookings: 22, percentage: 13 },
    { region: 'Pretoria', bookings: 18, percentage: 11 },
    { region: 'Port Elizabeth', bookings: 15, percentage: 9 },
    { region: 'Other', bookings: 25, percentage: 16 }
  ],
  seasonalData: [
    { season: 'Spring', revenue: 58400, bookings: 38, avgRate: 1537 },
    { season: 'Summer', revenue: 85300, bookings: 54, avgRate: 1580 },
    { season: 'Autumn', revenue: 64900, bookings: 42, avgRate: 1545 },
    { season: 'Winter', revenue: 27000, bookings: 29, avgRate: 931 }
  ]
};

export default function EnhancedAnalytics() {
  const [timeRange, setTimeRange] = useState('12m');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const MetricCard = ({ title, value, trend, icon: Icon, format = 'number' }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">
              {format === 'currency' ? formatCurrency(value) :
               format === 'percentage' ? `${value}%` :
               format === 'rating' ? `${value}/5` : value.toLocaleString()}
            </p>
          </div>
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
        <div className="flex items-center mt-4">
          {trend !== undefined && (
            <>
              {trend > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatPercentage(trend)}
              </span>
              <span className="text-sm text-gray-500 ml-1">from last period</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Advanced Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into your property performance</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="12m">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={mockData.performance.totalRevenue}
          trend={mockData.trends.revenue}
          icon={DollarSign}
          format="currency"
        />
        <MetricCard
          title="Total Bookings"
          value={mockData.performance.totalBookings}
          trend={mockData.trends.bookings}
          icon={Calendar}
        />
        <MetricCard
          title="Occupancy Rate"
          value={mockData.performance.occupancyRate}
          trend={mockData.trends.occupancy}
          icon={Target}
          format="percentage"
        />
        <MetricCard
          title="Average Rating"
          value={mockData.performance.averageRating}
          trend={mockData.trends.rating}
          icon={Star}
          format="rating"
        />
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
          <TabsTrigger value="guests">Guest Insights</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Bookings Trend</CardTitle>
                <CardDescription>Monthly performance over the past year</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockData.revenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'amount' ? formatCurrency(value) : value,
                        name === 'amount' ? 'Revenue' : 'Bookings'
                      ]}
                    />
                    <Area yAxisId="left" type="monotone" dataKey="amount" fill="#4ECDC4" fillOpacity={0.3} />
                    <Line yAxisId="left" type="monotone" dataKey="amount" stroke="#4ECDC4" strokeWidth={3} />
                    <Line yAxisId="right" type="monotone" dataKey="bookings" stroke="#45B7D1" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Seasonal Performance</CardTitle>
                <CardDescription>Revenue and bookings by season</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockData.seasonalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="season" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [
                      name === 'revenue' ? formatCurrency(value) : value,
                      name === 'revenue' ? 'Revenue' : name === 'bookings' ? 'Bookings' : 'Avg Rate'
                    ]} />
                    <Bar dataKey="revenue" fill="#4ECDC4" />
                    <Bar dataKey="bookings" fill="#45B7D1" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Average Nightly Rate"
              value={mockData.performance.averageNightlyRate}
              trend={5.2}
              icon={DollarSign}
              format="currency"
            />
            <MetricCard
              title="Conversion Rate"
              value={mockData.performance.conversionRate}
              trend={2.1}
              icon={Percent}
              format="percentage"
            />
            <MetricCard
              title="Repeat Guests"
              value={mockData.performance.repeatGuests}
              trend={18.5}
              icon={Users}
              format="percentage"
            />
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Monthly Revenue Breakdown</CardTitle>
                <CardDescription>Detailed revenue analysis with trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={mockData.revenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `R${(value/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                    <Area type="monotone" dataKey="amount" stroke="#4ECDC4" fill="#4ECDC4" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Sources</CardTitle>
                <CardDescription>Booking platform breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockData.sources}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="revenue"
                    >
                      {mockData.sources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {mockData.sources.map((source, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: source.color }}
                        />
                        <span>{source.platform}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(source.revenue)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Peak Month</span>
                  <span className="font-medium">August (R31,200)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Lowest Month</span>
                  <span className="font-medium">January (R12,500)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Growth Rate</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    +12.5% YoY
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Revenue per Booking</span>
                  <span className="font-medium">R1,445</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Forecasting</CardTitle>
                <CardDescription>Projected revenue for next quarter</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Q1 2025 Projection</span>
                  <span className="font-medium text-green-600">R68,500</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Confidence Level</span>
                  <Badge variant="secondary">85%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Expected Bookings</span>
                  <span className="font-medium">42</span>
                </div>
                <div className="text-xs text-gray-500 mt-4">
                  Based on historical trends and market analysis
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="occupancy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Occupancy Rate Analysis</CardTitle>
              <CardDescription>Monthly occupancy trends and availability</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={mockData.occupancy}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value, name) => [
                    name === 'rate' ? `${value}%` : `${value} days`,
                    name === 'rate' ? 'Occupancy Rate' : name === 'available' ? 'Available Days' : 'Booked Days'
                  ]} />
                  <Area type="monotone" dataKey="rate" stroke="#4ECDC4" fill="#4ECDC4" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Peak Seasons</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Summer (Dec-Feb)</span>
                  <Badge className="bg-red-100 text-red-800">97% avg</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Autumn (Mar-May)</span>
                  <Badge className="bg-yellow-100 text-yellow-800">78% avg</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Winter (Jun-Aug)</span>
                  <Badge className="bg-blue-100 text-blue-800">65% avg</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Spring (Sep-Nov)</span>
                  <Badge className="bg-green-100 text-green-800">72% avg</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Booking Patterns</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average Stay Duration</span>
                  <span className="font-medium">3.2 nights</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Most Popular Day</span>
                  <span className="font-medium">Friday</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Advance Booking</span>
                  <span className="font-medium">18 days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Weekend Premium</span>
                  <span className="font-medium text-green-600">+25%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Optimization Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-gray-600 space-y-2">
                  <p>• Consider increasing rates during peak months (Jul-Aug)</p>
                  <p>• Offer discounts for longer stays to improve occupancy</p>
                  <p>• Target marketing for shoulder seasons</p>
                  <p>• Implement dynamic pricing for weekends</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="guests" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Guest Demographics</CardTitle>
                <CardDescription>Age distribution of your guests</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockData.demographics}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="percentage"
                      label={({ age, percentage }) => `${age}: ${percentage}%`}
                    >
                      {mockData.demographics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Guest Origins</CardTitle>
                <CardDescription>Top regions where guests come from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockData.topRegions.map((region, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{region.region}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{region.bookings}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${region.percentage * 4}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-8">{region.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Guest Behavior</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average Group Size</span>
                  <span className="font-medium">2.4 guests</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Business Travelers</span>
                  <span className="font-medium">23%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Family Groups</span>
                  <span className="font-medium">45%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Solo Travelers</span>
                  <span className="font-medium">18%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Communication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Avg Response Time</span>
                  <span className="font-medium">2.3 hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Messages Sent</span>
                  <span className="font-medium">847</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pre-arrival Questions</span>
                  <span className="font-medium">65%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Satisfaction Rate</span>
                  <Badge className="bg-green-100 text-green-800">94%</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reviews & Ratings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Reviews</span>
                  <span className="font-medium">142</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">5-Star Reviews</span>
                  <span className="font-medium">78%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Response Rate</span>
                  <span className="font-medium">89%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Mention Rate</span>
                  <span className="font-medium">12%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="marketing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>How guests find your property</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockData.sources}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="platform" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#4ECDC4" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Marketing Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Views</span>
                  <span className="font-medium">2,840</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Listing CTR</span>
                  <span className="font-medium">12.4%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Photo Views</span>
                  <span className="font-medium">8,920</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Search Ranking</span>
                  <Badge className="bg-green-100 text-green-800">#3 in area</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Social Shares</span>
                  <span className="font-medium">67</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>SEO Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Search Visibility</span>
                  <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Top Keywords</span>
                  <span className="font-medium">Cape Town, Sea View</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Organic Traffic</span>
                  <span className="font-medium">68%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-gray-600 space-y-2">
                  <p>• Optimize listing photos for better engagement</p>
                  <p>• Add more local keywords to description</p>
                  <p>• Encourage more guest reviews</p>
                  <p>• Consider social media marketing</p>
                  <p>• Update amenities list regularly</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}