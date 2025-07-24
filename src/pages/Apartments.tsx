// src/pages/Apartments.tsx
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ApartmentCard, { ApartmentProps } from "@/components/ApartmentCard"; // Ensure this matches the new interface
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2 } from "lucide-react";

export default function Apartments() {
  const { t } = useLanguage();
  const [allApartments, setAllApartments] = useState<ApartmentProps[]>([]);
  const [filteredApartments, setFilteredApartments] = useState<ApartmentProps[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [capacityFilter, setCapacityFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<number[]>([0, 25000]);

  // Fetch all active properties on component mount
  useEffect(() => {
    const fetchProperties = async () => {
        setLoading(true);
        try {
            console.log('Fetching properties for apartments page...');
            const response = await fetch('http://localhost:5001/api/properties');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const properties = await response.json();
            console.log('Fetched properties:', properties);
            
            // Map the API response to match ApartmentProps interface
            const mappedProperties = properties.map((property: any) => ({
                id: property.id,
                title: property.title,
                description: property.description,
                price_per_night: parseFloat(property.nightly_price),
                capacity: property.max_guests,
                location: property.location,
                image_url: property.images && property.images.length > 0 ? property.images[0] : "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
                amenities: property.amenities || []
            }));
            
            setAllApartments(mappedProperties);
            setFilteredApartments(mappedProperties);
        } catch (error) {
            console.error("Failed to fetch properties:", error);
        }
        setLoading(false);
    };

    fetchProperties();
  }, []);

  // Apply filters whenever a filter state changes
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
    result = result.filter(apt => apt.price_per_night >= priceRange[0] && apt.price_per_night <= priceRange[1]);

    setFilteredApartments(result);
  }, [capacityFilter, locationFilter, priceRange, allApartments]);

  // Get unique locations for the filter dropdown
  const locations = ["all", ...Array.from(new Set(allApartments.map(apt => apt.location)))];

  const resetFilters = () => {
    setCapacityFilter("all");
    setLocationFilter("all");
    setPriceRange([0, 25000]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        <section className="relative py-20 bg-gradient-to-r from-sea-light to-white dark:from-sea-dark dark:to-background overflow-hidden">
          <div className="container relative z-10 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {t.apartments.title}
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              {t.apartments.subtitle}
            </p>
          </div>
        </section>

        <section className="py-8 border-b sticky top-[68px] bg-background/95 backdrop-blur-sm z-30">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div>
                <Label className="block text-sm font-medium mb-2">{t.apartments.filters.guests}</Label>
                <Select value={capacityFilter} onValueChange={setCapacityFilter}>
                  <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.apartments.filters.anyGuests}</SelectItem>
                    <SelectItem value="1">{t.apartments.filters.onePlus}</SelectItem>
                    <SelectItem value="2">{t.apartments.filters.twoPlus}</SelectItem>
                    <SelectItem value="3">{t.apartments.filters.threePlus}</SelectItem>
                    <SelectItem value="4">{t.apartments.filters.fourPlus}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="block text-sm font-medium mb-2">{t.apartments.filters.location}</Label>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.apartments.filters.allLocations}</SelectItem>
                    {locations.filter(loc => loc !== "all").map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="block text-sm font-medium mb-2">
                  {t.apartments.filters.priceRange}: R{priceRange[0]} - R{priceRange[1]}
                </Label>
                <Slider
                  min={0}
                  max={25000}
                  step={500}
                  value={priceRange}
                  onValueChange={setPriceRange}
                />
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-muted-foreground">
                {t.apartments.filters.showing} {filteredApartments.length} {t.apartments.filters.of} {allApartments.length} {t.apartments.filters.accommodations}
              </p>
              <Button variant="outline" onClick={resetFilters}>
                {t.apartments.filters.resetFilters}
              </Button>
            </div>
          </div>
        </section>

        <section className="py-12 bg-muted/40">
          <div className="container">
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredApartments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredApartments.map(apartment => (
                        <ApartmentCard key={apartment.id} apartment={apartment} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <h3 className="text-xl font-semibold">{t.apartments.filters.noMatch}</h3>
                    <p className="text-muted-foreground mt-2">{t.apartments.filters.adjustFilters}</p>
                </div>
            )}
          </div>
        </section>
      </main>

    </div>
  );
}