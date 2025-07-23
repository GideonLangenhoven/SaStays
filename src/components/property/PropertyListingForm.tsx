import React, { useState, useRef, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Property } from '@/types';
import { propertiesApi } from '@/services/api';

// Import step components
import { BasicInfoStep } from './listing-form-steps/BasicInfoStep';
import { LocationDetailsStep } from './listing-form-steps/LocationDetailsStep';
import { CapacityLayoutStep } from './listing-form-steps/CapacityLayoutStep';
import { PricingDetailsStep } from './listing-form-steps/PricingDetailsStep';
import { AmenitiesHouseRulesStep } from './listing-form-steps/AmenitiesHouseRulesStep';
import { MediaSettingsStep } from './listing-form-steps/MediaSettingsStep';

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

export function PropertyListingForm({ property, onSave, onCancel }: PropertyListingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedPhotos, setUploadedPhotos] = useState<Array<{ id: string; url: string; file?: File; isMain: boolean }>>([]);
  const [uploadedVideos, setUploadedVideos] = useState<Array<{ id: string; url: string; thumbnail: string; file?: File }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const onSubmit = async (data: PropertyFormData) => {
    if (uploadedPhotos.length === 0) {
      toast.error('Please upload at least one photo');
      return;
    }

    setIsSubmitting(true);
    try {
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
      case 2: return ['location.address', 'location.neighborhood'];
      case 3: return ['maxGuests', 'bedrooms', 'bathrooms'];
      case 4: return ['pricing.baseNightlyRate'];
      case 5: return ['amenities', 'houseRules'];
      case 6: return ['guestRequirements.verificationRequired', 'guestRequirements.governmentIdRequired', 'instantBooking', 'isActive'];
      default: return [];
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <BasicInfoStep />;
      case 2: return <LocationDetailsStep />;
      case 3: return <CapacityLayoutStep />;
      case 4: return <PricingDetailsStep />;
      case 5: return <AmenitiesHouseRulesStep />;
      case 6: return (
        <MediaSettingsStep
          uploadedPhotos={uploadedPhotos}
          uploadedVideos={uploadedVideos}
          handlePhotoUpload={handlePhotoUpload}
          handleVideoUpload={handleVideoUpload}
          removePhoto={removePhoto}
          setMainPhoto={setMainPhoto}
          removeVideo={removeVideo}
        />
      );
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {renderStep()}

          <div className="flex justify-between mt-6">
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
      </FormProvider>
    </div>
  );
}