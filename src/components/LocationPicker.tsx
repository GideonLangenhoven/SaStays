import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';

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
        <div className="space-y-2">
          <Label htmlFor="address">Street Address</Label>
          <Input
            id="address"
            value={location.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="e.g., 123 Beach Road"
          />
          {errors.address && <p className="text-destructive text-sm">{errors.address.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                id="city"
                value={location.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="e.g., Cape Town"
                />
                {errors.city && <p className="text-destructive text-sm">{errors.city.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="province">Province</Label>
                <Input
                id="province"
                value={location.province}
                onChange={(e) => handleChange('province', e.target.value)}
                placeholder="e.g., Western Cape"
                />
                {errors.province && <p className="text-destructive text-sm">{errors.province.message}</p>}
            </div>
        </div>

        <div className="space-y-2">
            <Label htmlFor="postal_code">Postal Code</Label>
            <Input
                id="postal_code"
                value={location.postal_code}
                onChange={(e) => handleChange('postal_code', e.target.value)}
                placeholder="e.g., 8005"
            />
            {errors.postal_code && <p className="text-destructive text-sm">{errors.postal_code.message}</p>}
        </div>

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