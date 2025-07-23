import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Settings,
  TestTube,
  Clock,
  Volume2,
  VolumeX,
  CheckCircle,
  AlertTriangle,
  Info,
  Save
} from 'lucide-react';
import { toast } from 'sonner';
import { NotificationPreferences, NotificationChannel, NotificationType } from '@/types/notifications';
import notificationService from '@/services/notificationService';

interface NotificationSettingsProps {
  ownerId: string;
}

const NOTIFICATION_TYPES = [
  {
    key: 'newBooking',
    label: 'New Bookings',
    description: 'When you receive a new booking request or confirmation',
    icon: <Bell className="h-4 w-4" />,
    priority: 'high'
  },
  {
    key: 'bookingModification',
    label: 'Booking Changes',
    description: 'When guests modify their existing bookings',
    icon: <Settings className="h-4 w-4" />,
    priority: 'normal'
  },
  {
    key: 'bookingCancellation',
    label: 'Booking Cancellations',
    description: 'When bookings are cancelled by guests',
    icon: <AlertTriangle className="h-4 w-4" />,
    priority: 'high'
  },
  {
    key: 'paymentReceived',
    label: 'Payment Received',
    description: 'When payments are successfully processed',
    icon: <CheckCircle className="h-4 w-4" />,
    priority: 'normal'
  },
  {
    key: 'paymentFailed',
    label: 'Payment Issues',
    description: 'When payments fail or require attention',
    icon: <AlertTriangle className="h-4 w-4" />,
    priority: 'high'
  },
  {
    key: 'guestMessage',
    label: 'Guest Messages',
    description: 'When guests send you messages',
    icon: <MessageSquare className="h-4 w-4" />,
    priority: 'normal'
  },
  {
    key: 'reviewReceived',
    label: 'New Reviews',
    description: 'When guests leave reviews for your properties',
    icon: <Info className="h-4 w-4" />,
    priority: 'normal'
  },
  {
    key: 'maintenanceReminder',
    label: 'Maintenance Reminders',
    description: 'Scheduled maintenance and property care reminders',
    icon: <Settings className="h-4 w-4" />,
    priority: 'low'
  },
  {
    key: 'calendarSync',
    label: 'Calendar Updates',
    description: 'When external calendars sync or fail to sync',
    icon: <Clock className="h-4 w-4" />,
    priority: 'low'
  }
];

const SMS_NOTIFICATION_TYPES = [
  {
    key: 'newBooking',
    label: 'New Bookings',
    description: 'Immediate SMS for new bookings'
  },
  {
    key: 'bookingModification',
    label: 'Booking Changes',
    description: 'SMS for booking modifications'
  },
  {
    key: 'bookingCancellation',
    label: 'Cancellations',
    description: 'SMS for booking cancellations'
  },
  {
    key: 'paymentReceived',
    label: 'Payment Confirmations',
    description: 'SMS for successful payments'
  },
  {
    key: 'paymentFailed',
    label: 'Payment Issues',
    description: 'SMS for payment failures'
  },
  {
    key: 'urgentMessages',
    label: 'Urgent Guest Messages',
    description: 'SMS for high-priority guest messages'
  },
  {
    key: 'checkInToday',
    label: 'Check-in Today',
    description: 'Daily reminder of upcoming check-ins'
  },
  {
    key: 'checkOutToday',
    label: 'Check-out Today',
    description: 'Daily reminder of upcoming check-outs'
  }
];

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ ownerId }) => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<{ [key: string]: boolean }>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    checkPushSupport();
    loadPreferences();
  }, []);

  const checkPushSupport = async () => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setPushSupported(true);
      setPushPermission(Notification.permission);
    }
  };

  const loadPreferences = async () => {
    try {
      const prefs = await notificationService.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast.error('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = (updates: Partial<NotificationPreferences>) => {
    if (!preferences) return;
    
    setPreferences({ ...preferences, ...updates });
    setHasChanges(true);
  };

  const updateEmailNotification = (key: string, value: boolean) => {
    if (!preferences) return;
    
    updatePreferences({
      emailNotifications: {
        ...preferences.emailNotifications,
        [key]: value
      }
    });
  };

  const updateSMSNotification = (key: string, value: boolean) => {
    if (!preferences) return;
    
    updatePreferences({
      smsNotifications: {
        ...preferences.smsNotifications,
        [key]: value
      }
    });
  };

  const updatePushNotification = (key: string, value: boolean) => {
    if (!preferences) return;
    
    updatePreferences({
      pushNotifications: {
        ...preferences.pushNotifications,
        [key]: value
      }
    });
  };

  const savePreferences = async () => {
    if (!preferences) return;
    
    setSaving(true);
    try {
      await notificationService.updatePreferences(preferences);
      setHasChanges(false);
      toast.success('Notification preferences saved successfully');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save notification preferences');
    } finally {
      setSaving(false);
    }
  };

  const testNotification = async (type: NotificationType, channels: NotificationChannel[]) => {
    const testKey = `${type}-${channels.join('-')}`;
    setTesting(prev => ({ ...prev, [testKey]: true }));
    
    try {
      const result = await notificationService.testNotification(type, channels);
      
      if (result.success) {
        toast.success(`Test notification sent successfully via ${channels.join(', ')}`);
      } else {
        const failedChannels = Object.entries(result.results)
          .filter(([, success]) => !success)
          .map(([channel]) => channel);
        
        if (failedChannels.length > 0) {
          toast.error(`Test failed for: ${failedChannels.join(', ')}`);
        }
      }
    } catch (error) {
      console.error('Error testing notification:', error);
      toast.error('Failed to send test notification');
    } finally {
      setTesting(prev => ({ ...prev, [testKey]: false }));
    }
  };

  const requestPushPermission = async () => {
    const permission = await notificationService.requestPermission();
    setPushPermission(permission);
    
    if (permission === 'granted') {
      toast.success('Push notifications enabled successfully');
    } else if (permission === 'denied') {
      toast.error('Push notifications were denied. Please enable them in your browser settings.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Bell className="h-8 w-8 animate-pulse mx-auto mb-4" />
          <p>Loading notification settings...</p>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load notification preferences. Please refresh the page and try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notification Settings</h1>
          <p className="text-muted-foreground">
            Manage how and when you receive notifications about your properties
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <Badge variant="outline" className="text-orange-600">
              Unsaved changes
            </Badge>
          )}
          <Button onClick={savePreferences} disabled={saving || !hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="channels" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="types">Notification Types</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Notification Channels */}
        <TabsContent value="channels" className="space-y-6">
          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Email Notifications</span>
              </CardTitle>
              <CardDescription>
                Configure which events trigger email notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {NOTIFICATION_TYPES.map((notificationType) => (
                <div key={notificationType.key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {notificationType.icon}
                    <div>
                      <Label className="font-medium">{notificationType.label}</Label>
                      <p className="text-sm text-muted-foreground">{notificationType.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={preferences.emailNotifications[notificationType.key as keyof typeof preferences.emailNotifications]}
                      onCheckedChange={(checked) => updateEmailNotification(notificationType.key, checked)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testNotification(notificationType.key as NotificationType, ['email'])}
                      disabled={testing[`${notificationType.key}-email`]}
                    >
                      <TestTube className="h-3 w-3 mr-1" />
                      Test
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* SMS Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5" />
                <span>SMS Notifications</span>
              </CardTitle>
              <CardDescription>
                Get instant SMS alerts for critical events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {SMS_NOTIFICATION_TYPES.map((notificationType) => (
                <div key={notificationType.key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label className="font-medium">{notificationType.label}</Label>
                    <p className="text-sm text-muted-foreground">{notificationType.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={preferences.smsNotifications[notificationType.key as keyof typeof preferences.smsNotifications]}
                      onCheckedChange={(checked) => updateSMSNotification(notificationType.key, checked)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testNotification(notificationType.key as NotificationType, ['sms'])}
                      disabled={testing[`${notificationType.key}-sms`]}
                    >
                      <TestTube className="h-3 w-3 mr-1" />
                      Test
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Push Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Push Notifications</span>
              </CardTitle>
              <CardDescription>
                Receive instant browser notifications when SaStays is closed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!pushSupported ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Push notifications are not supported in your browser.
                  </AlertDescription>
                </Alert>
              ) : pushPermission === 'denied' ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Push notifications are blocked. Please enable them in your browser settings to receive notifications.
                  </AlertDescription>
                </Alert>
              ) : pushPermission === 'default' ? (
                <div className="text-center p-6 border border-dashed rounded-lg">
                  <Bell className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-medium mb-2">Enable Push Notifications</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Stay updated with instant notifications even when SaStays is closed
                  </p>
                  <Button onClick={requestPushPermission}>
                    Enable Push Notifications
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label className="font-medium">Enable Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications in your browser
                      </p>
                    </div>
                    <Switch
                      checked={preferences.pushNotifications.enabled}
                      onCheckedChange={(checked) => updatePushNotification('enabled', checked)}
                    />
                  </div>

                  {preferences.pushNotifications.enabled && (
                    <>
                      <Separator />
                      {[
                        { key: 'newBooking', label: 'New Bookings' },
                        { key: 'guestMessage', label: 'Guest Messages' },
                        { key: 'paymentUpdate', label: 'Payment Updates' },
                        { key: 'urgentAlerts', label: 'Urgent Alerts' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-3 border rounded-lg">
                          <Label className="font-medium">{item.label}</Label>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={preferences.pushNotifications[item.key as keyof typeof preferences.pushNotifications] as boolean}
                              onCheckedChange={(checked) => updatePushNotification(item.key, checked)}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => testNotification(item.key as NotificationType, ['push'])}
                              disabled={testing[`${item.key}-push`]}
                            >
                              <TestTube className="h-3 w-3 mr-1" />
                              Test
                            </Button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Types */}
        <TabsContent value="types" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Priority</CardTitle>
              <CardDescription>
                Different types of notifications have different priority levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {['high', 'normal', 'low'].map((priority) => (
                  <div key={priority}>
                    <div className="flex items-center space-x-2 mb-3">
                      <Badge variant={priority === 'high' ? 'destructive' : priority === 'normal' ? 'default' : 'secondary'}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {NOTIFICATION_TYPES
                        .filter(type => type.priority === priority)
                        .map((type) => (
                          <div key={type.key} className="flex items-center space-x-3 p-3 border rounded-lg">
                            {type.icon}
                            <div>
                              <Label className="font-medium">{type.label}</Label>
                              <p className="text-xs text-muted-foreground">{type.description}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Settings */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Quiet Hours</span>
              </CardTitle>
              <CardDescription>
                Set hours when you don't want to receive non-urgent notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Enable Quiet Hours</Label>
                  <p className="text-sm text-muted-foreground">
                    Pause non-urgent notifications during specified hours
                  </p>
                </div>
                <Switch
                  checked={preferences.quietHours.enabled}
                  onCheckedChange={(checked) => updatePreferences({
                    quietHours: { ...preferences.quietHours, enabled: checked }
                  })}
                />
              </div>

              {preferences.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={preferences.quietHours.startTime}
                      onChange={(e) => updatePreferences({
                        quietHours: { ...preferences.quietHours, startTime: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={preferences.quietHours.endTime}
                      onChange={(e) => updatePreferences({
                        quietHours: { ...preferences.quietHours, endTime: e.target.value }
                      })}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Frequency</CardTitle>
              <CardDescription>
                Control how often you receive certain types of notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Digest Email Frequency</Label>
                <Select
                  value={preferences.frequency.digestEmail}
                  onValueChange={(value: any) => updatePreferences({
                    frequency: { ...preferences.frequency, digestEmail: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Summary Reports</Label>
                <Select
                  value={preferences.frequency.summary}
                  onValueChange={(value: any) => updatePreferences({
                    frequency: { ...preferences.frequency, summary: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test All Notifications</CardTitle>
              <CardDescription>
                Send test notifications across all enabled channels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <Button
                  onClick={() => testNotification('booking_new', ['email', 'sms', 'push'])}
                  disabled={testing['test-all']}
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Test All Channels
                </Button>
                <Button
                  variant="outline"
                  onClick={() => testNotification('booking_new', ['email'])}
                  disabled={testing['test-email']}
                >
                  Test Email Only
                </Button>
                <Button
                  variant="outline"
                  onClick={() => testNotification('booking_new', ['sms'])}
                  disabled={testing['test-sms']}
                >
                  Test SMS Only
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reset to Defaults</CardTitle>
              <CardDescription>
                Reset all notification preferences to recommended defaults
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={() => {
                  // Reset to default preferences
                  const defaultPrefs: Partial<NotificationPreferences> = {
                    emailNotifications: {
                      newBooking: true,
                      bookingModification: true,
                      bookingCancellation: true,
                      paymentReceived: true,
                      paymentFailed: true,
                      guestMessage: true,
                      reviewReceived: true,
                      maintenanceReminder: false,
                      calendarSync: false
                    },
                    smsNotifications: {
                      newBooking: true,
                      bookingModification: false,
                      bookingCancellation: true,
                      paymentReceived: false,
                      paymentFailed: true,
                      urgentMessages: true,
                      checkInToday: true,
                      checkOutToday: true
                    },
                    pushNotifications: {
                      enabled: true,
                      newBooking: true,
                      guestMessage: true,
                      paymentUpdate: true,
                      urgentAlerts: true
                    },
                    quietHours: {
                      enabled: true,
                      startTime: '22:00',
                      endTime: '08:00'
                    },
                    frequency: {
                      digestEmail: 'daily',
                      summary: 'weekly'
                    }
                  };
                  
                  updatePreferences(defaultPrefs);
                  toast.success('Settings reset to defaults');
                }}
              >
                Reset to Defaults
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationSettings;