// src/components/listings/ListingForm.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Home,
  MapPin,
  DollarSign,
  Users,
  Bed,
  Bath,
  Calendar,
  Clock,
  Camera,
  Plus,
  X,
  Save,
  Eye,
  Wifi,
  Car,
  Coffee,
  Tv,
  Dog,
  Waves,
  Dumbbell,
  ChefHat,
  Snowflake,
  Shield,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ListingFormProps {
  initialData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

interface FormData {
  // Basic Info
  title: string;
  description: string;
  type: string;
  
  // Location
  address: string;
  city: string;
  province: string;
  postalCode: string;
  
  // Capacity
  guests: number;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  
  // Pricing
  basePrice: number;
  cleaningFee: number;
  extraGuestFee: number;
  weeklyDiscount: number;
  monthlyDiscount: number;
  
  // Amenities
  amenities: string[];
  
  // Availability
  minStay: number;
  maxStay: number;
  checkInTime: string;
  checkOutTime: string;
  instantBook: boolean;
  
  // House Rules
  smokingAllowed: boolean;
  petsAllowed: boolean;
  partiesAllowed: boolean;
  quietHours: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  
  // Images
  images: string[];
}

const AMENITY_OPTIONS = [
  { id: 'wifi', label: 'WiFi', icon: <Wifi className="h-4 w-4" /> },
  { id: 'kitchen', label: 'Kitchen', icon: <ChefHat className="h-4 w-4" /> },
  { id: 'parking', label: 'Free Parking', icon: <Car className="h-4 w-4" /> },
  { id: 'pool', label: 'Pool', icon: <Waves className="h-4 w-4" /> },
  { id: 'gym', label: 'Gym', icon: <Dumbbell className="h-4 w-4" /> },
  { id: 'ac', label: 'Air Conditioning', icon: <Snowflake className="h-4 w-4" /> },
  { id: 'tv', label: 'TV', icon: <Tv className="h-4 w-4" /> },
  { id: 'coffee', label: 'Coffee Machine', icon: <Coffee className="h-4 w-4" /> },
  { id: 'security', label: 'Security System', icon: <Shield className="h-4 w-4" /> },
  { id: 'generator', label: 'Backup Power', icon: <Zap className="h-4 w-4" /> }
];

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'villa', label: 'Villa' },
  { value: 'studio', label: 'Studio' },
  { value: 'room', label: 'Private Room' },
  { value: 'guesthouse', label: 'Guest House' },
  { value: 'cottage', label: 'Cottage' },
  { value: 'cabin', label: 'Cabin' }
];

const SA_PROVINCES = [
  'Western Cape',
  'Eastern Cape',
  'Northern Cape',
  'Free State',
  'KwaZulu-Natal',
  'North West',
  'Gauteng',
  'Mpumalanga',
  'Limpopo'
];

export const ListingForm: React.FC<ListingFormProps> = ({
  initialData,
  onSave,
  onCancel,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    type: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    guests: 1,
    bedrooms: 1,
    bathrooms: 1,
    beds: 1,
    basePrice: 500,
    cleaningFee: 100,
    extraGuestFee: 50,
    weeklyDiscount: 0,
    monthlyDiscount: 0,
    amenities: [],
    minStay: 1,
    maxStay: 30,
    checkInTime: '15:00',
    checkOutTime: '11:00',
    instantBook: false,
    smokingAllowed: false,
    petsAllowed: false,
    partiesAllowed: false,
    quietHours: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    images: [],
    ...initialData
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setSaving] = useState(false);
  const { toast } = useToast();

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (amenityId: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const addImage = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, imageUrl]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async (isDraft = false) => {
    setSaving(true);
    try {
      // Validate required fields
      if (!formData.title || !formData.type || !formData.city) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      await onSave({ ...formData, isDraft });
      
      toast({
        title: isDraft ? "Draft Saved" : "Listing Saved",
        description: isDraft 
          ? "Your listing has been saved as a draft" 
          : "Your listing has been saved successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save listing",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? 'Edit Listing' : 'Create New Listing'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Update your property details' : 'Add a new property to your portfolio'}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="outline" onClick={() => handleSave(true)}>
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button onClick={() => handleSave(false)} disabled={loading}>
            {loading ? "Saving..." : "Publish Listing"}
          </Button>
        </div>
      </div>

      {/* Form Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="amenities">Amenities</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Tell guests what makes your property special
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Property Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="e.g., Beautiful Ocean View Apartment"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="type">Property Type *</Label>
                <Select value={formData.type} onValueChange={(value) => updateField('type', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Describe your property, its features, and what makes it special..."
                  rows={4}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Location Tab */}
        <TabsContent value="location" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Location Details</CardTitle>
              <CardDescription>
                Help guests find your property
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="e.g., 123 Main Street"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="e.g., Cape Town"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="province">Province</Label>
                  <Select value={formData.province} onValueChange={(value) => updateField('province', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      {SA_PROVINCES.map((province) => (
                        <SelectItem key={province} value={province}>
                          {province}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => updateField('postalCode', e.target.value)}
                  placeholder="e.g., 8001"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
              <CardDescription>
                Specify capacity and room details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="guests">Max Guests</Label>
                  <div className="flex items-center mt-1">
                    <Users className="h-4 w-4 text-muted-foreground mr-2" />
                    <Input
                      id="guests"
                      type="number"
                      min="1"
                      max="20"
                      value={formData.guests}
                      onChange={(e) => updateField('guests', parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <div className="flex items-center mt-1">
                    <Bed className="h-4 w-4 text-muted-foreground mr-2" />
                    <Input
                      id="bedrooms"
                      type="number"
                      min="0"
                      max="10"
                      value={formData.bedrooms}
                      onChange={(e) => updateField('bedrooms', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <div className="flex items-center mt-1">
                    <Bath className="h-4 w-4 text-muted-foreground mr-2" />
                    <Input
                      id="bathrooms"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.bathrooms}
                      onChange={(e) => updateField('bathrooms', parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="beds">Total Beds</Label>
                  <div className="flex items-center mt-1">
                    <Bed className="h-4 w-4 text-muted-foreground mr-2" />
                    <Input
                      id="beds"
                      type="number"
                      min="1"
                      max="20"
                      value={formData.beds}
                      onChange={(e) => updateField('beds', parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-4">Booking Settings</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minStay">Minimum Stay (nights)</Label>
                    <Input
                      id="minStay"
                      type="number"
                      min="1"
                      max="30"
                      value={formData.minStay}
                      onChange={(e) => updateField('minStay', parseInt(e.target.value) || 1)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxStay">Maximum Stay (nights)</Label>
                    <Input
                      id="maxStay"
                      type="number"
                      min="1"
                      max="365"
                      value={formData.maxStay}
                      onChange={(e) => updateField('maxStay', parseInt(e.target.value) || 30)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="checkInTime">Check-in Time</Label>
                    <Input
                      id="checkInTime"
                      type="time"
                      value={formData.checkInTime}
                      onChange={(e) => updateField('checkInTime', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="checkOutTime">Check-out Time</Label>
                    <Input
                      id="checkOutTime"
                      type="time"
                      value={formData.checkOutTime}
                      onChange={(e) => updateField('checkOutTime', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div>
                    <Label htmlFor="instantBook">Enable Instant Book</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow guests to book without approval
                    </p>
                  </div>
                  <Switch
                    id="instantBook"
                    checked={formData.instantBook}
                    onCheckedChange={(checked) => updateField('instantBook', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Fees</CardTitle>
              <CardDescription>
                Set your rates and additional fees
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="basePrice">Base Price per Night (ZAR)</Label>
                  <div className="flex items-center mt-1">
                    <DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
                    <Input
                      id="basePrice"
                      type="number"
                      min="0"
                      step="50"
                      value={formData.basePrice}
                      onChange={(e) => updateField('basePrice', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your nightly rate before fees and taxes
                  </p>
                </div>

                <div>
                  <Label htmlFor="cleaningFee">Cleaning Fee (ZAR)</Label>
                  <Input
                    id="cleaningFee"
                    type="number"
                    min="0"
                    step="25"
                    value={formData.cleaningFee}
                    onChange={(e) => updateField('cleaningFee', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    One-time cleaning fee
                  </p>
                </div>

                <div>
                  <Label htmlFor="extraGuestFee">Extra Guest Fee (ZAR)</Label>
                  <Input
                    id="extraGuestFee"
                    type="number"
                    min="0"
                    step="25"
                    value={formData.extraGuestFee}
                    onChange={(e) => updateField('extraGuestFee', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Per night, per guest above base capacity
                  </p>
                </div>

                <div>
                  <Label htmlFor="weeklyDiscount">Weekly Discount (%)</Label>
                  <Input
                    id="weeklyDiscount"
                    type="number"
                    min="0"
                    max="50"
                    value={formData.weeklyDiscount}
                    onChange={(e) => updateField('weeklyDiscount', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    For stays of 7+ nights
                  </p>
                </div>
              </div>

              <Separator />

              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Pricing Preview</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Base price (per night)</span>
                    <span>{formatCurrency(formData.basePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cleaning fee</span>
                    <span>{formatCurrency(formData.cleaningFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Extra guest fee</span>
                    <span>{formatCurrency(formData.extraGuestFee)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total for 2 nights, 2 guests</span>
                    <span>{formatCurrency((formData.basePrice * 2) + formData.cleaningFee)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Amenities Tab */}
        <TabsContent value="amenities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Property Amenities</CardTitle>
              <CardDescription>
                Select all amenities available to guests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {AMENITY_OPTIONS.map((amenity) => (
                  <div
                    key={amenity.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      formData.amenities.includes(amenity.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => toggleAmenity(amenity.id)}
                  >
                    <div className="flex items-center space-x-3">
                      {amenity.icon}
                      <span className="text-sm font-medium">{amenity.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              {formData.amenities.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Selected Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.amenities.map((amenityId) => {
                      const amenity = AMENITY_OPTIONS.find(a => a.id === amenityId);
                      return amenity ? (
                        <Badge key={amenityId} variant="secondary">
                          {amenity.label}
                          <X
                            className="h-3 w-3 ml-2 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleAmenity(amenityId);
                            }}
                          />
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* House Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>House Rules & Policies</CardTitle>
              <CardDescription>
                Set clear expectations for your guests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Smoking Allowed</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow smoking inside the property
                    </p>
                  </div>
                  <Switch
                    checked={formData.smokingAllowed}
                    onCheckedChange={(checked) => updateField('smokingAllowed', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Pets Allowed</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow guests to bring pets
                    </p>
                  </div>
                  <Switch
                    checked={formData.petsAllowed}
                    onCheckedChange={(checked) => updateField('petsAllowed', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Parties/Events Allowed</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow parties and events
                    </p>
                  </div>
                  <Switch
                    checked={formData.partiesAllowed}
                    onCheckedChange={(checked) => updateField('partiesAllowed', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Quiet Hours</Label>
                    <p className="text-sm text-muted-foreground">
                      Enforce quiet hours for noise control
                    </p>
                  </div>
                  <Switch
                    checked={formData.quietHours}
                    onCheckedChange={(checked) => updateField('quietHours', checked)}
                  />
                </div>

                {formData.quietHours && (
                  <div className="grid grid-cols-2 gap-4 ml-6">
                    <div>
                      <Label htmlFor="quietHoursStart">Start Time</Label>
                      <Input
                        id="quietHoursStart"
                        type="time"
                        value={formData.quietHoursStart}
                        onChange={(e) => updateField('quietHoursStart', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="quietHoursEnd">End Time</Label>
                      <Input
                        id="quietHoursEnd"
                        type="time"
                        value={formData.quietHoursEnd}
                        onChange={(e) => updateField('quietHoursEnd', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ListingForm;