// Enhanced notification system types
export interface NotificationPreferences {
  id: string;
  ownerId: string;
  emailNotifications: {
    newBooking: boolean;
    bookingModification: boolean;
    bookingCancellation: boolean;
    paymentReceived: boolean;
    paymentFailed: boolean;
    guestMessage: boolean;
    reviewReceived: boolean;
    maintenanceReminder: boolean;
    calendarSync: boolean;
  };
  smsNotifications: {
    newBooking: boolean;
    bookingModification: boolean;
    bookingCancellation: boolean;
    paymentReceived: boolean;
    paymentFailed: boolean;
    urgentMessages: boolean;
    checkInToday: boolean;
    checkOutToday: boolean;
  };
  pushNotifications: {
    enabled: boolean;
    newBooking: boolean;
    guestMessage: boolean;
    paymentUpdate: boolean;
    urgentAlerts: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string; // "22:00"
    endTime: string;   // "08:00"
  };
  frequency: {
    digestEmail: 'immediate' | 'hourly' | 'daily' | 'weekly' | 'never';
    summary: 'daily' | 'weekly' | 'monthly';
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  ownerId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  channels: NotificationChannel[];
  status: NotificationStatus;
  priority: NotificationPriority;
  scheduledFor?: Date;
  sentAt?: Date;
  readAt?: Date;
  createdAt: Date;
}

export type NotificationType = 
  | 'booking_new'
  | 'booking_modified' 
  | 'booking_cancelled'
  | 'payment_received'
  | 'payment_failed'
  | 'guest_message'
  | 'review_received'
  | 'maintenance_reminder'
  | 'calendar_sync_failed'
  | 'property_inquiry'
  | 'check_in_reminder'
  | 'check_out_reminder'
  | 'payout_processed'
  | 'account_alert';

export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app';

export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'read';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  name: string;
  subject: string;
  emailTemplate: string;
  smsTemplate: string;
  pushTemplate: string;
  variables: string[]; // List of available template variables
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationHistory {
  id: string;
  notificationId: string;
  channel: NotificationChannel;
  recipient: string;
  status: 'sent' | 'delivered' | 'failed' | 'bounced';
  errorMessage?: string;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
}

export interface NotificationStats {
  totalSent: number;
  emailsSent: number;
  smsSent: number;
  pushSent: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  failureRate: number;
  avgDeliveryTime: number; // in seconds
}

export interface CreateNotificationRequest {
  type: NotificationType;
  recipientId: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  channels: NotificationChannel[];
  priority?: NotificationPriority;
  scheduledFor?: Date;
}

export interface BulkNotificationRequest {
  recipientIds: string[];
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  channels: NotificationChannel[];
  priority?: NotificationPriority;
  scheduledFor?: Date;
}