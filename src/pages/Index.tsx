import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import BookingForm from "@/components/BookingForm";
import TestimonialsSection from "@/components/TestimonialsSection";
import FacilitiesSection from "@/components/FacilitiesSection";
import ApartmentCard, { ApartmentProps } from "@/components/ApartmentCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

// Featured apartments with South African locations and ZAR pricing
const featuredApartments: ApartmentProps[] = [
  {
    id: "1",
    name: "Lion's Head View Penthouse",
    description: "Luxurious penthouse with panoramic views of Lion's Head and the Atlantic Ocean, featuring modern amenities and a private balcony.",
    price: 8500,
    capacity: 2,
    size: 65,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop",
    location: "Camps Bay",
    rating: 4.9,
    features: ["Wi-Fi", "Full Kitchen", "En-suite Bathroom", "Air Conditioning", "Smart TV", "Balcony"]
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
    rating: 4.8,
    features: ["Wi-Fi", "Gourmet Kitchen", "3 Bathrooms", "Air Conditioning", "Smart TV", "Private Pool", "Ocean View"]
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
    rating: 4.7,
    features: ["Wi-Fi", "Full Kitchen", "2 Bathrooms", "Air Conditioning", "Smart TV", "Washing Machine", "Garden"]
  }
];

export default function Index() {
  const { t } = useLanguage();
  
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);
  
  // Feature items
  const features = [
    {
      icon: <span className="h-8 w-8" />,
      title: t.home.amenities.features.beachfront.title,
      description: t.home.amenities.features.beachfront.description
    },
    {
      icon: <span className="h-8 w-8" />,
      title: t.home.amenities.features.pools.title,
      description: t.home.amenities.features.pools.description
    },
    {
      icon: <span className="h-8 w-8" />,
      title: t.home.amenities.features.restaurant.title,
      description: t.home.amenities.features.restaurant.description
    },
    {
      icon: <span className="h-8 w-8" />,
      title: t.home.amenities.features.wifi.title,
      description: t.home.amenities.features.wifi.description
    },
    {
      icon: <span className="h-8 w-8" />,
      title: t.home.amenities.features.bar.title,
      description: t.home.amenities.features.bar.description
    },
    {
      icon: <span className="h-8 w-8" />,
      title: t.home.amenities.features.location.title,
      description: t.home.amenities.features.location.description
    }
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection />
        
        {/* Welcome Section */}
        <section id="welcome" className="section">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="animate-fade-in [animation-delay:100ms]">
                <span className="text-sm text-primary font-medium uppercase tracking-wider">
                  {t.home.welcome.subtitle}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">
                  {t.home.welcome.title}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {t.home.welcome.description1}
                </p>
                <p className="text-muted-foreground mb-8">
                  {t.home.welcome.description2}
                </p>
                <Button asChild className="btn-primary">
                  <Link to="/about">
                    {t.home.welcome.learnMore} <span className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
              
              <div className="relative animate-fade-in [animation-delay:300ms]">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=600&fit=crop"
                    alt="Seaside view" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 w-2/3 rounded-2xl overflow-hidden shadow-xl">
                  <img 
                    src="https://images.unsplash.com/photo-1545579133-99bb5ab189bd?w=400&h=300&fit=crop"
                    alt="Luxury apartment interior" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -top-6 -right-6 w-1/2 rounded-2xl overflow-hidden shadow-xl">
                  <img 
                    src="https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400&h=300&fit=crop"
                    alt="Pool view" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Booking Form Section */}
        <section className="relative py-20 bg-gradient-to-r from-sea-light to-white dark:from-sea-dark dark:to-background overflow-hidden">
          <div className="container relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="animate-fade-in">
                <span className="text-sm text-primary font-medium uppercase tracking-wider">
                  {t.home.booking.subtitle}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">
                  {t.home.booking.title}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {t.home.booking.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {t.home.booking.benefits.map((item, index) => (
                    <li key={index} className="flex items-center">
                      <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
                        <span className="h-3 w-3" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              <BookingForm />
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
            <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-primary/50 blur-3xl" />
            <div className="absolute bottom-10 right-40 w-48 h-48 rounded-full bg-sea-light blur-3xl" />
          </div>
        </section>
        
        {/* Featured Apartments */}
        <section className="section">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in">
              <span className="text-sm text-primary font-medium uppercase tracking-wider">
                {t.home.featuredApartments.subtitle}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
                {t.home.featuredApartments.title}
              </h2>
              <p className="text-muted-foreground">
                {t.home.featuredApartments.description}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredApartments.map((apartment, index) => (
                <div key={apartment.id} className="animate-fade-in" style={{ animationDelay: `${(index + 1) * 100}ms` }}>
                  <ApartmentCard apartment={apartment} />
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Button asChild className="btn-primary">
                <Link to="/apartments">
                  {t.home.featuredApartments.viewAll} <span className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <TestimonialsSection />
        
        {/* Facilities Section */}
        <FacilitiesSection />
        
        {/* CTA Section */}
        <section className="relative py-24 bg-primary/5">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {t.home.cta.title}
              </h2>
              <p className="text-muted-foreground mb-8">
                {t.home.cta.description}
              </p>
              <Button asChild size="lg" className="btn-primary">
                <Link to="/booking">{t.home.cta.bookNow}</Link>
              </Button>
            </div>
          </div>
          
          {/* Decorative waves */}
          <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden">
            <svg 
              className="absolute bottom-0 w-full h-24 fill-background"
              preserveAspectRatio="none"
              viewBox="0 0 1440 74"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M0,37.1L40,34.5C80,32,160,27,240,29.6C320,32,400,42,480,42.9C560,44,640,35,720,32.1C800,30,880,34,960,40.8C1040,47,1120,56,1200,56.6C1280,57,1360,48,1400,43.3L1440,39.1L1440,74L1400,74C1360,74,1280,74,1200,74C1120,74,1040,74,960,74C880,74,800,74,720,74C640,74,560,74,480,74C400,74,320,74,240,74C160,74,80,74,40,74L0,74Z"
                className="animate-wave opacity-50"
              />
              <path 
                d="M0,37.1L40,34.5C80,32,160,27,240,29.6C320,32,400,42,480,42.9C560,44,640,35,720,32.1C800,30,880,34,960,40.8C1040,47,1120,56,1200,56.6C1280,57,1360,48,1400,43.3L1440,39.1L1440,74L1400,74C1360,74,1280,74,1200,74C1120,74,1040,74,960,74C880,74,800,74,720,74C640,74,560,74,480,74C400,74,320,74,240,74C160,74,80,74,40,74L0,74Z"
                className="animate-wave opacity-100 [animation-delay:-4s]"
              />
            </svg>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
