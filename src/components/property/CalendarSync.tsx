
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Link, RefreshCw, Copy } from 'lucide-react';
import { apiService } from '@/services/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

interface CalendarSyncProps {
    propertyId: number;
}

const iCalSchema = z.object({
  externalCalendarUrl: z.string().url("Invalid URL format").regex(/^https:\/\/.*\.ics$/, "URL must be an HTTPS link ending with .ics"),
});

type ICalFormData = z.infer<typeof iCalSchema>;

export const CalendarSync: React.FC<CalendarSyncProps> = ({ propertyId }) => {
    const [isSyncing, setIsSyncing] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const { toast } = useToast();

    const form = useForm<ICalFormData>({
      resolver: zodResolver(iCalSchema),
      defaultValues: {
        externalCalendarUrl: '',
      },
    });

    const handleSync = async (values: ICalFormData) => {
        setIsSyncing(true);
        try {
            await calendarApi.syncCalendar(propertyId, values);
            toast({
                title: "Sync Initiated",
                description: "Your calendar will be updated shortly.",
            });
            form.reset();
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

    const handleCopy = () => {
      navigator.clipboard.writeText(`https://api.sastays.com/properties/${propertyId}/ical`);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Calendar Synchronization</CardTitle>
                <CardDescription>Keep your availability up-to-date by syncing with external calendars like Google Calendar, Airbnb, or Booking.com.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div>
                        <h4 className="font-medium">Export Your Calendar</h4>
                        <p className="text-sm text-muted-foreground mb-2">Use this link to import your bookings into an external calendar.</p>
                        <div className="flex gap-2">
                            <Input readOnly value={`https://api.sastays.com/properties/${propertyId}/ical`} />
                            <Button variant="outline" onClick={handleCopy}>
                              {copySuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                              {copySuccess ? 'Copied!' : 'Copy'}
                            </Button>
                        </div>
                    </div>
                    <div className="border-t pt-6">
                        <h4 className="font-medium">Import an External Calendar</h4>
                        <p className="text-sm text-muted-foreground mb-2">Paste the iCal link from another service to block off dates on your calendar.</p>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(handleSync)} className="flex gap-2">
                              <FormField
                                  control={form.control}
                                  name="externalCalendarUrl"
                                  render={({ field }) => (
                                      <FormItem className="flex-grow">
                                          <FormControl>
                                              <Input
                                                  placeholder="Paste iCal link here (e.g., https://calendar.google.com/calendar/ical/.../basic.ics)"
                                                  {...field}
                                              />
                                          </FormControl>
                                          <FormMessage />
                                      </FormItem>
                                  )}
                              />
                              <Button type="submit" disabled={isSyncing}>
                                  {isSyncing ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Sync'}
                              </Button>
                          </form>
                        </Form>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};