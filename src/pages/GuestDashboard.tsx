import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar, Home, MessageCircle, Star, LogOut, User, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';

interface Booking {
  id: number;
  property_id: number;
  property_title: string;
  start_date: string;
  end_date: string;
  guests: number;
  total_amount: string;
  status: string;
  payment_status: string;
  confirmation_code: string;
}

export default function GuestDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'guest') {
      navigate('/login');
    } else {
      fetchGuestBookings();
    }
  }, [user, navigate]);

  const fetchGuestBookings = async () => {
    try {
      // For now, we'll use mock data since the API endpoint doesn't exist yet
      // In a real implementation, this would be: 
      // const response = await axios.get(`/api/guests/${user.id}/bookings`);
      
      // Mock data for demonstration
      const mockBookings: Booking[] = [
        {
          id: 1,
          property_id: 3,
          property_title: "Spacious Family House",
          start_date: "2025-08-15",
          end_date: "2025-08-20",
          guests: 2,
          total_amount: "4400.00",
          status: "confirmed",
          payment_status: "paid",
          confirmation_code: "SAB001"
        }
      ];
      
      setBookings(mockBookings);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Confirmed</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />{status}</Badge>;
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {user.first_name}!
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your bookings and explore amazing properties
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/apartments')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Browse Properties</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Explore</div>
                <p className="text-xs text-muted-foreground">
                  Find your perfect stay
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/booking')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bookings.filter(b => b.status === 'confirmed').length}</div>
                <p className="text-xs text-muted-foreground">
                  Active reservations
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Messages</CardTitle>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Unread messages
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/rate-your-stay')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reviews</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Rate</div>
                <p className="text-xs text-muted-foreground">
                  Share your experience
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>My Bookings</CardTitle>
                <CardDescription>Your reservation history and upcoming stays</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-muted-foreground">Loading bookings...</p>
                ) : bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{booking.property_title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(booking.start_date), 'MMM dd')} - {format(new Date(booking.end_date), 'MMM dd, yyyy')}
                            </p>
                          </div>
                          {getStatusBadge(booking.status)}
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>{booking.guests} guests</span>
                          <span className="font-medium">R{parseFloat(booking.total_amount).toLocaleString()}</span>
                        </div>
                        <Separator />
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => navigate(`/apartments/${booking.property_id}`)}
                          >
                            View Property
                          </Button>
                          {booking.status === 'confirmed' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => navigate(`/rate-your-stay?booking=${booking.id}`)}
                            >
                              <Star className="w-3 h-3 mr-1" />
                              Review
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">No bookings yet</p>
                    <Button 
                      onClick={() => navigate('/apartments')}
                    >
                      Browse Properties
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account & Quick Actions</CardTitle>
                <CardDescription>Manage your account and quick actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Profile</h4>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{user.first_name} {user.last_name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => navigate('/apartments')}
                    >
                      <Home className="mr-2 h-4 w-4" />
                      Browse Properties
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => navigate('/booking')}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Make a Booking
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => navigate('/contact')}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Contact Support
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}