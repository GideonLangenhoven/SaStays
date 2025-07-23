// Enhanced messaging types
export interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  senderType: 'owner' | 'guest';
  message: string;
  messageType: 'text' | 'image' | 'document' | 'template';
  attachments?: MessageAttachment[];
  isRead: boolean;
  readAt?: Date;
  isScheduled: boolean;
  scheduledFor?: Date;
  templateId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageAttachment {
  id: string;
  messageId: string;
  filename: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  createdAt: Date;
}

export interface MessageTemplate {
  id: string;
  ownerId: string;
  name: string;
  subject?: string;
  content: string;
  category: 'welcome' | 'checkin' | 'checkout' | 'general' | 'reminder';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduledMessage {
  id: string;
  bookingId: string;
  templateId: string;
  triggerType: 'days_before_checkin' | 'checkin_day' | 'days_after_checkout' | 'custom';
  triggerOffset: number;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: Date;
  createdAt: Date;
}

export interface MessageThread {
  bookingId: string;
  propertyTitle: string;
  guestName: string;
  guestEmail: string;
  lastMessage?: Message;
  unreadCount: number;
  messages: Message[];
}

export interface SendMessageRequest {
  bookingId: string;
  message: string;
  messageType?: 'text' | 'template';
  templateId?: string;
  attachments?: File[];
  isScheduled?: boolean;
  scheduledFor?: Date;
}

export interface CreateTemplateRequest {
  name: string;
  subject?: string;
  content: string;
  category: MessageTemplate['category'];
}