// src/services/NotificationService.ts
import { toast } from '@/hooks/use-toast';

export interface NotificationData {
  type: 'booking_confirmed' | 'booking_cancelled' | 'payment_received' | 'guest_message' | 'review_received';
  recipientEmail: string;
  recipientPhone?: string;
  data: {
    guestName?: string;
    propertyTitle?: string;
    checkIn?: string;
    checkOut?: string;
    amount?: number;
    bookingId?: string;
    message?: string;
    rating?: number;
  };
}

class NotificationService {
  private apiBaseUrl = '/api/notifications';

  async sendDualNotification(notification: NotificationData): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/send-dual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notification),
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Notification error:', error);
      return false;
    }
  }

  async sendEmailNotification(notification: Omit<NotificationData, 'recipientPhone'>): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notification),
      });

      return response.ok;
    } catch (error) {
      console.error('Email notification error:', error);
      return false;
    }
  }

  async sendSMSNotification(notification: Required<Pick<NotificationData, 'type' | 'recipientPhone' | 'data'>>): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/send-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notification),
      });

      return response.ok;
    } catch (error) {
      console.error('SMS notification error:', error);
      return false;
    }
  }

  // Notification templates for different types
  getEmailTemplate(type: NotificationData['type'], data: NotificationData['data']): { subject: string; html: string } {
    switch (type) {
      case 'booking_confirmed':
        return {
          subject: `New Booking Confirmed - ${data.propertyTitle}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1E88E5;">New Booking Confirmed! 🎉</h2>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Booking Details:</h3>
                <p><strong>Guest:</strong> ${data.guestName}</p>
                <p><strong>Property:</strong> ${data.propertyTitle}</p>
                <p><strong>Check-in:</strong> ${data.checkIn}</p>
                <p><strong>Check-out:</strong> ${data.checkOut}</p>
                <p><strong>Amount:</strong> R${data.amount?.toLocaleString()}</p>
                <p><strong>Booking ID:</strong> ${data.bookingId}</p>
              </div>
              <p>You can view full details in your dashboard.</p>
              <a href="${window.location.origin}/dashboard" style="background: #1E88E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Dashboard</a>
            </div>
          `
        };

      case 'payment_received':
        return {
          subject: `Payment Received - R${data.amount?.toLocaleString()}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #10B981;">Payment Received! 💰</h2>
              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Amount:</strong> R${data.amount?.toLocaleString()}</p>
                <p><strong>Property:</strong> ${data.propertyTitle}</p>
                <p><strong>Guest:</strong> ${data.guestName}</p>
                <p><strong>Booking ID:</strong> ${data.bookingId}</p>
              </div>
              <p>The payment has been processed successfully and will be transferred to your account within 2-3 business days.</p>
            </div>
          `
        };

      case 'guest_message':
        return {
          subject: `New Message from ${data.guestName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1E88E5;">New Message from Guest 💬</h2>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Guest:</strong> ${data.guestName}</p>
                <p><strong>Property:</strong> ${data.propertyTitle}</p>
                <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #1E88E5;">
                  "${data.message}"
                </div>
              </div>
              <a href="${window.location.origin}/inbox" style="background: #1E88E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reply to Message</a>
            </div>
          `
        };

      case 'review_received':
        return {
          subject: `New Review Received - ${data.rating} Stars`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #F59E0B;">New Guest Review! ⭐</h2>
              <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Guest:</strong> ${data.guestName}</p>
                <p><strong>Property:</strong> ${data.propertyTitle}</p>
                <p><strong>Rating:</strong> ${data.rating}/5 stars</p>
                ${data.message ? `<div style="background: white; padding: 15px; border-radius: 6px; margin-top: 10px;">
                  "${data.message}"
                </div>` : ''}
              </div>
              <a href="${window.location.origin}/reviews" style="background: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View All Reviews</a>
            </div>
          `
        };

      default:
        return {
          subject: 'SaStays Notification',
          html: '<p>You have a new notification from SaStays.</p>'
        };
    }
  }

  getSMSMessage(type: NotificationData['type'], data: NotificationData['data']): string {
    switch (type) {
      case 'booking_confirmed':
        return `SaStays: New booking confirmed! ${data.guestName} booked ${data.propertyTitle} for ${data.checkIn} - ${data.checkOut}. Amount: R${data.amount?.toLocaleString()}. ID: ${data.bookingId}`;

      case 'payment_received':
        return `SaStays: Payment received! R${data.amount?.toLocaleString()} from ${data.guestName} for ${data.propertyTitle}. Transfer in 2-3 days.`;

      case 'guest_message':
        return `SaStays: New message from ${data.guestName} (${data.propertyTitle}): "${data.message?.substring(0, 100)}${data.message && data.message.length > 100 ? '...' : ''}"`;

      case 'review_received':
        return `SaStays: New ${data.rating}-star review from ${data.guestName} for ${data.propertyTitle}. Check your dashboard for details.`;

      default:
        return 'SaStays: You have a new notification.';
    }
  }
}

export const notificationService = new NotificationService();

// React Hook for notifications
import { useState, useCallback } from 'react';

export const useNotifications = () => {
  const [sending, setSending] = useState(false);

  const sendNotification = useCallback(async (notification: NotificationData) => {
    setSending(true);
    try {
      const success = await notificationService.sendDualNotification(notification);
      
      if (success) {
        toast({
          title: "Notification sent",
          description: "Email and SMS notifications have been delivered.",
        });
      } else {
        toast({
          title: "Notification failed",
          description: "There was an error sending notifications.",
          variant: "destructive",
        });
      }
      
      return success;
    } catch (error) {
      toast({
        title: "Notification error",
        description: "Failed to send notifications.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSending(false);
    }
  }, []);

  return {
    sendNotification,
    sending
  };
};

// src/components/notifications/NotificationSettings.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, Bell, Settings } from 'lucide-react';

interface NotificationPreferences {
  emailEnabled: boolean;
  smsEnabled: boolean;
  bookingNotifications: boolean;
  paymentNotifications: boolean;
  messageNotifications: boolean;
  reviewNotifications: boolean;
  email: string;
  phone: string;
}

export const NotificationSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailEnabled: true,
    smsEnabled: true,
    bookingNotifications: true,
    paymentNotifications: true,
    messageNotifications: true,
    reviewNotifications: true,
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [testingSMS, setTestingSMS] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load current preferences
    const loadPreferences = async () => {
      try {
        const response = await fetch('/api/user/notification-preferences');
        const data = await response.json();
        setPreferences(data);
      } catch (error) {
        console.error('Failed to load preferences:', error);
      }
    };

    loadPreferences();
  }, []);

  const savePreferences = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/notification-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      });

      if (response.ok) {
        toast({
          title: "Settings saved",
          description: "Your notification preferences have been updated."
        });
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notification preferences.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testNotification = async (type: 'email' | 'sms') => {
    const setTestingState = type === 'email' ? setTestingEmail : setTestingSMS;
    setTestingState(true);

    try {
      const testData: NotificationData = {
        type: 'booking_confirmed',
        recipientEmail: preferences.email,
        recipientPhone: type === 'sms' ? preferences.phone : undefined,
        data: {
          guestName: 'Test Guest',
          propertyTitle: 'Test Property',
          checkIn: '2024-01-15',
          checkOut: '2024-01-17',
          amount: 1500,
          bookingId: 'TEST-001'
        }
      };

      const success = type === 'email' 
        ? await notificationService.sendEmailNotification(testData)
        : await notificationService.sendSMSNotification({
            type: testData.type,
            recipientPhone: preferences.phone,
            data: testData.data
          });

      if (success) {
        toast({
          title: `Test ${type} sent`,
          description: `Check your ${type === 'email' ? 'email inbox' : 'phone'} for the test notification.`
        });
      } else {
        throw new Error(`Failed to send test ${type}`);
      }
    } catch (error) {
      toast({
        title: "Test failed",
        description: `Failed to send test ${type} notification.`,
        variant: "destructive"
      });
    } finally {
      setTestingState(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contact Information</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    value={preferences.email}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                    placeholder="your@email.com"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testNotification('email')}
                    disabled={!preferences.email || testingEmail}
                  >
                    {testingEmail ? <Bell className="h-4 w-4 animate-pulse" /> : <Mail className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="phone"
                    value={preferences.phone}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      phone: e.target.value
                    }))}
                    placeholder="+27 XX XXX XXXX"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testNotification('sms')}
                    disabled={!preferences.phone || testingSMS}
                  >
                    {testingSMS ? <Bell className="h-4 w-4 animate-pulse" /> : <Phone className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Channels */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Notification Channels</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <Label>Email Notifications</Label>
                </div>
                <Switch