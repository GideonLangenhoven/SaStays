
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Home } from 'lucide-react';

export const BasicInfoStep = () => {
  const { register, formState: { errors } } = useFormContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Home className="h-5 w-5" />Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="propertyType">Property Type *</Label>
          <select
            id="propertyType"
            {...register('propertyType')}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="villa">Villa</option>
            <option value="cottage">Cottage</option>
            <option value="other">Other</option>
          </select>
          {errors.propertyType && (
            <p className="text-sm text-red-500">{errors.propertyType.message?.toString()}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Property Title *</Label>
          <Input
            id="title"
            {...register('title')}
            placeholder="Beautiful oceanfront apartment with stunning views"
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message?.toString()}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Describe your space in detail. What makes it special? What can guests expect?"
            rows={6}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description.message?.toString()}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};