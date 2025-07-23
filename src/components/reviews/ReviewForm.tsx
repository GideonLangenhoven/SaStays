import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Star, Send, CheckCircle, AlertCircle, Calendar, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import reviewService, { ReviewData } from '@/services/reviewService';

interface ReviewFormProps {
  bookingId: string;
  propertyName: string;
  checkInDate: Date;
  checkOutDate: Date;
  guestCount: number;
  onReviewSubmitted?: (review: any) => void;
  className?: string;
}

interface RatingCategory {
  key: keyof ReviewData;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const ratingCategories: RatingCategory[] = [
  {
    key: 'cleanliness_rating',
    label: 'Cleanliness',
    description: 'How clean was the property?',
    icon: <Star className="h-4 w-4" />
  },
  {
    key: 'communication_rating',
    label: 'Communication',
    description: 'How was the host communication?',
    icon: <Star className="h-4 w-4" />
  },
  {
    key: 'check_in_rating',
    label: 'Check-in',
    description: 'How smooth was the check-in process?',
    icon: <Star className="h-4 w-4" />
  },
  {
    key: 'accuracy_rating',
    label: 'Accuracy',
    description: 'How accurate was the listing description?',
    icon: <Star className="h-4 w-4" />
  },
  {
    key: 'location_rating',
    label: 'Location',
    description: 'How was the location?',
    icon: <Star className="h-4 w-4" />
  },
  {
    key: 'value_rating',
    label: 'Value',
    description: 'How was the value for money?',
    icon: <Star className="h-4 w-4" />
  }
];

export const ReviewForm: React.FC<ReviewFormProps> = ({
  bookingId,
  propertyName,
  checkInDate,
  checkOutDate,
  guestCount,
  onReviewSubmitted,
  className
}) => {
  const [reviewData, setReviewData] = useState<ReviewData>({
    booking_id: bookingId,
    rating: 0,
    review_text: '',
    cleanliness_rating: 0,
    communication_rating: 0,
    check_in_rating: 0,
    accuracy_rating: 0,
    location_rating: 0,
    value_rating: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingReview, setExistingReview] = useState<any>(null);
  const [hoveredRating, setHoveredRating] = useState<{ category: string; rating: number } | null>(null);

  useEffect(() => {
    checkExistingReview();
  }, [bookingId]);

  const checkExistingReview = async () => {
    try {
      const review = await reviewService.getBookingReview(bookingId);
      if (review) {
        setExistingReview(review);
      }
    } catch (error) {
      console.error('Error checking existing review:', error);
    }
  };

  const handleRatingChange = (category: keyof ReviewData | 'rating', rating: number) => {
    setReviewData(prev => ({
      ...prev,
      [category]: rating
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (reviewData.rating === 0) {
      toast.error('Please provide an overall rating');
      return;
    }

    const categoryRatings = [
      reviewData.cleanliness_rating,
      reviewData.communication_rating,
      reviewData.check_in_rating,
      reviewData.accuracy_rating,
      reviewData.location_rating,
      reviewData.value_rating
    ];

    if (categoryRatings.some(rating => rating === 0)) {
      toast.error('Please rate all categories');
      return;
    }

    if (reviewData.review_text.trim().length < 10) {
      toast.error('Please provide a detailed review (at least 10 characters)');
      return;
    }

    try {
      setIsSubmitting(true);
      const review = await reviewService.createReview(reviewData);
      toast.success('Review submitted successfully!');
      onReviewSubmitted?.(review);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarRating = (
    category: keyof ReviewData | 'rating',
    currentRating: number,
    size: 'sm' | 'md' | 'lg' = 'md'
  ) => {
    const starSize = size === 'lg' ? 'h-8 w-8' : size === 'md' ? 'h-6 w-6' : 'h-4 w-4';
    const categoryKey = category === 'rating' ? 'overall' : category;
    
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isHovered = hoveredRating?.category === categoryKey && star <= hoveredRating.rating;
          const isFilled = star <= currentRating || isHovered;
          
          return (
            <button
              key={star}
              type="button"
              className={`${starSize} transition-colors duration-150 ${
                isFilled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
              } hover:text-yellow-400 hover:fill-yellow-400`}
              onClick={() => handleRatingChange(category, star)}
              onMouseEnter={() => setHoveredRating({ category: categoryKey, rating: star })}
              onMouseLeave={() => setHoveredRating(null)}
            >
              <Star className={starSize} />
            </button>
          );
        })}
        <span className="ml-2 text-sm font-medium text-gray-600">
          {currentRating > 0 ? `${currentRating}/5` : 'Rate'}
        </span>
      </div>
    );
  };

  const calculateAverageRating = () => {
    const categoryRatings = [
      reviewData.cleanliness_rating,
      reviewData.communication_rating,
      reviewData.check_in_rating,
      reviewData.accuracy_rating,
      reviewData.location_rating,
      reviewData.value_rating
    ];
    
    const validRatings = categoryRatings.filter(rating => rating > 0);
    if (validRatings.length === 0) return 0;
    
    return Math.round(validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length);
  };

  // Auto-update overall rating based on category averages
  useEffect(() => {
    const avgRating = calculateAverageRating();
    if (avgRating > 0 && avgRating !== reviewData.rating) {
      setReviewData(prev => ({ ...prev, rating: avgRating }));
    }
  }, [
    reviewData.cleanliness_rating,
    reviewData.communication_rating,
    reviewData.check_in_rating,
    reviewData.accuracy_rating,
    reviewData.location_rating,
    reviewData.value_rating
  ]);

  // If review already exists, show thank you message
  if (existingReview) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
          <p className="text-muted-foreground mb-4">
            You've already submitted a review for this stay.
          </p>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-lg font-medium">Your Rating:</span>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= existingReview.rating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="ml-2 font-medium">{existingReview.rating}/5</span>
            </div>
          </div>
          <Badge variant="secondary">
            Submitted on {format(new Date(existingReview.created_at), 'MMM dd, yyyy')}
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Star className="h-6 w-6 text-yellow-400" />
          <span>Rate Your Stay</span>
        </CardTitle>
        
        {/* Booking Details */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <h3 className="font-semibold text-lg">{propertyName}</h3>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>
                {format(checkInDate, 'MMM dd')} - {format(checkOutDate, 'MMM dd, yyyy')}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{guestCount} guest{guestCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold">Overall Rating</Label>
            <div className="flex items-center space-x-4">
              {renderStarRating('rating', reviewData.rating, 'lg')}
            </div>
          </div>

          {/* Category Ratings */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Rate Each Category</Label>
            <div className="grid gap-4 md:grid-cols-2">
              {ratingCategories.map((category) => (
                <div key={category.key} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {category.icon}
                    <Label className="font-medium">{category.label}</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                  {renderStarRating(category.key, reviewData[category.key] as number)}
                </div>
              ))}
            </div>
          </div>

          {/* Written Review */}
          <div className="space-y-3">
            <Label htmlFor="review-text" className="text-lg font-semibold">
              Tell Us About Your Experience
            </Label>
            <Textarea
              id="review-text"
              placeholder="Share details about your stay - what did you love? What could be improved? Your feedback helps other guests and the host."
              value={reviewData.review_text}
              onChange={(e) => setReviewData(prev => ({ ...prev, review_text: e.target.value }))}
              rows={5}
              className="resize-none"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Minimum 10 characters</span>
              <span>{reviewData.review_text.length}/500</span>
            </div>
          </div>

          {/* Guidelines */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Review Guidelines:</strong> Please be honest and constructive. 
              Focus on your actual experience and avoid personal attacks. 
              Reviews help improve the quality of stays for everyone.
            </AlertDescription>
          </Alert>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <Button
              type="submit"
              disabled={isSubmitting || reviewData.rating === 0}
              className="px-8"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Review
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;