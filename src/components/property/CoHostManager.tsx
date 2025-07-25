
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Trash2 } from 'lucide-react';
import { apiService } from '@/services/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';

interface CoHost {
    id: number;
    co_host_email: string;
    permissions: {
        can_edit_listing: boolean;
        can_manage_bookings: boolean;
        can_manage_calendar: boolean;
        can_message_guests: boolean;
    };
}

interface CoHostManagerProps {
    propertyId: number;
}

const newCoHostSchema = z.object({
  coHostEmail: z.string().email("Invalid email address"),
  permissions: z.object({
    can_edit_listing: z.boolean(),
    can_manage_bookings: z.boolean(),
    can_manage_calendar: z.boolean(),
    can_message_guests: z.boolean(),
  }).partial().default({ can_message_guests: true }), // Default message guests to true
});

type NewCoHostFormData = z.infer<typeof newCoHostSchema>;

export const CoHostManager: React.FC<CoHostManagerProps> = ({ propertyId }) => {
    const [coHosts, setCoHosts] = useState<CoHost[]>([]);
    const { toast } = useToast();

    const form = useForm<NewCoHostFormData>({
      resolver: zodResolver(newCoHostSchema),
      defaultValues: {
        coHostEmail: '',
        permissions: {
          can_edit_listing: false,
          can_manage_bookings: false,
          can_manage_calendar: false,
          can_message_guests: true,
        },
      },
    });

    useEffect(() => {
        const fetchCoHosts = async () => {
            try {
                const { data } = await coHostApi.getCoHosts(propertyId);
                setCoHosts(data);
            } catch (error) {
                console.error("Failed to fetch co-hosts:", error);
                toast({ title: "Error", description: "Could not load co-hosts.", variant: "destructive" });
            }
        };

        fetchCoHosts();
    }, [propertyId, toast]);

    const handleAddCoHost = async (values: NewCoHostFormData) => {
        try {
            const { data: newCoHost } = await coHostApi.addCoHost(propertyId, values);
            setCoHosts([...coHosts, newCoHost]);
            form.reset(); // Clear form after successful submission
            toast({ title: "Success", description: "Co-host added successfully." });
        } catch (error) {
            console.error("Failed to add co-host:", error);
            toast({ title: "Error", description: "Failed to add co-host. Make sure the user exists and is not already a co-host.", variant: "destructive" });
        }
    };

    const handleRemoveCoHost = async (coHostId: number) => {
        try {
            await coHostApi.removeCoHost(propertyId, coHostId);
            setCoHosts(coHosts.filter(ch => ch.id !== coHostId));
            toast({ title: "Success", description: "Co-host removed." });
        } catch (error) {
            console.error("Failed to remove co-host:", error);
            toast({ title: "Error", description: "Could not remove co-host.", variant: "destructive" });
        }
    };

    const permissionLabels: Record<keyof NewCoHostFormData['permissions'], string> = {
      can_edit_listing: "Edit Listing",
      can_manage_bookings: "Manage Bookings",
      can_manage_calendar: "Manage Calendar",
      can_message_guests: "Message Guests",
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Co-host Management</CardTitle>
                <CardDescription>Add or remove co-hosts and manage their permissions for this property.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {coHosts.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No co-hosts added yet.</p>
                    ) : (
                        coHosts.map(coHost => (
                            <div key={coHost.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p className="font-medium">{coHost.co_host_email}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Permissions: {
                                            Object.entries(coHost.permissions)
                                                .filter(([, value]) => value)
                                                .map(([key]) => permissionLabels[key as keyof NewCoHostFormData['permissions']])
                                                .join(', ') || 'None'
                                        }
                                    </p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveCoHost(coHost.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleAddCoHost)} className="mt-6 space-y-4 border-t pt-6">
                      <h3 className="text-lg font-semibold">Add New Co-host</h3>
                      <FormField
                          control={form.control}
                          name="coHostEmail"
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Co-host Email</FormLabel>
                                  <FormControl>
                                      <Input placeholder="cohost@example.com" {...field} />
                                  </FormControl>
                                  <FormDescription>Enter the email address of the user you want to add as a co-host.</FormDescription>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                      <div className="space-y-2">
                          <FormLabel>Permissions</FormLabel>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {Object.keys(permissionLabels).map((key) => (
                                  <FormField
                                      key={key}
                                      control={form.control}
                                      name={`permissions.${key}` as `permissions.${keyof NewCoHostFormData['permissions']}`}
                                      render={({ field }) => (
                                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                              <FormControl>
                                                  <Checkbox
                                                      checked={field.value}
                                                      onCheckedChange={field.onChange}
                                                  />
                                              </FormControl>
                                              <div className="space-y-1 leading-none">
                                                  <FormLabel>{permissionLabels[key as keyof NewCoHostFormData['permissions']]}</FormLabel>
                                              </div>
                                          </FormItem>
                                      )}
                                  />
                              ))}
                          </div>
                          <FormMessage />
                      </div>
                      <Button type="submit" className="w-full">
                          <UserPlus className="mr-2 h-4 w-4" /> Add Co-host
                      </Button>
                  </form>
                </Form>
            </CardContent>
        </Card>
    );
};