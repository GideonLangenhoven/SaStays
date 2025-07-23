
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Users } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';

interface GuestRequirements {
    minAge?: number;
    verificationRequired: boolean;
    governmentIdRequired: boolean;
}

interface GuestRequirementsFormProps {
  requirements: GuestRequirements;
  onRequirementChange: (requirements: GuestRequirements) => void;
}

export const GuestRequirementsForm: React.FC<GuestRequirementsFormProps> = ({ requirements, onRequirementChange }) => {
    const handleChange = (field: keyof GuestRequirements, value: any) => {
        onRequirementChange({ ...requirements, [field]: value });
    };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Guest Requirements
        </CardTitle>
        <CardDescription>
          Set requirements for guests who can book your property.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={{}} // This is a placeholder, as we are not using react-hook-form here
          name="verificationRequired"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Require Verified Email/Phone</FormLabel>
                <FormDescription>Guests must have a verified email and phone number to book.</FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={requirements.verificationRequired}
                  onCheckedChange={(checked) => handleChange('verificationRequired', checked)}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={{}} // This is a placeholder, as we are not using react-hook-form here
          name="governmentIdRequired"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Require Government-Issued ID</FormLabel>
                <FormDescription>Guests must submit a government-issued ID to book.</FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={requirements.governmentIdRequired}
                  onCheckedChange={(checked) => handleChange('governmentIdRequired', checked)}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="space-y-2">
          <Label htmlFor="minAge">Minimum Guest Age</Label>
          <Input
            id="minAge"
            type="number"
            min="18"
            max="99"
            placeholder="e.g., 21"
            value={requirements.minAge || ''}
            onChange={(e) => handleChange('minAge', parseInt(e.target.value, 10) || undefined)}
          />
        </div>
      </CardContent>
    </Card>
  );
};