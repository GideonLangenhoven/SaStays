
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { DollarSign } from 'lucide-react';

export const PricingTab = () => {
  const { control } = useFormContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" />Pricing & Fees</CardTitle>
        <CardDescription>Set your nightly rate and additional fees</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField name="base_price" control={control} render={({ field }) => (
          <FormItem>
            <FormLabel>Base Price (per night)</FormLabel>
            <FormControl>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R</span>
                <Input type="number" min={50} step={10} className="pl-8" {...field} onChange={e => field.onChange(+e.target.value)} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField name="cleaning_fee" control={control} render={({ field }) => (
            <FormItem>
              <FormLabel>Cleaning Fee</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R</span>
                  <Input type="number" min={0} step={10} className="pl-8" {...field} onChange={e => field.onChange(+e.target.value)} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="extra_guest_fee" control={control} render={({ field }) => (
            <FormItem>
              <FormLabel>Extra Guest Fee (per person)</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R</span>
                  <Input type="number" min={0} step={5} className="pl-8" {...field} onChange={e => field.onChange(+e.target.value)} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
      </CardContent>
    </Card>
  );
};