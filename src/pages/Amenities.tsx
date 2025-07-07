import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import AmenityCategorySection from "@/components/AmenityCategorySection";
import FacilitiesSection from "@/components/FacilitiesSection";

// High-quality images for different categories (800x600 for consistency with gallery)
const wellnessImages = [
  'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=600&fit=crop', // Spa treatment
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop', // Fitness center
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop', // Yoga session
  'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=800&h=600&fit=crop'  // Infinity pool
];

const diningImages = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop', // Gourmet Restaurant (Beach Bar & Café image)
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop', // Beach Bar & Café
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop',   // Room Service
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop'    // Wine Cellar (same as Room Service)
];

const servicesImages = [
  'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=800&h=600&fit=crop', // Concierge
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop', // Laundry service
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop', // Airport transfer
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop'  // 24/7 reception
];

const galleryImages = [
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop', // Beachfront
  'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&h=600&fit=crop', // Luxury suite
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop', // Dining area
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop'  // Recreation
];

export default function Amenities() {
  const { t } = useLanguage();
  
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);
  
  // Prepare amenity categories with their items
  const amenityCategories = [
    {
      key: 'wellness',
      title: 'Wellness & Relaxation',
      description: 'Indulge in our premium wellness facilities designed to rejuvenate your body and mind.',
      items: [
        {
          title: 'Spa & Massage',
          description: 'Pamper yourself with our range of relaxing spa treatments and massages.',
          image: wellnessImages[0]
        },
        {
          title: 'Fitness Center',
          description: 'Stay active during your stay with our state-of-the-art fitness equipment.',
          image: wellnessImages[1]
        },
        {
          title: 'Yoga & Meditation',
          description: 'Find your inner peace with our yoga and meditation sessions.',
          image: wellnessImages[2]
        },
        {
          title: 'Swimming Pools',
          description: 'Relax by our infinity pools with stunning views.',
          image: wellnessImages[3]
        }
      ]
    },
    {
      key: 'dining',
      title: 'Dining',
      description: 'Savor exquisite culinary experiences at our restaurants and bars.',
      items: [
        {
          title: 'Gourmet Restaurant',
          description: 'Experience fine dining with our carefully crafted menus.',
          image: diningImages[0]
        },
        {
          title: 'Beach Bar & Café',
          description: 'Enjoy refreshing drinks and light meals by the beach.',
          image: diningImages[1]
        },
        {
          title: 'Room Service',
          description: '24/7 room service for your convenience.',
          image: diningImages[2]
        },
        {
          title: 'Wine Cellar',
          description: 'Discover our selection of fine wines from around the world.',
          image: diningImages[3]
        }
      ]
    },
    {
      key: 'services',
      title: 'Extra Services',
      description: 'Enhance your stay with our additional services.',
      items: [
        {
          title: 'Concierge',
          description: 'Our concierge team is here to assist with all your needs.',
          image: servicesImages[0]
        },
        {
          title: 'Laundry Service',
          description: 'Professional laundry and dry cleaning services available.',
          image: servicesImages[1]
        },
        {
          title: 'Airport Transfer',
          description: 'Comfortable and convenient airport transfers.',
          image: servicesImages[2]
        },
        {
          title: '24/7 Reception',
          description: 'Round-the-clock assistance from our friendly staff.',
          image: servicesImages[3]
        }
      ]
    },
    {
      key: 'gallery',
      title: 'Photo Gallery',
      description: 'Explore our facilities through these beautiful moments.',
      items: [
        {
          title: 'Beachfront',
          description: 'Stunning views of our pristine beaches.',
          image: galleryImages[0]
        },
        {
          title: 'Luxury Suites',
          description: 'Elegant and comfortable accommodations.',
          image: galleryImages[1]
        },
        {
          title: 'Dining Areas',
          description: 'Beautiful settings for your dining pleasure.',
          image: galleryImages[2]
        },
        {
          title: 'Recreation',
          description: 'Activities and entertainment for all guests.',
          image: galleryImages[3]
        }
      ]
    }
  ];
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-20">
        {/* Header Section */}
        <section className="relative py-20 bg-gradient-to-r from-sea-light to-white dark:from-sea-dark dark:to-background overflow-hidden">
          <div className="container relative z-10">
            <div className="max-w-3xl mx-auto text-center animate-fade-in">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {t.amenitiesPage.title}
              </h1>
              <p className="text-muted-foreground text-lg mb-6">
                {t.amenitiesPage.subtitle}
              </p>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 opacity-10 pointer-events-none">
            <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-primary/50 blur-3xl" />
            <div className="absolute top-10 right-40 w-48 h-48 rounded-full bg-sea-light blur-3xl" />
          </div>
        </section>
        {/* Facilities Section */}
        <FacilitiesSection />
        {/* Amenity Categories */}
        <section className="py-12 bg-white dark:bg-card">
          <div className="container grid grid-cols-1 gap-8 animate-fade-in">
        {amenityCategories.map((category, index) => (
          <AmenityCategorySection 
            key={category.key} 
                category={category}
          />
        ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
