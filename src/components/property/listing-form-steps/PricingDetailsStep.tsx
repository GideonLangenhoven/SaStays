
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign } from 'lucide-react';

export const PricingDetailsStep = () => {
  const { register, formState: { errors } } = useFormContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" />Pricing Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="baseNightlyRate">Base Nightly Rate (ZAR) *</Label>
            <Input
              id="baseNightlyRate"
              type="number"
              min="1"
              {...register('pricing.baseNightlyRate', { valueAsNumber: true })}
            />
            {errors.pricing?.baseNightlyRate && (
              <p className="text-sm text-red-500">{errors.pricing.baseNightlyRate.message?.toString()}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cleaningFee">Cleaning Fee (ZAR)</Label>
            <Input
              id="cleaningFee"
              type="number"
              min="0"
              {...register('pricing.cleaningFee', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="extraGuestFee">Extra Guest Fee (ZAR)</Label>
            <Input
              id="extraGuestFee"
              type="number"
              min="0"
              {...register('pricing.extraGuestFee', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="petFee">Pet Fee (ZAR)</Label>
            <Input
              id="petFee"
              type="number"
              min="0"
              {...register('pricing.petFee', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weeklyDiscount">Weekly Discount (%)</Label>
            <Input
              id="weeklyDiscount"
              type="number"
              min="0"
              max="100"
              {...register('pricing.weeklyDiscount', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyDiscount">Monthly Discount (%)</Label>
            <Input
              id="monthlyDiscount"
              type="number"
              min="0"
              max="100"
              {...register('pricing.monthlyDiscount', { valueAsNumber: true })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};