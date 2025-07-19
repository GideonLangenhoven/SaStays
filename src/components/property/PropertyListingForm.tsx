// src/components/property/PropertyListingForm.tsx
import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, X, MapPin, Camera, Video, Star, Users, Bed, Bath, Home } from 'lucide-react';
import { Property } from '@/types';
import { propertiesApi } from '@/services/api';
import { toast } from 'sonner';

const propertySchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(100, 'Title must not exceed 100 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters').max(2000, 'Description must not exceed 2000 characters'),
  location: z.object({
    address: z.string().min(10, 'Address is required'),
    neighborhood: z.string().min(2, 'Neighborhood is required'),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
  maxGuests: z.number().min(1, 'Must accommodate at least 1 guest').max(20, 'Maximum 20 guests allowed'),
  bedrooms: z.number().min(0, 'Cannot be negative').max(10, 'Maximum 10 bedrooms'),
  bathrooms: z.number().min(0.5, 'Must have at least half a bathroom').max(10, 'Maximum 10 bathrooms'),
  propertyType: z.enum(['apartment', 'house', 'villa', 'cottage', 'other']),
  pricing: z.object({
    baseNightlyRate: z.number().min(1, 'Rate must be at least R1 per night'),
    cleaningFee: z.number().min(0, 'Cannot be negative').optional(),
    extraGuestFee: z.number().min(0, 'Cannot be negative').optional(),
    petFee: z.number().min(0, 'Cannot be negative').optional(),
    weeklyDiscount: z.number().min(0).max(100, 'Discount cannot exceed 100%').optional(),
    monthlyDiscount: z.number().min(0).max(100, 'Discount cannot exceed 100%').optional(),
  }),
  amenities: z.array(z.string()),
  houseRules: z.array(z.string()),
  guestRequirements: z.object({
    minAge: z.number().min(18, 'Minimum age must be at least 18').max(99, 'Maximum age is 99').optional(),
    verificationRequired: z.boolean(),
    governmentIdRequired: z.boolean(),
  }),
  instantBooking: z.boolean(),
  isActive: z.boolean(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

interface PropertyListingFormProps {
  property?: Property;
  onSave: (property: Property) => void;
  onCancel: () => void;
}

const AMENITIES_LIST = [
  'WiFi', 'Kitchen', 'Washing machine', 'Dryer', 'Air conditioning', 'Heating',
  'Dedicated workspace', 'TV', 'Hair dryer', 'Iron', 'Pool', 'Hot tub',
  'Free parking', 'Gym', 'BBQ grill', 'Patio', 'Garden', 'Balcony',
  'Ocean view', 'Mountain view', 'City view', 'Fireplace', 'Piano',
  'Pool table', 'Game console', 'Books and reading material'
];

const HOUSE_RULES_LIST = [
  'No smoking', 'No pets', 'No parties or events', 'Check-in after 3:00 PM',
  'Check-out before 11:00 AM', 'Quiet hours after 10:00 PM', 'No shoes inside',
  'No food in bedrooms', 'Clean up after yourself', 'Respect neighbors'
];

export function PropertyListingForm({ property, onSave, onCancel }: PropertyListingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedPhotos, setUploadedPhotos] = useState<Array<{ id: string; url: string; file?: File; isMain: boolean }>>([]);
  const [uploadedVideos, setUploadedVideos] = useState<Array<{ id: string; url: string; thumbnail: string; file?: File }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: property ? {
      title: property.title,
      description: property.description,
      location: property.location,
      maxGuests: property.maxGuests,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      propertyType: property.propertyType,
      pricing: property.pricing,
      amenities: property.amenities,
      houseRules: property.houseRules,
      guestRequirements: property.guestRequirements,
      instantBooking: property.instantBooking,
      isActive: property.isActive,
    } : {
      propertyType: 'apartment',
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      pricing: {
        baseNightlyRate: 500,
        cleaningFee: 100,
        extraGuestFee: 50,
        petFee: 100,
        weeklyDiscount: 10,
        monthlyDiscount: 20,
      },
      amenities: [],
      houseRules: [],
      guestRequirements: {
        verificationRequired: true,
        governmentIdRequired: true,
      },
      instantBooking: true,
      isActive: true,
    }
  });

  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setUploadedPhotos(prev => [...prev, {
          id: `temp-${Date.now()}-${Math.random()}`,
          url,
          file,
          isMain: prev.length === 0
        }]);
      }
    });
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    files.forEach((file) => {
      if (file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        setUploadedVideos(prev => [...prev, {
          id: `temp-${Date.now()}-${Math.random()}`,
          url,
          thumbnail: url, // In real app, generate thumbnail
          file
        }]);
      }
    });
  };

  const removePhoto = (id: string) => {
    setUploadedPhotos(prev => {
      const filtered = prev.filter(photo => photo.id !== id);
      if (filtered.length > 0 && !filtered.some(p => p.isMain)) {
        filtered[0].isMain = true;
      }
      return filtered;
    });
  };

  const setMainPhoto = (id: string) => {
    setUploadedPhotos(prev => prev.map(photo => ({
      ...photo,
      isMain: photo.id === id
    })));
  };

  const removeVideo = (id: string) => {
    setUploadedVideos(prev => prev.filter(video => video.id !== id));
  };

  const toggleAmenity = (amenity: string) => {
    const currentAmenities = form.getValues('amenities');
    if (currentAmenities.includes(amenity)) {
      form.setValue('amenities', currentAmenities.filter(a => a !== amenity));
    } else {
      form.setValue('amenities', [...currentAmenities, amenity]);
    }
  };

  const toggleHouseRule = (rule: string) => {
    const currentRules = form.getValues('houseRules');
    if (currentRules.includes(rule)) {
      form.setValue('houseRules', currentRules.filter(r => r !== rule));
    } else {
      form.setValue('houseRules', [...currentRules, rule]);
    }
  };

  const onSubmit = async (data: PropertyFormData) => {
    if (uploadedPhotos.length === 0) {
      toast.error('Please upload at least one photo');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create property data with photos and videos
      const propertyData = {
        ...data,
        photos: uploadedPhotos.map(photo => ({
          id: photo.id,
          url: photo.url,
          isMain: photo.isMain,
        })),
        videos: uploadedVideos.map(video => ({
          id: video.id,
          url: video.url,
          thumbnail: video.thumbnail,
        })),
        ownerId: 'current-owner-id', // Get from auth context
      };

      let savedProperty: Property;
      if (property?.id) {
        const response = await propertiesApi.update(property.id, propertyData);
        savedProperty = response.data;
      } else {
        const response = await propertiesApi.create(propertyData);
        savedProperty = response.data;
      }

      // Upload files if they exist
      for (const photo of uploadedPhotos) {
        if (photo.file) {
          await propertiesApi.uploadPhoto(savedProperty.id, photo.file);
        }
      }

      toast.success(property?.id ? 'Property updated successfully!' : 'Property created successfully!');
      onSave(savedProperty);
    } catch (error) {
      console.error('Error saving property:', error);
      toast.error('Failed to save property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    const fields = getStepFields(currentStep);
    const isValid = await form.trigger(fields);
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepFields = (step: number): (keyof PropertyFormData)[] => {
    switch (step) {
      case 1: return ['title', 'description', 'propertyType'];
      case 2: return ['location'];
      case 3: return ['maxGuests', 'bedrooms', 'bathrooms'];
      case 4: return ['pricing'];
      case 5: return ['amenities', 'houseRules'];
      case 6: return ['guestRequirements', 'instantBooking', 'isActive'];
      default: return [];
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="propertyType">Property Type *</Label>
                <select
                  id="propertyType"
                  {...form.register('propertyType')}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="cottage">Cottage</option>
                  <option value="other">Other</option>
                </select>
                {form.formState.errors.propertyType && (
                  <p className="text-sm text-red-500">{form.formState.errors.propertyType.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Property Title *</Label>
                <Input
                  id="title"
                  {...form.register('title')}
                  placeholder="Beautiful oceanfront apartment with stunning views"
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  placeholder="Describe your space in detail. What makes it special? What can guests expect?"
                  rows={6}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Location */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Full Address *</Label>
                <Input
                  id="address"
                  {...form.register('location.address')}
                  placeholder="123 Ocean Drive, Cape Town, Western Cape"
                />
                {form.formState.errors.location?.address && (
                  <p className="text-sm text-red-500">{form.formState.errors.location.address.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="neighborhood">Neighborhood *</Label>
                <Input
                  id="neighborhood"
                  {...form.register('location.neighborhood')}
                  placeholder="V&A Waterfront, Sea Point, Camps Bay"
                />
                {form.formState.errors.location?.neighborhood && (
                  <p className="text-sm text-red-500">{form.formState.errors.location.neighborhood.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude (Optional)</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    {...form.register('location.latitude', { valueAsNumber: true })}
                    placeholder="-33.9249"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude (Optional)</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    {...form.register('location.longitude', { valueAsNumber: true })}
                    placeholder="18.4241"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Capacity & Layout */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Capacity & Layout
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxGuests" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Max Guests *
                  </Label>
                  <Input
                    id="maxGuests"
                    type="number"
                    min="1"
                    max="20"
                    {...form.register('maxGuests', { valueAsNumber: true })}
                  />
                  {form.formState.errors.maxGuests && (
                    <p className="text-sm text-red-500">{form.formState.errors.maxGuests.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bedrooms" className="flex items-center gap-2">
                    <Bed className="h-4 w-4" />
                    Bedrooms *
                  </Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    min="0"
                    max="10"
                    {...form.register('bedrooms', { valueAsNumber: true })}
                  />
                  {form.formState.errors.bedrooms && (
                    <p className="text-sm text-red-500">{form.formState.errors.bedrooms.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms" className="flex items-center gap-2">
                    <Bath className="h-4 w-4" />
                    Bathrooms *
                  </Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    min="0.5"
                    max="10"
                    step="0.5"
                    {...form.register('bathrooms', { valueAsNumber: true })}
                  />
                  {form.formState.errors.bathrooms && (
                    <p className="text-sm text-red-500">{form.formState.errors.bathrooms.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Pricing */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Pricing Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="baseNightlyRate">Base Nightly Rate (ZAR) *</Label>
                  <Input
                    id="baseNightlyRate"
                    type="number"
                    min="1"
                    {...form.register('pricing.baseNightlyRate', { valueAsNumber: true })}
                  />
                  {form.formState.errors.pricing?.baseNightlyRate && (
                    <p className="text-sm text-red-500">{form.formState.errors.pricing.baseNightlyRate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cleaningFee">Cleaning Fee (ZAR)</Label>
                  <Input
                    id="cleaningFee"
                    type="number"
                    min="0"
                    {...form.register('pricing.cleaningFee', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="extraGuestFee">Extra Guest Fee (ZAR)</Label>
                  <Input
                    id="extraGuestFee"
                    type="number"
                    min="0"
                    {...form.register('pricing.extraGuestFee', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="petFee">Pet Fee (ZAR)</Label>
                  <Input
                    id="petFee"
                    type="number"
                    min="0"
                    {...form.register('pricing.petFee', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weeklyDiscount">Weekly Discount (%)</Label>
                  <Input
                    id="weeklyDiscount"
                    type="number"
                    min="0"
                    max="100"
                    {...form.register('pricing.weeklyDiscount', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthlyDiscount">Monthly Discount (%)</Label>
                  <Input
                    id="monthlyDiscount"
                    type="number"
                    min="0"
                    max="100"
                    {...form.register('pricing.monthlyDiscount', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Amenities & House Rules */}
        {currentStep === 5 && (
          <Card>
            <CardHeader>
              <CardTitle>Amenities & House Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Amenities</Label>
                <div className="grid grid-cols-3 gap-2">
                  {AMENITIES_LIST.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={`amenity-${amenity}`}
                        checked={form.watch('amenities').includes(amenity)}
                        onCheckedChange={() => toggleAmenity(amenity)}
                      />
                      <Label htmlFor={`amenity-${amenity}`} className="text-sm font-normal">
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label>House Rules</Label>
                <div className="grid grid-cols-2 gap-2">
                  {HOUSE_RULES_LIST.map((rule) => (
                    <div key={rule} className="flex items-center space-x-2">
                      <Checkbox
                        id={`rule-${rule}`}
                        checked={form.watch('houseRules').includes(rule)}
                        onCheckedChange={() => toggleHouseRule(rule)}
                      />
                      <Label htmlFor={`rule-${rule}`} className="text-sm font-normal">
                        {rule}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 6: Photos, Videos & Settings */}
        {currentStep === 6 && (
          <div className="space-y-6">
            {/* Photos Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Photos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Camera className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Photos
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Upload high-quality photos (JPG, PNG). First photo will be your main photo.
                  </p>
                </div>

                {uploadedPhotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {uploadedPhotos.map((photo) => (
                      <div key={photo.id} className="relative group">
                        <img
                          src={photo.url}
                          alt="Property"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        {photo.isMain && (
                          <Badge className="absolute top-2 left-2 bg-green-500">
                            Main Photo
                          </Badge>
                        )}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => removePhoto(photo.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        {!photo.isMain && (
                          <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => setMainPhoto(photo.id)}
                            >
                              <Star className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Videos Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Videos (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Video className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => videoInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Videos
                    </Button>
                    <input
                      ref={videoInputRef}
                      type="file"
                      multiple
                      accept="video/*"
                      className="hidden"
                      onChange={handleVideoUpload}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Upload video tours (MP4, MOV). Max 10MB per video.
                  </p>
                </div>

                {uploadedVideos.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {uploadedVideos.map((video) => (
                      <div key={video.id} className="relative group">
                        <video
                          src={video.url}
                          className="w-full h-32 object-cover rounded-lg"
                          controls
                        />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => removeVideo(video.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Settings Section */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="minAge">Minimum Guest Age</Label>
                    <Input
                      id="minAge"
                      type="number"
                      min="18"
                      max="99"
                      {...form.register('guestRequirements.minAge', { valueAsNumber: true })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Verification Required</Label>
                      <p className="text-sm text-muted-foreground">
                        Require guests to verify their identity
                      </p>
                    </div>
                    <Switch
                      checked={form.watch('guestRequirements.verificationRequired')}
                      onCheckedChange={(checked) =>
                        form.setValue('guestRequirements.verificationRequired', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Government ID Required</Label>
                      <p className="text-sm text-muted-foreground">
                        Require guests to provide government-issued ID
                      </p>
                    </div>
                    <Switch
                      checked={form.watch('guestRequirements.governmentIdRequired')}
                      onCheckedChange={(checked) =>
                        form.setValue('guestRequirements.governmentIdRequired', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Instant Booking</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow guests to book instantly without approval
                      </p>
                    </div>
                    <Switch
                      checked={form.watch('instantBooking')}
                      onCheckedChange={(checked) => form.setValue('instantBooking', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Active Listing</Label>
                      <p className="text-sm text-muted-foreground">
                        Make this listing visible to guests
                      </p>
                    </div>
                    <Switch
                      checked={form.watch('isActive')}
                      onCheckedChange={(checked) => form.setValue('isActive', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={currentStep === 1 ? onCancel : prevStep}
          >
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </Button>

          <div className="flex gap-2">
            {currentStep < totalSteps ? (
              <Button type="button" onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : property?.id ? 'Update Property' : 'Create Property'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
} 