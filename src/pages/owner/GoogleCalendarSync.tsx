import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Link, 
  Unlink, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Settings
} from 'lucide-react';

interface CalendarSync {
  id: string;
  name: string;
  url: string;
  type: 'google' | 'airbnb' | 'booking' | 'other';
  status: 'connected' | 'error' | 'syncing';
  lastSync: string;
  enabled: boolean;
  syncDirection: 'import' | 'export' | 'bidirectional';
}

interface GoogleCalendarSyncProps {
  propertyId: string;
  onCalendarUpdate?: () => void;
}

export default function GoogleCalendarSync({ propertyId, onCalendarUpdate }: GoogleCalendarSyncProps) {
  const [calendars, setCalendars] = useState<CalendarSync[]>([
    {
      id: '1',
      name: 'Google Calendar - Personal',
      url: 'https://calendar.google.com/calendar/ical/example@gmail.com/private-xyz/basic.ics',
      type: 'google',
      status: 'connected',
      lastSync: '2025-01-21T10:30:00Z',
      enabled: true,
      syncDirection: 'bidirectional'
    }
  ]);

  const [newCalendar, setNewCalendar] = useState({
    name: '',
    url: '',
    type: 'google' as const,
    syncDirection: 'bidirectional' as const
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [googleAuthStatus, setGoogleAuthStatus] = useState<'connected' | 'disconnected'>('disconnected');

  const handleGoogleAuth = async () => {
    setIsConnecting(true);
    try {
      // Simulate Google OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000));
      setGoogleAuthStatus('connected');
    } catch (error) {
      console.error('Google auth failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAddCalendar = async () => {
    if (!newCalendar.name || !newCalendar.url) return;

    const calendar: CalendarSync = {
      id: Date.now().toString(),
      ...newCalendar,
      status: 'syncing',
      lastSync: new Date().toISOString(),
      enabled: true
    };

    setCalendars(prev => [...prev, calendar]);
    setNewCalendar({ name: '', url: '', type: 'google', syncDirection: 'bidirectional' });

    // Simulate sync process
    setTimeout(() => {
      setCalendars(prev => prev.map(cal => 
        cal.id === calendar.id ? { ...cal, status: 'connected' as const } : cal
      ));
      onCalendarUpdate?.();
    }, 2000);
  };

  const handleRemoveCalendar = (id: string) => {
    setCalendars(prev => prev.filter(cal => cal.id !== id));
    onCalendarUpdate?.();
  };

  const handleToggleCalendar = (id: string, enabled: boolean) => {
    setCalendars(prev => prev.map(cal => 
      cal.id === id ? { ...cal, enabled } : cal
    ));
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 3000));
      setCalendars(prev => prev.map(cal => ({
        ...cal,
        lastSync: new Date().toISOString(),
        status: 'connected' as const
      })));
      onCalendarUpdate?.();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusIcon = (status: CalendarSync['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'syncing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: CalendarSync['status']) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'syncing':
        return 'bg-blue-500';
      default:
        return 'bg-yellow-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendar Synchronization
          </CardTitle>
          <CardDescription>
            Sync your property calendar with external calendars to prevent double bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="google" className="space-y-4">
            <TabsList>
              <TabsTrigger value="google">Google Calendar</TabsTrigger>
              <TabsTrigger value="external">External Calendars</TabsTrigger>
              <TabsTrigger value="settings">Sync Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="google" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Google Calendar Integration</CardTitle>
                  <CardDescription>
                    Connect your Google account to automatically sync calendars
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {googleAuthStatus === 'disconnected' ? (
                    <div className="text-center py-6">
                      <div className="mb-4">
                        <Calendar className="h-12 w-12 mx-auto text-gray-400" />
                      </div>
                      <p className="text-gray-600 mb-4">
                        Connect your Google account to access your calendars
                      </p>
                      <Button 
                        onClick={handleGoogleAuth} 
                        disabled={isConnecting}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isConnecting ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Link className="h-4 w-4 mr-2" />
                            Connect Google Calendar
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Google Calendar is connected successfully
                        </AlertDescription>
                      </Alert>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Connected Account</p>
                          <p className="text-sm text-gray-600">example@gmail.com</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Unlink className="h-4 w-4 mr-2" />
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="external" className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">External Calendars</h3>
                  <p className="text-sm text-gray-600">
                    Add calendar URLs from Airbnb, Booking.com, or other platforms
                  </p>
                </div>
                <Button 
                  onClick={handleSyncAll} 
                  disabled={isSyncing}
                  variant="outline"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sync All
                    </>
                  )}
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Add New Calendar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="calendar-name">Calendar Name</Label>
                      <Input
                        id="calendar-name"
                        placeholder="e.g., Airbnb Calendar"
                        value={newCalendar.name}
                        onChange={(e) => setNewCalendar(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="calendar-type">Platform</Label>
                      <select
                        id="calendar-type"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={newCalendar.type}
                        onChange={(e) => setNewCalendar(prev => ({ ...prev, type: e.target.value as any }))}
                      >
                        <option value="google">Google Calendar</option>
                        <option value="airbnb">Airbnb</option>
                        <option value="booking">Booking.com</option>
                        <option value="other">Other Platform</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="calendar-url">iCal URL</Label>
                    <Input
                      id="calendar-url"
                      placeholder="https://calendar.google.com/calendar/ical/..."
                      value={newCalendar.url}
                      onChange={(e) => setNewCalendar(prev => ({ ...prev, url: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sync-direction">Sync Direction</Label>
                    <select
                      id="sync-direction"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={newCalendar.syncDirection}
                      onChange={(e) => setNewCalendar(prev => ({ ...prev, syncDirection: e.target.value as any }))}
                    >
                      <option value="import">Import Only (Read external calendar)</option>
                      <option value="export">Export Only (Share my calendar)</option>
                      <option value="bidirectional">Bidirectional (Both ways)</option>
                    </select>
                  </div>
                  <Button onClick={handleAddCalendar} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Calendar
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {calendars.map((calendar) => (
                  <Card key={calendar.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(calendar.status)}
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{calendar.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {calendar.type}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {calendar.syncDirection}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 truncate max-w-md">
                              {calendar.url}
                            </p>
                            <p className="text-xs text-gray-500">
                              Last sync: {new Date(calendar.lastSync).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={calendar.enabled}
                            onCheckedChange={(enabled) => handleToggleCalendar(calendar.id, enabled)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveCalendar(calendar.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sync Settings</CardTitle>
                  <CardDescription>
                    Configure how calendar synchronization works
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-sync">Automatic Sync</Label>
                        <p className="text-sm text-gray-600">
                          Automatically sync calendars every hour
                        </p>
                      </div>
                      <Switch id="auto-sync" defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="buffer-time">Buffer Time</Label>
                        <p className="text-sm text-gray-600">
                          Add buffer time between bookings
                        </p>
                      </div>
                      <select className="p-2 border border-gray-300 rounded-md">
                        <option value="0">No buffer</option>
                        <option value="1">1 hour</option>
                        <option value="2">2 hours</option>
                        <option value="24">1 day</option>
                      </select>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="conflict-resolution">Conflict Resolution</Label>
                        <p className="text-sm text-gray-600">
                          How to handle booking conflicts
                        </p>
                      </div>
                      <select className="p-2 border border-gray-300 rounded-md">
                        <option value="block">Block conflicting dates</option>
                        <option value="notify">Notify owner only</option>
                        <option value="ignore">Ignore conflicts</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}