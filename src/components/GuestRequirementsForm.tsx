import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Users } from 'lucide-react';

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
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="verificationRequired">Require Verified Email/Phone</Label>
          <Switch
            id="verificationRequired"
            checked={requirements.verificationRequired}
            onCheckedChange={(checked) => handleChange('verificationRequired', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="governmentIdRequired">Require Government-Issued ID</Label>
          <Switch
            id="governmentIdRequired"
            checked={requirements.governmentIdRequired}
            onCheckedChange={(checked) => handleChange('governmentIdRequired', checked)}
          />
        </div>
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