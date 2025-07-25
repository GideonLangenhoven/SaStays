import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2, Trash2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/ui/ImageUpload';

const propertySchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters long.' }),
  description: z.string().min(20, { message: 'Description must be at least 20 characters long.' }),
  base_price_per_night: z.coerce.number().positive({ message: 'Base price must be a positive number.' }),
  capacity: z.coerce.number().int().positive({ message: 'Capacity must be a positive number.' }),
  location: z.string().min(2, { message: 'Location is required.' }),
  amenities: z.string().transform(val => val.split(',').map(item => item.trim())),
  booking_type: z.enum(['instant', 'request']),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

interface PricingRule {
    id?: number;
    name: string;
    type: 'nightly_override' | 'weekly_discount_percent';
    value: number;
    start_date: string;
    end_date: string;
}

const PropertyCreateEdit: React.FC = () => {
  const { id: propertyId } = useParams<{ id?: string }>();
  const isEditing = Boolean(propertyId);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
        booking_type: 'instant',
    }
  });

  const bookingType = watch('booking_type');

  useEffect(() => {
    if (isEditing && propertyId) {
      const fetchPropertyData = async () => {
        setIsLoading(true);
        const { data: propData, error: propError } = await supabase
          .from('properties')
          .select('*')
          .eq('id', propertyId)
          .single();

        if (propError) {
          toast.error('Failed to fetch property details.');
          setIsLoading(false);
          return;
        }

        setValue('title', propData.title);
        setValue('description', propData.description);
        setValue('base_price_per_night', propData.base_price_per_night);
        setValue('capacity', propData.capacity);
        setValue('location', propData.location);
        setValue('amenities', (propData.amenities || []).join(', '));
        setValue('booking_type', propData.booking_type);
        setExistingImages(propData.image_urls || []);

        const { data: rulesData, error: rulesError } = await supabase
            .from('pricing_rules')
            .select('*')
            .eq('property_id', propertyId);

        if (rulesError) {
            toast.error('Failed to fetch pricing rules.');
        } else {
            setPricingRules(rulesData || []);
        }
        setIsLoading(false);
      };
      fetchPropertyData();
    }
  }, [propertyId, isEditing, setValue]);

  const onPropertySubmit: SubmitHandler<PropertyFormValues> = async (formData) => {
    if (!user) {
      toast.error('You must be logged in.');
      return;
    }

    setIsLoading(true);
    let imageUrls = [...existingImages];

    if (imageFiles.length > 0) {
      for (const file of imageFiles) {
        const fileName = `${user.id}/${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('property-images').upload(fileName, file);

        if (uploadError) {
            toast.error('Failed to upload image.');
            setIsLoading(false);
            return;
        }
        imageUrls.push(supabase.storage.from('property-images').getPublicUrl(uploadData.path).data.publicUrl);
      }
    }

    const propertyData = {
      ...formData,
      owner_id: user.id,
      image_urls: imageUrls,
    };

    let query;
    if (isEditing) {
        query = supabase.from('properties').update(propertyData).eq('id', propertyId);
    } else {
        query = supabase.from('properties').insert(propertyData).select().single();
    }

    const { data, error } = await query;

    if (error) {
        toast.error(`Operation failed: ${error.message}`);
    } else {
        toast.success(`Property successfully ${isEditing ? 'updated' : 'created'}!`);
        if(!isEditing && data) {
            navigate(`/edit-property/${data.id}`);
        }
    }

    setIsLoading(false);
  };

  const handleAddRule = async (newRule: Omit<PricingRule, 'id'>) => {
    // This will be implemented in a future step
  }

  const handleDeleteRule = async (ruleId: number) => {
    // This will be implemented in a future step
  }

  return (
    <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="container py-8">
            <form onSubmit={handleSubmit(onPropertySubmit)} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>{isEditing ? 'Edit Property' : 'Create New Property'}</CardTitle>
                        <CardDescription>Enter the details for your property listing.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Booking Method</Label>
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="booking-type-request">Request to Book</Label>
                                <Switch
                                    id="booking-type-switch"
                                    checked={bookingType === 'instant'}
                                    onCheckedChange={(checked) => setValue('booking_type', checked ? 'instant' : 'request')}
                                />
                                <Label htmlFor="booking-type-instant">Instant Book</Label>
                            </div>
                            <input type="hidden" {...register('booking_type')} />
                        </div>
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
                            <div className="space-y-2">
                                <Label htmlFor="base_price_per_night">Base Price per Night (ZAR)</Label>
                                <Input id="base_price_per_night" type="number" step="0.01" {...register('base_price_per_night')} />
                                {errors.base_price_per_night && <p className="text-destructive text-sm">{errors.base_price_per_night.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="capacity">Capacity (Guests)</Label>
                                <Input id="capacity" type="number" {...register('capacity')} />
                                {errors.capacity && <p className="text-destructive text-sm">{errors.capacity.message}</p>}
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input id="location" {...register('location')} placeholder="e.g., Camps Bay, Cape Town" />
                            {errors.location && <p className="text-destructive text-sm">{errors.location.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amenities">Amenities (comma-separated)</Label>
                            <Input id="amenities" {...register('amenities')} placeholder="e.g., Wi-Fi, Pool, Air Conditioning" />
                            {errors.amenities && <p className="text-destructive text-sm">{errors.amenities.message}</p>}
                        </div>

                        <ImageUpload onFilesChange={setImageFiles} existingImages={existingImages} />

                        <Button type="submit" className="w-full btn-primary" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? 'Update Property Details' : 'Save Property'}
                        </Button>
                    </CardContent>
                </Card>
            </form>

            {isEditing && (
                <Card>
                    <CardHeader>
                        <CardTitle>Pricing Rules</CardTitle>
                        <CardDescription>Set custom prices and discounts for specific date ranges.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {pricingRules.map(rule => (
                                <div key={rule.id} className="flex justify-between items-center p-3 border rounded-md">
                                    <div>
                                        <p className="font-semibold">{rule.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {rule.type === 'nightly_override' ? `R${rule.value}/night` : `${rule.value}% off`} from {rule.start_date} to {rule.end_date}
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteRule(rule.id!)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <PricingRuleForm onAddRule={handleAddRule} />
                    </CardContent>
                </Card>
            )}
        </main>
    </div>
  );
};

const pricingRuleSchema = z.object({
    name: z.string().min(3),
    type: z.enum(['nightly_override', 'weekly_discount_percent']),
    value: z.coerce.number().positive(),
    start_date: z.string(),
    end_date: z.string(),
}).refine(data => data.end_date >= data.start_date, {
    message: "End date cannot be before start date",
    path: ["end_date"],
});
type PricingRuleFormValues = z.infer<typeof pricingRuleSchema>;

const PricingRuleForm: React.FC<{onAddRule: (rule: Omit<PricingRule, 'id'>) => void}> = ({ onAddRule }) => {
    const { register, handleSubmit, reset, formState: { errors }, setValue: setRuleValue } = useForm<PricingRuleFormValues>({
        resolver: zodResolver(pricingRuleSchema)
    });

    const onSubmit: SubmitHandler<PricingRuleFormValues> = (data) => {
        onAddRule(data);
        reset();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 p-4 border-t space-y-4">
            <h4 className="font-semibold">Add New Rule</h4>
             <div className="space-y-2">
                <Label htmlFor="name">Rule Name</Label>
                <Input id="name" {...register('name')} placeholder="e.g., December Holidays" />
                {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Rule Type</Label>
                    <Select onValueChange={(value: 'nightly_override' | 'weekly_discount_percent') => setRuleValue('type', value)} >
                        <SelectTrigger><SelectValue placeholder="Select rule type..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="nightly_override">Nightly Price Override</SelectItem>
                            <SelectItem value="weekly_discount_percent">Weekly Discount (%)</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.type && <p className="text-destructive text-sm">{errors.type.message}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="value">Value (Price or %)</Label>
                    <Input id="value" type="number" {...register('value')} />
                    {errors.value && <p className="text-destructive text-sm">{errors.value.message}</p>}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input id="start_date" type="date" {...register('start_date')} />
                    {errors.start_date && <p className="text-destructive text-sm">{errors.start_date.message}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input id="end_date" type="date" {...register('end_date')} />
                    {errors.end_date && <p className="text-destructive text-sm">{errors.end_date.message}</p>}
                </div>
            </div>
            <Button type="submit">Add Rule</Button>
        </form>
    )
}

export default PropertyCreateEdit;