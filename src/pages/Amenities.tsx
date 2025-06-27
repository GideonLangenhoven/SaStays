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
  'https://images.unsplash.com/photo-1414235077428-338989f6f9c3?w=800&h=600&fit=crop', // Fine dining
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop', // Restaurant
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop',   // Beach bar
  'https://images.unsplash.com/photo-1514362545859-8fdc295e1d3d?w=800&h=600&fit=crop'  // Wine cellar
];

const servicesImages = [
  'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=800&h=600&fit=crop', // Concierge
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop', // Laundry service
  'https://images.unsplash.com/photo-1571003123894-5b2e4fe00d3a?w=800&h=600&fit=crop', // Airport transfer
  'https://images.unsplash.com/photo-1523050853548-ef6f1f6a1a69?w=800&h=600&fit=crop'  // 24/7 reception
];

const galleryImages = [
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop', // Beachfront
  'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&h=600&fit=crop', // Luxury suite
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop', // Dining area
  'https://images.unsplash.com/photo-1533856493583-30c19163c0ed?w=800&h=600&fit=crop'  // Recreation area
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-r from-sea-light to-white dark:from-sea-dark dark:to-background">
          <div className="container relative z-10 pt-20">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-sm text-primary font-medium uppercase tracking-wider">
                MareSereno
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-6">
                {t.amenitiesPage.title}
              </h1>
              <p className="text-muted-foreground">
                {t.amenitiesPage.subtitle}
              </p>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
            <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-primary/50 blur-3xl" />
            <div className="absolute bottom-10 right-40 w-48 h-48 rounded-full bg-sea-light blur-3xl" />
          </div>
        </section>
        
        {/* Description Section */}
        <section className="py-16">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-lg text-muted-foreground">
                {t.amenitiesPage.description}
              </p>
            </div>
          </div>
        </section>

        {/* Facilities Section */}
        <FacilitiesSection />
        
        {/* Amenity Categories */}
        {amenityCategories.map((category, index) => (
          <AmenityCategorySection 
            key={category.key} 
            category={{
              ...category,
              items: category.items
            }} 
          />
        ))}
      </main>
      
      <Footer />
    </div>
  );
}
