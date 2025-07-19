// File: src/components/properties/PropertyForm.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, MapPin, DollarSign, Users, Clock, Shield, Loader2 } from 'lucide-react';
import axios from 'axios';

const propertySchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  property_type: z.string().min(1, 'Please select a property type'),
  address_line1: z.string().min(5, 'Address is required'),
  address_line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  province: z.string().min(1, 'Province is required'),
  postal_code: z.string().min(4, 'Postal code is required'),
  max_guests: z.number().min(1, 'At least 1 guest required').max(20, 'Maximum 20 guests'),
  bedrooms: z.number().min(0, 'Bedrooms cannot be negative'),
  bathrooms: z.number().min(0.5, 'At least 0.5 bathrooms required'),
  base_price: z.number().min(50, 'Minimum price is R50 per night'),
  cleaning_fee: z.number().min(0, 'Cleaning fee cannot be negative').optional(),
  extra_guest_fee: z.number().min(0, 'Extra guest fee cannot be negative').optional(),
  minimum_stay: z.number().min(1, 'Minimum stay is 1 night'),
  maximum_stay: z.number().max(365, 'Maximum stay is 365 nights'),
  check_in_time: z.string(),
  check_out_time: z.string(),
  house_rules: z.string().optional(),
  instant_book: z.boolean(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

interface Amenity {
  id: number;
  name: string;
  icon: string;
  category: string;
}

interface PropertyFormProps {
  propertyId?: number;
  onSuccess?: (property: any) => void;
  onCancel?: () => void;
}

export function PropertyForm({ propertyId, onSuccess, onCancel }: PropertyFormProps) {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(!!propertyId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      instant_book: true,
      minimum_stay: 1,
      maximum_stay: 365,
      check_in_time: '15:00',
      check_out_time: '11:00',
      cleaning_fee: 0,
      extra_guest_fee: 0,
    }
  });

  useEffect(() => {
    fetchAmenities();
    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  const fetchAmenities = async () => {
    try {
      const response = await axios.get('/amenities');
      setAmenities(response.data);
    } catch (error) {
      console.error('Failed to fetch amenities:', error);
    }
  };

  const fetchProperty = async () => {
    if (!propertyId) return;
    
    try {
      setIsLoadingData(true);
      const response = await axios.get(`/properties/${propertyId}`);
      const property = response.data;
      
      // Reset form with property data
      reset({
        ...property,
        base_price: Number(property.base_price),
        cleaning_fee: Number(property.cleaning_fee || 0),
        extra_guest_fee: Number(property.extra_guest_fee || 0),
      });
      
      setSelectedAmenities(property.amenities?.map((a: any) => a.id) || []);
      if (property.images) {
        setImagePreview(property.images);
      }
    } catch (error) {
      setError('Failed to load property data');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const totalImages = images.length + files.length;
    
    if (totalImages > 10) {
      setError('Maximum 10 images allowed');
      return;
    }

    setImages(prev => [...prev, ...files]);
    
    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreview(prev => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const toggleAmenity = (amenityId: number) => {
    setSelectedAmenities(prev => 
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const onSubmit = async (data: PropertyFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      
      // Append all form data
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      
      // Append amenities
      formData.append('amenities', JSON.stringify(selectedAmenities));
      
      // Append images
      images.forEach((image, index) => {
        formData.append(`images`, image);
      });

      const url = propertyId ? `/properties/${propertyId}` : '/properties';
      const method = propertyId ? 'put' : 'post';
      
      const response = await axios[method](url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onSuccess?.(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save property');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const propertyTypes = [
    'Apartment',
    'House',
    'Townhouse',
    'Villa',
    'Cottage',
    'Guest House',
    'Room',
    'Studio',
  ];

  const provinces = [
    'Eastern Cape',
    'Free State',
    'Gauteng',
    'KwaZulu-Natal',
    'Limpopo',
    'Mpumalanga',
    'North West',
    'Northern Cape',
    'Western Cape',
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="amenities">Amenities</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Tell guests about your property with an engaging title and description
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your property in detail. Mention unique features, nearby attractions, and what makes it special..."
                  rows={4}
                  {...register('description')}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="property_type">Property Type</Label>
                <Select onValueChange={(value) => setValue('property_type', value)}>
                  <SelectTrigger className={errors.property_type ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type} value={type.toLowerCase()}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.property_type && (
                  <p className="text-sm text-red-500">{errors.property_type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Property Images</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="images" className="cursor-pointer">
                        <span className="bg-sea text-white px-4 py-2 rounded-md hover:bg-sea-dark">
                          Upload Images
                        </span>
                        <input
                          id="images"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Upload up to 10 high-quality photos (JPG, PNG)
                    </p>
                  </div>
                </div>
                
                {imagePreview.length > 0 && (
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mt-4">
                    {imagePreview.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Property ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Property Location
              </CardTitle>
              <CardDescription>
                Help guests find your property easily
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address_line1">Street Address</Label>
                <Input
                  id="address_line1"
                  placeholder="123 Main Street"
                  {...register('address_line1')}
                  className={errors.address_line1 ? 'border-red-500' : ''}
                />
                {errors.address_line1 && (
                  <p className="text-sm text-red-500">{errors.address_line1.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_line2">Address Line 2 (Optional)</Label>
                <Input
                  id="address_line2"
                  placeholder="Apartment, suite, etc."
                  {...register('address_line2')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Cape Town"
                    {...register('city')}
                    className={errors.city ? 'border-red-500' : ''}
                  />
                  {errors.city && (
                    <p className="text-sm text-red-500">{errors.city.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    placeholder="8001"
                    {...register('postal_code')}
                    className={errors.postal_code ? 'border-red-500' : ''}
                  />
                  {errors.postal_code && (
                    <p className="text-sm text-red-500">{errors.postal_code.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="province">Province</Label>
                <Select onValueChange={(value) => setValue('province', value)}>
                  <SelectTrigger className={errors.province ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.province && (
                  <p className="text-sm text-red-500">{errors.province.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Property Details
              </CardTitle>
              <CardDescription>
                Specify the capacity and features of your property
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_guests">Maximum Guests</Label>
                  <Input
                    id="max_guests"
                    type="number"
                    min="1"
                    max="20"
                    {...register('max_guests', { valueAsNumber: true })}
                    className={errors.max_guests ? 'border-red-500' : ''}
                  />
                  {errors.max_guests && (
                    <p className="text-sm text-red-500">{errors.max_guests.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    min="0"
                    {...register('bedrooms', { valueAsNumber: true })}
                    className={errors.bedrooms ? 'border-red-500' : ''}
                  />
                  {errors.bedrooms && (
                    <p className="text-sm text-red-500">{errors.bedrooms.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    min="0.5"
                    step="0.5"
                    {...register('bathrooms', { valueAsNumber: true })}
                    className={errors.bathrooms ? 'border-red-500' : ''}
                  />
                  {errors.bathrooms && (
                    <p className="text-sm text-red-500">{errors.bathrooms.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minimum_stay">Minimum Stay (nights)</Label>
                  <Input
                    id="minimum_stay"
                    type="number"
                    min="1"
                    {...register('minimum_stay', { valueAsNumber: true })}
                    className={errors.minimum_stay ? 'border-red-500' : ''}
                  />
                  {errors.minimum_stay && (
                    <p className="text-sm text-red-500">{errors.minimum_stay.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maximum_stay">Maximum Stay (nights)</Label>
                  <Input
                    id="maximum_stay"
                    type="number"
                    max="365"
                    {...register('maximum_stay', { valueAsNumber: true })}
                    className={errors.maximum_stay ? 'border-red-500' : ''}
                  />
                  {errors.maximum_stay && (
                    <p className="text-sm text-red-500">{errors.maximum_stay.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="check_in_time">Check-in Time</Label>
                  <Input
                    id="check_in_time"
                    type="time"
                    {...register('check_in_time')}
                    className={errors.check_in_time ? 'border-red-500' : ''}
                  />
                  {errors.check_in_time && (
                    <p className="text-sm text-red-500">{errors.check_in_time.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="check_out_time">Check-out Time</Label>
                  <Input
                    id="check_out_time"
                    type="time"
                    {...register('check_out_time')}
                    className={errors.check_out_time ? 'border-red-500' : ''}
                  />
                  {errors.check_out_time && (
                    <p className="text-sm text-red-500">{errors.check_out_time.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="house_rules">House Rules</Label>
                <Textarea
                  id="house_rules"
                  placeholder="No smoking, no parties, no pets, etc."
                  rows={3}
                  {...register('house_rules')}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="instant_book"
                  {...register('instant_book')}
                />
                <Label htmlFor="instant_book">
                  Enable instant booking (guests can book without approval)
                </Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="amenities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Property Amenities
              </CardTitle>
              <CardDescription>
                Select all amenities available at your property
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.entries(
                amenities.reduce((acc, amenity) => {
                  if (!acc[amenity.category]) acc[amenity.category] = [];
                  acc[amenity.category].push(amenity);
                  return acc;
                }, {} as Record<string, Amenity[]>)
              ).map(([category, categoryAmenities]) => (
                <div key={category} className="mb-6">
                  <h4 className="font-semibold mb-3 capitalize">{category} Amenities</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {categoryAmenities.map((amenity) => (
                      <div
                        key={amenity.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedAmenities.includes(amenity.id)
                            ? 'border-sea bg-sea-light'
                            : 'border-gray-200 hover:border-sea'
                        }`}
                        onClick={() => toggleAmenity(amenity.id)}
                      >
                        <div className="flex items-center space-x-2">
                          <div className="text-lg">{amenity.icon}</div>
                          <span className="text-sm">{amenity.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing & Fees
              </CardTitle>
              <CardDescription>
                Set your nightly rate and additional fees
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="base_price">Base Price (per night)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    R
                  </span>
                  <Input
                    id="base_price"
                    type="number"
                    min="50"
                    step="10"
                    className={`pl-8 ${errors.base_price ? 'border-red-500' : ''}`}
                    {...register('base_price', { valueAsNumber: true })}
                  />
                </div>
                {errors.base_price && (
                  <p className="text-sm text-red-500">{errors.base_price.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cleaning_fee">Cleaning Fee</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      R
                    </span>
                    <Input
                      id="cleaning_fee"
                      type="number"
                      min="0"
                      step="10"
                      className="pl-8"
                      {...register('cleaning_fee', { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="extra_guest_fee">Extra Guest Fee (per person)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      R
                    </span>
                    <Input
                      id="extra_guest_fee"
                      type="number"
                      min="0"
                      step="5"
                      className="pl-8"
                      {...register('extra_guest_fee', { valueAsNumber: true })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-4 pt-6 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading} className="bg-sea hover:bg-sea-dark">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {propertyId ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            propertyId ? 'Update Property' : 'Create Property'
          )}
        </Button>
      </div>
    </form>
  );
}space-y-2">
                <Label htmlFor="title">Property Title</Label>
                <Input
                  id="title"
                  placeholder="Beautiful 2-bedroom apartment with ocean view"
                  {...register('title')}
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div className="