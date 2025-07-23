import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Users,
  BarChart3,
  Settings,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Star,
  Percent,
  Calculator,
  RefreshCw,
  Eye,
  Edit,
  Save,
  Download,
  Upload,
  Brain,
  LineChart,
  PieChart,
  Activity,
  Lightbulb,
  Shield,
  Award
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { format, addDays, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';
import { toast } from 'sonner';

interface PricingRule {
  id: string;
  name: string;
  type: 'seasonal' | 'demand' | 'competition' | 'occupancy' | 'event' | 'custom';
  enabled: boolean;
  priority: number;
  conditions: {
    dateRange?: { start: Date; end: Date };
    daysAhead?: number;
    occupancyThreshold?: number;
    demandLevel?: 'low' | 'medium' | 'high';
    eventType?: string;
    dayOfWeek?: string[];
  };
  adjustment: {
    type: 'percentage' | 'fixed';
    value: number;
    minimum?: number;
    maximum?: number;
  };
  description: string;
}

interface MarketData {
  competitorRates: { date: string; average: number; min: number; max: number }[];
  demandForecast: { date: string; demand: number; events: string[] }[];
  occupancyRates: { date: string; occupancy: number; market: number }[];
  seasonalTrends: { month: string; multiplier: number; bookings: number }[];
}

interface PricingRecommendation {
  date: string;
  currentPrice: number;
  recommendedPrice: number;
  confidence: number;
  reasoning: string[];
  potentialRevenue: number;
  occupancyImpact: number;
  factors: {
    demand: number;
    competition: number;
    seasonality: number;
    occupancy: number;
    events: number;
  };
}

interface SmartPricingEngineProps {
  propertyId: string;
  ownerId: string;
}

export const SmartPricingEngine: React.FC<SmartPricingEngineProps> = ({
  propertyId,
  ownerId
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [recommendations, setRecommendations] = useState<PricingRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [basePrice, setBasePrice] = useState(850);
  const [priceRange, setPriceRange] = useState({ min: 500, max: 1500 });
  const [selectedDateRange, setSelectedDateRange] = useState(30); // days
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);

  useEffect(() => {
    loadPricingData();
  }, [propertyId]);

  const loadPricingData = async () => {
    try {
      setLoading(true);
      
      // Mock data - in real implementation, this would be API calls
      const mockRules: PricingRule[] = [
        {
          id: '1',
          name: 'Weekend Premium',
          type: 'seasonal',
          enabled: true,
          priority: 1,
          conditions: {
            dayOfWeek: ['Friday', 'Saturday']
          },
          adjustment: {
            type: 'percentage',
            value: 25,
            minimum: 750,
            maximum: 1200
          },
          description: 'Increase prices on weekends due to higher demand'
        },
        {
          id: '2',
          name: 'High Season',
          type: 'seasonal',
          enabled: true,
          priority: 2,
          conditions: {
            dateRange: {
              start: new Date('2025-12-01'),
              end: new Date('2026-01-31')
            }
          },
          adjustment: {
            type: 'percentage',
            value: 40,
            minimum: 900,
            maximum: 1800
          },
          description: 'Summer holiday season premium pricing'
        },
        {
          id: '3',
          name: 'Last Minute Discount',
          type: 'demand',
          enabled: true,
          priority: 3,
          conditions: {
            daysAhead: 3,
            occupancyThreshold: 50
          },
          adjustment: {
            type: 'percentage',
            value: -15,
            minimum: 600
          },
          description: 'Discount for bookings within 3 days if occupancy is low'
        },
        {
          id: '4',
          name: 'Event Premium',
          type: 'event',
          enabled: true,
          priority: 1,
          conditions: {
            eventType: 'major'
          },
          adjustment: {
            type: 'percentage',
            value: 50,
            minimum: 1000,
            maximum: 2000
          },
          description: 'Premium pricing during major local events'
        }
      ];

      const mockMarketData: MarketData = {
        competitorRates: Array.from({ length: 30 }, (_, i) => ({
          date: format(addDays(new Date(), i), 'yyyy-MM-dd'),
          average: 780 + Math.random() * 200,
          min: 600 + Math.random() * 100,
          max: 1200 + Math.random() * 300
        })),
        demandForecast: Array.from({ length: 30 }, (_, i) => ({
          date: format(addDays(new Date(), i), 'yyyy-MM-dd'),
          demand: 0.3 + Math.random() * 0.7,
          events: Math.random() > 0.8 ? ['Local Festival'] : []
        })),
        occupancyRates: Array.from({ length: 30 }, (_, i) => ({
          date: format(addDays(new Date(), i), 'yyyy-MM-dd'),
          occupancy: 60 + Math.random() * 30,
          market: 65 + Math.random() * 25
        })),
        seasonalTrends: [
          { month: 'Jan', multiplier: 1.3, bookings: 45 },
          { month: 'Feb', multiplier: 1.2, bookings: 42 },
          { month: 'Mar', multiplier: 1.0, bookings: 38 },
          { month: 'Apr', multiplier: 0.9, bookings: 35 },
          { month: 'May', multiplier: 0.8, bookings: 32 },
          { month: 'Jun', multiplier: 0.7, bookings: 28 },
          { month: 'Jul', multiplier: 0.8, bookings: 31 },
          { month: 'Aug', multiplier: 0.9, bookings: 36 },
          { month: 'Sep', multiplier: 1.0, bookings: 39 },
          { month: 'Oct', multiplier: 1.1, bookings: 41 },
          { month: 'Nov', multiplier: 1.2, bookings: 43 },
          { month: 'Dec', multiplier: 1.4, bookings: 48 }
        ]
      };

      const mockRecommendations: PricingRecommendation[] = Array.from({ length: 30 }, (_, i) => {
        const date = format(addDays(new Date(), i), 'yyyy-MM-dd');
        const current = basePrice;
        const recommended = current + (Math.random() - 0.5) * 200;
        
        return {
          date,
          currentPrice: current,
          recommendedPrice: Math.round(recommended),
          confidence: 70 + Math.random() * 30,
          reasoning: [
            'Market rates are trending upward',
            'Demand forecast shows high activity',
            'Competitor pricing analysis suggests room for increase'
          ],
          potentialRevenue: recommended * 0.8,
          occupancyImpact: (recommended - current) / current * -0.1,
          factors: {
            demand: Math.random(),
            competition: Math.random(),
            seasonality: Math.random(),
            occupancy: Math.random(),
            events: Math.random()
          }
        };
      });

      setPricingRules(mockRules);
      setMarketData(mockMarketData);
      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error('Error loading pricing data:', error);
      toast.error('Failed to load pricing data');
    } finally {
      setLoading(false);
    }
  };

  const applyRecommendations = async (dateRange: string[]) => {
    try {
      // API call to apply recommendations
      toast.success(`Applied pricing recommendations for ${dateRange.length} dates`);
      await loadPricingData();
    } catch (error) {
      toast.error('Failed to apply recommendations');
    }
  };

  const saveRule = async (rule: PricingRule) => {
    try {
      if (editingRule) {
        setPricingRules(prev => prev.map(r => r.id === rule.id ? rule : r));
        toast.success('Pricing rule updated');
      } else {
        setPricingRules(prev => [...prev, { ...rule, id: Date.now().toString() }]);
        toast.success('Pricing rule created');
      }
      setShowRuleDialog(false);
      setEditingRule(null);
    } catch (error) {
      toast.error('Failed to save pricing rule');
    }
  };

  const toggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      setPricingRules(prev => prev.map(r => 
        r.id === ruleId ? { ...r, enabled } : r
      ));
      toast.success(`Pricing rule ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to update pricing rule');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const getRevenueImpact = () => {
    const totalPotential = recommendations.reduce((acc, rec) => acc + rec.potentialRevenue, 0);
    const currentRevenue = recommendations.reduce((acc, rec) => acc + rec.currentPrice * 0.8, 0);
    return totalPotential - currentRevenue;
  };

  const getConfidenceLevel = () => {
    const avgConfidence = recommendations.reduce((acc, rec) => acc + rec.confidence, 0) / recommendations.length;
    return Math.round(avgConfidence);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Base Price</p>
                <p className="text-2xl font-bold">{formatCurrency(basePrice)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue Impact</p>
                <p className="text-2xl font-bold text-green-600">
                  +{formatCurrency(getRevenueImpact())}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Rules</p>
                <p className="text-2xl font-bold">{pricingRules.filter(r => r.enabled).length}</p>
              </div>
              <Settings className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Confidence</p>
                <p className="text-2xl font-bold">{getConfidenceLevel()}%</p>
              </div>
              <Brain className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Auto-Update Toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Smart Pricing Automation</span>
              </CardTitle>
              <CardDescription>
                Automatically adjust prices based on market conditions and demand
              </CardDescription>
            </div>
            <Switch
              checked={autoUpdate}
              onCheckedChange={setAutoUpdate}
            />
          </div>
        </CardHeader>
        {autoUpdate && (
          <CardContent>
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Smart pricing is active. Prices will be automatically updated based on your rules and market conditions.
                Next update: Today at 6:00 PM
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {/* Price Recommendations Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Price Recommendations (Next 30 Days)</CardTitle>
          <CardDescription>
            AI-powered pricing suggestions based on market analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={recommendations}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(new Date(date), 'MMM dd')}
              />
              <YAxis tickFormatter={(value) => `R${value}`} />
              <Tooltip 
                labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === 'currentPrice' ? 'Current Price' : 'Recommended Price'
                ]}
              />
              <Area
                type="monotone"
                dataKey="currentPrice"
                stackId="1"
                stroke="#94A3B8"
                fill="#94A3B8"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="recommendedPrice"
                stackId="2"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Apply All Recommendations</CardTitle>
            <CardDescription>
              Accept all AI recommendations for the next 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Potential Revenue Increase:</span>
                <span className="font-semibold text-green-600">
                  +{formatCurrency(getRevenueImpact())}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Average Confidence:</span>
                <span className="font-semibold">{getConfidenceLevel()}%</span>
              </div>
              <Button 
                className="w-full" 
                onClick={() => applyRecommendations(recommendations.map(r => r.date))}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Apply All Recommendations
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market Analysis</CardTitle>
            <CardDescription>
              Current market conditions and competitor insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Market Average:</span>
                <span className="font-semibold">
                  {marketData ? formatCurrency(marketData.competitorRates[0]?.average || 0) : 'Loading...'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Your Position:</span>
                <Badge variant="outline" className="text-green-600">
                  Above Average
                </Badge>
              </div>
              <Button variant="outline" className="w-full">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Detailed Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderRules = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Pricing Rules</h2>
          <p className="text-muted-foreground">
            Automated rules that adjust your prices based on various conditions
          </p>
        </div>
        <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
          <DialogTrigger asChild>
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Create Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingRule ? 'Edit Pricing Rule' : 'Create Pricing Rule'}
              </DialogTitle>
            </DialogHeader>
            <PricingRuleForm
              rule={editingRule}
              onSave={saveRule}
              onCancel={() => {
                setShowRuleDialog(false);
                setEditingRule(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {pricingRules.map((rule) => (
          <Card key={rule.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={(enabled) => toggleRule(rule.id, enabled)}
                  />
                  <div>
                    <h3 className="font-semibold">{rule.name}</h3>
                    <p className="text-sm text-muted-foreground">{rule.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="capitalize">
                    {rule.type}
                  </Badge>
                  <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                    Priority {rule.priority}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingRule(rule);
                      setShowRuleDialog(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm font-medium mb-1">Adjustment</p>
                  <p className="text-sm text-muted-foreground">
                    {rule.adjustment.type === 'percentage' ? 
                      `${rule.adjustment.value > 0 ? '+' : ''}${rule.adjustment.value}%` :
                      formatCurrency(rule.adjustment.value)
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Range</p>
                  <p className="text-sm text-muted-foreground">
                    {rule.adjustment.minimum ? formatCurrency(rule.adjustment.minimum) : 'No min'} - {' '}
                    {rule.adjustment.maximum ? formatCurrency(rule.adjustment.maximum) : 'No max'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Conditions</p>
                  <p className="text-sm text-muted-foreground">
                    {rule.conditions.dayOfWeek ? `${rule.conditions.dayOfWeek.join(', ')}` :
                     rule.conditions.dateRange ? 'Date range' :
                     rule.conditions.daysAhead ? `${rule.conditions.daysAhead} days ahead` :
                     'Custom conditions'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Market Competition</CardTitle>
            <CardDescription>Compare your pricing with competitors</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={marketData?.competitorRates || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                />
                <YAxis tickFormatter={(value) => `R${value}`} />
                <Tooltip 
                  labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
                  formatter={(value: number) => [formatCurrency(value), 'Price']}
                />
                <Line type="monotone" dataKey="average" stroke="#3B82F6" name="Market Average" />
                <Line type="monotone" dataKey="min" stroke="#10B981" name="Minimum" />
                <Line type="monotone" dataKey="max" stroke="#F59E0B" name="Maximum" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Demand Forecast</CardTitle>
            <CardDescription>Predicted demand levels for upcoming dates</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={marketData?.demandForecast || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
                  formatter={(value: number) => [Math.round(value * 100) + '%', 'Demand Level']}
                />
                <Bar dataKey="demand" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seasonal Trends</CardTitle>
          <CardDescription>Historical seasonal pricing multipliers</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={marketData?.seasonalTrends || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  name === 'multiplier' ? `${value}x` : value,
                  name === 'multiplier' ? 'Price Multiplier' : 'Bookings'
                ]}
              />
              <Line type="monotone" dataKey="multiplier" stroke="#EF4444" name="Price Multiplier" />
              <Line type="monotone" dataKey="bookings" stroke="#3B82F6" name="Bookings" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading smart pricing engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Smart Pricing Engine</h1>
          <p className="text-muted-foreground">
            AI-powered dynamic pricing optimization for maximum revenue
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rules">Pricing Rules</TabsTrigger>
          <TabsTrigger value="analytics">Market Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">{renderOverview()}</TabsContent>
        <TabsContent value="rules">{renderRules()}</TabsContent>
        <TabsContent value="analytics">{renderAnalytics()}</TabsContent>
        <TabsContent value="settings">
          <PricingSettings 
            basePrice={basePrice}
            priceRange={priceRange}
            onBasePriceChange={setBasePrice}
            onPriceRangeChange={setPriceRange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Pricing Rule Form Component
const PricingRuleForm: React.FC<{
  rule: PricingRule | null;
  onSave: (rule: PricingRule) => void;
  onCancel: () => void;
}> = ({ rule, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<PricingRule>>(
    rule || {
      name: '',
      type: 'seasonal',
      enabled: true,
      priority: 1,
      conditions: {},
      adjustment: { type: 'percentage', value: 0 },
      description: ''
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as PricingRule);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Rule Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="type">Rule Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="seasonal">Seasonal</SelectItem>
              <SelectItem value="demand">Demand-based</SelectItem>
              <SelectItem value="competition">Competition</SelectItem>
              <SelectItem value="occupancy">Occupancy</SelectItem>
              <SelectItem value="event">Event-based</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="priority">Priority</Label>
          <Input
            id="priority"
            type="number"
            min="1"
            max="10"
            value={formData.priority}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe when this rule should apply"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Rule
        </Button>
      </div>
    </form>
  );
};

// Pricing Settings Component
const PricingSettings: React.FC<{
  basePrice: number;
  priceRange: { min: number; max: number };
  onBasePriceChange: (price: number) => void;
  onPriceRangeChange: (range: { min: number; max: number }) => void;
}> = ({ basePrice, priceRange, onBasePriceChange, onPriceRangeChange }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Base Pricing</CardTitle>
          <CardDescription>Set your default price and allowed range</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="basePrice">Base Price per Night</Label>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-sm">R</span>
              <Input
                id="basePrice"
                type="number"
                min="100"
                max="5000"
                value={basePrice}
                onChange={(e) => onBasePriceChange(parseInt(e.target.value))}
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label>Price Range</Label>
            <div className="space-y-4 mt-2">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Minimum: R{priceRange.min}</span>
                  <span>Maximum: R{priceRange.max}</span>
                </div>
                <Slider
                  value={[priceRange.min, priceRange.max]}
                  onValueChange={([min, max]) => onPriceRangeChange({ min, max })}
                  min={200}
                  max={3000}
                  step={50}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartPricingEngine;