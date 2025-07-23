import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CalendarDays, 
  CreditCard, 
  Download, 
  Eye, 
  Users, 
  Percent, 
  Clock, 
  Star, 
  Calendar, 
  Home, 
  Activity, 
  Filter, 
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Target,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUpIcon,
  MapPin,
  MessageSquare,
  Settings,
  FileText,
  Calculator,
  Globe,
  Smartphone
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear, differenceInDays } from 'date-fns';
import { toast } from 'sonner';

// Enhanced mock analytics data
const analyticsData = {
  // Core metrics
  totalEarnings: 45250.00,
  monthlyEarnings: 8750.00,
  weeklyEarnings: 2180.00,
  todayEarnings: 340.00,
  pendingPayouts: 2450.00,
  nextPayoutDate: '2025-07-20',
  
  // Advanced metrics
  totalBookings: 145,
  totalGuests: 289,
  averageBookingValue: 312.07,
  averageStayDuration: 3.2,
  occupancyRate: 78.5,
  repeatGuestRate: 24.3,
  cancellationRate: 8.2,
  averageRating: 4.7,
  responseTime: 45, // minutes
  conversionRate: 12.8, // inquiry to booking
  netPromoterScore: 68,
  revenuePerAvailableRoom: 245.30,
  
  // Comprehensive time series data
  monthlyTrend: [
    { 
      month: 'Jan', 
      earnings: 3200, 
      bookings: 8, 
      occupancy: 65, 
      avgRating: 4.5, 
      guests: 16, 
      revenue: 3200, 
      expenses: 800,
      profit: 2400,
      inquiries: 45,
      conversions: 8
    },
    { 
      month: 'Feb', 
      earnings: 4100, 
      bookings: 12, 
      occupancy: 72, 
      avgRating: 4.6, 
      guests: 24, 
      revenue: 4100, 
      expenses: 950,
      profit: 3150,
      inquiries: 58,
      conversions: 12
    },
    { 
      month: 'Mar', 
      earnings: 5200, 
      bookings: 15, 
      occupancy: 78, 
      avgRating: 4.7, 
      guests: 32, 
      revenue: 5200, 
      expenses: 1100,
      profit: 4100,
      inquiries: 68,
      conversions: 15
    },
    { 
      month: 'Apr', 
      earnings: 6800, 
      bookings: 18, 
      occupancy: 82, 
      avgRating: 4.8, 
      guests: 38, 
      revenue: 6800, 
      expenses: 1350,
      profit: 5450,
      inquiries: 75,
      conversions: 18
    },
    { 
      month: 'May', 
      earnings: 7900, 
      bookings: 22, 
      occupancy: 85, 
      avgRating: 4.7, 
      guests: 45, 
      revenue: 7900, 
      expenses: 1580,
      profit: 6320,
      inquiries: 82,
      conversions: 22
    },
    { 
      month: 'Jun', 
      earnings: 8750, 
      bookings: 25, 
      occupancy: 88, 
      avgRating: 4.8, 
      guests: 52, 
      revenue: 8750, 
      expenses: 1750,
      profit: 7000,
      inquiries: 95,
      conversions: 25
    },
    { 
      month: 'Jul', 
      earnings: 9100, 
      bookings: 24, 
      occupancy: 83, 
      avgRating: 4.6, 
      guests: 48, 
      revenue: 9100, 
      expenses: 1820,
      profit: 7280,
      inquiries: 88,
      conversions: 24
    }
  ],
  
  // Enhanced property performance data
  propertyPerformance: [
    { 
      name: 'Ocean View Apartment', 
      earnings: 18750, 
      bookings: 45, 
      occupancy: 85, 
      avgRating: 4.8, 
      revenue: 18750, 
      expenses: 3750, 
      profit: 15000,
      avgDailyRate: 425,
      totalDays: 275,
      guestReviews: 42,
      repeatGuests: 12,
      cancellations: 3,
      inquiries: 156,
      conversions: 45,
      responseTime: 32
    },
    { 
      name: 'Mountain Cabin', 
      earnings: 12400, 
      bookings: 28, 
      occupancy: 72, 
      avgRating: 4.6, 
      revenue: 12400, 
      expenses: 2480, 
      profit: 9920,
      avgDailyRate: 315,
      totalDays: 184,
      guestReviews: 26,
      repeatGuests: 8,
      cancellations: 2,
      inquiries: 98,
      conversions: 28,
      responseTime: 45
    },
    { 
      name: 'City Center Loft', 
      earnings: 8900, 
      bookings: 32, 
      occupancy: 68, 
      avgRating: 4.5, 
      revenue: 8900, 
      expenses: 1780, 
      profit: 7120,
      avgDailyRate: 285,
      totalDays: 142,
      guestReviews: 28,
      repeatGuests: 6,
      cancellations: 4,
      inquiries: 112,
      conversions: 32,
      responseTime: 58
    },
    { 
      name: 'Beachfront Villa', 
      earnings: 5200, 
      bookings: 15, 
      occupancy: 55, 
      avgRating: 4.3, 
      revenue: 5200, 
      expenses: 1040, 
      profit: 4160,
      avgDailyRate: 520,
      totalDays: 95,
      guestReviews: 13,
      repeatGuests: 2,
      cancellations: 2,
      inquiries: 78,
      conversions: 15,
      responseTime: 72
    }
  ],
  
  revenueBreakdown: [
    { name: 'Accommodation', value: 38000, color: '#1E88E5' },
    { name: 'Cleaning Fees', value: 4200, color: '#43A047' },
    { name: 'Extra Guest Fees', value: 1800, color: '#FB8C00' },
    { name: 'Pet Fees', value: 1250, color: '#8E24AA' }
  ],
  
  // Guest satisfaction and review analytics
  guestSatisfaction: {
    overallRating: 4.7,
    reviewCount: 289,
    ratingDistribution: [
      { stars: 5, count: 178, percentage: 61.6 },
      { stars: 4, count: 87, percentage: 30.1 },
      { stars: 3, count: 18, percentage: 6.2 },
      { stars: 2, count: 4, percentage: 1.4 },
      { stars: 1, count: 2, percentage: 0.7 }
    ],
    categoryRatings: [
      { category: 'Cleanliness', rating: 4.8, reviews: 275 },
      { category: 'Communication', rating: 4.7, reviews: 268 },
      { category: 'Check-in', rating: 4.6, reviews: 271 },
      { category: 'Accuracy', rating: 4.5, reviews: 265 },
      { category: 'Location', rating: 4.9, reviews: 280 },
      { category: 'Value', rating: 4.4, reviews: 258 }
    ],
    recentReviews: [
      {
        id: 1,
        guest: 'Sarah M.',
        property: 'Ocean View Apartment',
        rating: 5,
        comment: 'Absolutely stunning views and immaculate cleanliness. Host was very responsive.',
        date: '2025-07-20',
        helpful: 12
      },
      {
        id: 2,
        guest: 'David L.',
        property: 'Mountain Cabin',
        rating: 4,
        comment: 'Great location for hiking. Cabin was cozy but could use better WiFi.',
        date: '2025-07-18',
        helpful: 8
      },
      {
        id: 3,
        guest: 'Emma W.',
        property: 'City Center Loft',
        rating: 5,
        comment: 'Perfect for business trip. Walking distance to everything.',
        date: '2025-07-15',
        helpful: 15
      }
    ]
  },
  
  // Market insights and competitive analysis
  marketInsights: {
    localOccupancyRate: 72.3,
    averageMarketRate: 298,
    yourPremium: 15.2, // percentage above market
    seasonalTrends: [
      { month: 'Jan', market: 58, yours: 65 },
      { month: 'Feb', market: 62, yours: 72 },
      { month: 'Mar', market: 68, yours: 78 },
      { month: 'Apr', market: 75, yours: 82 },
      { month: 'May', market: 82, yours: 85 },
      { month: 'Jun', market: 88, yours: 88 },
      { month: 'Jul', market: 85, yours: 83 },
      { month: 'Aug', market: 89, yours: 91 },
      { month: 'Sep', market: 76, yours: 79 },
      { month: 'Oct', market: 71, yours: 74 },
      { month: 'Nov', market: 63, yours: 68 },
      { month: 'Dec', market: 69, yours: 75 }
    ],
    competitorPricing: [
      { category: 'Similar Properties', avgRate: 285, count: 24 },
      { category: 'Premium Properties', avgRate: 420, count: 12 },
      { category: 'Budget Properties', avgRate: 180, count: 38 }
    ]
  },
  
  // Revenue optimization insights
  revenueOptimization: {
    pricingRecommendations: [
      {
        property: 'Ocean View Apartment',
        currentRate: 425,
        recommendedRate: 465,
        potentialIncrease: 9.4,
        confidence: 85,
        reason: 'High demand and excellent reviews support premium pricing'
      },
      {
        property: 'Mountain Cabin',
        currentRate: 315,
        recommendedRate: 295,
        potentialIncrease: -6.3,
        confidence: 72,
        reason: 'Market saturation suggests slight rate reduction for better occupancy'
      }
    ],
    occupancyOptimization: [
      {
        property: 'Beachfront Villa',
        currentOccupancy: 55,
        targetOccupancy: 75,
        suggestedActions: ['Reduce rate by 8%', 'Improve photos', 'Add amenities']
      }
    ]
  },
  
  // Guest behavior analytics
  guestAnalytics: {
    demographics: [
      { segment: 'Business Travelers', percentage: 35, avgStay: 2.1, avgSpend: 380 },
      { segment: 'Leisure Couples', percentage: 28, avgStay: 4.2, avgSpend: 620 },
      { segment: 'Families', percentage: 22, avgStay: 5.8, avgSpend: 890 },
      { segment: 'Group Travelers', percentage: 15, avgStay: 3.5, avgSpend: 1240 }
    ],
    bookingPatterns: [
      { period: 'Same Day', bookings: 8, percentage: 5.5 },
      { period: '1-7 Days', bookings: 23, percentage: 15.9 },
      { period: '1-4 Weeks', bookings: 67, percentage: 46.2 },
      { period: '1-3 Months', bookings: 38, percentage: 26.2 },
      { period: '3+ Months', bookings: 9, percentage: 6.2 }
    ],
    topSourceMarkets: [
      { market: 'Cape Town', bookings: 45, revenue: 18750 },
      { market: 'Johannesburg', bookings: 38, revenue: 15640 },
      { market: 'Durban', bookings: 24, revenue: 9840 },
      { market: 'International', bookings: 38, revenue: 20120 }
    ]
  }
};

interface ComprehensiveAnalyticsDashboardProps {
  ownerId: string;
}

const ComprehensiveAnalyticsDashboard: React.FC<ComprehensiveAnalyticsDashboardProps> = ({ ownerId }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({ 
    from: startOfMonth(new Date()), 
    to: endOfMonth(new Date()) 
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod, dateRange]);
  
  const loadAnalyticsData = async () => {
    setLoading(true);
    // In real implementation, this would fetch from API
    setTimeout(() => setLoading(false), 1000);
  };
  
  const refreshData = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
    toast.success('Analytics data refreshed');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const getPercentageChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change > 0
    };
  };
  
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  
  const getPerformanceColor = (value: number, benchmarks: { good: number; excellent: number }) => {
    if (value >= benchmarks.excellent) return 'text-green-600';
    if (value >= benchmarks.good) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getProgressColor = (value: number, benchmarks: { good: number; excellent: number }) => {
    if (value >= benchmarks.excellent) return 'bg-green-500';
    if (value >= benchmarks.good) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const monthlyChange = getPercentageChange(analyticsData.monthlyEarnings, 7900);
  const occupancyBenchmarks = { good: 70, excellent: 85 };
  const ratingBenchmarks = { good: 4.5, excellent: 4.7 };
  const responseBenchmarks = { good: 60, excellent: 30 }; // minutes

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comprehensive Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Advanced insights into revenue, performance, guest satisfaction, and market trends
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-48"
            />
          </div>
          
          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              <SelectItem value="ocean-view">Ocean View Apartment</SelectItem>
              <SelectItem value="mountain-cabin">Mountain Cabin</SelectItem>
              <SelectItem value="city-loft">City Center Loft</SelectItem>
              <SelectItem value="beachfront">Beachfront Villa</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={refreshData} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Enhanced Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analyticsData.totalEarnings)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {monthlyChange.isPositive ? (
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              )}
              <span className={monthlyChange.isPositive ? 'text-green-500' : 'text-red-500'}>
                {monthlyChange.value}%
              </span>
              <span className="ml-1">from last month</span>
            </div>
            <Progress value={75} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(analyticsData.occupancyRate, occupancyBenchmarks)}`}>
              {formatPercentage(analyticsData.occupancyRate)}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
              <span>vs {formatPercentage(analyticsData.marketInsights.localOccupancyRate)} market</span>
              <Progress 
                value={analyticsData.occupancyRate} 
                className="w-16 h-2" 
                // indicatorClassName={getProgressColor(analyticsData.occupancyRate, occupancyBenchmarks)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Guest Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(analyticsData.averageRating, ratingBenchmarks)}`}>
              {analyticsData.averageRating}/5.0
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
              <span>{analyticsData.guestSatisfaction.reviewCount} reviews</span>
              <div className="flex">
                {[1,2,3,4,5].map(star => (
                  <Star 
                    key={star} 
                    className={`h-3 w-3 ${star <= Math.round(analyticsData.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(responseBenchmarks.excellent / analyticsData.responseTime, { good: 0.5, excellent: 1 })}`}>
              {analyticsData.responseTime}m
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-2">
              <Target className="mr-1 h-3 w-3" />
              <span>Target: &lt;30m</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Advanced Analytics Section */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{analyticsData.totalBookings}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{formatPercentage(analyticsData.conversionRate)}</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Repeat Guests</p>
                <p className="text-2xl font-bold">{formatPercentage(analyticsData.repeatGuestRate)}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue Per Room</p>
                <p className="text-2xl font-bold">{formatCurrency(analyticsData.revenuePerAvailableRoom)}</p>
              </div>
              <Home className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Comprehensive Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="guests">Guests</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        {/* Enhanced Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Profit Trend</CardTitle>
                <CardDescription>
                  Monthly revenue, expenses, and net profit analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="#1E88E5" fill="#1E88E5" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="expenses" stackId="2" stroke="#F44336" fill="#F44336" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="profit" stackId="3" stroke="#4CAF50" fill="#4CAF50" fillOpacity={0.8} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Occupancy vs Market</CardTitle>
                <CardDescription>
                  Your occupancy performance compared to local market
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.marketInsights.seasonalTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value: number) => `${value}%`} />
                    <Line type="monotone" dataKey="yours" stroke="#1E88E5" strokeWidth={3} name="Your Properties" />
                    <Line type="monotone" dataKey="market" stroke="#9E9E9E" strokeWidth={2} strokeDasharray="5 5" name="Market Average" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel Analysis</CardTitle>
              <CardDescription>
                Track inquiries through to confirmed bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="inquiries" fill="#E3F2FD" name="Inquiries" />
                  <Bar dataKey="conversions" fill="#1E88E5" name="Bookings" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Revenue Analysis Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>
                  Income sources and fee distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={analyticsData.revenueBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }: { name: string; value: number }) => `${name}: ${formatCurrency(value)}`}
                    >
                      {analyticsData.revenueBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Revenue Summary</CardTitle>
                <CardDescription>
                  Detailed breakdown of income sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.revenueBreakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(item.value)}</p>
                        <p className="text-xs text-muted-foreground">
                          {((item.value / analyticsData.totalEarnings) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Enhanced Properties Tab */}
        <TabsContent value="properties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Property Performance Matrix</CardTitle>
              <CardDescription>
                Comprehensive analysis of all property metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart>
                  <CartesianGrid />
                  <XAxis type="number" dataKey="occupancy" domain={[40, 100]} name="Occupancy %" />
                  <YAxis type="number" dataKey="avgRating" domain={[4.0, 5.0]} name="Rating" />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value, name) => [value, name === 'occupancy' ? 'Occupancy %' : 'Rating']}
                    labelFormatter={(label) => `Property: ${label}`}
                  />
                  <Scatter 
                    name="Properties" 
                    data={analyticsData.propertyPerformance} 
                    fill="#1E88E5"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            {analyticsData.propertyPerformance.map((property, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{property.name}</CardTitle>
                    <Badge variant="outline">
                      {property.avgRating} ⭐
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-2xl font-bold">{formatCurrency(property.earnings)}</p>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{formatCurrency(property.profit)}</p>
                      <p className="text-sm text-muted-foreground">Net Profit</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Occupancy Rate</span>
                      <span className={getPerformanceColor(property.occupancy, occupancyBenchmarks)}>
                        {property.occupancy}%
                      </span>
                    </div>
                    <Progress value={property.occupancy} className="h-2" />
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-medium">{property.bookings}</p>
                        <p className="text-muted-foreground">Bookings</p>
                      </div>
                      <div>
                        <p className="font-medium">{property.responseTime}m</p>
                        <p className="text-muted-foreground">Response</p>
                      </div>
                      <div>
                        <p className="font-medium">{formatPercentage((property.conversions / property.inquiries) * 100)}</p>
                        <p className="text-muted-foreground">Conversion</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Guest Analytics Tab */}
        <TabsContent value="guests" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Guest Demographics</CardTitle>
                <CardDescription>
                  Understanding your guest segments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.guestAnalytics.demographics.map((segment, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{segment.segment}</span>
                        <span className="text-sm text-muted-foreground">{segment.percentage}%</span>
                      </div>
                      <Progress value={segment.percentage} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Avg Stay: {segment.avgStay} days</span>
                        <span>Avg Spend: {formatCurrency(segment.avgSpend)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Booking Lead Time</CardTitle>
                <CardDescription>
                  How far in advance guests book
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analyticsData.guestAnalytics.bookingPatterns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#1E88E5" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Top Source Markets</CardTitle>
              <CardDescription>
                Geographic distribution of your guests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.guestAnalytics.topSourceMarkets.map((market, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{market.market}</p>
                        <p className="text-sm text-muted-foreground">{market.bookings} bookings</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(market.revenue)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(market.revenue / market.bookings)} avg
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Reviews & Satisfaction Tab */}
        <TabsContent value="reviews" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
                <CardDescription>
                  Breakdown of guest ratings received
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.guestSatisfaction.ratingDistribution.map((rating) => (
                    <div key={rating.stars} className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 w-16">
                        <span className="text-sm font-medium">{rating.stars}</span>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      </div>
                      <Progress value={rating.percentage} className="flex-1 h-2" />
                      <span className="text-sm text-muted-foreground w-12">
                        {rating.count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Category Ratings</CardTitle>
                <CardDescription>
                  Performance across different aspects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={analyticsData.guestSatisfaction.categoryRatings}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis domain={[4.0, 5.0]} />
                    <Radar
                      name="Rating"
                      dataKey="rating"
                      stroke="#1E88E5"
                      fill="#1E88E5"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
              <CardDescription>
                Latest guest feedback and ratings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.guestSatisfaction.recentReviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{review.guest}</span>
                        <Badge variant="outline">{review.property}</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {[1,2,3,4,5].map(star => (
                            <Star 
                              key={star} 
                              className={`h-4 w-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">{review.date}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {review.helpful} found this helpful
                      </span>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Reply
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Market Analysis Tab */}
        <TabsContent value="market" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Market Position</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">+{analyticsData.marketInsights.yourPremium}%</div>
                  <p className="text-sm text-muted-foreground">Premium over market rate</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Local Occupancy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold">{analyticsData.marketInsights.localOccupancyRate}%</div>
                  <p className="text-sm text-muted-foreground">Market average</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Average Market Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold">{formatCurrency(analyticsData.marketInsights.averageMarketRate)}</div>
                  <p className="text-sm text-muted-foreground">Per night</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Competitive Pricing Analysis</CardTitle>
              <CardDescription>
                How your rates compare to similar properties
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.marketInsights.competitorPricing.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{category.category}</p>
                      <p className="text-sm text-muted-foreground">{category.count} properties</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(category.avgRate)}</p>
                      <p className="text-sm text-muted-foreground">avg rate</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Revenue Optimization Tab */}
        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Recommendations</CardTitle>
              <CardDescription>
                AI-powered suggestions to optimize your revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.revenueOptimization.pricingRecommendations.map((rec, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{rec.property}</h4>
                      <Badge variant={rec.potentialIncrease > 0 ? 'default' : 'secondary'}>
                        {rec.potentialIncrease > 0 ? '+' : ''}{rec.potentialIncrease.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Current Rate</p>
                        <p className="font-semibold">{formatCurrency(rec.currentRate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Recommended Rate</p>
                        <p className="font-semibold">{formatCurrency(rec.recommendedRate)}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{rec.reason}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Confidence: {rec.confidence}%</span>
                      <Button size="sm">
                        Apply Suggestion
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Occupancy Optimization</CardTitle>
              <CardDescription>
                Strategies to improve underperforming properties
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.revenueOptimization.occupancyOptimization.map((opt, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{opt.property}</h4>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Current: {opt.currentOccupancy}%</p>
                        <p className="text-sm font-medium">Target: {opt.targetOccupancy}%</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Suggested Actions:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {opt.suggestedActions.map((action, actionIndex) => (
                          <li key={actionIndex} className="text-sm">{action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComprehensiveAnalyticsDashboard;