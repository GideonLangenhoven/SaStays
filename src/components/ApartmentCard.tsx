import React from 'react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import { MapPin, Users, Home } from 'lucide-react';

// This interface now reflects the columns in our Express API 'properties' table
export interface ApartmentProps {
  id: number;
  title: string;
  description: string;
  price_per_night?: number; // Legacy field
  nightly_price?: string | number; // Current API field
  capacity?: number; // Legacy field
  max_guests?: number; // Current API field
  location: string;
  image_url?: string; // Legacy field
  images?: string[]; // Current API field
  amenities: string[];
  bedrooms?: number;
  bathrooms?: number;
  property_type?: string;
}

const ApartmentCard: React.FC<{ apartment: ApartmentProps }> = ({ apartment }) => {
  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <img
          src={apartment.image_url || (apartment.images && apartment.images[0]) || 'https://via.placeholder.com/800x600?text=No+Image'}
          alt={apartment.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-foreground mb-2 truncate">{apartment.title}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">{apartment.description}</p>
        
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <div className="flex items-center mr-4" title="Location">
            <MapPin className="h-4 w-4 mr-1.5" />
            <span>{apartment.location}</span>
          </div>
          <div className="flex items-center" title="Capacity">
            <Users className="h-4 w-4 mr-1.5" />
            <span>{apartment.max_guests || apartment.capacity || 1} Guests</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {apartment.amenities.slice(0, 3).map((feature, index) => (
            <span key={index} className="text-xs bg-muted px-2 py-1 rounded-md">
              {feature}
            </span>
          ))}
          {apartment.amenities.length > 3 && (
            <span className="text-xs bg-muted px-2 py-1 rounded-md">
              +{apartment.amenities.length - 3} more
            </span>
          )}
        </div>
        
        <div className="mt-auto space-y-3">
            <div className="flex justify-between items-center">
                <div className="text-lg font-bold text-primary">
                    R{parseFloat((apartment.nightly_price || apartment.price_per_night || 0).toString()).toLocaleString('en-ZA')}
                    <span className="text-sm font-normal text-muted-foreground">/night</span>
                </div>
            </div>
            <div className="flex gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link to={`/apartments/${apartment.id}`}>
                        View Details
                    </Link>
                </Button>
                <Button asChild size="sm" className="flex-1">
                    <Link to={`/booking?propertyId=${apartment.id}`}>
                        Book Now
                    </Link>
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ApartmentCard;