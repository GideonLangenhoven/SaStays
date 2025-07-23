
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Users } from 'lucide-react';

export const DetailsTab = () => {
  const { control } = useFormContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Property Details</CardTitle>
        <CardDescription>Specify the capacity and features of your property</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <FormField name="max_guests" control={control} render={({ field }) => (<FormItem><FormLabel>Max Guests</FormLabel><FormControl><Input type="number" min={1} {...field} onChange={e => field.onChange(+e.target.value)} /></FormControl><FormMessage /></FormItem>)} />
          <FormField name="bedrooms" control={control} render={({ field }) => (<FormItem><FormLabel>Bedrooms</FormLabel><FormControl><Input type="number" min={0} {...field} onChange={e => field.onChange(+e.target.value)} /></FormControl><FormMessage /></FormItem>)} />
          <FormField name="bathrooms" control={control} render={({ field }) => (<FormItem><FormLabel>Bathrooms</FormLabel><FormControl><Input type="number" min={0.5} step={0.5} {...field} onChange={e => field.onChange(+e.target.value)} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField name="minimum_stay" control={control} render={({ field }) => (<FormItem><FormLabel>Minimum Stay</FormLabel><FormControl><Input type="number" min={1} {...field} onChange={e => field.onChange(+e.target.value)} /></FormControl><FormMessage /></FormItem>)} />
          <FormField name="maximum_stay" control={control} render={({ field }) => (<FormItem><FormLabel>Maximum Stay</FormLabel><FormControl><Input type="number" min={1} {...field} onChange={e => field.onChange(+e.target.value)} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField name="check_in_time" control={control} render={({ field }) => (<FormItem><FormLabel>Check-in Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField name="check_out_time" control={control} render={({ field }) => (<FormItem><FormLabel>Check-out Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <FormField
          name="instant_book"
          control={control}
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Enable Instant Booking</FormLabel>
                <p className="text-sm text-muted-foreground">Guests can book without requiring your approval.</p>
              </div>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};