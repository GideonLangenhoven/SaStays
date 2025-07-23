import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Shield } from 'lucide-react';

interface Amenity {
  id: number;
  name: string;
  icon: string;
  category: string;
}

interface AmenitiesTabProps {
  amenities: Amenity[];
  selectedAmenities: number[];
  onToggle: (id: number) => void;
}

export const AmenitiesTab: React.FC<AmenitiesTabProps> = ({ amenities, selectedAmenities, onToggle }) => {
  const groupedAmenities = amenities.reduce((acc, amenity) => {
    acc[amenity.category] = [...(acc[amenity.category] || []), amenity];
    return acc;
  }, {} as Record<string, Amenity[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Amenities</CardTitle>
        <CardDescription>Select all amenities available at your property</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedAmenities).map(([category, items]) => (
          <div key={category}>
            <h4 className="font-semibold mb-4 capitalize">{category}</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {items.map(amenity => (
                <FormItem key={amenity.id} className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={selectedAmenities.includes(amenity.id)}
                      onCheckedChange={() => onToggle(amenity.id)}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">{amenity.name}</FormLabel>
                </FormItem>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};