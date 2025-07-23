// src/components/search/AdvancedPropertySearch.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Search,
  Filter,
  MapPin,
  Calendar as CalendarIcon,
  Users,
  Bed,
  Bath,
  Wifi,
  Car,
  Coffee,
  Tv,
  AirVent,
  Utensils,
  Waves,
  Dumbbell,
  PawPrint,
  Cigarette,
  Baby,
  Accessibility,
  Star,
  DollarSign,
  Clock,
  Zap,
  Eye,
  RotateCcw,
  Download,
  Share2,
  Bookmark,
  X,
  ChevronDown,
  ChevronUp,
  Grid,
  List,
  Map,
  SlidersHorizontal
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { toast } from 'sonner';

interface SearchFilters {
  location: string;
  dateRange: DateRange | undefined;
  guests: number;
  priceRange: [number, number];
  bedrooms: number;
  bathrooms: number;
  propertyTypes: string[];
  amenities: string[];
  houseRules: {
    smokingAllowed: boolean;
    petsAllowed: boolean;
    partiesAllowed: boolean;
    childrenWelcome: boolean;
  };
  hostLanguages: string[];
  instantBooking: boolean;
  superhost: boolean;
  newListing: boolean;
  accessibility: string[];
  rating: number;
  radius: number;
  sortBy: string;
  viewType: 'grid' | 'list' | 'map';
}

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  guests: number;
  propertyType: string;
  amenities: string[];
  hostLanguages: string[];
  instantBooking: boolean;
  superhost: boolean;
  newListing: boolean;
  coordinates: { lat: number; lng: number };
  houseRules: {
    smokingAllowed: boolean;
    petsAllowed: boolean;
    partiesAllowed: boolean;
    childrenWelcome: boolean;
  };
  accessibility: string[];
}

interface AdvancedPropertySearchProps {
  onSearchResults?: (results: Property[]) => void;
  onFiltersChange?: (filters: SearchFilters) => void;
  className?: string;
}

const PROPERTY_TYPES = [
  'Apartment', 'House', 'Villa', 'Townhouse', 'Cottage', 'Loft', 
  'Studio', 'Guest House', 'Bed & Breakfast', 'Boutique Hotel'
];

const AMENITIES = [
  { key: 'wifi', icon: <Wifi className="h-4 w-4" />, label: 'WiFi' },
  { key: 'parking', icon: <Car className="h-4 w-4" />, label: 'Free Parking' },
  { key: 'kitchen', icon: <Utensils className="h-4 w-4" />, label: 'Kitchen' },
  { key: 'washer', icon: <Coffee className="h-4 w-4" />, label: 'Washer' },
  { key: 'tv', icon: <Tv className="h-4 w-4" />, label: 'TV' },
  { key: 'ac', icon: <AirVent className="h-4 w-4" />, label: 'Air Conditioning' },
  { key: 'pool', icon: <Waves className="h-4 w-4" />, label: 'Pool' },
  { key: 'gym', icon: <Dumbbell className="h-4 w-4" />, label: 'Gym' },
  { key: 'breakfast', icon: <Coffee className="h-4 w-4" />, label: 'Breakfast' },
  { key: 'workspace', icon: <Coffee className="h-4 w-4" />, label: 'Workspace' }
];

const ACCESSIBILITY_OPTIONS = [
  'Wheelchair Accessible',
  'Step-free Access',
  'Wide Doorways',
  'Accessible Bathroom',
  'Elevator Access',
  'Accessible Parking'
];

const HOST_LANGUAGES = [
  'English', 'Afrikaans', 'Zulu', 'Xhosa', 'Portuguese', 
  'French', 'German', 'Spanish', 'Italian', 'Dutch'
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Best Match' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'reviews', label: 'Most Reviews' },
  { value: 'newest', label: 'Newest First' },
  { value: 'distance', label: 'Distance' }
];

export const AdvancedPropertySearch: React.FC<AdvancedPropertySearchProps> = ({
  onSearchResults,
  onFiltersChange,
  className = ''
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    dateRange: undefined,
    guests: 1,
    priceRange: [100, 2000],
    bedrooms: 0,
    bathrooms: 0,
    propertyTypes: [],
    amenities: [],
    houseRules: {
      smokingAllowed: false,
      petsAllowed: false,
      partiesAllowed: false,
      childrenWelcome: true
    },
    hostLanguages: [],
    instantBooking: false,
    superhost: false,
    newListing: false,
    accessibility: [],
    rating: 0,
    radius: 25,
    sortBy: 'relevance',
    viewType: 'grid'
  });

  const [searchResults, setSearchResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (filters.location || filters.dateRange) {
        performSearch();
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [filters]);

  useEffect(() => {
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);

  const performSearch = useCallback(async () => {
    try {
      setLoading(true);
      
      // Mock API call - replace with real search API
      const mockResults: Property[] = Array.from({ length: 20 }, (_, i) => ({
        id: `prop-${i}`,
        title: `Beautiful Property ${i + 1}`,
        location: `${filters.location || 'Cape Town'}, South Africa`,
        price: Math.floor(Math.random() * 1500) + 300,
        rating: 4 + Math.random(),
        reviews: Math.floor(Math.random() * 200) + 10,
        images: [`/api/placeholder/300/200?${i}`],
        bedrooms: Math.floor(Math.random() * 4) + 1,
        bathrooms: Math.floor(Math.random() * 3) + 1,
        guests: Math.floor(Math.random() * 8) + 2,
        propertyType: PROPERTY_TYPES[Math.floor(Math.random() * PROPERTY_TYPES.length)],
        amenities: AMENITIES.slice(0, Math.floor(Math.random() * 6) + 2).map(a => a.key),
        hostLanguages: HOST_LANGUAGES.slice(0, Math.floor(Math.random() * 3) + 1),
        instantBooking: Math.random() > 0.5,
        superhost: Math.random() > 0.7,
        newListing: Math.random() > 0.8,
        coordinates: { 
          lat: -33.9249 + (Math.random() - 0.5) * 0.1, 
          lng: 18.4241 + (Math.random() - 0.5) * 0.1 
        },
        houseRules: {
          smokingAllowed: Math.random() > 0.8,
          petsAllowed: Math.random() > 0.7,
          partiesAllowed: Math.random() > 0.9,
          childrenWelcome: Math.random() > 0.3
        },
        accessibility: Math.random() > 0.7 ? ACCESSIBILITY_OPTIONS.slice(0, Math.floor(Math.random() * 3)) : []
      }));

      // Apply filters
      let filteredResults = mockResults.filter(property => {
        // Price filter
        if (property.price < filters.priceRange[0] || property.price > filters.priceRange[1]) {
          return false;
        }

        // Bedrooms filter
        if (filters.bedrooms > 0 && property.bedrooms < filters.bedrooms) {
          return false;
        }

        // Bathrooms filter
        if (filters.bathrooms > 0 && property.bathrooms < filters.bathrooms) {
          return false;
        }

        // Guests filter
        if (property.guests < filters.guests) {
          return false;
        }

        // Property type filter
        if (filters.propertyTypes.length > 0 && !filters.propertyTypes.includes(property.propertyType)) {
          return false;
        }

        // Amenities filter
        if (filters.amenities.length > 0 && !filters.amenities.every(amenity => 
          property.amenities.includes(amenity)
        )) {
          return false;
        }

        // Rating filter
        if (filters.rating > 0 && property.rating < filters.rating) {
          return false;
        }

        // Instant booking filter
        if (filters.instantBooking && !property.instantBooking) {
          return false;
        }

        // Superhost filter
        if (filters.superhost && !property.superhost) {
          return false;
        }

        // New listing filter
        if (filters.newListing && !property.newListing) {
          return false;
        }

        return true;
      });

      // Sort results
      filteredResults = filteredResults.sort((a, b) => {
        switch (filters.sortBy) {
          case 'price_low':
            return a.price - b.price;
          case 'price_high':
            return b.price - a.price;
          case 'rating':
            return b.rating - a.rating;
          case 'reviews':
            return b.reviews - a.reviews;
          default:
            return 0;
        }
      });

      setSearchResults(filteredResults);
      onSearchResults?.(filteredResults);

      // Add to search history
      if (filters.location && !searchHistory.includes(filters.location)) {
        setSearchHistory(prev => [filters.location, ...prev.slice(0, 4)]);
      }

    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters, onSearchResults, searchHistory]);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleAmenity = (amenity: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const togglePropertyType = (type: string) => {
    setFilters(prev => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter(t => t !== type)
        : [...prev.propertyTypes, type]
    }));
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      dateRange: undefined,
      guests: 1,
      priceRange: [100, 2000],
      bedrooms: 0,
      bathrooms: 0,
      propertyTypes: [],
      amenities: [],
      houseRules: {
        smokingAllowed: false,
        petsAllowed: false,
        partiesAllowed: false,
        childrenWelcome: true
      },
      hostLanguages: [],
      instantBooking: false,
      superhost: false,
      newListing: false,
      accessibility: [],
      rating: 0,
      radius: 25,
      sortBy: 'relevance',
      viewType: 'grid'
    });
  };

  const saveSearch = () => {
    const searchName = prompt('Name this search:');
    if (searchName) {
      const savedSearch = {
        id: Date.now().toString(),
        name: searchName,
        filters: { ...filters },
        createdAt: new Date().toISOString()
      };
      setSavedSearches(prev => [...prev, savedSearch]);
      toast.success('Search saved successfully');
    }
  };

  const loadSavedSearch = (savedSearch: any) => {
    setFilters(savedSearch.filters);
    toast.success(`Loaded search: ${savedSearch.name}`);
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => updateFilter('rating', star === filters.rating ? 0 : star)}
            className={`h-5 w-5 ${
              star <= filters.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          >
            <Star className="h-5 w-5" />
          </button>
        ))}
        <span className="text-sm text-gray-600 ml-2">
          {filters.rating > 0 ? `${filters.rating}+ stars` : 'Any rating'}
        </span>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Search Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-4">
            {/* Location */}
            <div className="space-y-2">
              <Label>Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Where are you going?"
                  value={filters.location}
                  onChange={(e) => updateFilter('location', e.target.value)}
                  className="pl-10"
                />
              </div>
              {searchHistory.length > 0 && filters.location === '' && (
                <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1">
                  {searchHistory.map((location, index) => (
                    <button
                      key={index}
                      onClick={() => updateFilter('location', location)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                    >
                      <MapPin className="h-3 w-3 inline mr-2" />
                      {location}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="space-y-2">
              <Label>Dates</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {filters.dateRange?.from ? (
                      filters.dateRange.to ? (
                        <>
                          {format(filters.dateRange.from, "LLL dd")} -{" "}
                          {format(filters.dateRange.to, "LLL dd")}
                        </>
                      ) : (
                        format(filters.dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      "Select dates"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={filters.dateRange}
                    onSelect={(range) => updateFilter('dateRange', range)}
                    numberOfMonths={2}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Guests */}
            <div className="space-y-2">
              <Label>Guests</Label>
              <Select value={filters.guests.toString()} onValueChange={(value) => updateFilter('guests', parseInt(value))}>
                <SelectTrigger>
                  <Users className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} guest{num !== 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search Button */}
            <div className="space-y-2">
              <Label className="invisible">Search</Label>
              <Button onClick={performSearch} disabled={loading} className="w-full">
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Search
              </Button>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <Button
              variant="ghost"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Advanced Filters</span>
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            <div className="flex items-center space-x-2">
              {/* View Type Toggle */}
              <div className="flex border rounded-md">
                <Button
                  variant={filters.viewType === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => updateFilter('viewType', 'grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={filters.viewType === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => updateFilter('viewType', 'list')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={filters.viewType === 'map' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => updateFilter('viewType', 'map')}
                >
                  <Map className="h-4 w-4" />
                </Button>
              </div>

              {/* Sort */}
              <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Actions */}
              <Button variant="outline" size="sm" onClick={saveSearch}>
                <Bookmark className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showAdvanced && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Advanced Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Price Range */}
              <div className="space-y-3">
                <Label>Price Range (per night)</Label>
                <div className="px-3">
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
                    max={3000}
                    min={50}
                    step={50}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>R{filters.priceRange[0]}</span>
                    <span>R{filters.priceRange[1]}+</span>
                  </div>
                </div>
              </div>

              {/* Bedrooms */}
              <div className="space-y-3">
                <Label>Bedrooms</Label>
                <Select value={filters.bedrooms.toString()} onValueChange={(value) => updateFilter('bedrooms', parseInt(value))}>
                  <SelectTrigger>
                    <Bed className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Any</SelectItem>
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}+ bedroom{num !== 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bathrooms */}
              <div className="space-y-3">
                <Label>Bathrooms</Label>
                <Select value={filters.bathrooms.toString()} onValueChange={(value) => updateFilter('bathrooms', parseInt(value))}>
                  <SelectTrigger>
                    <Bath className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Any</SelectItem>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}+ bathroom{num !== 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Property Types */}
            <div className="space-y-3">
              <Label>Property Types</Label>
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {PROPERTY_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => togglePropertyType(type)}
                    className={`p-3 rounded-md border text-sm transition-colors ${
                      filters.propertyTypes.includes(type)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-3">
              <Label>Amenities</Label>
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {AMENITIES.map((amenity) => (
                  <button
                    key={amenity.key}
                    onClick={() => toggleAmenity(amenity.key)}
                    className={`p-3 rounded-md border text-sm transition-colors flex items-center space-x-2 ${
                      filters.amenities.includes(amenity.key)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {amenity.icon}
                    <span>{amenity.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* House Rules */}
            <div className="space-y-3">
              <Label>House Rules</Label>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pets"
                    checked={filters.houseRules.petsAllowed}
                    onCheckedChange={(checked) => 
                      updateFilter('houseRules', { ...filters.houseRules, petsAllowed: checked })
                    }
                  />
                  <Label htmlFor="pets" className="flex items-center space-x-2">
                    <PawPrint className="h-4 w-4" />
                    <span>Pets Allowed</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="smoking"
                    checked={filters.houseRules.smokingAllowed}
                    onCheckedChange={(checked) => 
                      updateFilter('houseRules', { ...filters.houseRules, smokingAllowed: checked })
                    }
                  />
                  <Label htmlFor="smoking" className="flex items-center space-x-2">
                    <Cigarette className="h-4 w-4" />
                    <span>Smoking Allowed</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="children"
                    checked={filters.houseRules.childrenWelcome}
                    onCheckedChange={(checked) => 
                      updateFilter('houseRules', { ...filters.houseRules, childrenWelcome: checked })
                    }
                  />
                  <Label htmlFor="children" className="flex items-center space-x-2">
                    <Baby className="h-4 w-4" />
                    <span>Children Welcome</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="parties"
                    checked={filters.houseRules.partiesAllowed}
                    onCheckedChange={(checked) => 
                      updateFilter('houseRules', { ...filters.houseRules, partiesAllowed: checked })
                    }
                  />
                  <Label htmlFor="parties" className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Parties Allowed</span>
                  </Label>
                </div>
              </div>
            </div>

            {/* Host Features */}
            <div className="space-y-3">
              <Label>Host Features</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={filters.instantBooking}
                    onCheckedChange={(checked) => updateFilter('instantBooking', checked)}
                  />
                  <Label className="flex items-center space-x-2">
                    <Zap className="h-4 w-4" />
                    <span>Instant Booking</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={filters.superhost}
                    onCheckedChange={(checked) => updateFilter('superhost', checked)}
                  />
                  <Label className="flex items-center space-x-2">
                    <Star className="h-4 w-4" />
                    <span>Superhost</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={filters.newListing}
                    onCheckedChange={(checked) => updateFilter('newListing', checked)}
                  />
                  <Label className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>New Listing</span>
                  </Label>
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="space-y-3">
              <Label>Minimum Rating</Label>
              {renderStarRating(filters.rating)}
            </div>

            {/* Accessibility */}
            <div className="space-y-3">
              <Label>Accessibility Features</Label>
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                {ACCESSIBILITY_OPTIONS.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature}
                      checked={filters.accessibility.includes(feature)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilter('accessibility', [...filters.accessibility, feature]);
                        } else {
                          updateFilter('accessibility', filters.accessibility.filter(f => f !== feature));
                        }
                      }}
                    />
                    <Label htmlFor={feature} className="flex items-center space-x-2">
                      <Accessibility className="h-4 w-4" />
                      <span className="text-sm">{feature}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results Summary */}
      {searchResults.length > 0 && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {searchResults.length} propert{searchResults.length !== 1 ? 'ies' : 'y'} found
            </h3>
            {filters.location && (
              <p className="text-sm text-muted-foreground">in {filters.location}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share Search
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Results
            </Button>
          </div>
        </div>
      )}

      {/* Active Filters */}
      {(filters.propertyTypes.length > 0 || filters.amenities.length > 0 || filters.rating > 0 || 
        filters.instantBooking || filters.superhost || filters.newListing) && (
        <div className="flex flex-wrap gap-2">
          {filters.propertyTypes.map((type) => (
            <Badge key={type} variant="secondary" className="flex items-center space-x-1">
              <span>{type}</span>
              <button onClick={() => togglePropertyType(type)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.amenities.map((amenity) => (
            <Badge key={amenity} variant="secondary" className="flex items-center space-x-1">
              <span>{AMENITIES.find(a => a.key === amenity)?.label}</span>
              <button onClick={() => toggleAmenity(amenity)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.rating > 0 && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>{filters.rating}+ stars</span>
              <button onClick={() => updateFilter('rating', 0)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.instantBooking && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Instant Booking</span>
              <button onClick={() => updateFilter('instantBooking', false)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.superhost && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Superhost</span>
              <button onClick={() => updateFilter('superhost', false)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.newListing && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>New Listing</span>
              <button onClick={() => updateFilter('newListing', false)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Saved Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {savedSearches.map((savedSearch) => (
                <Button
                  key={savedSearch.id}
                  variant="outline"
                  size="sm"
                  onClick={() => loadSavedSearch(savedSearch)}
                  className="flex items-center space-x-2"
                >
                  <Bookmark className="h-3 w-3" />
                  <span>{savedSearch.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedPropertySearch;