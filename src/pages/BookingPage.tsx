import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { format, differenceInDays } from 'date-fns';
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, MapPin, Users, Bed, Bath, ArrowLeft, CreditCard } from "lucide-react";
import { DateRange } from "react-day-picker";
import { supabase } from "@/supabaseClient";
import { toast } from "sonner";
import { ApartmentProps } from "@/components/ApartmentCard";
import PaymentModal from "@/components/PaymentModal";

export default function BookingPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const propertyId = searchParams.get('propertyId');
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');

    const [property, setProperty] = useState<ApartmentProps | null>(null);
    const [bookedDates, setBookedDates] = useState<Date[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: fromDate ? new Date(fromDate) : undefined,
        to: toDate ? new Date(toDate) : undefined,
    });
    const [guests, setGuests] = useState(1);
    const [nights, setNights] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);

    const [guestDetails, setGuestDetails] = useState({
        name: '',
        email: '',
        phone: '',
    });

    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [bookingId, setBookingId] = useState<string | null>(null);

    useEffect(() => {
        if (!propertyId) {
            setError("No property selected. Please go back and choose a property.");
            setLoading(false);
            return;
        }

        const fetchPropertyData = async () => {
            setLoading(true);
            try {
                // Fetch property details
                const { data: propertyData, error: propertyError } = await supabase
                    .from('properties')
                    .select('*')
                    .eq('id', propertyId)
                    .single();
                if (propertyError) throw new Error("Property not found.");
                setProperty(propertyData);

                // Fetch booked dates for this property
                const { data: bookings, error: bookingsError } = await supabase
                    .from('bookings')
                    .select('start_date, end_date')
                    .eq('property_id', propertyId)
                    .in('status', ['confirmed', 'pending']);
                
                if (bookingsError) throw bookingsError;

                const datesToDisable: Date[] = [];
                bookings.forEach(booking => {
                    let currentDate = new Date(booking.start_date);
                    const endDate = new Date(booking.end_date);
                    while (currentDate < endDate) {
                        datesToDisable.push(new Date(currentDate));
                        currentDate.setDate(currentDate.getDate() + 1);
                    }
                });
                setBookedDates(datesToDisable);
            } catch (err: any) {
                setError(err.message || "Failed to load property data.");
                toast.error(err.message || "Failed to load property data.");
            } finally {
                setLoading(false);
            }
        };

        fetchPropertyData();
    }, [propertyId]);

    useEffect(() => {
        if (dateRange?.from && dateRange?.to && property) {
            const numNights = differenceInDays(dateRange.to, dateRange.from);
            if (numNights > 0) {
                setNights(numNights);
                setTotalPrice(numNights * property.price_per_night);
            }
        } else {
            setNights(0);
            setTotalPrice(0);
        }
    }, [dateRange, property]);

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!property || !dateRange?.from || !dateRange?.to || !guestDetails.name || !guestDetails.email || !guestDetails.phone) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setLoading(true);
        try {
            // Create the booking record first
            const { data, error } = await supabase.from('bookings').insert([{
                property_id: property.id,
                customer_id: 1, // Placeholder customer_id
                start_date: format(dateRange.from, 'yyyy-MM-dd'),
                end_date: format(dateRange.to, 'yyyy-MM-dd'),
                total_price: totalPrice,
                status: 'pending', // Pending until payment is completed
                guest_name: guestDetails.name,
                guest_email: guestDetails.email,
                guest_phone: guestDetails.phone,
                guest_count: guests
            }]).select();

            if (error) throw error;
            
            if (data && data[0]) {
                setBookingId(data[0].id);
                setPaymentModalOpen(true);
                toast.success("Booking created! Please complete payment.");
            }

        } catch (err: any) {
            toast.error(err.message || "An error occurred during booking.");
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = (paymentReference: string) => {
        toast.success("Payment successful! Your booking is confirmed.");
        navigate(`/booking-confirmation?status=confirmed&booking_id=${bookingId}&payment_ref=${paymentReference}`);
    };
    
    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    }
    
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }
    
    if (!property) return null;

    return (
        <div className="min-h-screen flex flex-col bg-muted/40">
            <Navbar />
            <main className="flex-1 container py-8 pt-24">
                <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Property
                </Button>
                <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Guest Details Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Guest Details</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" required value={guestDetails.name} onChange={(e) => setGuestDetails({...guestDetails, name: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" required value={guestDetails.email} onChange={(e) => setGuestDetails({...guestDetails, email: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input id="phone" type="tel" required value={guestDetails.phone} onChange={(e) => setGuestDetails({...guestDetails, phone: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="guests">Number of Guests</Label>
                                    <Input id="guests" type="number" min="1" max={property.capacity} value={guests} onChange={(e) => setGuests(parseInt(e.target.value))} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Payment Information
                                </CardTitle>
                                <CardDescription>
                                    You'll complete payment after submitting your booking details.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    We accept multiple payment methods including:
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                    <div>• PayFast (Cards)</div>
                                    <div>• Ozow (Bank Transfer)</div>
                                    <div>• Zapper</div>
                                    <div>• SnapScan</div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                                    <span>🔒</span>
                                    <span>Your payment will be processed securely</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        {/* Property Summary */}
                        <Card>
                            <CardHeader className="flex flex-row items-start gap-4">
                                <img src={property.image_url} alt={property.title} className="w-24 h-24 object-cover rounded-lg" />
                                <div>
                                    <CardTitle className="text-lg">{property.title}</CardTitle>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" /> {property.location}</p>
                                </div>
                            </CardHeader>
                            <CardContent className="flex justify-around text-sm text-muted-foreground">
                                <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {property.capacity} Guests</span>
                                <span className="flex items-center gap-1"><Bed className="h-4 w-4" /> {property.bedrooms || 1} Bed(s)</span>
                                <span className="flex items-center gap-1"><Bath className="h-4 w-4" /> {property.bathrooms || 1} Bath(s)</span>
                            </CardContent>
                        </Card>

                        {/* Booking Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Booking</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Calendar
                                    mode="range"
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    disabled={[{ before: new Date() }, ...bookedDates]}
                                    numberOfMonths={1}
                                />
                                <Separator />
                                <div className="space-y-2">
                                    <div className="flex justify-between"><span>Price per night</span> <span>R {property.price_per_night.toLocaleString()}</span></div>
                                    <div className="flex justify-between"><span>Nights</span> <span>{nights}</span></div>
                                    <div className="flex justify-between font-bold text-lg"><span>Total</span> <span>R {totalPrice.toLocaleString()}</span></div>
                                </div>
                                <Button type="submit" className="w-full" disabled={loading || nights === 0}>
                                    {loading ? <Loader2 className="animate-spin" /> : "Continue to Payment"}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </main>
            
            {/* Payment Modal */}
            {bookingId && property && dateRange?.from && dateRange?.to && (
                <PaymentModal
                    isOpen={paymentModalOpen}
                    onClose={() => setPaymentModalOpen(false)}
                    bookingData={{
                        bookingId,
                        propertyTitle: property.title,
                        dates: `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd, yyyy')}`,
                        guests,
                        totalAmount: totalPrice
                    }}
                    onPaymentSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
} 

