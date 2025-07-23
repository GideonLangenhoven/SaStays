
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';

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
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <FormLabel>Common Rules</FormLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {HOUSE_RULES_LIST.map(rule => (
              <FormField
                key={rule}
                control={{}} // Placeholder
                name="houseRules"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={selectedRules.includes(rule)}
                        onCheckedChange={() => onRuleToggle(rule)}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{rule}</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
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