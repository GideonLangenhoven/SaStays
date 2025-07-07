import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ApartmentCard, { ApartmentProps } from "@/components/ApartmentCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useLanguage } from "@/contexts/LanguageContext";

// Sample apartments data with South African locations and ZAR prices
const allApartments: ApartmentProps[] = [
  {
    id: "1",
    name: "Lion's Head View Penthouse",
    description: "Luxurious penthouse with panoramic views of Lion's Head and the Atlantic Ocean, featuring modern amenities and a private balcony.",
    price: 8500,
    capacity: 2,
    size: 65,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop",
    location: "Camps Bay",
    features: ["Wi-Fi", "Full Kitchen", "En-suite Bathroom", "Air Conditioning", "Smart TV", "Balcony"]
  },
  {
    id: "2",
    name: "Table Mountain Family Villa",
    description: "Spacious 2-bedroom villa with stunning Table Mountain views, ideal for families, with a full kitchen and private garden.",
    price: 12500,
    capacity: 4,
    size: 110,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
    location: "Gardens",
    features: ["Wi-Fi", "Full Kitchen", "2 Bathrooms", "Air Conditioning", "Smart TV", "Washing Machine", "Garden"]
  },
  {
    id: "3",
    name: "Beachfront Studio",
    description: "Elegant beachfront studio with direct access to Camps Bay Beach, modern design, and premium finishes.",
    price: 4500,
    capacity: 2,
    size: 40,
    image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&h=600&fit=crop",
    location: "Camps Bay",
    features: ["Wi-Fi", "Kitchenette", "En-suite Bathroom", "Air Conditioning", "Smart TV", "Beach Access"]
  },
  {
    id: "4",
    name: "Luxury Clifton Penthouse",
    description: "Exclusive top-floor suite with 180-degree ocean views, private pool, and direct beach access to Clifton's 4th Beach.",
    price: 18500,
    capacity: 4,
    size: 180,
    image: "https://images.unsplash.com/photo-1562438668-bcf0ca6578f0?w=800&h=600&fit=crop",
    location: "Clifton",
    features: ["Wi-Fi", "Gourmet Kitchen", "3 Bathrooms", "Air Conditioning", "Smart TV", "Private Pool", "Ocean View"]
  },
  {
    id: "5",
    name: "Cape Town City Apartment",
    description: "Stylish apartment in the heart of Cape Town, walking distance to V&A Waterfront and local attractions.",
    price: 3800,
    capacity: 2,
    size: 45,
    image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop",
    location: "CBD",
    features: ["Wi-Fi", "Kitchen", "Bathroom", "Air Conditioning", "Smart TV", "Secure Parking"]
  },
  {
    id: "6",
    name: "Kirstenbosch Garden Suite",
    description: "Peaceful garden suite with mountain views, just minutes from Kirstenbosch National Botanical Garden.",
    price: 5200,
    capacity: 3,
    size: 65,
    image: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&h=600&fit=crop",
    location: "Newlands",
    features: ["Wi-Fi", "Kitchen", "Bathroom", "Air Conditioning", "Smart TV", "Garden View"]
  },
];

// Add a helper to fetch ratings
async function fetchRatings(propertyId: string) {
  const res = await fetch(`http://localhost:5001/api/properties/${propertyId}/ratings`);
  if (!res.ok) return [];
  return await res.json();
}

type Rating = {
  rating: number;
  review: string;
  name: string;
  created_at: string;
};

export default function Apartments() {
  const { t } = useLanguage();
  const [filteredApartments, setFilteredApartments] = useState<ApartmentProps[]>(allApartments);
  const [capacityFilter, setCapacityFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<number[]>([3500, 20000]);
  const [apartmentRatings, setApartmentRatings] = useState<Record<string, Rating[]>>({});
  
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);
  
  // Apply filters
  useEffect(() => {
    let result = allApartments;
    
    // Filter by capacity
    if (capacityFilter !== "all") {
      const capacity = parseInt(capacityFilter);
      result = result.filter(apt => apt.capacity >= capacity);
    }
    
    // Filter by location
    if (locationFilter !== "all") {
      result = result.filter(apt => apt.location === locationFilter);
    }
    
    // Filter by price range
    result = result.filter(apt => apt.price >= priceRange[0] && apt.price <= priceRange[1]);
    
    setFilteredApartments(result);
  }, [capacityFilter, locationFilter, priceRange]);
  
  useEffect(() => {
    // Fetch ratings for all apartments in the filtered list
    filteredApartments.forEach(async (apt) => {
      if (!apartmentRatings[apt.id]) {
        const ratings = await fetchRatings(apt.id);
        setApartmentRatings(prev => ({ ...prev, [apt.id]: ratings }));
      }
    });
    // eslint-disable-next-line
  }, [filteredApartments]);
  
  // Get unique locations for filter
  const locations = ["all", ...new Set(allApartments.map(apt => apt.location))];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-20">
        {/* Header Section */}
        <section className="relative py-20 bg-gradient-to-r from-sea-light to-white dark:from-sea-dark dark:to-background overflow-hidden">
          <div className="container relative z-10">
            <div className="max-w-3xl mx-auto text-center animate-fade-in">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {t.apartments.title}
              </h1>
              <p className="text-muted-foreground text-lg mb-6">
                {t.apartments.subtitle}
              </p>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 opacity-10">
            <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-primary/50 blur-3xl" />
            <div className="absolute top-10 right-40 w-48 h-48 rounded-full bg-sea-light blur-3xl" />
          </div>
        </section>
        
        {/* Filter Section */}
        <section className="py-8 border-b">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
              {/* Capacity Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t.apartments.filters.guests}
                </label>
                <Select value={capacityFilter} onValueChange={setCapacityFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t.apartments.filters.guests} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.apartments.filters.anyGuests}</SelectItem>
                    <SelectItem value="1">{t.apartments.filters.onePlus}</SelectItem>
                    <SelectItem value="2">{t.apartments.filters.twoPlus}</SelectItem>
                    <SelectItem value="3">{t.apartments.filters.threePlus}</SelectItem>
                    <SelectItem value="4">{t.apartments.filters.fourPlus}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t.apartments.filters.location}
                </label>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t.apartments.filters.location} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.apartments.filters.allLocations}</SelectItem>
                    {locations.filter(loc => loc !== "all").map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t.apartments.filters.priceRange}: R{priceRange[0].toLocaleString('en-ZA')} - R{priceRange[1].toLocaleString('en-ZA')}
                </label>
                <Slider
                  defaultValue={[3500, 20000]}
                  min={2000}
                  max={25000}
                  step={500}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-6 animate-fade-in [animation-delay:200ms]">
              <p className="text-muted-foreground">
                {t.apartments.filters.showing} {filteredApartments.length} {t.apartments.filters.of} {allApartments.length} {t.apartments.filters.accommodations}
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setCapacityFilter("all");
                  setLocationFilter("all");
                  setPriceRange([100, 350]);
                }}
              >
                {t.apartments.filters.resetFilters}
              </Button>
            </div>
          </div>
        </section>
        
        {/* Apartments Grid */}
        <section className="py-12">
          <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
            {filteredApartments.map(apartment => (
              <div key={apartment.id}>
                    <ApartmentCard apartment={apartment} />
                {/* Show average rating and reviews */}
                {apartmentRatings[apartment.id] && apartmentRatings[apartment.id].length > 0 && (
                  <div className="mt-2 bg-muted rounded-lg p-3">
                    <div className="flex items-center mb-1">
                      <span className="font-semibold mr-2">{(
                        apartmentRatings[apartment.id].reduce((sum, r) => sum + r.rating, 0) /
                        apartmentRatings[apartment.id].length
                      ).toFixed(1)}</span>
                      <span className="text-yellow-500">★</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({apartmentRatings[apartment.id].length} review{apartmentRatings[apartment.id].length > 1 ? 's' : ''})
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {apartmentRatings[apartment.id].slice(0, 2).map((r, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground border-b pb-1 mb-1 last:border-b-0 last:pb-0 last:mb-0">
                          <span className="font-medium">{r.name}</span>: {r.review} <span className="text-yellow-500">{'★'.repeat(r.rating)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
