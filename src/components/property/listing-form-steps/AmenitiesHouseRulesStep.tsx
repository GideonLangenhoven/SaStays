
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';

const AMENITIES_LIST = [
  'WiFi', 'Kitchen', 'Washing machine', 'Dryer', 'Air conditioning', 'Heating',
  'Dedicated workspace', 'TV', 'Hair dryer', 'Iron', 'Pool', 'Hot tub',
  'Free parking', 'Gym', 'BBQ grill', 'Patio', 'Garden', 'Balcony',
  'Ocean view', 'Mountain view', 'City view', 'Fireplace', 'Piano',
  'Pool table', 'Game console', 'Books and reading material'
];

const HOUSE_RULES_LIST = [
  'No smoking', 'No pets', 'No parties or events', 'Check-in after 3:00 PM',
  'Check-out before 11:00 AM', 'Quiet hours after 10:00 PM', 'No shoes inside',
  'No food in bedrooms', 'Clean up after yourself', 'Respect neighbors'
];

export const AmenitiesHouseRulesStep = () => {
  const { watch, setValue } = useFormContext();

  const toggleAmenity = (amenity: string) => {
    const currentAmenities = watch('amenities');
    if (currentAmenities.includes(amenity)) {
      setValue('amenities', currentAmenities.filter((a: string) => a !== amenity));
    } else {
      setValue('amenities', [...currentAmenities, amenity]);
    }
  };

  const toggleHouseRule = (rule: string) => {
    const currentRules = watch('houseRules');
    if (currentRules.includes(rule)) {
      setValue('houseRules', currentRules.filter((r: string) => r !== rule));
    } else {
      setValue('houseRules', [...currentRules, rule]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Amenities & House Rules</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label>Amenities</Label>
          <div className="grid grid-cols-3 gap-2">
            {AMENITIES_LIST.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  id={`amenity-${amenity}`}
                  checked={watch('amenities').includes(amenity)}
                  onCheckedChange={() => toggleAmenity(amenity)}
                />
                <Label htmlFor={`amenity-${amenity}`} className="text-sm font-normal">
                  {amenity}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Label>House Rules</Label>
          <div className="grid grid-cols-2 gap-2">
            {HOUSE_RULES_LIST.map((rule) => (
              <div key={rule} className="flex items-center space-x-2">
                <Checkbox
                  id={`rule-${rule}`}
                  checked={watch('houseRules').includes(rule)}
                  onCheckedChange={() => toggleHouseRule(rule)}
                />
                <Label htmlFor={`rule-${rule}`} className="text-sm font-normal">
                  {rule}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};