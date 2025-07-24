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
import { useAuth } from '@/contexts/AuthContext';
import { propertyApi } from '../services/api.ts';

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
  property: any;
  onEdit: (property: any) => void;
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
  property?: any;
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
  const [errors, setErrors] = useState<any>({});

  const handleInputChange = (field: keyof PropertyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: null }));
    }
  };

  const handleAmenityToggle = (amenityId: string) => {
    const amenityLabel = AVAILABLE_AMENITIES.find(a => a.id === amenityId)?.label || amenityId;
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityLabel)
        ? prev.amenities.filter(a => a !== amenityLabel)
        : [...prev.amenities, amenityLabel]
    }));
  };

  const handleAddRule = () => {
    if (newRule.trim()) {
      setFormData(prev => ({
        ...prev,
        rules: [...prev.rules, newRule.trim()]
      }));
      setNewRule('');
    }
  };

  const handleRemoveRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = async (files: FileList) => {
    if (!files.length) return;
    
    setUploading(true);
    try {
      // For now, create placeholder URLs - in production this would upload to storage
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (formData.maxGuests <= 0) newErrors.maxGuests = 'Max guests must be greater than 0';
    if (formData.bedrooms <= 0) newErrors.bedrooms = 'Bedrooms must be greater than 0';
    if (formData.bathrooms <= 0) newErrors.bathrooms = 'Bathrooms must be greater than 0';
    if (formData.images.length === 0) newErrors.images = 'At least one image is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="amenities">Amenities</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Property Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Beautiful Beachfront Villa"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Cape Town, South Africa"
                className={errors.location ? 'border-red-500' : ''}
              />
              {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your property..."
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="status"
              checked={formData.status === 'active'}
              onCheckedChange={(checked) => handleInputChange('status', checked ? 'active' : 'inactive')}
            />
            <Label htmlFor="status">Active listing</Label>
          </div>
        </TabsContent>
        
        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price per night (R) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', Number(e.target.value))}
                min="0"
                className={errors.price ? 'border-red-500' : ''}
              />
              {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxGuests">Max Guests *</Label>
              <Input
                id="maxGuests"
                type="number"
                value={formData.maxGuests}
                onChange={(e) => handleInputChange('maxGuests', Number(e.target.value))}
                min="1"
                className={errors.maxGuests ? 'border-red-500' : ''}
              />
              {errors.maxGuests && <p className="text-sm text-red-500">{errors.maxGuests}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms *</Label>
              <Input
                id="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={(e) => handleInputChange('bedrooms', Number(e.target.value))}
                min="1"
                className={errors.bedrooms ? 'border-red-500' : ''}
              />
              {errors.bedrooms && <p className="text-sm text-red-500">{errors.bedrooms}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms *</Label>
              <Input
                id="bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={(e) => handleInputChange('bathrooms', Number(e.target.value))}
                min="1"
                className={errors.bathrooms ? 'border-red-500' : ''}
              />
              {errors.bathrooms && <p className="text-sm text-red-500">{errors.bathrooms}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>House Rules</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                placeholder="Add a house rule..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRule())}
              />
              <Button type="button" onClick={handleAddRule} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {formData.rules.map((rule, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm">{rule}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveRule(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="amenities" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {AVAILABLE_AMENITIES.map((amenity) => {
              const Icon = amenity.icon;
              const isSelected = formData.amenities.includes(amenity.label);
              
              return (
                <div
                  key={amenity.id}
                  className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleAmenityToggle(amenity.id)}
                >
                  <Checkbox checked={isSelected} onChange={() => {}} />
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{amenity.label}</span>
                </div>
              );
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="images" className="space-y-4">
          <div className="space-y-2">
            <Label>Property Images *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                className="hidden"
                id="image-upload"
                disabled={uploading}
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">
                  {uploading ? 'Uploading...' : 'Click to upload images or drag and drop'}
                </p>
                <p className="text-xs text-gray-400">PNG, JPG up to 10MB each</p>
              </label>
            </div>
            {errors.images && <p className="text-sm text-red-500">{errors.images}</p>}
          </div>
          
          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Property ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={uploading}>
          {uploading ? 'Uploading...' : property ? 'Update Property' : 'Create Property'}
        </Button>
      </div>
    </form>
  );
};

// Main Property Listing Component
const PropertyListingManager = () => {
  const { owner } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load properties on mount
  useEffect(() => {
    if (owner) {
      loadProperties();
    }
  }, [owner]);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const response = await propertyApi.getProperties();
      setProperties(response || []);
    } catch (error) {
      setError('Failed to load properties');
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProperty = async (data: PropertyFormData) => {
    setLoading(true);
    try {
      const response = await propertyApi.createProperty(data);
      setProperties(prev => [...prev, response]);
      setShowForm(false);
      setError(null);
    } catch (error) {
      setError('Failed to create property');
      console.error('Error creating property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProperty = async (data: PropertyFormData) => {
    if (!editingProperty) return;
    
    setLoading(true);
    try {
      const response = await propertyApi.updateProperty(editingProperty.id, data);
      setProperties(prev => prev.map(p => p.id === editingProperty.id ? response : p));
      setEditingProperty(null);
      setShowForm(false);
      setError(null);
    } catch (error) {
      setError('Failed to update property');
      console.error('Error updating property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    
    setLoading(true);
    try {
      await propertyApi.deleteProperty(id);
      setProperties(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      setError('Failed to delete property');
      console.error('Error deleting property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, status: 'active' | 'inactive') => {
    setLoading(true);
    try {
      const response = await propertyApi.updateProperty(id, { status });
      setProperties(prev => prev.map(p => p.id === id ? response : p));
    } catch (error) {
      setError('Failed to update property status');
      console.error('Error updating property status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (property: any) => {
    setEditingProperty(property);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setEditingProperty(null);
    setShowForm(false);
  };

  if (!owner) {
    return (
      <div className="p-6 text-center">
        <Home className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h2 className="text-xl font-semibold mb-2">Owner Access Required</h2>
        <p className="text-gray-600">You need to be logged in as a property owner to manage listings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Property Management</h1>
          <p className="text-gray-600">Manage your property listings and availability</p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingProperty(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>
                {editingProperty ? 'Edit Property' : 'Add New Property'}
              </DialogTitle>
              <DialogDescription>
                {editingProperty 
                  ? 'Update your property details below'
                  : 'Fill in the details to create a new property listing'
                }
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh]">
              <PropertyForm
                property={editingProperty}
                onSubmit={editingProperty ? handleUpdateProperty : handleCreateProperty}
                onCancel={handleCancelForm}
              />
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Properties Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200" />
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded w-5/6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <Card className="p-12 text-center">
          <Home className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No Properties Yet</h3>
          <p className="text-gray-600 mb-4">
            Start by adding your first property listing to begin accepting bookings.
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Property
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onEdit={handleEdit}
              onDelete={handleDeleteProperty}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyManagement;