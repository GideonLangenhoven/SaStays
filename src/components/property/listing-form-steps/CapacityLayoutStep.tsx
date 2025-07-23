
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Bed, Bath } from 'lucide-react';

export const CapacityLayoutStep = () => {
  const { register, formState: { errors } } = useFormContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Capacity & Layout</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="maxGuests" className="flex items-center gap-2"><Users className="h-4 w-4" />Max Guests *</Label>
            <Input
              id="maxGuests"
              type="number"
              min="1"
              max="20"
              {...register('maxGuests', { valueAsNumber: true })}
            />
            {errors.maxGuests && (
              <p className="text-sm text-red-500">{errors.maxGuests.message?.toString()}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bedrooms" className="flex items-center gap-2"><Bed className="h-4 w-4" />Bedrooms *</Label>
            <Input
              id="bedrooms"
              type="number"
              min="0"
              max="10"
              {...register('bedrooms', { valueAsNumber: true })}
            />
            {errors.bedrooms && (
              <p className="text-sm text-red-500">{errors.bedrooms.message?.toString()}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bathrooms" className="flex items-center gap-2"><Bath className="h-4 w-4" />Bathrooms *</Label>
            <Input
              id="bathrooms"
              type="number"
              min="0.5"
              max="10"
              step="0.5"
              {...register('bathrooms', { valueAsNumber: true })}
            />
            {errors.bathrooms && (
              <p className="text-sm text-red-500">{errors.bathrooms.message?.toString()}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};