import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen } from 'lucide-react';

const HOUSE_RULES_LIST = [
  'No smoking',
  'No pets',
  'No parties or events',
  'Quiet hours after 10:00 PM',
];

interface HouseRulesSelectorProps {
  selectedRules: string[];
  customRules: string;
  onRuleToggle: (rule: string) => void;
  onCustomRulesChange: (value: string) => void;
}

export const HouseRulesSelector: React.FC<HouseRulesSelectorProps> = ({
  selectedRules,
  customRules,
  onRuleToggle,
  onCustomRulesChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          House Rules
        </CardTitle>
        <CardDescription>
          Set the rules for your property to ensure a smooth experience for everyone.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Common Rules</Label>
          <div className="grid grid-cols-2 gap-4">
            {HOUSE_RULES_LIST.map(rule => (
              <div key={rule} className="flex items-center space-x-2">
                <Checkbox
                  id={`rule-${rule}`}
                  checked={selectedRules.includes(rule)}
                  onCheckedChange={() => onRuleToggle(rule)}
                />
                <Label htmlFor={`rule-${rule}`} className="text-sm font-normal">
                  {rule}
                </Label>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="custom-rules">Additional Rules</Label>
          <Textarea
            id="custom-rules"
            placeholder="e.g., Please remove shoes before entering."
            value={customRules}
            onChange={(e) => onCustomRulesChange(e.target.value)}
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
};