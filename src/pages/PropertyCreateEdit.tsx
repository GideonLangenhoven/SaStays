import React, { useState, useEffect } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { AmenitySelector } from '@/components/AmenitySelector';
import { LocationPicker } from '@/components/LocationPicker';
import { HouseRulesSelector } from '@/components/HouseRulesSelector';
import { GuestRequirementsForm } from '@/components/GuestRequirementsForm';

const propertySchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  base_price_per_night: z.coerce.number().positive(),
  capacity: z.coerce.number().int().positive(),
  location: z.object({
    address: z.string().min(5),
    city: z.string().min(2),
    province: z.string().min(2),
    postal_code: z.string().min(4),
  }),
  amenities: z.array(z.string()).min(1),
  house_rules: z.array(z.string()),
  custom_house_rules: z.string().optional(),
  guest_requirements: z.object({
    minAge: z.coerce.number().optional(),
    verificationRequired: z.boolean(),
    governmentIdRequired: z.boolean(),
  }),
  booking_type: z.enum(['instant', 'request']),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

const PropertyCreateEdit: React.FC = () => {
  const { id: propertyId } = useParams<{ id?: string }>();
  const isEditing = Boolean(propertyId);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
        location: { address: '', city: '', province: '', postal_code: '' },
        amenities: [],
        house_rules: [],
        guest_requirements: { verificationRequired: true, governmentIdRequired: false },
        booking_type: 'instant',
    }
  });

  const selectedAmenities = watch('amenities');
  const selectedHouseRules = watch('house_rules');

  useEffect(() => {
    if (isEditing && propertyId) {
      // Fetch property data logic...
    }
  }, [propertyId, isEditing, setValue]);

  const onPropertySubmit: SubmitHandler<PropertyFormValues> = async (formData) => {
    // onPropertySubmit logic...
  };

  const handleAmenityToggle = (amenity: string) => {
    const currentAmenities = watch('amenities');
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];
    setValue('amenities', newAmenities, { shouldValidate: true });
  };
  
  const handleRuleToggle = (rule: string) => {
    const currentRules = watch('house_rules');
    const newRules = currentRules.includes(rule)
      ? currentRules.filter(r => r !== rule)
      : [...currentRules, rule];
    setValue('house_rules', newRules, { shouldValidate: true });
  };

  return (
    <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="container py-8">
            <form onSubmit={handleSubmit(onPropertySubmit)} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>{isEditing ? 'Edit Property' : 'Create New Property'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Basic Info */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Property Title</Label>
                            <Input id="title" {...register('title')} />
                            {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" {...register('description')} rows={5} />
                            {errors.description && <p className="text-destructive text-sm">{errors.description.message}</p>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="base_price_per_night">Base Price per Night (ZAR)</Label>
                                <Input id="base_price_per_night" type="number" {...register('base_price_per_night')} />
                                {errors.base_price_per_night && <p className="text-destructive text-sm">{errors.base_price_per_night.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="capacity">Capacity (Guests)</Label>
                                <Input id="capacity" type="number" {...register('capacity')} />
                                {errors.capacity && <p className="text-destructive text-sm">{errors.capacity.message}</p>}
                            </div>
                        </div>

                        <Controller
                            name="location"
                            control={control}
                            render={({ field }) => (
                                <LocationPicker
                                    location={field.value}
                                    onLocationChange={field.onChange}
                                    errors={errors.location || {}}
                                />
                            )}
                        />

                        <AmenitySelector
                          selectedAmenities={selectedAmenities}
                          onAmenityToggle={handleAmenityToggle}
                        />
                        {errors.amenities && <p className="text-destructive text-sm">{errors.amenities.message}</p>}

                        <Controller
                            name="house_rules"
                            control={control}
                            render={({ field }) => (
                                <HouseRulesSelector
                                    selectedRules={field.value}
                                    onRuleToggle={handleRuleToggle}
                                    customRules={watch('custom_house_rules') || ''}
                                    onCustomRulesChange={(value) => setValue('custom_house_rules', value)}
                                />
                            )}
                        />

                        <Controller
                            name="guest_requirements"
                            control={control}
                            render={({ field }) => (
                                <GuestRequirementsForm
                                    requirements={field.value}
                                    onRequirementChange={field.onChange}
                                />
                            )}
                        />
                        
                        <ImageUpload onFilesChange={setImageFiles} existingImages={existingImages} />

                        <Button type="submit" className="w-full btn-primary" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save Property'}
                        </Button>
                    </CardContent>
                </Card>
            </form>
        </main>
    </div>
  );
};

export default PropertyCreateEdit;