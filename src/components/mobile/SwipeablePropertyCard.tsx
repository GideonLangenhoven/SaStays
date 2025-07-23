// src/components/mobile/SwipeablePropertyCard.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Heart,
  Share2,
  Star,
  MapPin,
  Wifi,
  Car,
  Coffee,
  Tv,
  Users,
  Bed,
  Bath,
  Zap,
  Clock,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Eye,
  Phone,
  MessageCircle,
  Calendar,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  guests: number;
  amenities: string[];
  host: {
    name: string;
    avatar?: string;
    superhost: boolean;
  };
  instantBooking: boolean;
  discount?: number;
  availableFrom?: Date;
  isFavorite?: boolean;
  isNew?: boolean;
}

interface SwipeablePropertyCardProps {
  property: Property;
  onFavoriteToggle?: (propertyId: string) => void;
  onShare?: (property: Property) => void;
  onContact?: (property: Property) => void;
  onBook?: (property: Property) => void;
  onView?: (property: Property) => void;
  className?: string;
  variant?: 'full' | 'compact' | 'list';
}

export const SwipeablePropertyCard: React.FC<SwipeablePropertyCardProps> = ({
  property,
  onFavoriteToggle,
  onShare,
  onContact,
  onBook,
  onView,
  className = '',
  variant = 'full'
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isLiked, setIsLiked] = useState(property.isFavorite || false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentImageIndex < property.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
    if (isRightSwipe && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    onFavoriteToggle?.(property.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.(property);
  };

  const handleQuickAction = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    switch (action) {
      case 'contact':
        onContact?.(property);
        break;
      case 'book':
        onBook?.(property);
        break;
      case 'view':
        onView?.(property);
        break;
    }
    setShowQuickActions(false);
  };

  const renderAmenityIcon = (amenity: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      wifi: <Wifi className="h-3 w-3" />,
      parking: <Car className="h-3 w-3" />,
      kitchen: <Coffee className="h-3 w-3" />,
      tv: <Tv className="h-3 w-3" />,
      breakfast: <Coffee className="h-3 w-3" />
    };
    return iconMap[amenity] || <Coffee className="h-3 w-3" />;
  };

  // Compact variant for list view
  if (variant === 'compact') {
    return (
      <Card className={`w-full ${className}`} onClick={() => onView?.(property)}>
        <CardContent className="p-3">
          <div className="flex space-x-3">
            {/* Image */}
            <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              {property.isNew && (
                <Badge className="absolute top-1 left-1 text-xs px-1">New</Badge>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-semibold text-sm truncate">{property.title}</h3>
                <button onClick={handleFavoriteToggle}>
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </button>
              </div>
              
              <div className="flex items-center text-xs text-muted-foreground mb-1">
                <MapPin className="h-3 w-3 mr-1" />
                <span className="truncate">{property.location}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs ml-1">{property.rating}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">({property.reviews})</span>
                </div>
                <div className="text-sm font-semibold">
                  R{property.price}/night
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // List variant for detailed list view
  if (variant === 'list') {
    return (
      <Card className={`w-full ${className}`} onClick={() => onView?.(property)}>
        <CardContent className="p-4">
          <div className="flex space-x-4">
            {/* Image Gallery */}
            <div className="relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
              <div
                ref={imageRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="relative w-full h-full"
              >
                <img
                  src={property.images[currentImageIndex]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Image indicators */}
                {property.images.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {property.images.map((_, index) => (
                      <div
                        key={index}
                        className={`w-1.5 h-1.5 rounded-full ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col space-y-1">
                {property.isNew && (
                  <Badge variant="secondary" className="text-xs px-2">New</Badge>
                )}
                {property.discount && (
                  <Badge variant="destructive" className="text-xs px-2">
                    -{property.discount}%
                  </Badge>
                )}
              </div>

              {/* Favorite Button */}
              <button
                onClick={handleFavoriteToggle}
                className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full"
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{property.title}</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span className="truncate">{property.location}</span>
                  </div>
                </div>
              </div>

              {/* Host Info */}
              <div className="flex items-center space-x-2 mb-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={property.host.avatar} />
                  <AvatarFallback className="text-xs">
                    {property.host.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">{property.host.name}</span>
                {property.host.superhost && (
                  <Badge variant="outline" className="text-xs px-1">Superhost</Badge>
                )}
              </div>

              {/* Property Details */}
              <div className="flex items-center space-x-3 text-sm text-muted-foreground mb-2">
                <div className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  <span>{property.guests}</span>
                </div>
                <div className="flex items-center">
                  <Bed className="h-3 w-3 mr-1" />
                  <span>{property.bedrooms}</span>
                </div>
                <div className="flex items-center">
                  <Bath className="h-3 w-3 mr-1" />
                  <span>{property.bathrooms}</span>
                </div>
              </div>

              {/* Amenities */}
              <div className="flex items-center space-x-2 mb-3">
                {property.amenities.slice(0, 4).map((amenity, index) => (
                  <div key={index} className="flex items-center text-muted-foreground">
                    {renderAmenityIcon(amenity)}
                  </div>
                ))}
                {property.amenities.length > 4 && (
                  <span className="text-xs text-muted-foreground">
                    +{property.amenities.length - 4} more
                  </span>
                )}
              </div>

              {/* Rating and Price */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium ml-1">{property.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">({property.reviews} reviews)</span>
                  {property.instantBooking && (
                    <Badge variant="outline" className="flex items-center text-xs px-2">
                      <Zap className="h-3 w-3 mr-1" />
                      Instant
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  {property.originalPrice && (
                    <div className="text-xs text-muted-foreground line-through">
                      R{property.originalPrice}
                    </div>
                  )}
                  <div className="font-semibold">
                    R{property.price}<span className="text-sm font-normal">/night</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex space-x-2 mt-3 pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => handleQuickAction('contact', e)}
              className="flex-1"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => handleQuickAction('view', e)}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
            <Button
              size="sm"
              onClick={(e) => handleQuickAction('book', e)}
              className="flex-1"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Book
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full variant (default)
  return (
    <Card className={`w-full ${className}`} onClick={() => onView?.(property)}>
      <CardContent className="p-0">
        {/* Image Gallery */}
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <div
            ref={imageRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative w-full h-full"
          >
            <img
              src={property.images[currentImageIndex]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            
            {/* Navigation arrows for desktop */}
            {property.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentImageIndex > 0) {
                      setCurrentImageIndex(currentImageIndex - 1);
                    }
                  }}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 p-1 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentImageIndex < property.images.length - 1) {
                      setCurrentImageIndex(currentImageIndex + 1);
                    }
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </>
            )}
            
            {/* Image indicators */}
            {property.images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {property.images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col space-y-1">
            {property.isNew && (
              <Badge variant="secondary" className="text-xs">New</Badge>
            )}
            {property.discount && (
              <Badge variant="destructive" className="text-xs">
                -{property.discount}% off
              </Badge>
            )}
            {property.instantBooking && (
              <Badge variant="outline" className="bg-white/90 text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Instant Book
              </Badge>
            )}
          </div>

          {/* Action buttons */}
          <div className="absolute top-3 right-3 flex space-x-2">
            <button
              onClick={handleShare}
              className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white/90 transition-colors"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              onClick={handleFavoriteToggle}
              className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white/90 transition-colors"
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{property.title}</h3>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm truncate">{property.location}</span>
              </div>
            </div>
          </div>

          {/* Host */}
          <div className="flex items-center space-x-2 mb-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={property.host.avatar} />
              <AvatarFallback>{property.host.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{property.host.name}</span>
                {property.host.superhost && (
                  <Badge variant="outline" className="text-xs">Superhost</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Property details */}
          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>{property.guests} guests</span>
            </div>
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              <span>{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              <span>{property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Amenities */}
          <div className="flex items-center space-x-3 mb-3">
            {property.amenities.slice(0, 5).map((amenity, index) => (
              <div key={index} className="flex items-center text-muted-foreground">
                {renderAmenityIcon(amenity)}
              </div>
            ))}
            {property.amenities.length > 5 && (
              <span className="text-sm text-muted-foreground">
                +{property.amenities.length - 5}
              </span>
            )}
          </div>

          {/* Rating and availability */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="font-medium ml-1">{property.rating}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                ({property.reviews} review{property.reviews !== 1 ? 's' : ''})
              </span>
            </div>
            {property.availableFrom && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                <span>Available {format(property.availableFrom, 'MMM d')}</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              {property.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  R{property.originalPrice}
                </span>
              )}
              <span className="text-2xl font-bold">R{property.price}</span>
              <span className="text-muted-foreground">/night</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => handleQuickAction('contact', e)}
              className="flex-1"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Host
            </Button>
            <Button
              size="sm"
              onClick={(e) => handleQuickAction('book', e)}
              className="flex-1"
            >
              {property.instantBooking ? (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Book Instantly
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Request to Book
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SwipeablePropertyCard;