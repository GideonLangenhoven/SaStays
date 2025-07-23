// Client-side review service
import { apiClient } from './api';

export interface ReviewData {
  booking_id: string;
  rating: number;
  review_text: string;
  cleanliness_rating: number;
  communication_rating: number;
  check_in_rating: number;
  accuracy_rating: number;
  location_rating: number;
  value_rating: number;
}

export interface Review {
  id: string;
  booking_id: string;
  property_id: string;
  customer_id: string;
  rating: number;
  review_text: string;
  cleanliness_rating: number;
  communication_rating: number;
  check_in_rating: number;
  accuracy_rating: number;
  location_rating: number;
  value_rating: number;
  owner_response?: string;
  status: 'published' | 'hidden';
  created_at: string;
  updated_at: string;
  customer_name?: string;
  customer_image?: string;
}

class ReviewService {
  async createReview(reviewData: ReviewData): Promise<Review> {
    const response = await apiClient.post('/api/reviews', reviewData);
    return response.data.review;
  }

  async getPropertyReviews(propertyId: string): Promise<Review[]> {
    const response = await apiClient.get(`/api/reviews/property/${propertyId}`);
    return response.data.reviews;
  }

  async respondToReview(reviewId: string, response: string): Promise<Review> {
    const res = await apiClient.post(`/api/reviews/${reviewId}/respond`, { response });
    return res.data.review;
  }

  async getBookingReview(bookingId: string): Promise<Review | null> {
    try {
      const response = await apiClient.get(`/api/reviews/booking/${bookingId}`);
      return response.data.review;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async updateReview(reviewId: string, updates: Partial<ReviewData>): Promise<Review> {
    const response = await apiClient.put(`/api/reviews/${reviewId}`, updates);
    return response.data.review;
  }

  async deleteReview(reviewId: string): Promise<void> {
    await apiClient.delete(`/api/reviews/${reviewId}`);
  }

  // Helper methods for rating calculations
  calculateAverageRating(reviews: Review[]): number {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }

  calculateCategoryAverages(reviews: Review[]): {
    cleanliness: number;
    communication: number;
    checkIn: number;
    accuracy: number;
    location: number;
    value: number;
  } {
    if (reviews.length === 0) {
      return {
        cleanliness: 0,
        communication: 0,
        checkIn: 0,
        accuracy: 0,
        location: 0,
        value: 0
      };
    }

    const averages = {
      cleanliness: reviews.reduce((acc, r) => acc + r.cleanliness_rating, 0) / reviews.length,
      communication: reviews.reduce((acc, r) => acc + r.communication_rating, 0) / reviews.length,
      checkIn: reviews.reduce((acc, r) => acc + r.check_in_rating, 0) / reviews.length,
      accuracy: reviews.reduce((acc, r) => acc + r.accuracy_rating, 0) / reviews.length,
      location: reviews.reduce((acc, r) => acc + r.location_rating, 0) / reviews.length,
      value: reviews.reduce((acc, r) => acc + r.value_rating, 0) / reviews.length
    };

    // Round to 1 decimal place
    Object.keys(averages).forEach(key => {
      averages[key as keyof typeof averages] = Math.round(averages[key as keyof typeof averages] * 10) / 10;
    });

    return averages;
  }

  getRatingDistribution(reviews: Review[]): { rating: number; count: number; percentage: number }[] {
    const distribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: reviews.filter(r => Math.round(r.rating) === rating).length,
      percentage: 0
    }));

    const total = reviews.length;
    distribution.forEach(item => {
      item.percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
    });

    return distribution.reverse(); // Show 5 stars first
  }
}

export const reviewService = new ReviewService();
export default reviewService;