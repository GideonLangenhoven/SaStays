import React from 'react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

export interface ApartmentProps {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  size: number;
  image: string;
  location: string;
  features: string[];
  rating?: number;
}

const ApartmentCard: React.FC<{ apartment: ApartmentProps }> = ({ apartment }) => {
  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-48 overflow-hidden">
        <img
          src={apartment.image}
          alt={apartment.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium flex items-center">
          <span className="h-3 w-3 mr-1" />
          {apartment.location}
        </div>
        {apartment.rating && (
          <div className="absolute top-3 right-3 bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
            <span className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
            {apartment.rating}
          </div>
        )}
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-foreground">{apartment.name}</h3>
          <div className="text-lg font-bold text-primary">R{apartment.price.toLocaleString('en-ZA')}<span className="text-sm font-normal text-muted-foreground">/night</span></div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{apartment.description}</p>
        
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <div className="flex items-center mr-4">
            <span className="h-4 w-4 mr-1" />
            {apartment.capacity} {apartment.capacity > 1 ? 'Guests' : 'Guest'}
          </div>
          <div className="flex items-center mr-4">
            <span className="h-4 w-4 mr-1" />
            {apartment.size} m²
          </div>
          <div className="flex items-center bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
            Cape Town
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {apartment.features.slice(0, 3).map((feature, index) => (
            <span key={index} className="text-xs bg-muted px-2 py-1 rounded-md">
              {feature}
            </span>
          ))}
          {apartment.features.length > 3 && (
            <span className="text-xs bg-muted px-2 py-1 rounded-md">
              +{apartment.features.length - 3} more
            </span>
          )}
        </div>
        
        <Button asChild className="w-full mt-2">
          <Link to={`/apartments/${apartment.id}`}>
            View Details
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default ApartmentCard;