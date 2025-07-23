
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { MapPin } from 'lucide-react';

export const LocationTab = () => {
  const { control } = useFormContext();

  const provinces = [
    'Eastern Cape',
    'Free State',
    'Gauteng',
    'KwaZulu-Natal',
    'Limpopo',
    'Mpumalanga',
    'North West',
    'Northern Cape',
    'Western Cape',
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />Location</CardTitle>
        <CardDescription>Provide the address and pinpoint the location of your property.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField name="address_line1" control={control} render={({ field }) => (<FormItem><FormLabel>Street Address</FormLabel><FormControl><Input placeholder="123 Main Street" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField name="address_line2" control={control} render={({ field }) => (<FormItem><FormLabel>Address Line 2 (Optional)</FormLabel><FormControl><Input placeholder="Apartment, suite, etc." {...field} /></FormControl><FormMessage /></FormItem>)} />
        <div className="grid grid-cols-2 gap-4">
          <FormField name="city" control={control} render={({ field }) => (<FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="Cape Town" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField name="postal_code" control={control} render={({ field }) => (<FormItem><FormLabel>Postal Code</FormLabel><FormControl><Input placeholder="8001" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <FormField
          name="province"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Province</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select a province" /></SelectTrigger></FormControl>
                <SelectContent>{provinces.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};