import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Star,
  Send,
  Clock,
  Users,
  MessageSquare,
  TrendingUp,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  Calendar,
  Mail,
  Smartphone,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Filter,
  Search,
  RefreshCw,
  Download
} from 'lucide-react';
import { format, formatDistanceToNow, addDays, isAfter, isBefore } from 'date-fns';
import { toast } from 'sonner';

// Types
interface ReviewRequest {
  id: string;
  bookingId: string;
  propertyName: string;
  guestName: string;
  guestEmail: string;
  checkOutDate: Date;
  scheduledSendDate: Date;
  status: 'pending' | 'sent' | 'reviewed' | 'expired' | 'cancelled';
  attempts: number;
  lastSentAt?: Date;
  reviewSubmittedAt?: Date;
  rating?: number;
  reminders: ReminderLog[];
}

interface ReminderLog {
  id: string;
  sentAt: Date;
  channel: 'email' | 'sms';
  status: 'sent' | 'failed' | 'delivered' | 'opened' | 'clicked';
  template: string;
}

interface AutomationSettings {
  enabled: boolean;
  sendDelay: number; // hours after checkout
  maxReminders: number;
  reminderInterval: number; // days between reminders
  expireAfter: number; // days until expired
  channels: {
    email: boolean;
    sms: boolean;
  };
  personalizedMessages: boolean;
  incentives: {
    enabled: boolean;
    type: 'discount' | 'voucher' | 'loyalty_points';
    value: number;
    minRating: number;
  };
  templates: {
    initial: string;
    reminder1: string;
    reminder2: string;
    thankYou: string;
  };
}

interface ReviewAnalytics {
  totalRequests: number;
  responseRate: number;
  averageRating: number;
  averageResponseTime: number; // hours
  channelPerformance: {
    email: { sent: number; opened: number; clicked: number; reviewed: number };
    sms: { sent: number; clicked: number; reviewed: number };
  };
  ratingDistribution: { rating: number; count: number; percentage: number }[];
  monthlyTrends: { month: string; requests: number; reviews: number; rating: number }[];
  propertyPerformance: { propertyId: string; name: string; responseRate: number; avgRating: number }[];
}

interface AutomatedRatingSystemProps {
  ownerId: string;
}

export const AutomatedRatingSystem: React.FC<AutomatedRatingSystemProps> = ({ ownerId }) => {
  const [reviewRequests, setReviewRequests] = useState<ReviewRequest[]>([]);
  const [settings, setSettings] = useState<AutomationSettings>({
    enabled: true,
    sendDelay: 24,
    maxReminders: 2,
    reminderInterval: 3,
    expireAfter: 14,
    channels: { email: true, sms: false },
    personalizedMessages: true,
    incentives: {
      enabled: false,
      type: 'discount',
      value: 10,
      minRating: 4
    },
    templates: {
      initial: 'Thank you for staying with us! We hope you had a wonderful experience. Please take a moment to share your feedback.',
      reminder1: 'We\'d love to hear about your recent stay! Your feedback helps us improve.',
      reminder2: 'Last chance to share your experience! We value your opinion.',
      thankYou: 'Thank you for your review! We appreciate your feedback.'
    }
  });
  const [analytics, setAnalytics] = useState<ReviewAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'sent' | 'reviewed' | 'expired'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // In a real implementation, these would be API calls
      const mockRequests: ReviewRequest[] = [
        {
          id: '1',
          bookingId: 'bk-001',
          propertyName: 'Ocean View Apartment',
          guestName: 'Sarah Johnson',
          guestEmail: 'sarah@example.com',
          checkOutDate: new Date('2025-07-20'),
          scheduledSendDate: addDays(new Date('2025-07-20'), 1),
          status: 'reviewed',
          attempts: 1,
          lastSentAt: new Date('2025-07-21'),
          reviewSubmittedAt: new Date('2025-07-22'),
          rating: 5,
          reminders: [
            {
              id: 'r1',
              sentAt: new Date('2025-07-21'),
              channel: 'email',
              status: 'opened',
              template: 'initial'
            }
          ]
        },
        {
          id: '2',
          bookingId: 'bk-002',
          propertyName: 'Mountain Cabin',
          guestName: 'David Smith',
          guestEmail: 'david@example.com',
          checkOutDate: new Date('2025-07-18'),
          scheduledSendDate: addDays(new Date('2025-07-18'), 1),
          status: 'sent',
          attempts: 2,
          lastSentAt: new Date('2025-07-22'),
          reminders: [
            {
              id: 'r2',
              sentAt: new Date('2025-07-19'),
              channel: 'email',
              status: 'opened',
              template: 'initial'
            },
            {
              id: 'r3',
              sentAt: new Date('2025-07-22'),
              channel: 'email',
              status: 'delivered',
              template: 'reminder1'
            }
          ]
        },
        {
          id: '3',
          bookingId: 'bk-003',
          propertyName: 'City Center Loft',
          guestName: 'Emma Wilson',
          guestEmail: 'emma@example.com',
          checkOutDate: new Date('2025-07-15'),
          scheduledSendDate: addDays(new Date('2025-07-15'), 1),
          status: 'expired',
          attempts: 3,
          lastSentAt: new Date('2025-07-25'),
          reminders: [
            {
              id: 'r4',
              sentAt: new Date('2025-07-16'),
              channel: 'email',
              status: 'opened',
              template: 'initial'
            },
            {
              id: 'r5',
              sentAt: new Date('2025-07-19'),
              channel: 'email',
              status: 'delivered',
              template: 'reminder1'
            },
            {
              id: 'r6',
              sentAt: new Date('2025-07-25'),
              channel: 'email',
              status: 'delivered',
              template: 'reminder2'
            }
          ]
        }
      ];

      const mockAnalytics: ReviewAnalytics = {
        totalRequests: 145,
        responseRate: 67.5,
        averageRating: 4.7,
        averageResponseTime: 28.5,
        channelPerformance: {
          email: { sent: 145, opened: 98, clicked: 87, reviewed: 78 },
          sms: { sent: 45, clicked: 32, reviewed: 25 }
        },
        ratingDistribution: [
          { rating: 5, count: 89, percentage: 61.4 },
          { rating: 4, count: 35, percentage: 24.1 },
          { rating: 3, count: 15, percentage: 10.3 },
          { rating: 2, count: 4, percentage: 2.8 },
          { rating: 1, count: 2, percentage: 1.4 }
        ],
        monthlyTrends: [
          { month: 'Jan', requests: 18, reviews: 12, rating: 4.5 },
          { month: 'Feb', requests: 22, reviews: 15, rating: 4.6 },
          { month: 'Mar', requests: 25, reviews: 18, rating: 4.7 },
          { month: 'Apr', requests: 28, reviews: 19, rating: 4.8 },
          { month: 'May', requests: 32, reviews: 22, rating: 4.7 },
          { month: 'Jun', requests: 35, reviews: 24, rating: 4.8 },
          { month: 'Jul', requests: 28, reviews: 20, rating: 4.6 }
        ],
        propertyPerformance: [
          { propertyId: '1', name: 'Ocean View Apartment', responseRate: 85.2, avgRating: 4.8 },
          { propertyId: '2', name: 'Mountain Cabin', responseRate: 72.1, avgRating: 4.6 },
          { propertyId: '3', name: 'City Center Loft', responseRate: 68.5, avgRating: 4.5 },
          { propertyId: '4', name: 'Beachfront Villa', responseRate: 55.3, avgRating: 4.3 }
        ]
      };

      setReviewRequests(mockRequests);
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error loading review automation data:', error);
      toast.error('Failed to load review automation data');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success('Data refreshed successfully');
  };

  const saveSettings = async () => {
    try {
      // In a real implementation, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowSettingsDialog(false);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const sendManualRequest = async (requestId: string) => {
    try {
      // API call to send manual review request
      toast.success('Review request sent successfully');
      await loadData();
    } catch (error) {
      toast.error('Failed to send review request');
    }
  };

  const cancelRequest = async (requestId: string) => {
    try {
      // API call to cancel review request
      toast.success('Review request cancelled');
      await loadData();
    } catch (error) {
      toast.error('Failed to cancel review request');
    }
  };

  const getStatusIcon = (status: ReviewRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'sent':
        return <Send className="h-4 w-4 text-blue-500" />;
      case 'reviewed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: ReviewRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'reviewed':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = reviewRequests.filter(request => {
    if (selectedFilter !== 'all' && request.status !== selectedFilter) return false;
    if (searchQuery && !request.guestName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !request.propertyName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading automated rating system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Automated Rating System</h1>
          <p className="text-muted-foreground">
            Streamline guest feedback collection with automated review requests
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={refreshData} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Automation Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* Basic Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enabled">Enable Automated Review Requests</Label>
                    <Switch
                      id="enabled"
                      checked={settings.enabled}
                      onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sendDelay">Send Delay (hours after checkout)</Label>
                      <Input
                        id="sendDelay"
                        type="number"
                        value={settings.sendDelay}
                        onChange={(e) => setSettings({ ...settings, sendDelay: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxReminders">Maximum Reminders</Label>
                      <Input
                        id="maxReminders"
                        type="number"
                        value={settings.maxReminders}
                        onChange={(e) => setSettings({ ...settings, maxReminders: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reminderInterval">Reminder Interval (days)</Label>
                      <Input
                        id="reminderInterval"
                        type="number"
                        value={settings.reminderInterval}
                        onChange={(e) => setSettings({ ...settings, reminderInterval: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="expireAfter">Expire After (days)</Label>
                      <Input
                        id="expireAfter"
                        type="number"
                        value={settings.expireAfter}
                        onChange={(e) => setSettings({ ...settings, expireAfter: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                {/* Channels */}
                <div className="space-y-4">
                  <h4 className="font-medium">Communication Channels</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="email"
                        checked={settings.channels.email}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            channels: { ...settings.channels, email: checked }
                          })
                        }
                      />
                      <Label htmlFor="email" className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>Email</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="sms"
                        checked={settings.channels.sms}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            channels: { ...settings.channels, sms: checked }
                          })
                        }
                      />
                      <Label htmlFor="sms" className="flex items-center space-x-2">
                        <Smartphone className="h-4 w-4" />
                        <span>SMS</span>
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Incentives */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="incentivesEnabled">Enable Review Incentives</Label>
                    <Switch
                      id="incentivesEnabled"
                      checked={settings.incentives.enabled}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          incentives: { ...settings.incentives, enabled: checked }
                        })
                      }
                    />
                  </div>
                  
                  {settings.incentives.enabled && (
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="incentiveType">Incentive Type</Label>
                        <Select
                          value={settings.incentives.type}
                          onValueChange={(value: any) =>
                            setSettings({
                              ...settings,
                              incentives: { ...settings.incentives, type: value }
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="discount">Discount</SelectItem>
                            <SelectItem value="voucher">Voucher</SelectItem>
                            <SelectItem value="loyalty_points">Loyalty Points</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="incentiveValue">Value</Label>
                        <Input
                          id="incentiveValue"
                          type="number"
                          value={settings.incentives.value}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              incentives: { ...settings.incentives, value: parseInt(e.target.value) }
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="minRating">Min Rating Required</Label>
                        <Input
                          id="minRating"
                          type="number"
                          min="1"
                          max="5"
                          value={settings.incentives.minRating}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              incentives: { ...settings.incentives, minRating: parseInt(e.target.value) }
                            })
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={saveSettings}>
                    Save Settings
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{analytics?.totalRequests}</p>
              </div>
              <Send className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Response Rate</p>
                <p className="text-2xl font-bold">{analytics?.responseRate}%</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold">{analytics?.averageRating}/5.0</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">{analytics?.averageResponseTime}h</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">Review Requests</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Review Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Review Requests</CardTitle>
                  <CardDescription>
                    Monitor and manage automated review requests
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search guests or properties..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={selectedFilter} onValueChange={(value: any) => setSelectedFilter(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(request.status)}
                        <div>
                          <h4 className="font-medium">{request.guestName}</h4>
                          <p className="text-sm text-muted-foreground">{request.propertyName}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                        {request.rating && (
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{request.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Check-out</p>
                        <p className="font-medium">{format(request.checkOutDate, 'MMM dd, yyyy')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Scheduled</p>
                        <p className="font-medium">{format(request.scheduledSendDate, 'MMM dd, yyyy')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Attempts</p>
                        <p className="font-medium">{request.attempts}/{settings.maxReminders + 1}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Sent</p>
                        <p className="font-medium">
                          {request.lastSentAt ? formatDistanceToNow(request.lastSentAt, { addSuffix: true }) : 'Never'}
                        </p>
                      </div>
                    </div>

                    {request.reminders.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm font-medium mb-2">Communication History</p>
                        <div className="flex flex-wrap gap-2">
                          {request.reminders.map((reminder) => (
                            <Badge key={reminder.id} variant="outline" className="text-xs">
                              {reminder.channel} - {reminder.template} - {reminder.status}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-end space-x-2 mt-3">
                      {request.status === 'pending' && (
                        <Button size="sm" onClick={() => sendManualRequest(request.id)}>
                          <Send className="h-4 w-4 mr-1" />
                          Send Now
                        </Button>
                      )}
                      {(request.status === 'pending' || request.status === 'sent') && (
                        <Button variant="outline" size="sm" onClick={() => cancelRequest(request.id)}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Channel Performance</CardTitle>
                <CardDescription>Compare email vs SMS effectiveness</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span className="font-medium">Email</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {((analytics?.channelPerformance.email.reviewed || 0) / (analytics?.channelPerformance.email.sent || 1) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={(analytics?.channelPerformance.email.reviewed || 0) / (analytics?.channelPerformance.email.sent || 1) * 100} />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Sent: {analytics?.channelPerformance.email.sent}</span>
                      <span>Reviewed: {analytics?.channelPerformance.email.reviewed}</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Smartphone className="h-4 w-4" />
                        <span className="font-medium">SMS</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {((analytics?.channelPerformance.sms.reviewed || 0) / (analytics?.channelPerformance.sms.sent || 1) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={(analytics?.channelPerformance.sms.reviewed || 0) / (analytics?.channelPerformance.sms.sent || 1) * 100} />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Sent: {analytics?.channelPerformance.sms.sent}</span>
                      <span>Reviewed: {analytics?.channelPerformance.sms.reviewed}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
                <CardDescription>Breakdown of received ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.ratingDistribution.map((item) => (
                    <div key={item.rating} className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 w-16">
                        <span className="text-sm font-medium">{item.rating}</span>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      </div>
                      <Progress value={item.percentage} className="flex-1" />
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Property Performance</CardTitle>
              <CardDescription>Review response rates by property</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.propertyPerformance.map((property) => (
                  <div key={property.propertyId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{property.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Response Rate: {property.responseRate}%</span>
                        <span>Avg Rating: {property.avgRating}/5.0</span>
                      </div>
                    </div>
                    <div className="w-24">
                      <Progress value={property.responseRate} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Message Templates</CardTitle>
              <CardDescription>Customize automated review request messages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="initial-template">Initial Request Template</Label>
                <Textarea
                  id="initial-template"
                  value={settings.templates.initial}
                  onChange={(e) => setSettings({
                    ...settings,
                    templates: { ...settings.templates, initial: e.target.value }
                  })}
                  rows={3}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="reminder1-template">First Reminder Template</Label>
                <Textarea
                  id="reminder1-template"
                  value={settings.templates.reminder1}
                  onChange={(e) => setSettings({
                    ...settings,
                    templates: { ...settings.templates, reminder1: e.target.value }
                  })}
                  rows={3}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="reminder2-template">Second Reminder Template</Label>
                <Textarea
                  id="reminder2-template"
                  value={settings.templates.reminder2}
                  onChange={(e) => setSettings({
                    ...settings,
                    templates: { ...settings.templates, reminder2: e.target.value }
                  })}
                  rows={3}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="thankyou-template">Thank You Template</Label>
                <Textarea
                  id="thankyou-template"
                  value={settings.templates.thankYou}
                  onChange={(e) => setSettings({
                    ...settings,
                    templates: { ...settings.templates, thankYou: e.target.value }
                  })}
                  rows={3}
                  className="mt-2"
                />
              </div>
              
              <div className="pt-4 border-t">
                <Button onClick={saveSettings}>
                  Save Templates
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutomatedRatingSystem;