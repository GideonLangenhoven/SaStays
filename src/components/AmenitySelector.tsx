import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

const AMENITIES_LIST = [
  'Wi-Fi', 'Kitchen', 'Air Conditioning', 'Pool', 'Parking', 'TV', 'Washer', 'Dryer', 'Heating', 'Balcony', 'Gym', 'Pet Friendly', 'Wheelchair Accessible', 'Breakfast', 'Workspace', 'Security'
];

interface AmenitySelectorProps {
  selectedAmenities: string[];
  onAmenityToggle: (amenity: string) => void;
}

export const AmenitySelector: React.FC<AmenitySelectorProps> = ({ selectedAmenities, onAmenityToggle }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Amenities
        </CardTitle>
        <CardDescription>
          Select all the amenities available at your property.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {AMENITIES_LIST.map((amenity) => (
            <div key={amenity} className="flex items-center space-x-2">
              <Checkbox
                id={`amenity-${amenity}`}
                checked={selectedAmenities.includes(amenity)}
                onCheckedChange={() => onAmenityToggle(amenity)}
              />
              <Label htmlFor={`amenity-${amenity}`} className="text-sm font-normal">
                {amenity}
              </Label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};