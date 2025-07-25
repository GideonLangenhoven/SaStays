import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { parseISO, format, differenceInDays } from 'date-fns';
import Navbar from "@/components/Navbar";
import { ApartmentProps } from "@/components/ApartmentCard";
import { propertyApi } from "@/services/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar as CalendarIcon, Users } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import axios from "axios";
import { cn } from "@/lib/utils";

interface Rating {
    id: number;
    rating: number;
    review_text: string; // Match schema
    name: string; // This will be joined
    created_at: string;
}

export default function ApartmentPage() {
    const { t } = useLanguage();
    const { id } = useParams<{ id: string }>();
    const [apartment, setApartment] = useState<ApartmentProps | null>(null);
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [bookedDates, setBookedDates] = useState<Date[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [priceDetails, setPriceDetails] = useState<{ totalPrice: string; nights: number } | null>(null);
    const [isPriceLoading, setIsPriceLoading] = useState(false);

    useEffect(() => {
        if (id) {
            const fetchApartmentDetails = async () => {
                setLoading(true);
                try {
                    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
                    
                    // Fetch property details using Express API
                    const propertyResponse = await axios.get(`${apiUrl}/properties/${id}`);
                    setApartment(propertyResponse.data);

                    // Fetch booked dates using Express API
                    const bookedData = await propertyApi.getPropertyBookedDates(id);
                    setBookedDates(bookedData.map((d: string) => parseISO(d)));
                    
                    // Fetch reviews using Express API (if endpoint exists)
                    try {
                        const reviewsResponse = await axios.get(`${apiUrl}/properties/${id}/reviews`);
                        setRatings(reviewsResponse.data || []);
                    } catch (reviewError) {
                        console.log('Reviews endpoint not available, using empty array');
                        setRatings([]);
                    }

                } catch (error) {
                    console.error("Failed to fetch apartment details:", error);
                    toast.error("Could not load property details.");
                } finally {
                    setLoading(false);
                }
            };
            fetchApartmentDetails();
        }
    }, [id]);

    useEffect(() => {
        const calculatePrice = async () => {
            if (dateRange?.from && dateRange?.to && id) {
                setIsPriceLoading(true);
                try {
                    const response = await fetch(`http://localhost:5001/api/properties/${id}/calculate-price`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            start_date: format(dateRange.from, 'yyyy-MM-dd'),
                            end_date: format(dateRange.to, 'yyyy-MM-dd'),
                        }),
                    });
                    if (!response.ok) throw new Error('Price calculation failed');
                    const data = await response.json();
                    setPriceDetails(data);
                } catch (error) {
                    toast.error("Could not calculate price.");
                } finally {
                    setIsPriceLoading(false);
                }
            } else {
                setPriceDetails(null);
            }
        };
        calculatePrice();
    }, [dateRange, id]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    }

    if (!apartment) {
        return <div>Apartment not found.</div>;
    }
    
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 pt-20">
                <section className="container py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                             <img src={apartment.image_url} alt={apartment.title} className="w-full h-auto rounded-lg shadow-lg mb-8 aspect-video object-cover" />
                             <h1 className="text-4xl font-bold mb-2">{apartment.title}</h1>
                             <p className="text-lg text-muted-foreground mb-4">{apartment.location}</p>
                             <p className="text-base mb-6">{apartment.description}</p>
                             <div className="mb-4">
                                <h3 className="text-xl font-semibold mb-2">Amenities</h3>
                                <ul className="list-disc list-inside columns-2">
                                    {apartment.amenities.map((feature, index) => (
                                        <li key={index}>{feature}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 border rounded-lg p-6 shadow-lg">
                                <h2 className="text-2xl font-bold mb-4">Book Your Stay</h2>
                                <div className="grid gap-2">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {dateRange?.from ? (
                                                dateRange.to ? (
                                                    <>
                                                    {format(dateRange.from, "LLL dd, y")} -{" "}
                                                    {format(dateRange.to, "LLL dd, y")}
                                                    </>
                                                ) : (
                                                    format(dateRange.from, "LLL dd, y")
                                                )
                                                ) : (
                                                <span>Pick a date range</span>
                                            )}
                                        </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="range"
                                                defaultMonth={dateRange?.from}
                                                selected={dateRange}
                                                onSelect={setDateRange}
                                                numberOfMonths={1}
                                                disabled={[{ before: new Date() }, ...bookedDates]}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {isPriceLoading && <div className="flex items-center justify-center h-20"><Loader2 className="h-6 w-6 animate-spin" /></div>}
                                
                                {priceDetails && !isPriceLoading && (
                                    <div className="mt-4 space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>{priceDetails.nights} {priceDetails.nights > 1 ? 'nights' : 'night'}</span>
                                            <span>R {priceDetails.totalPrice}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                                            <span>Total</span>
                                            <span>R {priceDetails.totalPrice}</span>
                                        </div>
                                    </div>
                                )}

                                <Button asChild className="w-full mt-6 btn-primary" disabled={!dateRange?.to}>
                                    <Link to={`/booking?propertyId=${id}&from=${dateRange?.from?.toISOString()}&to=${dateRange?.to?.toISOString()}`}>
                                        Reserve
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}