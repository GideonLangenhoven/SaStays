// server/services/reviewService.js - Review Service
const pool = require('../db');
const notificationService = require('./notificationService');
const cron = require('node-cron');

class ReviewService {
  constructor() {
    // Schedule review requests to run daily at 10 AM
    cron.schedule('0 10 * * *', () => {
      this.sendPendingReviewRequests();
    });
  }

  async sendPendingReviewRequests() {
    try {
      // Find bookings that ended 24 hours ago and haven't had review requests sent
      const query = `
        SELECT 
          b.*,
          p.title as property_title,
          c.email as customer_email,
          c.full_name as customer_name
        FROM bookings b
        JOIN properties p ON b.property_id = p.id
        JOIN customers c ON b.customer_id = c.id
        LEFT JOIN reviews r ON b.id = r.booking_id
        WHERE 
          b.status = 'completed' 
          AND b.end_date = CURRENT_DATE - INTERVAL '1 day'
          AND r.id IS NULL
      `;

      const result = await pool.query(query);
      
      for (const booking of result.rows) {
        await this.sendReviewRequest(booking);
      }

      console.log(`Sent ${result.rows.length} review requests`);
    } catch (error) {
      console.error('Error sending review requests:', error);
    }
  }

  async sendReviewRequest(booking) {
    try {
      await notificationService.sendEmail({
        to: booking.customer_email,
        subject: `How was your stay at ${booking.property_title}?`,
        template: 'review-request',
        data: {
          customerName: booking.customer_name,
          propertyTitle: booking.property_title,
          reviewUrl: `${process.env.FRONTEND_URL}/review/${booking.id}`,
          bookingId: booking.id
        }
      });

      console.log(`Review request sent for booking ${booking.id}`);
    } catch (error) {
      console.error(`Failed to send review request for booking ${booking.id}:`, error);
    }
  }

  async createReview(reviewData) {
    try {
      const {
        booking_id,
        rating,
        review_text,
        cleanliness_rating,
        communication_rating,
        check_in_rating,
        accuracy_rating,
        location_rating,
        value_rating
      } = reviewData;

      // Get booking details
      const bookingResult = await pool.query(
        'SELECT property_id, customer_id FROM bookings WHERE id = $1',
        [booking_id]
      );

      if (bookingResult.rows.length === 0) {
        throw new Error('Booking not found');
      }

      const { property_id, customer_id } = bookingResult.rows[0];

      // Create review
      const result = await pool.query(`
        INSERT INTO reviews (
          booking_id, property_id, customer_id, rating, review_text,
          cleanliness_rating, communication_rating, check_in_rating,
          accuracy_rating, location_rating, value_rating, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'published')
        RETURNING *
      `, [
        booking_id, property_id, customer_id, rating, review_text,
        cleanliness_rating, communication_rating, check_in_rating,
        accuracy_rating, location_rating, value_rating
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  async getPropertyReviews(propertyId) {
    try {
      const result = await pool.query(`
        SELECT 
          r.*,
          c.full_name as customer_name,
          c.profile_image as customer_image
        FROM reviews r
        JOIN customers c ON r.customer_id = c.id
        WHERE r.property_id = $1 AND r.status = 'published'
        ORDER BY r.created_at DESC
      `, [propertyId]);

      return result.rows;
    } catch (error) {
      console.error('Error fetching property reviews:', error);
      throw error;
    }
  }

  async respondToReview(reviewId, ownerId, response) {
    try {
      // Verify the owner owns the property
      const verifyResult = await pool.query(`
        SELECT r.id 
        FROM reviews r
        JOIN properties p ON r.property_id = p.id
        WHERE r.id = $1 AND p.owner_id = $2
      `, [reviewId, ownerId]);

      if (verifyResult.rows.length === 0) {
        throw new Error('Review not found or unauthorized');
      }

      // Update review with owner response
      const result = await pool.query(
        'UPDATE reviews SET owner_response = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [response, reviewId]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error responding to review:', error);
      throw error;
    }
  }
}

module.exports = new ReviewService();

// server/routes/reviews.js - Review Routes
const express = require('express');
const router = express.Router();
const reviewService = require('../services/reviewService');
const { authenticateToken } = require('../middleware/auth');

// Get reviews for a property
router.get('/property/:propertyId', async (req, res) => {
  try {
    const reviews = await reviewService.getPropertyReviews(req.params.propertyId);
    res.json({ reviews });
  } catch (error) {
    console.error('Get property reviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a review
router.post('/', async (req, res) => {
  try {
    const review = await reviewService.createReview(req.body);
    res.status(201).json({ 
      message: 'Review created successfully',
      review 
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Owner response to review
router.post('/:reviewId/respond', authenticateToken, async (req, res) => {
  try {
    const { response } = req.body;
    const review = await reviewService.respondToReview(
      req.params.reviewId, 
      req.user.userId, 
      response
    );
    
    res.json({ 
      message: 'Response added successfully',
      review 
    });
  } catch (error) {
    console.error('Review response error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

// src/components/reviews/ReviewForm.tsx - Review Form Component
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

interface ReviewFormProps {
  bookingId: string;
  propertyTitle: string;
  onSubmit: (reviewData: any) => Promise<void>;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  bookingId,
  propertyTitle,
  onSubmit
}) => {
  const [ratings, setRatings] = useState({
    overall: 0,
    cleanliness: 0,
    communication: 0,
    checkIn: 0,
    accuracy: 0,
    location: 0,
    value: 0
  });
  
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingChange = (category: string, rating: number) => {
    setRatings(prev => ({ ...prev, [category]: rating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (ratings.overall === 0) {
      toast.error('Please provide an overall rating');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        booking_id: bookingId,
        rating: ratings.overall,
        review_text: reviewText,
        cleanliness_rating: ratings.cleanliness,
        communication_rating: ratings.communication,
        check_in_rating: ratings.checkIn,
        accuracy_rating: ratings.accuracy,
        location_rating: ratings.location,
        value_rating: ratings.value
      });
      
      toast.success('Thank you for your review!');
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating: React.FC<{ 
    value: number; 
    onChange: (rating: number) => void;
    label: string;
  }> = ({ value, onChange, label }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`w-5 h-5 ${
                star <= value 
                  ? 'text-yellow-400 fill-yellow-400' 
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Rate Your Stay</CardTitle>
        <p className="text-gray-600">How was your experience at {propertyTitle}?</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Overall Rating</h3>
            <StarRating
              value={ratings.overall}
              onChange={(rating) => handleRatingChange('overall', rating)}
              label="Overall Experience"
            />
          </div>

          {/* Detailed Ratings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Rate specific aspects</h3>
            <div className="space-y-2">
              <StarRating
                value={ratings.cleanliness}
                onChange={(rating) => handleRatingChange('cleanliness', rating)}
                label="Cleanliness"
              />
              <StarRating
                value={ratings.communication}
                onChange={(rating) => handleRatingChange('communication', rating)}
                label="Communication"
              />
              <StarRating
                value={ratings.checkIn}
                onChange={(rating) => handleRatingChange('checkIn', rating)}
                label="Check-in Process"
              />
              <StarRating
                value={ratings.accuracy}
                onChange={(rating) => handleRatingChange('accuracy', rating)}
                label="Accuracy of Listing"
              />
              <StarRating
                value={ratings.location}
                onChange={(rating) => handleRatingChange('location', rating)}
                label="Location"
              />
              <StarRating
                value={ratings.value}
                onChange={(rating) => handleRatingChange('value', rating)}
                label="Value for Money"
              />
            </div>
          </div>

          {/* Written Review */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Share your experience</h3>
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tell others about your stay..."
              rows={4}
              className="w-full"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || ratings.overall === 0}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// src/components/reviews/ReviewList.tsx - Review List Component
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { format } from 'date-fns';

interface Review {
  id: number;
  rating: number;
  review_text: string;
  customer_name: string;
  customer_image?: string;
  owner_response?: string;
  created_at: string;
}

interface ReviewListProps {
  reviews: Review[];
}

export const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => {
  const StarDisplay: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating 
              ? 'text-yellow-400 fill-yellow-400' 
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          No reviews yet. Be the first to leave a review!
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <Avatar>
                <AvatarImage src={review.customer_image} />
                <AvatarFallback>
                  {review.customer_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{review.customer_name}</h4>
                  <span className="text-sm text-gray-500">
                    {format(new Date(review.created_at), 'MMM yyyy')}
                  </span>
                </div>
                
                <StarDisplay rating={review.rating} />
                
                {review.review_text && (
                  <p className="mt-3 text-gray-700">{review.review_text}</p>
                )}
                
                {review.owner_response && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Response from owner:
                    </p>
                    <p className="text-gray-700">{review.owner_response}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// src/pages/ReviewPage.tsx - Review Page Component
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { toast } from 'sonner';
import { reviewService } from '@/services/reviewService';

export const ReviewPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`);
      if (response.ok) {
        const data = await response.json();
        setBooking(data.booking);
      } else {
        toast.error('Booking not found');
        navigate('/');
      }
    } catch (error) {
      toast.error('Failed to load booking details');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSubmit = async (reviewData: any) => {
    try {
      await reviewService.createReview(reviewData);
      navigate('/review/success');
    } catch (error) {
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sea-dark"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Booking Not Found</h1>
          <p className="text-gray-600 mt-2">The booking you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <ReviewForm
          bookingId={bookingId!}
          propertyTitle={booking.property_title}
          onSubmit={handleReviewSubmit}
        />
      </div>
    </div>
  );
};