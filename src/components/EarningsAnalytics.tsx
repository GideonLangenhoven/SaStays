import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, CalendarDays, CreditCard, Download, Eye } from 'lucide-react';

// Mock earnings data
const earningsData = {
  totalEarnings: 45250.00,
  monthlyEarnings: 8750.00,
  weeklyEarnings: 2180.00,
  todayEarnings: 340.00,
  pendingPayouts: 2450.00,
  nextPayoutDate: '2025-07-20',
  
  monthlyTrend: [
    { month: 'Jan', earnings: 3200, bookings: 8 },
    { month: 'Feb', earnings: 4100, bookings: 12 },
    { month: 'Mar', earnings: 5200, bookings: 15 },
    { month: 'Apr', earnings: 6800, bookings: 18 },
    { month: 'May', earnings: 7900, bookings: 22 },
    { month: 'Jun', earnings: 8750, bookings: 25 },
    { month: 'Jul', earnings: 9100, bookings: 24 }
  ],
  
  propertyPerformance: [
    { name: 'Ocean View Apartment', earnings: 18750, bookings: 45, occupancy: 85 },
    { name: 'Mountain Cabin', earnings: 12400, bookings: 28, occupancy: 72 },
    { name: 'City Center Loft', earnings: 8900, bookings: 32, occupancy: 68 },
    { name: 'Beachfront Villa', earnings: 5200, bookings: 15, occupancy: 55 }
  ],
  
  revenueBreakdown: [
    { name: 'Accommodation', value: 38000, color: '#1E88E5' },
    { name: 'Cleaning Fees', value: 4200, color: '#43A047' },
    { name: 'Extra Guest Fees', value: 1800, color: '#FB8C00' },
    { name: 'Pet Fees', value: 1250, color: '#8E24AA' }
  ],
  
  transactions: [
    {
      id: 1,
      date: '2025-07-12',
      property: 'Ocean View Apartment',
      guest: 'Sarah Johnson',
      amount: 1250.00,
      type: 'booking',
      status: 'completed',
      paymentMethod: 'PayFast'
    },
    {
      id: 2,
      date: '2025-07-11',
      property: 'Mountain Cabin',
      guest: 'David Smith',
      amount: 850.00,
      type: 'booking',
      status: 'pending',
      paymentMethod: 'Ozow'
    },
    {
      id: 3,
      date: '2025-07-10',
      property: 'City Center Loft',
      guest: 'Emma Wilson',
      amount: 680.00,
      type: 'booking',
      status: 'completed',
      paymentMethod: 'Zapper'
    },
    {
      id: 4,
      date: '2025-07-09',
      property: 'Ocean View Apartment',
      guest: 'Michael Brown',
      amount: 75.00,
      type: 'cleaning_fee',
      status: 'completed',
      paymentMethod: 'PayFast'
    }
  ]
};

const EarningsAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');

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

  const monthlyChange = getPercentageChange(8750, 7900);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      completed: 'default',
      pending: 'secondary',
      failed: 'destructive'
    };
    return (
      <Badge variant={variants[status] || 'default'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Earnings & Analytics</h1>
          <p className="text-muted-foreground">
            Track your revenue, bookings, and property performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(earningsData.totalEarnings)}</div>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(earningsData.monthlyEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(earningsData.weeklyEarnings)} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(earningsData.pendingPayouts)}</div>
            <p className="text-xs text-muted-foreground">
              Next payout: {new Date(earningsData.nextPayoutDate).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(earningsData.todayEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              2 new bookings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Earnings Trend</CardTitle>
              <CardDescription>
                Monthly earnings and booking volume over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={earningsData.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'earnings' ? formatCurrency(value) : value,
                      name === 'earnings' ? 'Earnings' : 'Bookings'
                    ]}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="earnings" 
                    stroke="#1E88E5" 
                    strokeWidth={2}
                    dot={{ fill: '#1E88E5', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="bookings" 
                    stroke="#43A047" 
                    strokeWidth={2}
                    dot={{ fill: '#43A047', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Properties Tab */}
        <TabsContent value="properties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Property Performance</CardTitle>
              <CardDescription>
                Earnings and occupancy by property
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={earningsData.propertyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number, name: string) => [
                    name === 'earnings' ? formatCurrency(value) : 
                    name === 'occupancy' ? `${value}%` : value,
                    name === 'earnings' ? 'Earnings' : 
                    name === 'occupancy' ? 'Occupancy' : 'Bookings'
                  ]} />
                  <Bar dataKey="earnings" fill="#1E88E5" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {earningsData.propertyPerformance.map((property, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{property.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(property.earnings)}</div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>{property.bookings} bookings</span>
                    <span>{property.occupancy}% occupied</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                All payment transactions and booking fees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {earningsData.transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{transaction.property}</p>
                        <Badge variant="outline">{transaction.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {transaction.guest} • {new Date(transaction.date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        via {transaction.paymentMethod}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-semibold">{formatCurrency(transaction.amount)}</p>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Breakdown Tab */}
        <TabsContent value="breakdown" className="space-y-4">
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
                      data={earningsData.revenueBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }: { name: string; value: number }) => `${name}: ${formatCurrency(value)}`}
                    >
                      {earningsData.revenueBreakdown.map((entry, index) => (
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
                  {earningsData.revenueBreakdown.map((item, index) => (
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
                          {((item.value / earningsData.totalEarnings) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EarningsAnalytics; 