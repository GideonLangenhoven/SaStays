
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';

export const LocationDetailsStep = () => {
  const { register, formState: { errors } } = useFormContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />Location Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="address">Full Address *</Label>
          <Input
            id="address"
            {...register('location.address')}
            placeholder="123 Ocean Drive, Cape Town, Western Cape"
          />
          {errors.location?.address && (
            <p className="text-sm text-red-500">{errors.location.address.message?.toString()}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="neighborhood">Neighborhood *</Label>
          <Input
            id="neighborhood"
            {...register('location.neighborhood')}
            placeholder="V&A Waterfront, Sea Point, Camps Bay"
          />
          {errors.location?.neighborhood && (
            <p className="text-sm text-red-500">{errors.location.neighborhood.message?.toString()}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude (Optional)</Label>
            <Input
              id="latitude"
              type="number"
              step="any"
              {...register('location.latitude', { valueAsNumber: true })}
              placeholder="-33.9249"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude (Optional)</Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              {...register('location.longitude', { valueAsNumber: true })}
              placeholder="18.4241"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};