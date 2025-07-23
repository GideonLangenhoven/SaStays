import { apiClient } from './api';
import {
  Notification,
  NotificationPreferences,
  NotificationTemplate,
  NotificationHistory,
  NotificationStats,
  CreateNotificationRequest,
  BulkNotificationRequest,
  NotificationType,
  NotificationChannel
} from '@/types/notifications';

class NotificationService {
  private wsConnection: WebSocket | null = null;
  private notificationCallbacks: ((notification: Notification) => void)[] = [];

  // Initialize WebSocket for real-time notifications
  initializeWebSocket(ownerId: string) {
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'}/ws/notifications/${ownerId}`;
    
    this.wsConnection = new WebSocket(wsUrl);
    
    this.wsConnection.onopen = () => {
      console.log('Notifications WebSocket connected');
    };
    
    this.wsConnection.onmessage = (event) => {
      const notification: Notification = JSON.parse(event.data);
      this.notificationCallbacks.forEach(callback => callback(notification));
      
      // Show browser notification if supported and enabled
      this.showBrowserNotification(notification);
    };
    
    this.wsConnection.onclose = () => {
      console.log('Notifications WebSocket disconnected');
      setTimeout(() => this.initializeWebSocket(ownerId), 5000);
    };
    
    this.wsConnection.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  // Subscribe to real-time notifications
  onNotification(callback: (notification: Notification) => void) {
    this.notificationCallbacks.push(callback);
    return () => {
      this.notificationCallbacks = this.notificationCallbacks.filter(cb => cb !== callback);
    };
  }

  // Show browser notification
  private async showBrowserNotification(notification: Notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const options = {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/badge-icon.png',
        tag: notification.type,
        requireInteraction: notification.priority === 'urgent',
        actions: [
          { action: 'view', title: 'View' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      };

      const browserNotification = new Notification(notification.title, options);
      
      browserNotification.onclick = () => {
        window.focus();
        this.markAsRead(notification.id);
      };

      // Auto-close after 10 seconds unless urgent
      if (notification.priority !== 'urgent') {
        setTimeout(() => browserNotification.close(), 10000);
      }
    }
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }

    return Notification.permission;
  }

  // Get notification preferences
  async getPreferences(): Promise<NotificationPreferences> {
    const response = await apiClient.get('/api/notifications/preferences');
    return response.data;
  }

  // Update notification preferences
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const response = await apiClient.put('/api/notifications/preferences', preferences);
    return response.data;
  }

  // Get notifications
  async getNotifications(
    page = 1, 
    limit = 20, 
    filter?: { 
      type?: NotificationType; 
      status?: 'read' | 'unread'; 
      priority?: string;
      channel?: NotificationChannel;
    }
  ): Promise<{
    notifications: Notification[];
    total: number;
    unreadCount: number;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filter
    });

    const response = await apiClient.get(`/api/notifications?${params}`);
    return response.data;
  }

  // Create notification
  async createNotification(request: CreateNotificationRequest): Promise<Notification> {
    const response = await apiClient.post('/api/notifications', request);
    return response.data;
  }

  // Send bulk notifications
  async sendBulkNotifications(request: BulkNotificationRequest): Promise<{ sent: number; failed: number }> {
    const response = await apiClient.post('/api/notifications/bulk', request);
    return response.data;
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    await apiClient.patch(`/api/notifications/${notificationId}/read`);
  }

  // Mark multiple notifications as read
  async markAllAsRead(notificationIds?: string[]): Promise<void> {
    const body = notificationIds ? { notificationIds } : {};
    await apiClient.patch('/api/notifications/mark-all-read', body);
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    await apiClient.delete(`/api/notifications/${notificationId}`);
  }

  // Get notification templates
  async getTemplates(): Promise<NotificationTemplate[]> {
    const response = await apiClient.get('/api/notifications/templates');
    return response.data;
  }

  // Update notification template
  async updateTemplate(templateId: string, template: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    const response = await apiClient.put(`/api/notifications/templates/${templateId}`, template);
    return response.data;
  }

  // Test notification
  async testNotification(
    type: NotificationType, 
    channels: NotificationChannel[]
  ): Promise<{ success: boolean; results: Record<NotificationChannel, boolean> }> {
    const response = await apiClient.post('/api/notifications/test', { type, channels });
    return response.data;
  }

  // Get notification history
  async getHistory(
    notificationId: string
  ): Promise<NotificationHistory[]> {
    const response = await apiClient.get(`/api/notifications/${notificationId}/history`);
    return response.data;
  }

  // Get notification statistics
  async getStats(
    period: 'day' | 'week' | 'month' | 'year' = 'month'
  ): Promise<NotificationStats> {
    const response = await apiClient.get(`/api/notifications/stats?period=${period}`);
    return response.data;
  }

  // Schedule notification
  async scheduleNotification(
    request: CreateNotificationRequest & { scheduledFor: Date }
  ): Promise<Notification> {
    const response = await apiClient.post('/api/notifications/schedule', request);
    return response.data;
  }

  // Cancel scheduled notification
  async cancelScheduledNotification(notificationId: string): Promise<void> {
    await apiClient.delete(`/api/notifications/scheduled/${notificationId}`);
  }

  // Get delivery status
  async getDeliveryStatus(notificationId: string): Promise<{
    status: string;
    channels: Record<NotificationChannel, {
      status: string;
      deliveredAt?: string;
      errorMessage?: string;
    }>;
  }> {
    const response = await apiClient.get(`/api/notifications/${notificationId}/delivery-status`);
    return response.data;
  }

  // Resend failed notification
  async resendNotification(
    notificationId: string, 
    channels?: NotificationChannel[]
  ): Promise<{ success: boolean; results: Record<NotificationChannel, boolean> }> {
    const response = await apiClient.post(`/api/notifications/${notificationId}/resend`, { channels });
    return response.data;
  }

  // Subscribe to push notifications
  async subscribeToPush(subscription: PushSubscription): Promise<void> {
    await apiClient.post('/api/notifications/push/subscribe', {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.getKey('p256dh'),
        auth: subscription.getKey('auth')
      }
    });
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPush(): Promise<void> {
    await apiClient.post('/api/notifications/push/unsubscribe');
  }

  // Get notification templates by type
  getTemplatesByType(type: NotificationType): Promise<NotificationTemplate[]> {
    return apiClient.get(`/api/notifications/templates?type=${type}`).then(res => res.data);
  }

  // Create custom notification template
  async createTemplate(template: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<NotificationTemplate> {
    const response = await apiClient.post('/api/notifications/templates', template);
    return response.data;
  }

  // Preview notification template
  async previewTemplate(
    templateId: string, 
    data: Record<string, any>
  ): Promise<{
    email: { subject: string; body: string };
    sms: { body: string };
    push: { title: string; body: string };
  }> {
    const response = await apiClient.post(`/api/notifications/templates/${templateId}/preview`, data);
    return response.data;
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    this.notificationCallbacks = [];
  }

  // Utility methods for common notification types
  async notifyNewBooking(bookingData: any): Promise<Notification> {
    return this.createNotification({
      type: 'booking_new',
      recipientId: bookingData.ownerId,
      title: 'New Booking Received!',
      message: `${bookingData.customerName} has booked ${bookingData.propertyName} for ${bookingData.dates}`,
      data: bookingData,
      channels: ['email', 'sms', 'push', 'in_app'],
      priority: 'high'
    });
  }

  async notifyPaymentReceived(paymentData: any): Promise<Notification> {
    return this.createNotification({
      type: 'payment_received',
      recipientId: paymentData.ownerId,
      title: 'Payment Received',
      message: `Payment of R${paymentData.amount} received for booking ${paymentData.bookingReference}`,
      data: paymentData,
      channels: ['email', 'in_app'],
      priority: 'normal'
    });
  }

  async notifyGuestMessage(messageData: any): Promise<Notification> {
    return this.createNotification({
      type: 'guest_message',
      recipientId: messageData.ownerId,
      title: 'New Message from Guest',
      message: `${messageData.guestName}: ${messageData.message.substring(0, 100)}...`,
      data: messageData,
      channels: ['push', 'in_app'],
      priority: 'normal'
    });
  }

  async notifyReviewReceived(reviewData: any): Promise<Notification> {
    return this.createNotification({
      type: 'review_received',
      recipientId: reviewData.ownerId,
      title: 'New Review Received',
      message: `${reviewData.guestName} left a ${reviewData.rating}-star review for ${reviewData.propertyName}`,
      data: reviewData,
      channels: ['email', 'in_app'],
      priority: 'normal'
    });
  }
}

export const notificationService = new NotificationService();
export default notificationService;