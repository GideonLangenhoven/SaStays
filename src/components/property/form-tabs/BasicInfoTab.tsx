import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Users, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BasicInfoTabProps {
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
  imagePreview: string[];
}

export const BasicInfoTab: React.FC<BasicInfoTabProps> = ({ handleImageUpload, removeImage, imagePreview }) => {
  const { control } = useFormContext();

  const propertyTypes = [
    'Apartment',
    'House',
    'Townhouse',
    'Villa',
    'Cottage',
    'Guest House',
    'Room',
    'Studio',
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Basic Information</CardTitle>
        <CardDescription>Tell guests about your property with an engaging title and description</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Stunning Beachfront Villa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe your property in detail..." {...field} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="property_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Select a property type" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {propertyTypes.map(type => <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <Label>Property Images</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mt-2">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="images" className="cursor-pointer bg-sea text-white px-4 py-2 rounded-md hover:bg-sea-dark">
                Upload Images
                <input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <p className="mt-2 text-sm text-gray-500">Upload up to 10 high-quality photos (JPG, PNG)</p>
          </div>
          {imagePreview.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mt-4">
              {imagePreview.map((preview, index) => (
                <div key={index} className="relative">
                  <img src={preview} alt={`Property ${index + 1}`} className="w-full h-20 object-cover rounded-lg" />
                  <Button type="button" variant="destructive" size="sm" className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0" onClick={() => removeImage(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};