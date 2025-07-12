import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/supabaseClient';
import { PlusCircle, Loader2, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

// Define interfaces for our data structures
interface Booking {
  id: number;
  property_id: number;
  start_date: string;
  end_date: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'pending_approval' | 'completed';
  properties: { title: string };
  profiles: { full_name: string; email: string; phone: string };
}

interface Property {
    id: number;
    title: string;
    status: string;
}

interface Transaction {
    id: number;
    booking_id: number;
    amount: number;
    status: string;
    created_at: string;
    bookings: {
        properties: { title: string }
    }
}

export default function OwnerDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
        navigate('/login');
        return;
    }

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch properties owned by the current user
            const { data: propertiesData, error: propertiesError } = await supabase
                .from('properties')
                .select('id, title, status')
                .eq('owner_id', user.id);

            if (propertiesError) throw propertiesError;
            const safeProperties = propertiesData || [];
            setProperties(safeProperties);

            const propertyIds = safeProperties.map(p => p.id);

            if (propertyIds.length > 0) {
                // Fetch bookings for these properties
                const { data: bookingsData, error: bookingsError } = await supabase
                    .from('bookings')
                    .select(`
                        id, start_date, end_date, total_price, status,
                        properties ( title ),
                        profiles ( full_name, email, phone )
                    `)
                    .in('property_id', propertyIds)
                    .order('created_at', { ascending: false });
                if (bookingsError) throw bookingsError;
                const safeBookings = bookingsData || [];
                setBookings(safeBookings);

                // Fetch transactions for the owner's bookings
                const bookingIds = safeBookings.map(b => b.id);
                if (bookingIds.length > 0) {
                    const { data: transData, error: transError } = await supabase
                        .from('transactions')
                        .select('*, bookings(properties(title))')
                        .in('booking_id', bookingIds)
                        .order('created_at', { ascending: false });
                    if(transError) throw transError;
                    setTransactions(transData || []);
                }
            }
        } catch (err: any) {
            setError('Failed to fetch dashboard data.');
            toast.error('Could not load dashboard data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    fetchData();
  }, [user, navigate]);

  // Function to handle approving or declining a booking request
  const handleUpdateRequest = async (bookingId: number, newStatus: 'confirmed' | 'cancelled') => {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .update({ status: newStatus })
            .eq('id', bookingId)
            .eq('status', 'pending_approval')
            .select()
            .single();

        if (error) throw error;
        
        setBookings(prevBookings => prevBookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
        toast.success(`Booking request has been ${newStatus}.`);

    } catch (error) {
        toast.error("Failed to update booking status.");
        console.error(error);
    }
  }

  const pendingApprovalBookings = bookings.filter(b => b.status === 'pending_approval');
  const otherBookings = bookings.filter(b => b.status !== 'pending_approval');

  return (
    <div className="min-h-screen flex flex-col bg-muted/40">
      <Navbar />
      <main className="flex-1 pt-20 container mb-12">
        <div className="flex justify-between items-center mb-8 mt-8">
            <h1 className="text-3xl font-bold">Owner Dashboard</h1>
            <Button asChild>
                <Link to="/create-property">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Property
                </Link>
            </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
        ) : error ? (
          <div className="text-destructive bg-destructive/10 p-4 rounded-md">{error}</div>
        ) : (
          <div className="space-y-12">
             {/* Pending Approvals Section */}
             {pendingApprovalBookings.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Booking Requests</CardTitle>
                        <CardDescription>You have {pendingApprovalBookings.length} new request(s) to review.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {pendingApprovalBookings.map(booking => (
                            <div key={booking.id} className="flex flex-wrap justify-between items-center gap-4 p-4 border rounded-lg">
                                <div>
                                    <p className="font-bold">{booking.properties.title}</p>
                                    <p className="text-sm text-muted-foreground">Guest: {booking.profiles.full_name} ({booking.profiles.email})</p>
                                    <p className="text-sm">
                                        {format(parseISO(booking.start_date), 'dd MMM yyyy')} - {format(parseISO(booking.end_date), 'dd MMM yyyy')}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleUpdateRequest(booking.id, 'confirmed')}>
                                        <Check className="h-4 w-4 mr-2"/>
                                        Approve
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleUpdateRequest(booking.id, 'cancelled')}>
                                        <X className="h-4 w-4 mr-2"/>
                                        Decline
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
             )}

            {/* Your Properties Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Your Properties</CardTitle>
                </CardHeader>
                <CardContent>
                    {properties.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                            <thead className="text-left">
                                <tr className="border-b">
                                <th className="px-4 py-2 font-semibold">Title</th>
                                <th className="px-4 py-2 font-semibold">Status</th>
                                <th className="px-4 py-2 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {properties.map(p => (
                                <tr key={p.id} className="border-b last:border-b-0">
                                    <td className="px-4 py-3">{p.title}</td>
                                    <td className="px-4 py-3 capitalize">{p.status}</td>
                                    <td className="px-4 py-3 text-right">
                                        <Button asChild variant="outline" size="sm">
                                            <Link to={`/edit-property/${p.id}`}>Edit</Link>
                                        </Button>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-muted-foreground py-4">You haven't added any properties yet.</p>
                    )}
                </CardContent>
            </Card>

            {/* Transaction History Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>A log of all payment attempts for your properties.</CardDescription>
                </CardHeader>
                 <CardContent>
                    {transactions.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                            <thead className="text-left">
                                <tr className="border-b">
                                    <th className="px-4 py-2 font-semibold">Date</th>
                                    <th className="px-4 py-2 font-semibold">Property</th>
                                    <th className="px-4 py-2 font-semibold">Amount (ZAR)</th>
                                    <th className="px-4 py-2 font-semibold">Status</th>
                                    <th className="px-4 py-2 font-semibold">Booking ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map(t => (
                                <tr key={t.id} className="border-b last:border-b-0">
                                    <td className="px-4 py-3">{format(parseISO(t.created_at), 'dd MMM yyyy, HH:mm')}</td>
                                    <td className="px-4 py-3">{t.bookings.properties.title}</td>
                                    <td className="px-4 py-3">{t.amount}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs ${t.status === 'COMPLETE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">{t.booking_id}</td>
                                </tr>
                                ))}
                            </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-muted-foreground py-4">No transactions found.</p>
                    )}
                 </CardContent>
            </Card>
            
            {/* Booking History (for non-pending bookings) */}
            <Card>
                <CardHeader>
                    <CardTitle>Booking History</CardTitle>
                    <CardDescription>A log of all past and upcoming bookings for your properties.</CardDescription>
                </CardHeader>
                 <CardContent>
                    {otherBookings.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                            <thead className="text-left">
                                <tr className="border-b">
                                    <th className="px-4 py-2 font-semibold">Property</th>
                                    <th className="px-4 py-2 font-semibold">Guest</th>
                                    <th className="px-4 py-2 font-semibold">Dates</th>
                                    <th className="px-4 py-2 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {otherBookings.map(b => (
                                <tr key={b.id} className="border-b last:border-b-0">
                                    <td className="px-4 py-3">{b.properties.title}</td>
                                    <td className="px-4 py-3">{b.profiles.full_name}</td>
                                    <td className="px-4 py-3">{format(parseISO(b.start_date), 'dd/MM/yy')} - {format(parseISO(b.end_date), 'dd/MM/yy')}</td>
                                    <td className="px-4 py-3 capitalize font-medium">{b.status}</td>
                                </tr>
                                ))}
                            </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-muted-foreground py-4">No confirmed or past bookings yet.</p>
                    )}
                 </CardContent>
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}