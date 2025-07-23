
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

interface LocationPickerProps {
  location: {
    address: string;
    city: string;
    province: string;
    postal_code: string;
    latitude?: number;
    longitude?: number;
  };
  onLocationChange: (location: LocationPickerProps['location']) => void;
  errors: any; // Simplified error handling for this component
}

export const LocationPicker: React.FC<LocationPickerProps> = ({ location, onLocationChange, errors }) => {
  const handleChange = (field: keyof typeof location, value: string | number) => {
    onLocationChange({ ...location, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location
        </CardTitle>
        <CardDescription>
          Provide the address and pinpoint the location of your property.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={{}} // Placeholder
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street Address</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={location.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="e.g., 123 Beach Road"
                />
              </FormControl>
              <FormMessage>{errors.address?.message}</FormMessage>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={{}} // Placeholder
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={location.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="e.g., Cape Town"
                  />
                </FormControl>
                <FormMessage>{errors.city?.message}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={{}} // Placeholder
            name="province"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Province</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={location.province}
                    onChange={(e) => handleChange('province', e.target.value)}
                    placeholder="e.g., Western Cape"
                  />
                </FormControl>
                <FormMessage>{errors.province?.message}</FormMessage>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={{}} // Placeholder
          name="postal_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Postal Code</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={location.postal_code}
                  onChange={(e) => handleChange('postal_code', e.target.value)}
                  placeholder="e.g., 8005"
                />
              </FormControl>
              <FormMessage>{errors.postal_code?.message}</FormMessage>
            </FormItem>
          )}
        />

        <div className="pt-4 mt-4 border-t">
            <Label>Map Location (Optional)</Label>
            <div className="mt-2 p-4 text-center bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Interactive map picker coming soon.</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};