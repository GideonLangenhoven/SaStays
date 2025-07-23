import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  Eye, 
  Calendar, 
  MessageSquare,
  DollarSign,
  Shield,
  Mail,
  Phone,
  MapPin,
  Building,
  Key,
  UserCheck,
  UserX,
  Clock,
  TrendingUp,
  Home,
  Filter,
  Search,
  MoreHorizontal,
  Bell,
  Archive,
  Star,
  ChevronRight
} from 'lucide-react';

interface Property {
  id: string;
  name: string;
  address: string;
  type: 'apartment' | 'house' | 'villa' | 'studio';
  status: 'active' | 'inactive' | 'maintenance';
  occupancy: number;
  revenue: number;
  rating: number;
  image?: string;
  coHosts: string[];
  bookings: number;
  lastBooking: string;
}

interface CoHost {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'manager' | 'cleaner' | 'maintenance' | 'guest-relations';
  permissions: {
    viewBookings: boolean;
    manageBookings: boolean;
    messaging: boolean;
    pricing: boolean;
    calendar: boolean;
    analytics: boolean;
    settings: boolean;
  };
  properties: string[];
  status: 'active' | 'pending' | 'inactive';
  joinedDate: string;
  lastActive: string;
  performance: {
    responseTime: number; // hours
    rating: number;
    tasksCompleted: number;
  };
}

const mockProperties: Property[] = [
  {
    id: '1',
    name: 'Sea View Apartment',
    address: '123 Ocean Drive, Cape Town',
    type: 'apartment',
    status: 'active',
    occupancy: 85,
    revenue: 45000,
    rating: 4.8,
    coHosts: ['1', '2'],
    bookings: 28,
    lastBooking: '2025-01-20T10:00:00Z'
  },
  {
    id: '2',
    name: 'Mountain Villa',
    address: '456 Table Mountain Road, Cape Town',
    type: 'villa',
    status: 'active',
    occupancy: 72,
    revenue: 78000,
    rating: 4.9,
    coHosts: ['1'],
    bookings: 35,
    lastBooking: '2025-01-19T14:30:00Z'
  },
  {
    id: '3',
    name: 'City Studio',
    address: '789 Long Street, Cape Town',
    type: 'studio',
    status: 'maintenance',
    occupancy: 0,
    revenue: 12000,
    rating: 4.5,
    coHosts: [],
    bookings: 8,
    lastBooking: '2025-01-15T09:00:00Z'
  }
];

const mockCoHosts: CoHost[] = [
  {
    id: '1',
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    phone: '+27 82 123 4567',
    role: 'manager',
    permissions: {
      viewBookings: true,
      manageBookings: true,
      messaging: true,
      pricing: true,
      calendar: true,
      analytics: true,
      settings: false
    },
    properties: ['1', '2'],
    status: 'active',
    joinedDate: '2024-06-15T00:00:00Z',
    lastActive: '2025-01-21T08:30:00Z',
    performance: {
      responseTime: 2.5,
      rating: 4.9,
      tasksCompleted: 145
    }
  },
  {
    id: '2',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    phone: '+27 71 987 6543',
    role: 'cleaner',
    permissions: {
      viewBookings: true,
      manageBookings: false,
      messaging: false,
      pricing: false,
      calendar: true,
      analytics: false,
      settings: false
    },
    properties: ['1'],
    status: 'active',
    joinedDate: '2024-08-20T00:00:00Z',
    lastActive: '2025-01-20T16:45:00Z',
    performance: {
      responseTime: 4.2,
      rating: 4.7,
      tasksCompleted: 89
    }
  }
];

export default function CoHostingMultiProperty() {
  const [properties, setProperties] = useState<Property[]>(mockProperties);
  const [coHosts, setCoHosts] = useState<CoHost[]>(mockCoHosts);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [newCoHost, setNewCoHost] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'guest-relations' as const
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const getStatusColor = (status: string) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'maintenance': 'bg-yellow-100 text-yellow-800',
      'pending': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || colors.inactive;
  };

  const getRoleColor = (role: string) => {
    const colors = {
      'manager': 'bg-purple-100 text-purple-800',
      'cleaner': 'bg-blue-100 text-blue-800',
      'maintenance': 'bg-orange-100 text-orange-800',
      'guest-relations': 'bg-green-100 text-green-800'
    };
    return colors[role] || colors['guest-relations'];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleInviteCoHost = () => {
    if (!newCoHost.name || !newCoHost.email) return;

    const coHost: CoHost = {
      id: Date.now().toString(),
      ...newCoHost,
      avatar: undefined,
      permissions: {
        viewBookings: true,
        manageBookings: false,
        messaging: newCoHost.role === 'manager' || newCoHost.role === 'guest-relations',
        pricing: newCoHost.role === 'manager',
        calendar: true,
        analytics: newCoHost.role === 'manager',
        settings: false
      },
      properties: [],
      status: 'pending',
      joinedDate: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      performance: {
        responseTime: 0,
        rating: 0,
        tasksCompleted: 0
      }
    };

    setCoHosts(prev => [...prev, coHost]);
    setNewCoHost({ name: '', email: '', phone: '', role: 'guest-relations' });
  };

  const handleUpdatePermissions = (coHostId: string, permission: string, value: boolean) => {
    setCoHosts(prev => prev.map(coHost =>
      coHost.id === coHostId
        ? {
            ...coHost,
            permissions: {
              ...coHost.permissions,
              [permission]: value
            }
          }
        : coHost
    ));
  };

  const totalRevenue = properties.reduce((sum, prop) => sum + prop.revenue, 0);
  const avgOccupancy = properties.reduce((sum, prop) => sum + prop.occupancy, 0) / properties.length;
  const totalBookings = properties.reduce((sum, prop) => sum + prop.bookings, 0);
  const avgRating = properties.reduce((sum, prop) => sum + prop.rating, 0) / properties.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Property Portfolio</h1>
          <p className="text-gray-600">Manage multiple properties and co-hosts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Users className="h-4 w-4 mr-2" />
                Invite Co-host
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Co-host</DialogTitle>
                <DialogDescription>
                  Invite someone to help manage your properties
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cohost-name">Full Name</Label>
                  <Input
                    id="cohost-name"
                    value={newCoHost.name}
                    onChange={(e) => setNewCoHost(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="cohost-email">Email Address</Label>
                  <Input
                    id="cohost-email"
                    type="email"
                    value={newCoHost.email}
                    onChange={(e) => setNewCoHost(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="cohost-phone">Phone Number</Label>
                  <Input
                    id="cohost-phone"
                    value={newCoHost.phone}
                    onChange={(e) => setNewCoHost(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+27 XX XXX XXXX"
                  />
                </div>
                <div>
                  <Label htmlFor="cohost-role">Role</Label>
                  <Select
                    value={newCoHost.role}
                    onValueChange={(value) => setNewCoHost(prev => ({ ...prev, role: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">Property Manager</SelectItem>
                      <SelectItem value="guest-relations">Guest Relations</SelectItem>
                      <SelectItem value="cleaner">Cleaner</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleInviteCoHost} className="w-full">
                  Send Invitation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Properties</p>
                <p className="text-2xl font-bold">{properties.length}</p>
              </div>
              <Building className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Occupancy</p>
                <p className="text-2xl font-bold">{avgOccupancy.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold">{avgRating.toFixed(1)}</p>
              </div>
              <Star className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="properties" className="space-y-6">
        <TabsList>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="cohosts">Co-hosts</TabsTrigger>
          <TabsTrigger value="calendar">Multi-Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input className="pl-10 w-64" placeholder="Search properties..." />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Card key={property.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center">
                    <Home className="h-12 w-12 text-gray-400" />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{property.name}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {property.address}
                        </p>
                      </div>
                      <Badge className={getStatusColor(property.status)}>
                        {property.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Occupancy</p>
                        <p className="font-semibold">{property.occupancy}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Revenue</p>
                        <p className="font-semibold">{formatCurrency(property.revenue)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Rating</p>
                        <p className="font-semibold flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {property.rating}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Co-hosts</p>
                        <p className="font-semibold">{property.coHosts.length}</p>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="flex justify-between items-center">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left">
                        <th className="p-4 font-medium">Property</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium">Occupancy</th>
                        <th className="p-4 font-medium">Revenue</th>
                        <th className="p-4 font-medium">Rating</th>
                        <th className="p-4 font-medium">Co-hosts</th>
                        <th className="p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {properties.map((property) => (
                        <tr key={property.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div>
                              <h4 className="font-medium">{property.name}</h4>
                              <p className="text-sm text-gray-600">{property.address}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={getStatusColor(property.status)}>
                              {property.status}
                            </Badge>
                          </td>
                          <td className="p-4">{property.occupancy}%</td>
                          <td className="p-4">{formatCurrency(property.revenue)}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {property.rating}
                            </div>
                          </td>
                          <td className="p-4">{property.coHosts.length}</td>
                          <td className="p-4">
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cohosts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {coHosts.map((coHost) => (
              <Card key={coHost.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={coHost.avatar} />
                        <AvatarFallback>
                          {coHost.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{coHost.name}</h3>
                        <Badge className={getRoleColor(coHost.role)}>
                          {coHost.role}
                        </Badge>
                      </div>
                    </div>
                    <Badge className={getStatusColor(coHost.status)}>
                      {coHost.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-600">{coHost.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-600">{coHost.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-600">{coHost.properties.length} properties</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs mb-4">
                    <div className="text-center">
                      <p className="font-semibold">{coHost.performance.rating.toFixed(1)}</p>
                      <p className="text-gray-600">Rating</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">{coHost.performance.responseTime.toFixed(1)}h</p>
                      <p className="text-gray-600">Response</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">{coHost.performance.tasksCompleted}</p>
                      <p className="text-gray-600">Tasks</p>
                    </div>
                  </div>

                  <Separator className="mb-4" />

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Permissions</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(coHost.permissions).map(([permission, enabled]) => (
                        <div key={permission} className="flex items-center justify-between">
                          <span className="text-gray-600 capitalize">
                            {permission.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <Switch
                            checked={enabled}
                            onCheckedChange={(value) => 
                              handleUpdatePermissions(coHost.id, permission, value)
                            }
                            size="sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Property Calendar View</CardTitle>
              <CardDescription>
                View all your properties' bookings in one unified calendar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    {properties.map((property) => (
                      <Badge
                        key={property.id}
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-100"
                      >
                        {property.name}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Today
                    </Button>
                    <Button variant="outline" size="sm">
                      Week
                    </Button>
                    <Button variant="outline" size="sm">
                      Month
                    </Button>
                  </div>
                </div>

                <div className="bg-gray-50 p-8 rounded-lg text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Multi-property calendar view will be displayed here
                  </p>
                  <p className="text-sm text-gray-500">
                    This will show all bookings across all properties in a unified calendar interface
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Today's Check-ins</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Sea View Apartment</span>
                          <span>2 guests</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Mountain Villa</span>
                          <span>4 guests</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Today's Check-outs</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>City Studio</span>
                          <span>1 guest</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Maintenance Tasks</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>City Studio</span>
                          <span>Cleaning</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}