// src/components/property/CalendarSync.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Link, RefreshCw } from 'lucide-react';
import { calendarApi } from '../services/api'; // Assuming you create a calendarApi service

interface CalendarSyncProps {
    propertyId: number;
}

export const CalendarSync: React.FC<CalendarSyncProps> = ({ propertyId }) => {
    const [externalCalendarUrl, setExternalCalendarUrl] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);
    const { toast } = useToast();

    const handleSync = async () => {
        if (!externalCalendarUrl.startsWith('https://') || !externalCalendarUrl.endsWith('.ics')) {
            toast({
                title: "Invalid URL",
                description: "Please enter a valid iCal (.ics) URL.",
                variant: "destructive",
            });
            return;
        }

        setIsSyncing(true);
        try {
            await calendarApi.syncCalendar(propertyId, { externalCalendarUrl });
            toast({
                title: "Sync Initiated",
                description: "Your calendar will be updated shortly.",
            });
        } catch (error) {
            console.error("Failed to sync calendar:", error);
            toast({
                title: "Error",
                description: "Could not initiate calendar sync.",
                variant: "destructive",
            });
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Calendar Synchronization</CardTitle>
                <CardDescription>Keep your availability up-to-date by syncing with external calendars like Google Calendar, Airbnb, or Booking.com.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <h4 className="font-medium">Export Your Calendar</h4>
                        <p className="text-sm text-muted-foreground mb-2">Use this link to import your bookings into an external calendar.</p>
                        <div className="flex gap-2">
                            <Input readOnly value={`https://api.sastays.com/properties/${propertyId}/ical`} />
                            <Button variant="outline" onClick={() => navigator.clipboard.writeText(`https://api.sastays.com/properties/${propertyId}/ical`)}>Copy</Button>
                        </div>
                    </div>
                    <div className="border-t pt-4">
                        <h4 className="font-medium">Import an External Calendar</h4>
                        <p className="text-sm text-muted-foreground mb-2">Paste the iCal link from another service to block off dates on your calendar.</p>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Paste iCal link here..."
                                value={externalCalendarUrl}
                                onChange={(e) => setExternalCalendarUrl(e.target.value)}
                            />
                            <Button onClick={handleSync} disabled={isSyncing}>
                                {isSyncing ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Sync'}
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};