// src/components/property/CoHostManager.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Trash2 } from 'lucide-react';
import { coHostApi } from '../services/api'; // Assuming you create a coHostApi service

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

export const CoHostManager: React.FC<CoHostManagerProps> = ({ propertyId }) => {
    const [coHosts, setCoHosts] = useState<CoHost[]>([]);
    const [newCoHostEmail, setNewCoHostEmail] = useState('');
    const [permissions, setPermissions] = useState({
        can_edit_listing: false,
        can_manage_bookings: false,
        can_manage_calendar: false,
        can_message_guests: true,
    });
    const { toast } = useToast();

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

    const handleAddCoHost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCoHostEmail) return;

        try {
            const { data: newCoHost } = await coHostApi.addCoHost(propertyId, {
                coHostEmail: newCoHostEmail,
                permissions,
            });
            setCoHosts([...coHosts, newCoHost]);
            setNewCoHostEmail('');
            toast({ title: "Success", description: "Co-host added successfully." });
        } catch (error) {
            console.error("Failed to add co-host:", error);
            toast({ title: "Error", description: "Failed to add co-host. Make sure the user exists.", variant: "destructive" });
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

    const handlePermissionChange = (key: keyof typeof permissions) => {
        setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Co-host Management</CardTitle>
                <CardDescription>Add or remove co-hosts and manage their permissions for this property.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {coHosts.map(coHost => (
                        <div key={coHost.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                                <p className="font-medium">{coHost.co_host_email}</p>
                                <p className="text-xs text-muted-foreground">
                                    {Object.entries(coHost.permissions)
                                        .filter(([, value]) => value)
                                        .map(([key]) => key.replace(/_/g, ' ').replace('can ', ''))
                                        .join(', ')}
                                </p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveCoHost(coHost.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleAddCoHost} className="mt-6 space-y-4 border-t pt-6">
                    <h3 className="text-lg font-semibold">Add New Co-host</h3>
                    <Input
                        type="email"
                        placeholder="Enter co-host's email address"
                        value={newCoHostEmail}
                        onChange={(e) => setNewCoHostEmail(e.target.value)}
                    />
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Permissions</label>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.keys(permissions).map((key) => (
                                <div key={key} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={key}
                                        checked={permissions[key as keyof typeof permissions]}
                                        onCheckedChange={() => handlePermissionChange(key as keyof typeof permissions)}
                                    />
                                    <label htmlFor={key} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        {key.replace(/_/g, ' ')}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <Button type="submit" className="w-full">
                        <UserPlus className="mr-2 h-4 w-4" /> Add Co-host
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};