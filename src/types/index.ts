// src/types/index.ts
export interface Property {
  id: string;
  title: string;
  description: string;
  location: {
    address: string;
    city: string;
    province: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  images: string[];
  videos?: string[];
  amenities: string[];
  houseRules: string[];
  guestRequirements: {
    minAge?: number;
    verificationRequired: boolean;
    instantBookAllowed: boolean;
  };
  pricing: {
    basePrice: number;
    currency: string;
    cleaningFee?: number;
    extraGuestFee?: number;
    petFee?: number;
    weeklyDiscount?: number;
    monthlyDiscount?: number;
  };
  capacity: {
    maxGuests: number;
    bedrooms: number;
    bathrooms: number;
    beds: number;
  };
  availability: {
    isActive: boolean;
    calendar: CalendarEntry[];
  };
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEntry {
  date: string;
  status: 'available' | 'booked' | 'blocked';
  price?: number;
  bookingId?: string;
}

export interface Booking {
  id: string;
  propertyId: string;
  guestId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentId?: string;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  nationality?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: string;
}

export interface Owner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage?: string;
  businessName?: string;
  taxNumber?: string;
  bankDetails?: {
    accountHolder: string;
    bankName: string;
    accountNumber: string;
    branchCode: string;
  };
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  method: 'ozow' | 'payfast' | 'zapper' | 'snapscan';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  transactionId?: string;
  gatewayResponse?: any;
  createdAt: string;
  completedAt?: string;
}

export interface Review {
  id: string;
  bookingId: string;
  propertyId: string;
  guestId: string;
  rating: number; // 1-5
  comment?: string;
  categories: {
    cleanliness: number;
    communication: number;
    checkIn: number;
    accuracy: number;
    location: number;
    value: number;
  };
  isPublic: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'document';
  attachments?: string[];
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  bookingId?: string;
  propertyId: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'booking' | 'payment' | 'message' | 'review' | 'system';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

// API Response Types
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

// Form Types
export interface BookingFormData {
  checkIn: string;
  checkOut: string;
  guests: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests?: string;
}

export interface PropertyFormData {
  title: string;
  description: string;
  location: {
    address: string;
    city: string;
    province: string;
  };
  capacity: {
    maxGuests: number;
    bedrooms: number;
    bathrooms: number;
    beds: number;
  };
  pricing: {
    basePrice: number;
    cleaningFee?: number;
    extraGuestFee?: number;
  };
  amenities: string[];
  houseRules: string[];
  images: File[];
}