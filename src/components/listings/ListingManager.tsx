// src/components/listings/ListingManager.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Eye,
  Trash2,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Star,
  Home,
  MoreHorizontal,
  Copy,
  Share,
  Settings,
  BarChart3,
  Camera,
  Wifi,
  Car,
  Coffee,
  Tv,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

// Types
interface Listing {
  id: string;
  title: string;
  description: string;
  type: 'apartment' | 'house' | 'villa' | 'studio' | 'room';
  location: {
    address: string;
    city: string;
    province: string;
    postalCode: string;
    coordinates: { lat: number; lng: number };
  };
  pricing: {
    basePrice: number;
    cleaningFee: number;
    extraGuestFee: number;
    currency: 'ZAR';
  };
  capacity: {
    guests: number;
    bedrooms: number;
    bathrooms: number;
    beds: number;
  };
  amenities: string[];
  images: string[];
  availability: {
    minStay: number;
    maxStay: number;
    checkInTime: string;
    checkOutTime: string;
    instantBook: boolean;
  };
  status: 'active' | 'inactive' | 'draft' | 'pending_approval';
  performance: {
    views: number;
    bookings: number;
    revenue: number;
    occupancyRate: number;
    averageRating: number;
    reviewCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface ListingManagerProps {
  ownerId: string;
}

export const ListingManager: React.FC<ListingManagerProps> = ({ ownerId }) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Listing['status']>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | Listing['type']>('all');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('grid');
  const { toast } = useToast();

  // Mock data - replace with API calls
  useEffect(() => {
    const mockListings: Listing[] = [
      {
        id: '1',
        title: 'Ocean View Penthouse',
        description: 'Luxury penthouse with panoramic ocean views and modern amenities',
        type: 'apartment',
        location: {
          address: '123 Beach Road',
          city: 'Cape Town',
          province: 'Western Cape',
          postalCode: '8001',
          coordinates: { lat: -33.9249, lng: 18.4241 }
        },
        pricing: {
          basePrice: 1850,
          cleaningFee: 250,
          extraGuestFee: 150,
          currency: 'ZAR'
        },
        capacity: {
          guests: 4,
          bedrooms: 2,
          bathrooms: 2,
          beds: 2
        },
        amenities: ['WiFi', 'Kitchen', 'Pool', 'Balcony', 'Parking', 'AC'],
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
        ],
        availability: {
          minStay: 2,
          maxStay: 30,
          checkInTime: '15:00',
          checkOutTime: '11:00',
          instantBook: true
        },
        status: 'active',
        performance: {
          views: 1247,
          bookings: 45,
          revenue: 83250,
          occupancyRate: 78,
          averageRating: 4.8,
          reviewCount: 34
        },
        createdAt: new Date('2025-01-15'),
        updatedAt: new Date('2025-07-20')
      },
      {
        id: '2',
        title: 'Mountain Cabin Retreat',
        description: 'Cozy mountain cabin perfect for nature lovers and weekend getaways',
        type: 'house',
        location: {
          address: '456 Mountain Road',
          city: 'Stellenbosch',
          province: 'Western Cape',
          postalCode: '7600',
          coordinates: { lat: -33.9321, lng: 18.8602 }
        },
        pricing: {
          basePrice: 1200,
          cleaningFee: 180,
          extraGuestFee: 100,
          currency: 'ZAR'
        },
        capacity: {
          guests: 6,
          bedrooms: 3,
          bathrooms: 1,
          beds: 3
        },
        amenities: ['WiFi', 'Kitchen', 'Fireplace', 'Garden', 'Braai'],
        images: [
          'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800'
        ],
        availability: {
          minStay: 1,
          maxStay: 14,
          checkInTime: '16:00',
          checkOutTime: '10:00',
          instantBook: false
        },
        status: 'active',
        performance: {
          views: 892,
          bookings: 28,
          revenue: 33600,
          occupancyRate: 65,
          averageRating: 4.6,
          reviewCount: 22
        },
        createdAt: new Date('2025-02-10'),
        updatedAt: new Date('2025-07-18')
      },
      {
        id: '3',
        title: 'City Center Loft',
        description: 'Modern loft in the heart of the city with easy access to attractions',
        type: 'apartment',
        location: {
          address: '789 Long Street',
          city: 'Cape Town',
          province: 'Western Cape',
          postalCode: '8001',
          coordinates: { lat: -33.9188, lng: 18.4231 }
        },
        pricing: {
          basePrice: 950,
          cleaningFee: 150,
          extraGuestFee: 80,
          currency: 'ZAR'
        },
        capacity: {
          guests: 2,
          bedrooms: 1,
          bathrooms: 1,
          beds: 1
        },
        amenities: ['WiFi', 'Kitchen', 'Elevator', 'City View'],
        images: [
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
        ],
        availability: {
          minStay: 1,
          maxStay: 21,
          checkInTime: '15:00',
          checkOutTime: '11:00',
          instantBook: true
        },
        status: 'draft',
        performance: {
          views: 0,
          bookings: 0,
          revenue: 0,
          occupancyRate: 0,
          averageRating: 0,
          reviewCount: 0
        },
        createdAt: new Date('2025-07-15'),
        updatedAt: new Date('2025-07-20')
      }
    ];

    setListings(mockListings);
    setFilteredListings(mockListings);
    setLoading(false);
  }, []);

  // Filter listings based on search and filters
  useEffect(() => {
    let filtered = listings;

    if (searchQuery) {
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.location.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(listing => listing.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(listing => listing.type === typeFilter);
    }

    setFilteredListings(filtered);
  }, [listings, searchQuery, statusFilter, typeFilter]);

  const getStatusBadge = (status: Listing['status']) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      draft: 'bg-yellow-100 text-yellow-800',
      pending_approval: 'bg-blue-100 text-blue-800'
    };

    return (
      <Badge className={colors[status]}>
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
      </Badge>
    );
  };

  const getTypeIcon = (type: Listing['type']) => {
    const icons = {
      apartment: <Home className="h-4 w-4" />,
      house: <Home className="h-4 w-4" />,
      villa: <Home className="h-4 w-4" />,
      studio: <Home className="h-4 w-4" />,
      room: <Home className="h-4 w-4" />
    };
    return icons[type];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const duplicateListing = async (listingId: string) => {
    try {
      // API call to duplicate listing
      toast({
        title: "Listing duplicated",
        description: "A copy of your listing has been created as a draft."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate listing",
        variant: "destructive"
      });
    }
  };

  const toggleListingStatus = async (listingId: string) => {
    try {
      // API call to toggle status
      const listing = listings.find(l => l.id === listingId);
      const newStatus = listing?.status === 'active' ? 'inactive' : 'active';
      
      setListings(prev => prev.map(l => 
        l.id === listingId ? { ...l, status: newStatus as Listing['status'] } : l
      ));

      toast({
        title: "Status updated",
        description: `Listing is now ${newStatus}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update listing status",
        variant: "destructive"
      });
    }
  };

  const deleteListing = async (listingId: string) => {
    try {
      // API call to delete listing
      setListings(prev => prev.filter(l => l.id !== listingId));
      toast({
        title: "Listing deleted",
        description: "The listing has been permanently removed"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete listing",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Listing Management</h1>
          <p className="text-muted-foreground">
            Manage your properties, track performance, and optimize bookings
          </p>
        </div>
        
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Listing
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search listings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending_approval">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="studio">Studio</SelectItem>
                <SelectItem value="room">Room</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Listings</p>
                <p className="text-2xl font-bold">{listings.length}</p>
              </div>
              <Home className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Listings</p>
                <p className="text-2xl font-bold">
                  {listings.filter(l => l.status === 'active').length}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(listings.reduce((sum, l) => sum + l.performance.revenue, 0))}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">
                  {(listings.reduce((sum, l) => sum + l.performance.averageRating, 0) / listings.length).toFixed(1)}
                </p>
              </div>
              <Star className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listings Grid */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredListings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden">
                <div className="relative">
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(listing.status)}
                  </div>
                  <div className="absolute top-2 left-2">
                    <Badge variant="outline" className="bg-white/90">
                      {getTypeIcon(listing.type)}
                      <span className="ml-1">{listing.type}</span>
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1">{listing.title}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        {listing.location.city}, {listing.location.province}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {listing.capacity.guests}
                        </span>
                        <span>{listing.capacity.bedrooms} bed</span>
                        <span>{listing.capacity.bathrooms} bath</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold">
                          {formatCurrency(listing.pricing.basePrice)}
                        </span>
                        <span className="text-sm text-muted-foreground">/night</span>
                      </div>
                      {listing.performance.averageRating > 0 && (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="text-sm font-medium">
                            {listing.performance.averageRating}
                          </span>
                          <span className="text-sm text-muted-foreground ml-1">
                            ({listing.performance.reviewCount})
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedListing(listing)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => duplicateListing(listing.id)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleListingStatus(listing.id)}
                        >
                          {listing.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredListings.map((listing) => (
                  <div key={listing.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <h3 className="font-semibold">{listing.title}</h3>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 mr-1" />
                            {listing.location.city}, {listing.location.province}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                            <span>{listing.capacity.guests} guests</span>
                            <span>{listing.capacity.bedrooms} bed</span>
                            <span>{listing.capacity.bathrooms} bath</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Price</div>
                          <div className="font-semibold">
                            {formatCurrency(listing.pricing.basePrice)}
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Revenue</div>
                          <div className="font-semibold">
                            {formatCurrency(listing.performance.revenue)}
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Rating</div>
                          <div className="font-semibold">
                            {listing.performance.averageRating || 'N/A'}
                          </div>
                        </div>

                        <div>{getStatusBadge(listing.status)}</div>

                        <div className="flex items-center space-x-2">
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Listing Detail Modal */}
      {selectedListing && (
        <Dialog open={!!selectedListing} onOpenChange={() => setSelectedListing(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedListing.title}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid gap-4">
                <img
                  src={selectedListing.images[0]}
                  alt={selectedListing.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Property Details</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Type:</strong> {selectedListing.type}</p>
                      <p><strong>Guests:</strong> {selectedListing.capacity.guests}</p>
                      <p><strong>Bedrooms:</strong> {selectedListing.capacity.bedrooms}</p>
                      <p><strong>Bathrooms:</strong> {selectedListing.capacity.bathrooms}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Location</h4>
                    <div className="text-sm">
                      <p>{selectedListing.location.address}</p>
                      <p>{selectedListing.location.city}, {selectedListing.location.province} {selectedListing.location.postalCode}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedListing.amenities.map((amenity, index) => (
                        <Badge key={index} variant="outline">{amenity}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Pricing</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Base Price:</strong> {formatCurrency(selectedListing.pricing.basePrice)}/night</p>
                      <p><strong>Cleaning Fee:</strong> {formatCurrency(selectedListing.pricing.cleaningFee)}</p>
                      <p><strong>Extra Guest Fee:</strong> {formatCurrency(selectedListing.pricing.extraGuestFee)}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Performance</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Views:</strong> {selectedListing.performance.views.toLocaleString()}</p>
                      <p><strong>Bookings:</strong> {selectedListing.performance.bookings}</p>
                      <p><strong>Revenue:</strong> {formatCurrency(selectedListing.performance.revenue)}</p>
                      <p><strong>Occupancy Rate:</strong> {selectedListing.performance.occupancyRate}%</p>
                      {selectedListing.performance.averageRating > 0 && (
                        <p><strong>Rating:</strong> {selectedListing.performance.averageRating}/5 ({selectedListing.performance.reviewCount} reviews)</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Availability</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Min Stay:</strong> {selectedListing.availability.minStay} nights</p>
                      <p><strong>Max Stay:</strong> {selectedListing.availability.maxStay} nights</p>
                      <p><strong>Check-in:</strong> {selectedListing.availability.checkInTime}</p>
                      <p><strong>Check-out:</strong> {selectedListing.availability.checkOutTime}</p>
                      <p><strong>Instant Book:</strong> {selectedListing.availability.instantBook ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ListingManager;