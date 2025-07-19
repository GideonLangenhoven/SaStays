// src/services/api.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  Property, 
  Booking, 
  Review, 
  Message, 
  CustomerInfo, 
  PaymentTransaction,
  Owner,
  Amenity,
  ApiResponse,
  PaginatedResponse,
  PropertyFormData,
  BookingFormData,
  ReviewFormData
} from '@/types/database';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Properties API
  async getProperties(): Promise<Property[]> {
    const response = await this.api.get('/properties');
    return response.data.data;
  }

  async getProperty(id: string): Promise<Property> {
    const response = await this.api.get(`/properties/${id}`);
    return response.data.data;
  }

  async createProperty(data: PropertyFormData): Promise<Property> {
    const response = await this.api.post('/properties', data);
    return response.data.data;
  }

  async updateProperty(id: string, data: Partial<PropertyFormData>): Promise<Property> {
    const response = await this.api.put(`/properties/${id}`, data);
    return response.data.data;
  }

  async deleteProperty(id: string): Promise<void> {
    await this.api.delete(`/properties/${id}`);
  }

  async getPropertyBookedDates(propertyId: string): Promise<string[]> {
    const response = await this.api.get(`/properties/${propertyId}/booked-dates`);
    return response.data.data;
  }

  // Bookings API
  async getBookings(propertyId?: string): Promise<Booking[]> {
    const url = propertyId ? `/bookings?property_id=${propertyId}` : '/bookings';
    const response = await this.api.get(url);
    return response.data.data;
  }

  async getBooking(id: string): Promise<Booking> {
    const response = await this.api.get(`/bookings/${id}`);
    return response.data.data;
  }

  async createBooking(data: BookingFormData): Promise<Booking> {
    const response = await this.api.post('/bookings', data);
    return response.data.data;
  }

  async updateBookingStatus(id: string, status: Booking['booking_status']): Promise<Booking> {
    const response = await this.api.patch(`/bookings/${id}/status`, { status });
    return response.data.data;
  }

  async cancelBooking(id: string, reason?: string): Promise<void> {
    await this.api.patch(`/bookings/${id}/cancel`, { reason });
  }

  // Payment API
  async initiatePayment(bookingId: string, method: string): Promise<{ payment_url: string; reference: string }> {
    const response = await this.api.post(`/payments/initiate`, {
      booking_id: bookingId,
      payment_method: method
    });
    return response.data.data;
  }

  async verifyPayment(reference: string): Promise<PaymentTransaction> {
    const response = await this.api.get(`/payments/verify/${reference}`);
    return response.data.data;
  }

  async getPaymentHistory(bookingId?: string): Promise<PaymentTransaction[]> {
    const url = bookingId ? `/payments?booking_id=${bookingId}` : '/payments';
    const response = await this.api.get(url);
    return response.data.data;
  }

  // Reviews API
  async getPropertyReviews(propertyId: string): Promise<Review[]> {
    const response = await this.api.get(`/properties/${propertyId}/reviews`);
    return response.data.data;
  }

  async createReview(data: ReviewFormData & { booking_id: string }): Promise<Review> {
    const response = await this.api.post('/reviews', data);
    return response.data.data;
  }

  async respondToReview(reviewId: string, response: string): Promise<Review> {
    const response_data = await this.api.patch(`/reviews/${reviewId}/respond`, { response });
    return response_data.data.data;
  }

  // Messages API
  async getBookingMessages(bookingId: string): Promise<Message[]> {
    const response = await this.api.get(`/bookings/${bookingId}/messages`);
    return response.data.data;
  }

  async sendMessage(bookingId: string, content: string, attachments?: File[]): Promise<Message> {
    const formData = new FormData();
    formData.append('content', content);
    
    if (attachments) {
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }

    const response = await this.api.post(`/bookings/${bookingId}/messages`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    await this.api.patch(`/messages/${messageId}/read`);
  }

  // File Upload API
  async uploadPropertyPhotos(propertyId: string, files: File[]): Promise<string[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('photos', file);
    });

    const response = await this.api.post(`/properties/${propertyId}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  async deletePropertyPhoto(propertyId: string, photoId: string): Promise<void> {
    await this.api.delete(`/properties/${propertyId}/photos/${photoId}`);
  }

  // Dashboard API
  async getDashboardStats(): Promise<{
    total_properties: number;
    total_bookings: number;
    total_revenue: number;
    occupancy_rate: number;
    recent_bookings: Booking[];
    monthly_revenue: Array<{ month: string; revenue: number }>;
  }> {
    const response = await this.api.get('/dashboard/stats');
    return response.data.data;
  }

  // Owner Profile API
  async getOwnerProfile(): Promise<Owner> {
    const response = await this.api.get('/owner/profile');
    return response.data.data;
  }

  async updateOwnerProfile(data: Partial<Owner>): Promise<Owner> {
    const response = await this.api.put('/owner/profile', data);
    return response.data.data;
  }

  // Amenities API
  async getAmenities(): Promise<Amenity[]> {
    const response = await this.api.get('/amenities');
    return response.data.data;
  }

  // Availability API
  async checkAvailability(propertyId: string, checkIn: string, checkOut: string): Promise<boolean> {
    const response = await this.api.get(`/properties/${propertyId}/availability`, {
      params: { check_in: checkIn, check_out: checkOut }
    });
    return response.data.data.available;
  }

  async updatePropertyAvailability(propertyId: string, dates: Array<{ date: string; available: boolean }>): Promise<void> {
    await this.api.post(`/properties/${propertyId}/availability`, { dates });
  }

  // Search API
  async searchProperties(params: {
    location?: string;
    check_in?: string;
    check_out?: string;
    guests?: number;
    min_price?: number;
    max_price?: number;
    amenities?: string[];
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Property>> {
    const response = await this.api.get('/properties/search', { params });
    return response.data;
  }

  // Notifications API
  async getNotifications(): Promise<Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    created_at: string;
  }>> {
    const response = await this.api.get('/notifications');
    return response.data.data;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await this.api.patch(`/notifications/${id}/read`);
  }
}

export const apiService = new ApiService();
export default apiService;