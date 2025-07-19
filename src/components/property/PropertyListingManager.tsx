import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Upload, 
  MapPin, 
  Bed, 
  Bath, 
  Users, 
  Wifi, 
  Car, 
  Coffee,
  Tv,
  AirVent,
  Utensils,
  Waves,
  Dumbbell,
  ParkingCircle,
  Camera,
  X,
  Check,
  AlertCircle,
  Home,
  Star
} from 'lucide-react';
import { useApp, useAuth } from '../AppContext';
import { propertyApi, fileApi } from '../../services/api';

// Types
interface PropertyFormData {
  title: string;
  description: string;
  images: string[];
  amenities: string[];
  price: number;
  location: string;
  rules: string[];
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  status: 'active' | 'inactive';
}

// Minimal Property type for this component
interface Property extends PropertyFormData {
  id: string;
}

// Available amenities with icons
const AVAILABLE_AMENITIES = [
  { id: 'wifi', label: 'WiFi', icon: Wifi },
  { id: 'parking', label: 'Parking', icon: ParkingCircle },
  { id: 'kitchen', label: 'Kitchen', icon: Utensils },
  { id: 'tv', label: 'TV', icon: Tv },
  { id: 'ac', label: 'Air Conditioning', icon: AirVent },
  { id: 'coffee', label: 'Coffee Machine', icon: Coffee },
  { id: 'pool', label: 'Swimming Pool', icon: Waves },
  { id: 'gym', label: 'Gym', icon: Dumbbell },
];

// Property Card Component
const PropertyCard = ({ property, onEdit, onDelete, onToggleStatus }: {
  property: Property;
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: 'active' | 'inactive') => void;
}) => {
  const [imageError, setImageError] = useState(false);
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img 
          src={imageError ? '/api/placeholder/400/200' : (property.images?.[0] || '/api/placeholder/400/200')}
          alt={property.title}
          className="w-full h-48 object-cover"
          onError={() => setImageError(true)}
        />
        <div className="absolute top-2 right-2">
          <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
            {property.status}
          </Badge>
        </div>
        <div className="absolute bottom-2 left-2">
          <Badge variant="outline" className="bg-white/90">
            R{property.price}/night
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-1">{property.title}</CardTitle>
        <CardDescription className="flex items-center gap-1 text-sm">
          <MapPin className="w-3 h-3" />
          {property.location}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {property.description}
        </p>
        
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            {property.bedrooms}
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4" />
            {property.bathrooms}
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {property.maxGuests}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {property.amenities?.slice(0, 3).map((amenity: string) => (
            <Badge key={amenity} variant="outline" className="text-xs">
              {amenity}
            </Badge>
          ))}
          {property.amenities?.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{property.amenities.length - 3} more
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-2 pt-0">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onEdit(property)}
          className="flex-1"
        >
          <Edit className="w-3 h-3 mr-1" />
          Edit
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onToggleStatus(property.id, property.status === 'active' ? 'inactive' : 'active')}
        >
          {property.status === 'active' ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onDelete(property.id)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </CardFooter>
    </Card>
  );
};

// Property Form Component
const PropertyForm = ({ property, onSubmit, onCancel }: {
  property?: Property;
  onSubmit: (data: PropertyFormData) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState<PropertyFormData>({
    title: property?.title || '',
    description: property?.description || '',
    images: property?.images || [],
    amenities: property?.amenities || [],
    price: property?.price || 0,
    location: property?.location || '',
    rules: property?.rules || [],
    maxGuests: property?.maxGuests || 1,
    bedrooms: property?.bedrooms || 1,
    bathrooms: property?.bathrooms || 1,
    status: property?.status || 'active',
  });
  
  const [newRule, setNewRule] = useState('');
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof PropertyFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAddRule = () => {
    if (newRule.trim()) {
      setFormData(prev => ({ ...prev, rules: [...prev.rules, newRule] }));
      setNewRule('');
    }
  };

  const handleRemoveRule = (index: number) => {
    setFormData(prev => ({ ...prev, rules: prev.rules.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (formData.images.length === 0) newErrors.images = 'At least one image is required';
    if (formData.amenities.length === 0) newErrors.amenities = 'At least one amenity is required';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.location) newErrors.location = 'Location is required';
    if (formData.rules.length === 0) newErrors.rules = 'At least one rule is required';
    if (formData.maxGuests <= 0) newErrors.maxGuests = 'Max guests must be greater than 0';
    if (formData.bedrooms <= 0) newErrors.bedrooms = 'Bedrooms must be greater than 0';
    if (formData.bathrooms <= 0) newErrors.bathrooms = 'Bathrooms must be greater than 0';

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      setUploading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price.toString());
      formDataToSend.append('location', formData.location);
      formDataToSend.append('maxGuests', formData.maxGuests.toString());
      formDataToSend.append('bedrooms', formData.bedrooms.toString());
      formDataToSend.append('bathrooms', formData.bathrooms.toString());
      formDataToSend.append('status', formData.status);

      if (property) { // Editing existing property
        formDataToSend.append('id', property.id);
        if (formData.images.length > 0) {
          for (let i = 0; i < formData.images.length; i++) {
            formDataToSend.append('images', formData.images[i]);
          }
        }
        if (formData.amenities.length > 0) {
          for (let i = 0; i < formData.amenities.length; i++) {
            formDataToSend.append('amenities', formData.amenities[i]);
          }
        }
        if (formData.rules.length > 0) {
          for (let i = 0; i < formData.rules.length; i++) {
            formDataToSend.append('rules', formData.rules[i]);
          }
        }
        await propertyApi.updateProperty(property.id, formDataToSend);
      } else { // Creating new property
        if (formData.images.length > 0) {
          for (let i = 0; i < formData.images.length; i++) {
            formDataToSend.append('images', formData.images[i]);
          }
        }
        if (formData.amenities.length > 0) {
          for (let i = 0; i < formData.amenities.length; i++) {
            formDataToSend.append('amenities', formData.amenities[i]);
          }
        }
        if (formData.rules.length > 0) {
          for (let i = 0; i < formData.rules.length; i++) {
            formDataToSend.append('rules', formData.rules[i]);
          }
        }
        await propertyApi.createProperty(formDataToSend);
      }
      onSubmit(formData);
    } catch (error: any) {
      setError('Failed to save property: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={!!property} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{property ? 'Edit Property' : 'New Property'}</DialogTitle>
          <DialogDescription>
            {property ? 'Edit your property details' : 'Add a new property to your listing'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="col-span-3"
            />
            {errors.title && <p className="text-red-500 text-sm col-span-4">{errors.title}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="col-span-4"
            />
            {errors.description && <p className="text-red-500 text-sm col-span-4">{errors.description}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price (R/night)
            </Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
              className="col-span-1"
            />
            {errors.price && <p className="text-red-500 text-sm col-span-3">{errors.price}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Location
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="col-span-3"
            />
            {errors.location && <p className="text-red-500 text-sm col-span-4">{errors.location}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="maxGuests" className="text-right">
              Max Guests
            </Label>
            <Input
              id="maxGuests"
              type="number"
              value={formData.maxGuests}
              onChange={(e) => handleInputChange('maxGuests', parseInt(e.target.value))}
              className="col-span-1"
            />
            {errors.maxGuests && <p className="text-red-500 text-sm col-span-3">{errors.maxGuests}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bedrooms" className="text-right">
              Bedrooms
            </Label>
            <Input
              id="bedrooms"
              type="number"
              value={formData.bedrooms}
              onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value))}
              className="col-span-1"
            />
            {errors.bedrooms && <p className="text-red-500 text-sm col-span-3">{errors.bedrooms}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bathrooms" className="text-right">
              Bathrooms
            </Label>
            <Input
              id="bathrooms"
              type="number"
              value={formData.bathrooms}
              onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value))}
              className="col-span-1"
            />
            {errors.bathrooms && <p className="text-red-500 text-sm col-span-3">{errors.bathrooms}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select onValueChange={(value) => handleInputChange('status', value)} defaultValue={formData.status}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              Amenities
            </Label>
            <div className="col-span-4 flex flex-wrap gap-2">
              {AVAILABLE_AMENITIES.map((amenity) => (
                <Badge
                  key={amenity.id}
                  variant={formData.amenities.includes(amenity.id) ? 'default' : 'outline'}
                  className="flex items-center gap-1 cursor-pointer"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      amenities: prev.amenities.includes(amenity.id)
                        ? prev.amenities.filter(a => a !== amenity.id)
                        : [...prev.amenities, amenity.id],
                    }));
                  }}
                >
                  <amenity.icon className="w-4 h-4" />
                  {amenity.label}
                </Badge>
              ))}
            </div>
            {errors.amenities && <p className="text-red-500 text-sm col-span-4">{errors.amenities}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              Rules
            </Label>
            <div className="col-span-4 flex flex-wrap gap-2">
              {formData.rules.map((rule, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  <X className="w-3 h-3 text-red-500 cursor-pointer" onClick={() => handleRemoveRule(index)} />
                  {rule}
                </Badge>
              ))}
              <Input
                placeholder="Add a rule"
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddRule();
                  }
                }}
                className="col-span-3"
              />
            </div>
            {errors.rules && <p className="text-red-500 text-sm col-span-4">{errors.rules}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="images" className="text-right">
              Images
            </Label>
            <div className="col-span-4 flex flex-wrap gap-2">
              {formData.images.map((image, index) => (
                <div key={index} className="relative w-24 h-24 rounded-md overflow-hidden">
                  <img src={image} alt={`Property image ${index + 1}`} className="w-full h-full object-cover" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-0 right-0 w-6 h-6 rounded-full"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        images: prev.images.filter((_, i) => i !== index),
                      }));
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.multiple = true;
                  input.onchange = (event) => {
                    const files = (event.target as HTMLInputElement).files;
                    if (files) {
                      for (let i = 0; i < files.length; i++) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          setFormData(prev => ({
                            ...prev,
                            images: [...prev.images, e.target?.result as string],
                          }));
                        };
                        reader.readAsDataURL(files[i]);
                      }
                    }
                  };
                  input.click();
                }}
                disabled={uploading}
                className="col-span-4"
              >
                {uploading ? 'Uploading...' : 'Upload Images'}
                {uploading && <Upload className="ml-2 w-4 h-4 animate-spin" />}
              </Button>
            </div>
            {errors.images && <p className="text-red-500 text-sm col-span-4">{errors.images}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={uploading}>
            {uploading ? 'Saving...' : 'Save Property'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main Property Listing Component
const PropertyListingManager = () => {
  const { state, dispatch } = useApp();
  const { user, isOwner } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const properties = await propertyApi.getProperties();
        dispatch({ type: 'SET_PROPERTIES', payload: properties });
      } catch (err: any) {
        setError('Failed to fetch properties: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
    const interval = setInterval(fetchProperties, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setShowForm(true);
  };

  const handleDeleteProperty = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this property?')) {
      return;
    }
    try {
      await propertyApi.deleteProperty(id);
      dispatch({ type: 'DELETE_PROPERTY', payload: id });
      setError('Property deleted successfully.');
    } catch (err: any) {
      setError('Failed to delete property: ' + err.message);
    }
  };

  const handleToggleStatus = async (id: string, status: 'active' | 'inactive') => {
    try {
      await propertyApi.updateProperty(id, { status });
      dispatch({ type: 'TOGGLE_STATUS', payload: { id, status } });
      setError('Status updated successfully.');
    } catch (err: any) {
      setError('Failed to update status: ' + err.message);
    }
  };

  const handleCreateProperty = () => {
    setEditingProperty(null);
    setShowForm(true);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Properties</h1>
      {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}
      <Button onClick={handleCreateProperty} className="mb-4">
        <Plus className="w-4 h-4 mr-2" /> Add New Property
      </Button>
      {loading ? (
        <p>Loading properties...</p>
      ) : state.properties.length === 0 ? (
        <p>You have no properties listed yet. Add a new one!</p>
      ) : (
        <ScrollArea className="rounded-md border">
          <div className="grid gap-4">
            {state.properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onEdit={handleEditProperty}
                onDelete={handleDeleteProperty}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        </ScrollArea>
      )}
      <PropertyForm
        property={editingProperty}
        onSubmit={(data) => {
          setEditingProperty(null);
          setShowForm(false);
          setError('Property saved successfully.');
        }}
        onCancel={() => {
          setEditingProperty(null);
          setShowForm(false);
        }}
      />
    </div>
  );
};

export default PropertyListingManager; 