import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BookingForm from "@/components/BookingForm";
import TestimonialsSection from "@/components/TestimonialsSection";
import FacilitiesSection from "@/components/FacilitiesSection";
import ApartmentCard, { ApartmentProps } from "@/components/ApartmentCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar, Shield, CreditCard, MessageCircle, BarChart3, Globe, Clock, Users } from "lucide-react";

// Real-time booking features as described in README
const systemFeatures = [
  {
    icon: <Calendar className="h-8 w-8" />,
    title: "Real-Time Booking System",
    description: "Instant booking with calendar synchronization and double-booking prevention across all platforms."
  },
  {
    icon: <CreditCard className="h-8 w-8" />,
    title: "Multi-Platform Payments",
    description: "Integrated South African payment providers: Ozow, PayFast, Zapper, and SnapScan."
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: "POPIA Compliant",
    description: "Secure customer data management with full privacy protection compliance."
  },
  {
    icon: <MessageCircle className="h-8 w-8" />,
    title: "Guest Communication",
    description: "Unified inbox for seamless owner-guest messaging and automated notifications."
  },
  {
    icon: <BarChart3 className="h-8 w-8" />,
    title: "Owner Dashboard",
    description: "Performance metrics, earnings tracking, and comprehensive property management."
  },
  {
    icon: <Globe className="h-8 w-8" />,
    title: "Multi-Language Support",
    description: "Available in English, Afrikaans, Xhosa, and Zulu for diverse South African guests."
  }
];

// Payment methods supported as per README
const paymentMethods = [
  { name: "Ozow", logo: "data:image/svg+xml,%3Csvg width='120' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='120' height='40' fill='%230066cc'/%3E%3Ctext x='60' y='25' font-family='Arial' font-size='14' fill='white' text-anchor='middle'%3EOzow%3C/text%3E%3C/svg%3E", description: "Instant EFT payments" },
  { name: "PayFast", logo: "data:image/svg+xml,%3Csvg width='120' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='120' height='40' fill='%23ff6600'/%3E%3Ctext x='60' y='25' font-family='Arial' font-size='14' fill='white' text-anchor='middle'%3EPayFast%3C/text%3E%3C/svg%3E", description: "Secure online payments" },
  { name: "Zapper", logo: "data:image/svg+xml,%3Csvg width='120' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='120' height='40' fill='%238b5cf6'/%3E%3Ctext x='60' y='25' font-family='Arial' font-size='14' fill='white' text-anchor='middle'%3EZapper%3C/text%3E%3C/svg%3E", description: "QR code payments" },
  { name: "SnapScan", logo: "data:image/svg+xml,%3Csvg width='120' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='120' height='40' fill='%2310b981'/%3E%3Ctext x='60' y='25' font-family='Arial' font-size='14' fill='white' text-anchor='middle'%3ESnapScan%3C/text%3E%3C/svg%3E", description: "Quick scan & pay" }
];


// Featured apartments with South African locations and ZAR pricing
const featuredApartments: ApartmentProps[] = [
  {
    id: 1,
    title: "Lion's Head View Penthouse",
    description: "Luxurious penthouse with panoramic views of Lion's Head and the Atlantic Ocean, featuring modern amenities and a private balcony.",
    price_per_night: 8500,
    capacity: 2,
    location: "Camps Bay",
    image_url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop",
    amenities: ["Wi-Fi", "Full Kitchen", "En-suite Bathroom", "Air Conditioning", "Smart TV", "Balcony"]
  },
  {
    id: 4,
    title: "Luxury Clifton Penthouse",
    description: "Exclusive top-floor suite with 180-degree ocean views, private pool, and direct beach access to Clifton's 4th Beach.",
    price_per_night: 18500,
    capacity: 4,
    location: "Clifton",
    image_url: "https://images.unsplash.com/photo-1562438668-bcf0ca6578f0?w=800&h=600&fit=crop",
    amenities: ["Wi-Fi", "Gourmet Kitchen", "3 Bathrooms", "Air Conditioning", "Smart TV", "Private Pool", "Ocean View"]
  },
  {
    id: 2,
    title: "Table Mountain Family Villa",
    description: "Spacious 2-bedroom villa with stunning Table Mountain views, ideal for families, with a full kitchen and private garden.",
    price_per_night: 12500,
    capacity: 4,
    location: "Gardens",
    image_url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
    amenities: ["Wi-Fi", "Full Kitchen", "2 Bathrooms", "Air Conditioning", "Smart TV", "Washing Machine", "Garden"]
  }
];

// Add ImageGrid component for the 2x3 grid with hover effect
const imageData = [
  {
    img: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=600&q=80',
    lyr: { oxy: '-50%, -50%' }
  },
  {
    img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80',
    lyr: { oxy: '0, calc(var(--hov)*-100%)', spr: 'var(--l)' }
  },
  {
    img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=600&q=80',
    lyr: { oxy: '50%, -50%' }
  },
  {
    img: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=600&q=80',
    lyr: { raz: '45deg', fxy: +Math.sqrt(2).toFixed(3) }
  },
  {
    img: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?w=600&q=80',
    lyr: { fxy: +Math.sqrt(2).toFixed(3) }
  },
  {
    img: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&q=80',
    lyr: {}
  }
];

// Add stock images for BlogCards
const blogCard1Images = [
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=600&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80",
  "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=600&q=80",
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80"
];
const blogCard2Images = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
  "https://images.unsplash.com/photo-1464983953574-0892a716854b?w=600&q=80",
  "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=600&q=80",
  "https://images.unsplash.com/photo-1549921296-a0107b7b9c31?w=600&q=80",
  "https://images.unsplash.com/photo-1519985176271-adb1088fa94c?w=600&q=80"
];

interface BlogCardProps {
  title: string;
  intro: string;
  info: string;
  articleLink: string;
  stats: Array<{ icon: string; value: string; link?: boolean }>;
  bgImage: string;
}

function ImageGrid() {
  const n = imageData.length;
  const m = 3; // 3 columns
  const [activeIndexes, setActiveIndexes] = useState<number[]>([]);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const revealQueue = useRef<number[]>([]);
  const revealing = useRef(false);

  useEffect(() => {
    // Intersection Observer for scroll-in effect
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number(entry.target.getAttribute('data-idx'));
          if (entry.isIntersecting && !activeIndexes.includes(idx) && !revealQueue.current.includes(idx)) {
            revealQueue.current.push(idx);
          }
        });
        // Start revealing if not already
        if (!revealing.current && revealQueue.current.length > 0) {
          revealing.current = true;
          const revealNext = () => {
            if (revealQueue.current.length === 0) {
              revealing.current = false;
              return;
            }
            const nextIdx = revealQueue.current.shift();
            setActiveIndexes((prev) => [...prev, nextIdx!]);
            setTimeout(revealNext, 1500); // 1500ms between reveals (200% slower)
          };
          revealNext();
        }
      },
      { threshold: 0.5 }
    );
    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });
    return () => observer.disconnect();
  }, [activeIndexes]);

  return (
    <div
      className="grid gap-2 sm:gap-4"
      style={{
        gridTemplateColumns: `repeat(${m}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(2, minmax(0, 1fr))`,
        '--m': m,
        '--l': 'min(13em, calc((100vw - (3 + 1)*0.5em)/3))',
      } as React.CSSProperties}
    >
      {imageData.map((c, i) => {
        const s = Object.entries(c.lyr).map(([p, v]) => `--${p}: ${v}`).join('; ');
        // Determine if this card should show the effect (hover or scroll-in)
        const isActive = activeIndexes.includes(i);
        return (
          <figure
            key={i}
            className="relative overflow-hidden rounded-2xl group aspect-[4/3] bg-muted"
            style={{ ...Object.fromEntries(Object.entries(c.lyr).map(([p, v]) => [`--${p}`, v])), '--hov': isActive ? 1 : 0 } as React.CSSProperties}
            ref={el => (cardRefs.current[i] = el)}
            data-idx={i}
            tabIndex={0}
            onMouseEnter={() => setActiveIndexes((prev) => prev.includes(i) ? prev : [...prev, i])}
            onMouseLeave={() => setActiveIndexes((prev) => prev.filter(idx => idx !== i))}
            onFocus={() => setActiveIndexes((prev) => prev.includes(i) ? prev : [...prev, i])}
            onBlur={() => setActiveIndexes((prev) => prev.filter(idx => idx !== i))}
          >
            <span
              className="absolute inset-0 z-10 pointer-events-none transition-all duration-500"
              style={{
                borderRadius: '50%',
                transform: `translate(var(--oxy, 0, 0)) rotate(var(--raz, 0deg)) scale(var(--fxy, ${2 * Math.sqrt(2)}))`,
                boxShadow: `inset 0 0 0 var(--spr, calc(.5*(1 - var(--hov, 0))*var(--l, 13em))) hsl(0, 0%, 40%)`,
                mixBlendMode: 'multiply',
                transition: '.5s',
              }}
            />
            <img
              src={c.img}
              alt="Apartment or amenity"
              className={
                `w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ` +
                `transition-all duration-700 ${isActive ? 'filter-none' : 'grayscale'} `
              }
              style={{ mixBlendMode: 'luminosity', filter: isActive ? 'none' : 'grayscale(1)' }}
            />
            <span
              className="absolute inset-0 z-10 pointer-events-none transition-all duration-500"
              style={{
                borderRadius: '50%',
                transform: `translate(var(--oxy, 0, 0)) rotate(var(--raz, 0deg)) scale(var(--fxy, ${2 * Math.sqrt(2)}))`,
                boxShadow: `inset 0 0 0 var(--spr, calc(.5*(1 - var(--hov, 0))*var(--l, 13em))) hsl(0, 0%, 40%)`,
                mixBlendMode: 'multiply',
                transition: '.5s',
              }}
            />
          </figure>
        );
      })}
    </div>
  );
}

function BlogCard({ title, intro, info, articleLink, stats, bgImage }: BlogCardProps) {
  return (
    <div className="blog-card spring-fever relative w-[330px] h-[300px] mx-auto overflow-hidden rounded-none shadow-lg text-center bg-cover bg-center transition-all duration-400 hover:shadow-2xl group" style={{backgroundImage: `url(${bgImage})`}}>
      {/* Zoom effect on hover for the image background */}
      <div className="absolute inset-0 transition-transform duration-500 will-change-transform group-hover:scale-110" style={{backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 1}} />
      <div className="title-content absolute z-20 w-full top-0 left-0 text-center mt-[68px] transition-all duration-500">
        <h3 className="text-lg font-serif font-normal mb-0 inline-block"><a href="#" className="text-white hover:text-shadow">{title}</a></h3>
        <div className="intro w-[68px] mx-auto text-gray-200 italic leading-[18px]"> <a href="#" className="text-gray-200 hover:underline">{intro}</a> </div>
      </div>
      <div className="card-info absolute bottom-[-16px] left-0 w-full px-6 text-xs leading-5 z-20 opacity-0 transition-all duration-500">
        {info}
        <a href="#" className="block w-[40px] mx-auto bg-white text-gray-800 rounded px-1 py-0.5 mt-2 text-xs hover:bg-yellow-700 hover:text-white transition">{articleLink}<span className="licon icon-arr icon-black ml-1"></span></a>
      </div>
      <div className="utility-info absolute bottom-0 left-0 w-full z-20 text-left">
        <ul className="utility-list list-none m-0 mb-1 ml-2 p-0 w-full">
          {stats.map((stat, i) => (
            <li key={i} className="inline-block mr-1 text-xs"><span className={`licon ${stat.icon}`}></span>{stat.link ? <a href="#" className="ml-1">{stat.value}</a> : <span className="ml-1">{stat.value}</span>}</li>
          ))}
        </ul>
      </div>
      <div className="gradient-overlay absolute top-[140px] left-0 w-full h-[60px] z-15" style={{background: "linear-gradient(transparent 0%, rgba(0, 0, 0, 0.6) 21%)"}}></div>
      <div className="color-overlay absolute top-0 left-0 w-full h-full z-10" style={{background: "rgba(64, 84, 94,0.5)"}}></div>
    </div>
  );
}

export default function Index() {
  const { t } = useLanguage();
  const [selectedApartment, setSelectedApartment] = useState<ApartmentProps | null>(null);
  const [featuredProperties, setFeaturedProperties] = useState<ApartmentProps[]>(featuredApartments);
  const [loading, setLoading] = useState(false);
  
  // BlogCard image indexes
  const [card1Index, setCard1Index] = useState(0);
  const [card2Index, setCard2Index] = useState(0);

  // Auto-rotate BlogCard images every 3 seconds, independently
  useEffect(() => {
    const interval1 = setInterval(() => {
      setCard1Index((prev) => (prev + 1) % blogCard1Images.length);
    }, 3000);
    const interval2 = setInterval(() => {
      setCard2Index((prev) => (prev + 1) % blogCard2Images.length);
    }, 3000);
    return () => {
      clearInterval(interval1);
      clearInterval(interval2);
    };
  }, []);

  // Fetch properties from API if available, fallback to static data
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        console.log('Attempting to fetch properties from API...');
        const response = await fetch('http://localhost:5001/api/properties');
        
        if (response.ok) {
          const properties = await response.json();
          console.log('Successfully fetched properties from API:', properties);
          
          // Map API response to ApartmentProps interface and take first 3
          const mappedProperties = properties.slice(0, 3).map((property: any) => ({
            id: property.id,
            title: property.title,
            description: property.description,
            price_per_night: parseFloat(property.nightly_price),
            capacity: property.max_guests,
            location: property.location,
            image_url: property.images && property.images.length > 0 ? property.images[0] : "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
            amenities: property.amenities || []
          }));
          
          setFeaturedProperties(mappedProperties);
        } else {
          console.log('API not available, using fallback data');
          setFeaturedProperties(featuredApartments);
        }
      } catch (error) {
        console.log("API not available, using fallback data:", error);
        setFeaturedProperties(featuredApartments);
      }
      setLoading(false);
    };

    fetchProperties();
  }, []);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);
  
  return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-20">
          {/* Hero Section */}
          <HeroSection />
          

          {/* Welcome Section */}
          <section id="welcome" className="section bg-white dark:bg-card">
            <div className="container">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="animate-fade-in [animation-delay:100ms] text-left md:text-left">
                  <span className="text-xs text-primary font-semibold uppercase tracking-wider mb-2 block">
                    {t.home.welcome.subtitle}
                  </span>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mt-2 mb-6 leading-tight">
                    {t.home.welcome.title}
                  </h2>
                  <p className="text-muted-foreground mb-6 text-base" style={{ fontSize: '0.75rem' }}>
                    {t.home.welcome.description1}
                  </p>
                  <p className="text-muted-foreground mb-8 text-base" style={{ fontSize: '0.75rem' }}>
                    {t.home.welcome.description2}
                  </p>
                  <div className="flex gap-4">
                    <Button asChild className="btn-primary text-base px-4 py-2 rounded-full shadow-md">
                      <Link to="/owner-login">
                        Owner Dashboard
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="text-base px-4 py-2 rounded-full">
                      <Link to="/apartments">
                        {t.home.welcome.learnMore}
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="relative animate-fade-in [animation-delay:300ms] flex flex-row gap-4 justify-center items-center">
                  <BlogCard
                    title="Real-Time Booking"
                    intro="Technology"
                    info="Experience our instant booking system with real-time calendar synchronization and zero double-booking guarantee across all platforms."
                    articleLink="Learn More"
                    stats={[]}
                    bgImage={blogCard1Images[card1Index]}
                  />
                  <BlogCard
                    title="Secure Payments"
                    intro="Safety"
                    info="Multiple South African payment options including Ozow, PayFast, Zapper, and SnapScan with POPIA-compliant data protection."
                    articleLink="View Methods"
                    stats={[]}
                    bgImage={blogCard2Images[card2Index]}
                  />
                </div>
              </div>
            </div>
          </section>
          
          {/* System Features Section - NEW: Showcasing README functionality */}
          <section className="py-20 bg-muted/50">
            <div className="container">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Production-Ready Platform Features
                </h2>
                <p className="text-muted-foreground text-lg">
                  Comprehensive property management system with real-time capabilities and South African market focus.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {systemFeatures.map((feature, index) => (
                  <div key={index} className="bg-card p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-primary mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Payment Methods Section - NEW: Highlighting supported methods */}
          <section className="py-16 bg-white dark:bg-card">
            <div className="container">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Trusted Payment Partners
                </h2>
                <p className="text-muted-foreground text-lg">
                  Secure, local payment solutions for South African guests and property owners.
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
                {paymentMethods.map((method, index) => (
                  <div key={index} className="text-center p-4 rounded-lg hover:bg-muted/50 transition-colors">
                    <img 
                      src={method.logo} 
                      alt={method.name}
                      className="mx-auto mb-3 h-10 object-contain"
                    />
                    <h4 className="font-semibold mb-1">{method.name}</h4>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Booking Form Section */}
          <section className="relative py-20 bg-gradient-to-r from-sea-light to-white dark:from-sea-dark dark:to-background overflow-hidden">
            <div className="container relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="animate-fade-in text-left">
                  <span className="text-sm text-primary font-semibold uppercase tracking-wider mb-2 block">
                    {t.home.booking.subtitle}
                  </span>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-2 mb-6 leading-tight">
                    {t.home.booking.title}
                  </h2>
                  <p className="text-muted-foreground mb-6 text-lg">
                    {t.home.booking.description}
                  </p>
                  <ul className="space-y-3 mb-8">
                    {t.home.booking.benefits.map((item, index) => (
                      <li key={index} className="flex items-center text-base">
                        <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
                          <Shield className="h-3 w-3" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <BookingForm />
              </div>
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
                <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-primary/50 blur-3xl" />
                <div className="absolute bottom-10 right-40 w-48 h-48 rounded-full bg-sea-light blur-3xl" />
              </div>
            </div>
          </section>
          
          {/* Featured Apartments */}
          <section className="section bg-white dark:bg-card">
            <div className="container">
              <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in">
                <span className="text-sm text-primary font-semibold uppercase tracking-wider">
                  {t.home.featuredApartments.subtitle}
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-2 mb-4">
                  {t.home.featuredApartments.title}
                </h2>
                <p className="text-muted-foreground text-lg">
                  {t.home.featuredApartments.description}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                  <div className="text-center py-8 col-span-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading properties...</p>
                  </div>
                ) : (
                  featuredProperties.map((apartment, index) => (
                  <div key={apartment.id} className="animate-fade-in" style={{ animationDelay: `${(index + 1) * 100}ms` }}>
                    <div className="bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={apartment.image_url}
                          alt={apartment.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {apartment.location}
                        </div>
                        <div className="absolute top-3 right-3 bg-green-500/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-white flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Available Now
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-foreground">{apartment.title}</h3>
                          <div className="text-lg font-bold text-primary">R{apartment.price_per_night.toLocaleString('en-ZA')}<span className="text-sm font-normal text-muted-foreground">/night</span></div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{apartment.description}</p>
                        <div className="flex items-center text-sm text-muted-foreground mb-4">
                          <div className="flex items-center mr-4">
                            <Users className="h-4 w-4 mr-1" />
                            {apartment.capacity} {apartment.capacity > 1 ? 'Guests' : 'Guest'}
                          </div>
                          <div className="flex items-center bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                            Cape Town
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {apartment.amenities.slice(0, 3).map((amenity, index) => (
                            <span key={index} className="text-xs bg-muted px-2 py-1 rounded-md">
                              {amenity}
                            </span>
                          ))}
                          {apartment.amenities.length > 3 && (
                            <span className="text-xs bg-muted px-2 py-1 rounded-md">
                              +{apartment.amenities.length - 3} more
                            </span>
                          )}
                        </div>
                        <Button className="w-full mt-2" onClick={() => setSelectedApartment(apartment)}>
                          View Details & Book Now
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
                )}
              </div>
              <div className="text-center mt-12">
                <Button asChild className="btn-primary text-lg px-6 py-3 rounded-full shadow-md">
                  <Link to="/apartments">
                    {t.home.featuredApartments.viewAll} <Calendar className="h-3 w-3 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
            {/* Apartment Details Modal */}
            {selectedApartment && (
              <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fade-in">
                <button
                  className="absolute top-4 right-4 z-50 text-white bg-black/60 p-2 rounded-full hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  onClick={() => setSelectedApartment(null)}
                  aria-label="Close"
                >
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="bg-white dark:bg-card rounded-xl shadow-2xl max-w-2xl w-full p-8 relative animate-fade-in overflow-y-auto max-h-[90vh]">
                  <div className="flex flex-col md:flex-row gap-6">
                    <img
                      src={selectedApartment.image_url}
                      alt={selectedApartment.title}
                      className="w-full md:w-1/2 h-64 object-cover rounded-lg shadow"
                    />
                    <div className="flex-1 flex flex-col gap-2">
                      <h3 className="text-2xl font-bold text-primary mb-2">{selectedApartment.title}</h3>
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-lg font-bold text-primary">R{selectedApartment.price_per_night.toLocaleString('en-ZA')}</span>
                        <span className="text-sm text-muted-foreground">/night</span>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Real-time pricing</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span>{selectedApartment.capacity} {selectedApartment.capacity > 1 ? 'Guests' : 'Guest'}</span>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">{selectedApartment.location}</span>
                      </div>
                      <p className="text-base text-foreground mb-4">{selectedApartment.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {selectedApartment.amenities.map((amenity, index) => (
                          <span key={index} className="text-xs bg-muted px-2 py-1 rounded-md">
                            {amenity}
                          </span>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <Button asChild className="w-full">
                          <Link to={`/apartments/${selectedApartment.id}`} onClick={() => setSelectedApartment(null)}>
                            View Full Details
                          </Link>
                        </Button>
                        <Button asChild variant="default" className="w-full bg-green-600 hover:bg-green-700">
                          <Link to="/booking" onClick={() => setSelectedApartment(null)}>
                            Book Now
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
          
          {/* Testimonials Section */}
          <TestimonialsSection />
          
          {/* Facilities Section */}
          <FacilitiesSection />
          
          {/* CTA Section */}
          <section className="relative py-24 bg-primary/5">
            <div className="container">
              <div className="max-w-3xl mx-auto text-center animate-fade-in">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                  {t.home.cta.title}
                </h2>
                <p className="text-muted-foreground mb-8 text-lg">
                  {t.home.cta.description}
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Button asChild size="lg" className="btn-primary text-lg px-8 py-4 rounded-full shadow-lg">
                    <Link to="/booking">{t.home.cta.bookNow}</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="text-lg px-8 py-4 rounded-full">
                    <Link to="/owner-login">Owner Dashboard</Link>
                  </Button>
                </div>
              </div>
            </div>
            {/* Decorative waves */}
            <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden pointer-events-none">
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
      </div>
  );
}