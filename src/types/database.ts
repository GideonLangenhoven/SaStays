// src/types/database.ts
export interface Property {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  location: {
    address: string;
    city: string;
    province: string;
    postal_code: string;
    latitude?: number;
    longitude?: number;
  };
  amenities: string[];
  house_rules: string[];
  guest_requirements: {
    min_age?: number;
    id_verification_required: boolean;
    phone_verification_required: boolean;
  };
  pricing: {
    base_price: number;
    cleaning_fee?: number;
    extra_guest_fee?: number;
    pet_fee?: number;
    weekly_discount?: number;
    monthly_discount?: number;
  };
  capacity: {
    max_guests: number;
    bedrooms: number;
    bathrooms: number;
    beds: number;
  };
  photos: PropertyPhoto[];
  videos?: PropertyVideo[];
  status: 'active' | 'inactive' | 'draft';
  instant_booking: boolean;
  created_at: string;
  updated_at: string;
}

export interface PropertyPhoto {
  id: string;
  property_id: string;
  url: string;
  caption?: string;
  is_primary: boolean;
  order_index: number;
}

export interface PropertyVideo {
  id: string;
  property_id: string;
  url: string;
  thumbnail_url?: string;
  caption?: string;
}

export interface Booking {
  id: string;
  property_id: string;
  customer: CustomerInfo;
  check_in: string;
  check_out: string;
  guests: number;
  total_amount: number;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: 'ozow' | 'zapper' | 'snapscan' | 'payfast';
  booking_status: 'confirmed' | 'cancelled' | 'completed';
  special_requests?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerInfo {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  id_number?: string;
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface Review {
  id: string;
  booking_id: string;
  property_id: string;
  customer_id: string;
  rating: number; // 1-5
  comment?: string;
  response?: string; // Owner response
  created_at: string;
  is_published: boolean;
}

export interface Message {
  id: string;
  booking_id: string;
  sender_type: 'owner' | 'guest';
  sender_id: string;
  content: string;
  attachments?: MessageAttachment[];
  read_at?: string;
  created_at: string;
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  type: 'photo' | 'video' | 'document';
  url: string;
  filename: string;
  size: number;
}

export interface PaymentTransaction {
  id: string;
  booking_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_reference: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  gateway_response?: any;
  created_at: string;
  updated_at: string;
}

export interface Owner {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  profile_photo?: string;
  payout_methods: PayoutMethod[];
  notification_preferences: {
    email_enabled: boolean;
    sms_enabled: boolean;
    booking_notifications: boolean;
    review_notifications: boolean;
    payout_notifications: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface PayoutMethod {
  id: string;
  owner_id: string;
  type: 'bank_account' | 'paypal';
  details: {
    bank_name?: string;
    account_number?: string;
    account_holder?: string;
    branch_code?: string;
    paypal_email?: string;
  };
  is_default: boolean;
  is_verified: boolean;
}

export interface Amenity {
  id: string;
  name: string;
  category: 'basic' | 'entertainment' | 'kitchen' | 'bathroom' | 'outdoor' | 'safety';
  icon: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface PropertyFormData extends Omit<Property, 'id' | 'owner_id' | 'created_at' | 'updated_at'> {}

export interface BookingFormData {
  property_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  customer: Omit<CustomerInfo, 'id'>;
  special_requests?: string;
}

export interface ReviewFormData {
  rating: number;
  comment?: string;
}