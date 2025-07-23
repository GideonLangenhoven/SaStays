// src/types/i18n.ts
export interface Translation {
  [key: string]: string | Translation;
}

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
  dateFormat: string;
  currencyFormat: {
    symbol: string;
    position: 'before' | 'after';
    decimal: string;
    thousand: string;
  };
}

export interface I18nContext {
  currentLanguage: string;
  translations: Translation;
  availableLanguages: LanguageConfig[];
  isLoading: boolean;
  changeLanguage: (languageCode: string) => Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date, format?: string) => string;
}

export interface TranslationKeys {
  // Common
  common: {
    yes: string;
    no: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    search: string;
    filter: string;
    loading: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    submit: string;
    reset: string;
    clear: string;
    select: string;
    all: string;
    none: string;
  };

  // Navigation
  navigation: {
    home: string;
    properties: string;
    bookings: string;
    profile: string;
    settings: string;
    help: string;
    logout: string;
    dashboard: string;
    analytics: string;
    reviews: string;
    messaging: string;
    notifications: string;
  };

  // Property
  property: {
    title: string;
    description: string;
    location: string;
    price: string;
    pricePerNight: string;
    availability: string;
    amenities: string;
    photos: string;
    rules: string;
    checkIn: string;
    checkOut: string;
    guests: string;
    bedrooms: string;
    bathrooms: string;
    propertyType: string;
    instantBooking: string;
    addProperty: string;
    editProperty: string;
    deleteProperty: string;
    viewProperty: string;
  };

  // Booking
  booking: {
    bookNow: string;
    requestToBook: string;
    checkAvailability: string;
    selectDates: string;
    guestInfo: string;
    payment: string;
    confirmation: string;
    bookingConfirmed: string;
    bookingCancelled: string;
    bookingPending: string;
    totalCost: string;
    nights: string;
    cleaningFee: string;
    serviceFee: string;
    taxes: string;
    specialRequests: string;
  };

  // User
  user: {
    profile: string;
    personalInfo: string;
    contactInfo: string;
    preferences: string;
    security: string;
    notifications: string;
    privacy: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    language: string;
    currency: string;
    timezone: string;
  };

  // Reviews
  reviews: {
    writeReview: string;
    overallRating: string;
    cleanliness: string;
    communication: string;
    checkInProcess: string;
    accuracy: string;
    locationRating: string;
    valueForMoney: string;
    reviewText: string;
    submitReview: string;
    helpful: string;
    respond: string;
    hostResponse: string;
    guestReviews: string;
    averageRating: string;
    ratingBreakdown: string;
  };

  // Messages
  messages: {
    inbox: string;
    compose: string;
    send: string;
    reply: string;
    forward: string;
    subject: string;
    message: string;
    attachment: string;
    markAsRead: string;
    markAsUnread: string;
    archive: string;
    newMessage: string;
    conversation: string;
  };

  // Notifications
  notifications: {
    all: string;
    unread: string;
    markAllRead: string;
    settings: string;
    emailNotifications: string;
    pushNotifications: string;
    smsNotifications: string;
    bookingUpdates: string;
    messageUpdates: string;
    reviewUpdates: string;
    promotions: string;
  };

  // Errors
  errors: {
    required: string;
    invalid: string;
    notFound: string;
    unauthorized: string;
    forbidden: string;
    serverError: string;
    networkError: string;
    validationError: string;
    loginRequired: string;
    sessionExpired: string;
  };
}