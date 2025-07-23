
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MapPin,
  Bed,
  Bath,
  Users,
} from 'lucide-react';
import { useApp, useAuth } from '../../contexts/AppContextDemo';
import { propertyApi } from '../../services/api';
import { PropertyListingForm } from './PropertyListingForm';
import { toast } from 'sonner';

// Types
interface PropertyData {
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

interface Property extends PropertyData {
  id: string;
}

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

// Main Property Listing Component
const PropertyManagement = () => {
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
      toast.success('Property deleted successfully.');
    } catch (err: any) {
      toast.error('Failed to delete property: ' + err.message);
    }
  };

  const handleToggleStatus = async (id: string, status: 'active' | 'inactive') => {
    try {
      await propertyApi.updateProperty(id, { status });
      dispatch({ type: 'TOGGLE_STATUS', payload: { id, status } });
      toast.success('Status updated successfully.');
    } catch (err: any) {
      toast.error('Failed to update status: ' + err.message);
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
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{editingProperty ? 'Edit Property' : 'New Property'}</DialogTitle>
            <DialogDescription>
              {editingProperty ? 'Edit your property details' : 'Add a new property to your listing'}
            </DialogDescription>
          </DialogHeader>
          <PropertyListingForm
            property={editingProperty}
            onSave={(savedProperty) => {
              setShowForm(false);
              setEditingProperty(null);
              // You might want to refresh the list of properties here
              // dispatch({ type: 'ADD_OR_UPDATE_PROPERTY', payload: savedProperty });
              toast.success('Property saved successfully!');
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingProperty(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyManagement;
