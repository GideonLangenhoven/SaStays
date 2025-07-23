// src/components/integrations/IntegrationHub.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
  Plug,
  Settings,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  Plus,
  Search,
  Filter,
  Calendar,
  CreditCard,
  MessageSquare,
  Mail,
  Smartphone,
  MapPin,
  BarChart3,
  Shield,
  Key,
  Database,
  Zap,
  Globe,
  Clock,
  Users,
  Star,
  TrendingUp,
  ExternalLink,
  Download,
  Upload,
  Sync,
  Webhook,
  TestTube,
  Activity,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'payment' | 'calendar' | 'communication' | 'analytics' | 'marketing' | 'security' | 'utilities';
  icon: React.ReactNode;
  isActive: boolean;
  isConnected: boolean;
  isPremium: boolean;
  rating: number;
  installs: number;
  developer: string;
  version: string;
  lastUpdated: Date;
  features: string[];
  pricing: {
    free: boolean;
    priceRange?: string;
  };
  config?: Record<string, any>;
  status: 'healthy' | 'warning' | 'error' | 'disconnected';
  webhookUrl?: string;
  apiKey?: string;
}

interface WebhookConfig {
  url: string;
  events: string[];
  secret?: string;
  isActive: boolean;
}

interface IntegrationHubProps {
  className?: string;
}

const AVAILABLE_INTEGRATIONS: Integration[] = [
  {
    id: 'ozow',
    name: 'Ozow',
    description: 'Instant EFT payments for South African guests',
    category: 'payment',
    icon: <CreditCard className="h-6 w-6" />,
    isActive: true,
    isConnected: true,
    isPremium: false,
    rating: 4.8,
    installs: 15000,
    developer: 'Ozow',
    version: '2.1.0',
    lastUpdated: new Date('2024-01-15'),
    features: ['Instant payments', 'Real-time notifications', 'Fraud protection', 'Mobile optimized'],
    pricing: { free: false, priceRange: '2.9% per transaction' },
    status: 'healthy'
  },
  {
    id: 'payfast',
    name: 'PayFast',
    description: 'Credit card and EFT payments',
    category: 'payment',
    icon: <CreditCard className="h-6 w-6" />,
    isActive: true,
    isConnected: true,
    isPremium: false,
    rating: 4.6,
    installs: 12000,
    developer: 'PayFast',
    version: '1.8.2',
    lastUpdated: new Date('2024-01-10'),
    features: ['Card payments', 'Recurring billing', 'International cards', 'Secure checkout'],
    pricing: { free: false, priceRange: '2.9% + R2.90 per transaction' },
    status: 'healthy'
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Sync bookings with Google Calendar',
    category: 'calendar',
    icon: <Calendar className="h-6 w-6" />,
    isActive: true,
    isConnected: true,
    isPremium: false,
    rating: 4.9,
    installs: 25000,
    developer: 'Google',
    version: '3.2.1',
    lastUpdated: new Date('2024-01-20'),
    features: ['Two-way sync', 'Multiple calendars', 'Event details', 'Automatic updates'],
    pricing: { free: true },
    status: 'healthy'
  },
  {
    id: 'whatsapp-business',
    name: 'WhatsApp Business',
    description: 'Send automated messages to guests',
    category: 'communication',
    icon: <MessageSquare className="h-6 w-6" />,
    isActive: false,
    isConnected: false,
    isPremium: true,
    rating: 4.7,
    installs: 8000,
    developer: 'Meta',
    version: '2.0.5',
    lastUpdated: new Date('2024-01-18'),
    features: ['Automated messages', 'Templates', 'Rich media', 'Delivery reports'],
    pricing: { free: false, priceRange: 'R0.50 per message' },
    status: 'disconnected'
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Email marketing and automation',
    category: 'marketing',
    icon: <Mail className="h-6 w-6" />,
    isActive: false,
    isConnected: false,
    isPremium: false,
    rating: 4.5,
    installs: 5000,
    developer: 'Mailchimp',
    version: '4.1.0',
    lastUpdated: new Date('2024-01-12'),
    features: ['Email campaigns', 'Automation', 'Analytics', 'Segmentation'],
    pricing: { free: true, priceRange: 'Free up to 500 contacts' },
    status: 'disconnected'
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Track website and booking analytics',
    category: 'analytics',
    icon: <BarChart3 className="h-6 w-6" />,
    isActive: true,
    isConnected: true,
    isPremium: false,
    rating: 4.8,
    installs: 18000,
    developer: 'Google',
    version: '4.0.2',
    lastUpdated: new Date('2024-01-22'),
    features: ['Real-time data', 'Custom reports', 'Goal tracking', 'Audience insights'],
    pricing: { free: true },
    status: 'healthy'
  },
  {
    id: 'twilio-sms',
    name: 'Twilio SMS',
    description: 'Send SMS notifications to guests',
    category: 'communication',
    icon: <Smartphone className="h-6 w-6" />,
    isActive: false,
    isConnected: false,
    isPremium: true,
    rating: 4.6,
    installs: 3000,
    developer: 'Twilio',
    version: '1.5.3',
    lastUpdated: new Date('2024-01-08'),
    features: ['Global SMS', 'Delivery reports', 'Two-way messaging', 'Short codes'],
    pricing: { free: false, priceRange: 'R1.20 per SMS' },
    status: 'disconnected'
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect with 3000+ apps and automate workflows',
    category: 'utilities',
    icon: <Zap className="h-6 w-6" />,
    isActive: false,
    isConnected: false,
    isPremium: true,
    rating: 4.7,
    installs: 7500,
    developer: 'Zapier',
    version: '5.2.1',
    lastUpdated: new Date('2024-01-25'),
    features: ['Workflow automation', '3000+ app connections', 'Custom triggers', 'Multi-step zaps'],
    pricing: { free: true, priceRange: 'Free plan available' },
    status: 'disconnected'
  }
];

const WEBHOOK_EVENTS = [
  'booking.created',
  'booking.confirmed',
  'booking.cancelled',
  'booking.completed',
  'payment.received',
  'payment.failed',
  'guest.checkin',
  'guest.checkout',
  'review.received',
  'message.received'
];

export const IntegrationHub: React.FC<IntegrationHubProps> = ({
  className = ''
}) => {
  const [integrations, setIntegrations] = useState<Integration[]>(AVAILABLE_INTEGRATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: 'all', label: 'All Categories', icon: <Globe className="h-4 w-4" /> },
    { value: 'payment', label: 'Payments', icon: <CreditCard className="h-4 w-4" /> },
    { value: 'calendar', label: 'Calendar', icon: <Calendar className="h-4 w-4" /> },
    { value: 'communication', label: 'Communication', icon: <MessageSquare className="h-4 w-4" /> },
    { value: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
    { value: 'marketing', label: 'Marketing', icon: <Mail className="h-4 w-4" /> },
    { value: 'security', label: 'Security', icon: <Shield className="h-4 w-4" /> },
    { value: 'utilities', label: 'Utilities', icon: <Settings className="h-4 w-4" /> }
  ];

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'disconnected': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'healthy': return <Check className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <X className="h-4 w-4" />;
      case 'disconnected': return <Plug className="h-4 w-4" />;
      default: return <Plug className="h-4 w-4" />;
    }
  };

  const toggleIntegration = async (integrationId: string) => {
    setLoading(true);
    try {
      setIntegrations(prev => prev.map(integration =>
        integration.id === integrationId
          ? { 
              ...integration, 
              isActive: !integration.isActive,
              status: !integration.isActive ? 'healthy' : 'disconnected'
            }
          : integration
      ));
      
      const integration = integrations.find(i => i.id === integrationId);
      toast.success(`${integration?.name} ${integration?.isActive ? 'disabled' : 'enabled'} successfully`);
    } catch (error) {
      toast.error('Failed to update integration');
    } finally {
      setLoading(false);
    }
  };

  const connectIntegration = async (integration: Integration) => {
    setSelectedIntegration(integration);
    setShowConfigDialog(true);
  };

  const testIntegration = async (integrationId: string) => {
    setLoading(true);
    try {
      // Mock API test
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Integration test successful');
    } catch (error) {
      toast.error('Integration test failed');
    } finally {
      setLoading(false);
    }
  };

  const syncIntegration = async (integrationId: string) => {
    setLoading(true);
    try {
      // Mock sync
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Integration synced successfully');
    } catch (error) {
      toast.error('Sync failed');
    } finally {
      setLoading(false);
    }
  };

  const renderIntegrationCard = (integration: Integration) => (
    <Card key={integration.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              {integration.icon}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg flex items-center space-x-2">
                <span>{integration.name}</span>
                {integration.isPremium && (
                  <Badge variant="outline" className="text-xs">Premium</Badge>
                )}
              </CardTitle>
              <CardDescription className="text-sm">
                {integration.description}
              </CardDescription>
            </div>
          </div>
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
            {getStatusIcon(integration.status)}
            <span className="capitalize">{integration.status}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{integration.rating}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Download className="h-3 w-3" />
            <span>{integration.installs.toLocaleString()} installs</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>v{integration.version}</span>
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-1">
          {integration.features.slice(0, 3).map((feature, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {feature}
            </Badge>
          ))}
          {integration.features.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{integration.features.length - 3} more
            </Badge>
          )}
        </div>

        {/* Pricing */}
        <div className="text-sm">
          <span className="font-medium">
            {integration.pricing.free ? 'Free' : integration.pricing.priceRange}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {integration.isConnected ? (
            <>
              <div className="flex items-center space-x-1">
                <Switch
                  checked={integration.isActive}
                  onCheckedChange={() => toggleIntegration(integration.id)}
                  disabled={loading}
                />
                <span className="text-sm">
                  {integration.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => testIntegration(integration.id)}
                disabled={loading}
              >
                <TestTube className="h-4 w-4 mr-1" />
                Test
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => syncIntegration(integration.id)}
                disabled={loading}
              >
                <Sync className="h-4 w-4 mr-1" />
                Sync
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => connectIntegration(integration)}
              >
                <Settings className="h-4 w-4 mr-1" />
                Configure
              </Button>
            </>
          ) : (
            <Button
              onClick={() => connectIntegration(integration)}
              className="flex-1"
            >
              <Plug className="h-4 w-4 mr-2" />
              Connect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderWebhookConfig = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Webhook Configuration</h3>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Webhook
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Global Webhook Endpoint</CardTitle>
          <CardDescription>
            Receive real-time notifications about events in your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                placeholder="https://your-server.com/webhooks/sastays"
                className="font-mono"
              />
            </div>
            <div>
              <Label htmlFor="webhook-secret">Secret Key (Optional)</Label>
              <Input
                id="webhook-secret"
                type="password"
                placeholder="Your webhook secret for verification"
              />
            </div>
            <div>
              <Label>Events to Subscribe</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {WEBHOOK_EVENTS.map((event) => (
                  <div key={event} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={event}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={event} className="text-sm">
                      {event}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button>Save Webhook</Button>
            <Button variant="outline">
              <TestTube className="h-4 w-4 mr-2" />
              Test Webhook
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integration Hub</h1>
          <p className="text-muted-foreground">
            Connect your favorite tools and automate your workflow
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Config
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import Config
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="browse" className="space-y-4">
        <TabsList>
          <TabsTrigger value="browse">Browse Integrations</TabsTrigger>
          <TabsTrigger value="installed">My Integrations</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center space-x-2">
                      {category.icon}
                      <span>{category.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Integration Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredIntegrations.map(renderIntegrationCard)}
          </div>

          {filteredIntegrations.length === 0 && (
            <div className="text-center py-12">
              <Plug className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No integrations found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="installed" className="space-y-4">
          {/* Connected Integrations */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {integrations
              .filter(integration => integration.isConnected)
              .map(renderIntegrationCard)}
          </div>

          {integrations.filter(integration => integration.isConnected).length === 0 && (
            <div className="text-center py-12">
              <Plug className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No integrations connected</h3>
              <p className="text-muted-foreground mb-4">
                Start by connecting your first integration to automate your workflow
              </p>
              <Button>Browse Integrations</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          {renderWebhookConfig()}
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">API Keys</h3>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Generate New Key
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">SaStays API Access</CardTitle>
                <CardDescription>
                  Use these API keys to integrate with external systems
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Production API Key</Label>
                  <div className="flex space-x-2">
                    <Input
                      value="sk_live_••••••••••••••••••••••••••••••••"
                      readOnly
                      className="font-mono"
                    />
                    <Button variant="outline" size="sm">
                      Copy
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Last used: 2 hours ago
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Test API Key</Label>
                  <div className="flex space-x-2">
                    <Input
                      value="sk_test_••••••••••••••••••••••••••••••••"
                      readOnly
                      className="font-mono"
                    />
                    <Button variant="outline" size="sm">
                      Copy
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    For development and testing purposes
                  </p>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Keep your API keys secure and never share them publicly. 
                    Use environment variables in production.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">API Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Monthly API Calls</span>
                      <span className="text-sm text-muted-foreground">2,847 / 10,000</span>
                    </div>
                    <Progress value={28.47} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">2.8K</div>
                      <div className="text-xs text-muted-foreground">This Month</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">847</div>
                      <div className="text-xs text-muted-foreground">This Week</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">142</div>
                      <div className="text-xs text-muted-foreground">Today</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Configuration Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Configure {selectedIntegration?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedIntegration && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                {selectedIntegration.icon}
                <div>
                  <h3 className="font-semibold">{selectedIntegration.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedIntegration.description}
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                <div>
                  <Label>API Key</Label>
                  <Input
                    placeholder={`Enter your ${selectedIntegration.name} API key`}
                    type="password"
                  />
                </div>
                
                {selectedIntegration.category === 'payment' && (
                  <div>
                    <Label>Merchant ID</Label>
                    <Input placeholder="Enter your merchant ID" />
                  </div>
                )}

                {selectedIntegration.category === 'communication' && (
                  <div>
                    <Label>Phone Number</Label>
                    <Input placeholder="+27 XX XXX XXXX" />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="test-mode" />
                  <Label htmlFor="test-mode">Enable test mode</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
                  Cancel
                </Button>
                <Button>
                  Connect Integration
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IntegrationHub;