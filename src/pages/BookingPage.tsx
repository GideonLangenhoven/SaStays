// src/pages/BookingPage.tsx

import { useEffect, useState } from "react";
import { format, addDays, differenceInDays, parseISO, isSameDay } from "date-fns";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApartmentProps } from "@/components/ApartmentCard";
import { getUnavailableDates, createBooking, generatePaymentSignature } from "@/services/api";
import { useLanguage } from "@/contexts/LanguageContext";


// Sample apartments data
const apartmentsData: ApartmentProps[] = [
  { id: "1", name: "Deluxe Sea View Suite", description: "Luxurious suite with panoramic sea views...", price: 180, capacity: 2, size: 45, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop", location: "Beachfront", features: ["Wi-Fi", "Kitchen", "Bathroom", "Air Conditioning", "TV", "Balcony"] },
  { id: "2", name: "Premium Family Apartment", description: "Spacious apartment ideal for families...", price: 250, capacity: 4, size: 75, image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop", location: "Second row", features: ["Wi-Fi", "Kitchen", "Bathroom", "Air Conditioning", "TV", "Washing Machine"] },
  { id: "3", name: "Executive Beach Studio", description: "Elegant studio with direct beach access...", price: 150, capacity: 2, size: 35, image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&h=600&fit=crop", location: "Beachfront", features: ["Wi-Fi", "Kitchenette", "Bathroom", "Air Conditioning", "TV"] },
];

export default function BookingPage() {
    const { t } = useLanguage();
    const [startDate, setStartDate] = useState<Date | undefined>(new Date());
    const [endDate, setEndDate] = useState<Date | undefined>(addDays(new Date(), 7));
    const [adults, setAdults] = useState("2");
    const [children, setChildren] = useState("0");
    const [selectedApartment, setSelectedApartment] = useState<ApartmentProps | null>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const [isBookingConfirmed, setIsBookingConfirmed] = useState(searchParams.get('payment') === 'success');

  const [formData, setFormData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "test@example.com",
    phone: "0821234567",
    address: "123 Test Street",
    city: "Cape Town",
    zipCode: "8000",
    country: "South Africa",
    paymentMethod: "payfast",
    cardName: "John Doe",
    cardNumber: "4111111111111111",
    cardExpiry: "12/29",
    cardCvc: "123",
    specialRequests: "Testing booking functionality."
  });

  useEffect(() => {
    if (selectedApartment) {
      const fetchDates = async () => {
        try {
          const response = await getUnavailableDates(selectedApartment.id);
          const dates = response.data.map((dateStr: string) => parseISO(dateStr));
          setUnavailableDates(dates);
        } catch (error) { console.error("Failed to fetch unavailable dates", error); }
      };
      fetchDates();
    }
  }, [selectedApartment]);
  
  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    if (isBookingConfirmed) {
      setCurrentStep(3);
    }
  }, [isBookingConfirmed]);
  
  const nightsCount = startDate && endDate ? differenceInDays(endDate, startDate) : 0;
  const cleaningFee = 50;
  const serviceFee = 30;
  const totalPrice = selectedApartment ? (selectedApartment.price * nightsCount) + cleaningFee + serviceFee : 0;
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const requiredFields: (keyof typeof formData)[] = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'zipCode', 'country'];
    for (const field of requiredFields) {
        if (!formData[field]) {
            alert(`Error: Please fill in all required guest information. Missing: ${field}`);
            setIsLoading(false);
            return;
        }
    }

    if (!selectedApartment || !startDate || !endDate) {
        alert("Please make sure an apartment and dates are selected.");
        setIsLoading(false);
        return;
    }

    try {
        const bookingData = {
            property_id: parseInt(selectedApartment.id, 10),
            start_date: format(startDate, "yyyy-MM-dd"),
            end_date: format(endDate, "yyyy-MM-dd"),
            total_price: totalPrice,
            fullName: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone,
            payment_provider: formData.paymentMethod
        };

        const bookingResponse = await createBooking(bookingData);
        const { bookingId, propertyName } = bookingResponse.data;

        // UPDATE THE CALENDAR IN REAL-TIME
        const newUnavailableDates = [];
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            newUnavailableDates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        setUnavailableDates(prev => [...prev, ...newUnavailableDates]);

        if (formData.paymentMethod === 'payfast') {
            const signatureData = {
                total_price: totalPrice,
                bookingId: bookingId,
                propertyName: selectedApartment.name,
            };
            const signatureResponse = await generatePaymentSignature(signatureData);
            const paymentDetails = signatureResponse.data;
            
            const queryString = new URLSearchParams(paymentDetails).toString();
            window.location.href = `https://sandbox.payfast.co.za/eng/process?${queryString}`;
        } else if (["ozow", "zapper", "snapscan"].includes(formData.paymentMethod)) {
            // Call /api/initiate-payment for other providers
            const paymentInitResponse = await fetch('http://localhost:5001/api/initiate-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId,
                    payment_provider: formData.paymentMethod,
                    total_price: totalPrice,
                    propertyName: selectedApartment.name
                })
            });
            const paymentInitData = await paymentInitResponse.json();
            if (paymentInitData.paymentUrl) {
                window.location.href = paymentInitData.paymentUrl;
            } else {
                alert('There was an error initiating payment. Please try again.');
                setIsLoading(false);
            }
        } else {
            // Handle other payment methods here
            setCurrentStep(3);
            setIsBookingConfirmed(true);
        }

    } catch (error: any) {
        if (error.response && error.response.status === 409) {
            alert("One or more of the selected dates are not available. Please select different dates.");
        } else {
        console.error("Error during booking process:", error);
        alert("There was an error processing your booking. Please try again.");
        }
        setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-20">
        <section className="relative py-16 bg-gradient-to-r from-sea-light to-white dark:from-sea-dark dark:to-background overflow-hidden">
          <div className="container relative z-10"><div className="max-w-3xl mx-auto text-center animate-fade-in"><h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Book Your Stay</h1><p className="text-muted-foreground text-lg">Complete your reservation in a few simple steps.</p></div></div>
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-10"><div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-primary/50 blur-3xl" /><div className="absolute bottom-10 right-40 w-48 h-48 rounded-full bg-sea-light blur-3xl" /></div>
        </section>
        
        <section className="container py-8">
          <div className="relative animate-fade-in [animation-delay:200ms]">
            <div className="flex justify-between items-center mb-8">
              {[1, 2, 3].map((step) => (<div key={step} className="flex flex-col items-center relative z-10"><div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors", currentStep >= step ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>{currentStep > step ? <span /> : <span>{step}</span>}</div><span className={cn("text-sm font-medium", currentStep >= step ? "text-foreground" : "text-muted-foreground")}>{step === 1 ? "Choose Room" : step === 2 ? "Guest Details" : "Confirmation"}</span></div>))}
            </div>
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted z-0"><div className="h-full bg-primary transition-all duration-300" style={{ width: `${((currentStep - 1) / 2) * 100}%` }} /></div>
          </div>
          
          {currentStep === 1 && (
            <div className="animate-fade-in [animation-delay:300ms]"><div className="max-w-4xl mx-auto"><div className="glass-card p-6 mb-8"><h2 className="text-xl font-semibold mb-4">Select Dates and Guests</h2><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"><div className="space-y-2"><Label htmlFor="check-in">Check-in Date</Label><Popover><PopoverTrigger asChild><Button id="check-in" variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}><span />{startDate ? format(startDate, "PPP") : <span>Select date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus disabled={(date) => date < new Date() || unavailableDates.some(disabledDate => isSameDay(disabledDate, date))} /></PopoverContent></Popover></div><div className="space-y-2"><Label htmlFor="check-out">Check-out Date</Label><Popover><PopoverTrigger asChild><Button id="check-out" variant="outline" className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}><span />{endDate ? format(endDate, "PPP") : <span>Select date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus disabled={(date) => date < (startDate || new Date()) || unavailableDates.some(disabledDate => isSameDay(disabledDate, date))} /></PopoverContent></Popover></div><div className="space-y-2"><Label htmlFor="adults">Adults</Label><Select value={adults} onValueChange={setAdults}><SelectTrigger id="adults"><SelectValue /></SelectTrigger><SelectContent>{[1, 2, 3, 4, 5, 6].map(num => <SelectItem key={num} value={String(num)}>{num} {num === 1 ? "Adult" : "Adults"}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label htmlFor="children">Children</Label><Select value={children} onValueChange={setChildren}><SelectTrigger id="children"><SelectValue /></SelectTrigger><SelectContent>{[0, 1, 2, 3, 4].map(num => <SelectItem key={num} value={String(num)}>{num} {num === 1 ? "Child" : "Children"}</SelectItem>)}</SelectContent></Select></div></div></div><h2 className="text-xl font-semibold mb-4">Select Your Accommodation</h2><div className="space-y-6">{apartmentsData.map((apartment) => (<div key={apartment.id} className={cn("border rounded-xl overflow-hidden transition-all flex flex-col md:flex-row", selectedApartment?.id === apartment.id ? "border-primary shadow-md" : "border-border hover:border-primary/50")}><div className="md:w-1/3 h-48 md:h-auto relative"><img src={apartment.image} alt={apartment.name} className="w-full h-full object-cover" /></div><div className="p-6 flex-1 flex flex-col"><div className="flex-1"><h3 className="text-lg font-semibold mb-2">{apartment.name}</h3><p className="text-muted-foreground mb-4">{apartment.description}</p><div className="flex flex-wrap gap-2 mb-4"><div className="text-sm bg-muted px-3 py-1 rounded-full">{apartment.capacity} Guests</div><div className="text-sm bg-muted px-3 py-1 rounded-full">{apartment.size} m²</div><div className="text-sm bg-muted px-3 py-1 rounded-full">{apartment.location}</div></div></div><div className="flex items-center justify-between mt-4"><div><span className="text-xl font-bold">R{apartment.price.toLocaleString('en-ZA')}</span><span className="text-muted-foreground text-sm"> / night</span></div><Button variant={selectedApartment?.id === apartment.id ? "default" : "outline"} className={selectedApartment?.id === apartment.id ? "btn-primary" : ""} onClick={() => setSelectedApartment(apartment)}>{selectedApartment?.id === apartment.id ? <><span />Selected</> : "Select"}</Button></div></div></div>))}</div><div className="flex justify-end mt-8"><Button className="btn-primary" disabled={!selectedApartment} onClick={() => setCurrentStep(2)}>Continue <span /></Button></div></div></div>
          )}
          
          {currentStep === 2 && (
            <div className="animate-fade-in [animation-delay:300ms]"><div className="max-w-4xl mx-auto"><div className="grid grid-cols-1 md:grid-cols-3 gap-8"><div className="md:col-span-2"><h2 className="text-xl font-semibold mb-4">Guest Information</h2><form className="space-y-6"><div className="glass-card p-6 space-y-6"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="firstName">First Name</Label><Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required /></div><div className="space-y-2"><Label htmlFor="lastName">Last Name</Label><Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required /></div></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required /></div><div className="space-y-2"><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required /></div></div><div className="space-y-2"><Label htmlFor="address">Address</Label><Input id="address" name="address" value={formData.address} onChange={handleInputChange} required /></div><div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><div className="space-y-2"><Label htmlFor="city">City</Label><Input id="city" name="city" value={formData.city} onChange={handleInputChange} required /></div><div className="space-y-2"><Label htmlFor="zipCode">Zip Code</Label><Input id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleInputChange} required /></div><div className="space-y-2"><Label htmlFor="country">Country</Label><Input id="country" name="country" value={formData.country} onChange={handleInputChange} required /></div></div><div className="space-y-2"><Label htmlFor="specialRequests">Special Requests</Label><textarea id="specialRequests" name="specialRequests" value={formData.specialRequests} onChange={handleInputChange} className="w-full h-24 rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Any special requests or notes for your stay" /></div></div><h2 className="text-xl font-semibold mb-4">Payment Information</h2><div className="glass-card p-6 space-y-6"><Tabs defaultValue="payfast" onValueChange={(value) => handleSelectChange("paymentMethod", value)}><TabsList className="grid w-full grid-cols-4"><TabsTrigger value="payfast">PayFast</TabsTrigger><TabsTrigger value="ozow">Ozow</TabsTrigger><TabsTrigger value="zapper">Zapper</TabsTrigger><TabsTrigger value="snapscan">SnapScan</TabsTrigger></TabsList><TabsContent value="payfast" className="space-y-4 mt-4"><div className="space-y-2"><Label htmlFor="cardName">Name on Card</Label><Input id="cardName" name="cardName" value={formData.cardName} onChange={handleInputChange} /></div><div className="space-y-2"><Label htmlFor="cardNumber">Card Number</Label><Input id="cardNumber" name="cardNumber" value={formData.cardNumber} onChange={handleInputChange} placeholder="0000 0000 0000 0000" /></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="cardExpiry">Expiry Date</Label><Input id="cardExpiry" name="cardExpiry" value={formData.cardExpiry} onChange={handleInputChange} placeholder="MM/YY" /></div><div className="space-y-2"><Label htmlFor="cardCvc">CVC</Label><Input id="cardCvc" name="cardCvc" value={formData.cardCvc} onChange={handleInputChange} placeholder="123" /></div></div></TabsContent><TabsContent value="ozow" className="mt-4"><p className="text-muted-foreground">You will be redirected to Ozow to complete your payment.</p></TabsContent><TabsContent value="zapper" className="mt-4"><p className="text-muted-foreground">Scan the QR code with your Zapper app to complete the payment.</p></TabsContent><TabsContent value="snapscan" className="mt-4"><p className="text-muted-foreground">Scan the QR code with your SnapScan app to complete the payment.</p></TabsContent></Tabs></div></form></div><div className="md:col-span-1"><h2 className="text-xl font-semibold mb-4">Booking Summary</h2><div className="glass-card p-6 sticky top-24">{selectedApartment && (<><div className="pb-4 border-b"><h3 className="font-medium mb-1">{selectedApartment.name}</h3><p className="text-sm text-muted-foreground">{selectedApartment.location}</p></div><div className="py-4 border-b space-y-2"><div className="flex justify-between items-center"><span>Check-in</span><span className="font-medium">{startDate ? format(startDate, "EEE, MMM d, yyyy") : "Not selected"}</span></div><div className="flex justify-between items-center"><span>Check-out</span><span className="font-medium">{endDate ? format(endDate, "EEE, MMM d, yyyy") : "Not selected"}</span></div><div className="flex justify-between items-center"><span>Guests</span><span className="font-medium">{adults} {parseInt(adults) === 1 ? "Adult" : "Adults"}{parseInt(children) > 0 && `, ${children} ${parseInt(children) === 1 ? "Child" : "Children"}`}</span></div></div><div className="py-4 border-b space-y-2"><div className="flex justify-between items-center"><span>R{selectedApartment.price.toLocaleString('en-ZA')} x {nightsCount} {nightsCount === 1 ? "night" : "nights"}</span><span className="font-medium">R{selectedApartment.price * nightsCount}</span></div><div className="flex justify-between items-center"><span>Cleaning fee</span><span className="font-medium">R{cleaningFee}</span></div><div className="flex justify-between items-center"><span>Service fee</span><span className="font-medium">R{serviceFee}</span></div></div><div className="pt-4"><div className="flex justify-between items-center font-bold"><span>Total</span><span className="font-bold text-xl">R{totalPrice}</span></div></div></>)}</div></div></div><div className="flex justify-between mt-8"><Button variant="outline" onClick={() => setCurrentStep(1)}>Back</Button><Button className="btn-primary" onClick={handleSubmitBooking} disabled={isLoading}>{isLoading ? 'Processing...' : 'Proceed to Payment'}</Button></div></div></div>
          )}
          
          {currentStep === 3 && (
            <div className="animate-fade-in [animation-delay:300ms]"><div className="max-w-4xl mx-auto">{isBookingConfirmed ? (<div className="glass-card p-8 text-center animate-fade-in"><div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"><span /></div><h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2><p className="text-muted-foreground mb-6">Your reservation has been successfully confirmed. A confirmation email has been sent to {formData.email}.</p><p className="font-medium mb-8">Booking Reference: <span className="text-primary">MRS-{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</span></p><Button asChild className="btn-primary"><Link to="/">Return to Homepage</Link></Button></div>) : (<><h2 className="text-xl font-semibold mb-6">Review Booking Details</h2><div className="glass-card p-6 mb-8"><div className="grid grid-cols-1 md:grid-cols-2 gap-8"><div><h3 className="text-lg font-medium mb-4">Accommodation Details</h3>{selectedApartment && <div className="space-y-4"><div className="rounded-lg overflow-hidden"><img src={selectedApartment.image} alt={selectedApartment.name} className="w-full h-48 object-cover"/></div><div><h4 className="font-semibold">{selectedApartment.name}</h4><p className="text-sm text-muted-foreground">{selectedApartment.location}</p></div><div className="space-y-1 text-sm"><div className="flex justify-between"><span>Check-in:</span><span className="font-medium">{startDate ? format(startDate, "EEE, MMM d, yyyy") : "Not selected"}</span></div><div className="flex justify-between"><span>Check-out:</span><span className="font-medium">{endDate ? format(endDate, "EEE, MMM d, yyyy") : "Not selected"}</span></div><div className="flex justify-between"><span>Guests:</span><span className="font-medium">{adults} {parseInt(adults) === 1 ? "Adult" : "Adults"}{parseInt(children) > 0 && `, ${children} ${parseInt(children) === 1 ? "Child" : "Children"}`}</span></div></div></div>}</div><div><h3 className="text-lg font-medium mb-4">Guest Details</h3><div className="space-y-4"><div className="space-y-1 text-sm"><div className="flex justify-between"><span>Name:</span><span className="font-medium">{formData.firstName} {formData.lastName}</span></div><div className="flex justify-between"><span>Email:</span><span className="font-medium">{formData.email}</span></div><div className="flex justify-between"><span>Phone:</span><span className="font-medium">{formData.phone}</span></div><div className="flex justify-between"><span>Address:</span><span className="font-medium">{formData.address}</span></div><div className="flex justify-between"><span>City:</span><span className="font-medium">{formData.city}</span></div><div className="flex justify-between"><span>Country:</span><span className="font-medium">{formData.country}</span></div></div>{formData.specialRequests && <div><h4 className="font-medium mb-1">Special Requests:</h4><p className="text-sm text-muted-foreground">{formData.specialRequests}</p></div>}<div><h4 className="font-medium mb-1">Payment Method:</h4><p className="text-sm">{formData.paymentMethod === "credit-card" ? <span className="flex items-center"><span />Credit Card (ending in {formData.cardNumber.slice(-4) || "****"})</span> : "Pay at Property"}</p></div></div></div></div></div><div className="glass-card p-6 mb-8"><h3 className="text-lg font-medium mb-4">Price Summary</h3><div className="space-y-2">{selectedApartment && (<><div className="flex justify-between items-center"><span>R{selectedApartment.price.toLocaleString('en-ZA')} x {nightsCount} {nightsCount === 1 ? "night" : "nights"}</span><span className="font-medium">R{selectedApartment.price * nightsCount}</span></div><div className="flex justify-between items-center"><span>Cleaning fee</span><span className="font-medium">R{cleaningFee}</span></div><div className="flex justify-between items-center"><span>Service fee</span><span className="font-medium">R{serviceFee}</span></div><div className="flex justify-between items-center pt-4 border-t mt-4"><span className="font-semibold">Total</span><span className="font-bold text-xl">R{totalPrice}</span></div></>)}</div></div><div className="mb-8"><div className="flex items-start"><input type="checkbox" id="terms" className="mt-1 mr-3" required defaultChecked/><label htmlFor="terms" className="text-sm text-muted-foreground">I agree to the <a href="#" className="text-primary underline">Terms and Conditions</a> and <a href="#" className="text-primary underline">Privacy Policy</a>. I understand that my booking is subject to the property's cancellation policy.</label></div></div><div className="flex justify-between"><Button variant="outline" onClick={() => setCurrentStep(2)}>Back</Button><Button className="btn-primary" onClick={handleSubmitBooking} disabled={isLoading}>{isLoading ? 'Processing...' : 'Proceed to Payment'}</Button></div></>)}</div></div>
          )}

        </section>
      </main>
      
      <Footer />
    </div>
  );
}