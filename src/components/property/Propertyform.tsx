import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import axios from 'axios';

import { BasicInfoTab } from './form-tabs/BasicInfoTab';
import { LocationTab } from './form-tabs/LocationTab';
import { DetailsTab } from './form-tabs/DetailsTab';
import { AmenitiesTab } from './form-tabs/AmenitiesTab';
import { PricingTab } from './form-tabs/PricingTab';

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

  const methods = useForm<PropertyFormData>({
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

  const { handleSubmit, reset } = methods;

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
      
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      
      formData.append('amenities', JSON.stringify(selectedAmenities));
      
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

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="basic">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="amenities">Amenities</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <BasicInfoTab 
              handleImageUpload={handleImageUpload}
              removeImage={removeImage}
              imagePreview={imagePreview}
            />
          </TabsContent>
          <TabsContent value="location"><LocationTab /></TabsContent>
          <TabsContent value="details"><DetailsTab /></TabsContent>
          <TabsContent value="amenities">
            <AmenitiesTab 
              amenities={amenities}
              selectedAmenities={selectedAmenities}
              onToggle={toggleAmenity}
            />
          </TabsContent>
          <TabsContent value="pricing"><PricingTab /></TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-4 pt-6 border-t">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
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
    </FormProvider>
  );
}