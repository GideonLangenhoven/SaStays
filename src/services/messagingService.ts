import { apiClient } from './api';
import { 
  Message, 
  MessageTemplate, 
  MessageThread, 
  SendMessageRequest, 
  CreateTemplateRequest,
  ScheduledMessage 
} from '@/types/messaging';

class MessagingService {
  private wsConnection: WebSocket | null = null;
  private messageCallbacks: ((message: Message) => void)[] = [];

  // WebSocket connection for real-time messaging
  initializeWebSocket(ownerId: string) {
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'}/ws/messages/${ownerId}`;
    
    this.wsConnection = new WebSocket(wsUrl);
    
    this.wsConnection.onopen = () => {
      console.log('Messaging WebSocket connected');
    };
    
    this.wsConnection.onmessage = (event) => {
      const message: Message = JSON.parse(event.data);
      this.messageCallbacks.forEach(callback => callback(message));
    };
    
    this.wsConnection.onclose = () => {
      console.log('Messaging WebSocket disconnected');
      // Attempt to reconnect after 5 seconds
      setTimeout(() => this.initializeWebSocket(ownerId), 5000);
    };
  }

  // Subscribe to new messages
  onNewMessage(callback: (message: Message) => void) {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }

  // Get all message threads for an owner
  async getMessageThreads(): Promise<MessageThread[]> {
    const response = await apiClient.get('/api/messages/threads');
    return response.data;
  }

  // Get messages for a specific booking
  async getBookingMessages(bookingId: string): Promise<Message[]> {
    const response = await apiClient.get(`/api/messages/booking/${bookingId}`);
    return response.data;
  }

  // Send a message
  async sendMessage(data: SendMessageRequest): Promise<Message> {
    const formData = new FormData();
    formData.append('bookingId', data.bookingId);
    formData.append('message', data.message);
    formData.append('messageType', data.messageType || 'text');
    
    if (data.templateId) {
      formData.append('templateId', data.templateId);
    }
    
    if (data.isScheduled && data.scheduledFor) {
      formData.append('isScheduled', 'true');
      formData.append('scheduledFor', data.scheduledFor.toISOString());
    }
    
    if (data.attachments) {
      data.attachments.forEach((file, index) => {
        formData.append(`attachments`, file);
      });
    }

    const response = await apiClient.post('/api/messages', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }

  // Mark messages as read
  async markAsRead(messageIds: string[]): Promise<void> {
    await apiClient.patch('/api/messages/mark-read', { messageIds });
  }

  // Get message templates
  async getTemplates(): Promise<MessageTemplate[]> {
    const response = await apiClient.get('/api/message-templates');
    return response.data;
  }

  // Create message template
  async createTemplate(data: CreateTemplateRequest): Promise<MessageTemplate> {
    const response = await apiClient.post('/api/message-templates', data);
    return response.data;
  }

  // Update message template
  async updateTemplate(id: string, data: Partial<CreateTemplateRequest>): Promise<MessageTemplate> {
    const response = await apiClient.put(`/api/message-templates/${id}`, data);
    return response.data;
  }

  // Delete message template
  async deleteTemplate(id: string): Promise<void> {
    await apiClient.delete(`/api/message-templates/${id}`);
  }

  // Get scheduled messages
  async getScheduledMessages(): Promise<ScheduledMessage[]> {
    const response = await apiClient.get('/api/messages/scheduled');
    return response.data;
  }

  // Upload attachment
  async uploadAttachment(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/api/messages/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }

  // Search messages
  async searchMessages(query: string, bookingId?: string): Promise<Message[]> {
    const params = new URLSearchParams({ query });
    if (bookingId) {
      params.append('bookingId', bookingId);
    }
    
    const response = await apiClient.get(`/api/messages/search?${params}`);
    return response.data;
  }

  // Get message statistics
  async getMessageStats(): Promise<{
    totalMessages: number;
    unreadMessages: number;
    responseTime: number; // average response time in minutes
    activeThreads: number;
  }> {
    const response = await apiClient.get('/api/messages/stats');
    return response.data;
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    this.messageCallbacks = [];
  }
}

export const messagingService = new MessagingService();
export default messagingService;