import React from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import FacilityCard from './FacilityCard';

const FacilitiesSection: React.FC = () => {
  const { t } = useLanguage();
  
  const facilities = [
    {
      title: t.home.amenities.features.beachfront.title,
      description: t.home.amenities.features.beachfront.description,
      image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
    },
    {
      title: t.home.amenities.features.pools.title,
      description: t.home.amenities.features.pools.description,
      image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
    },
    {
      title: t.home.amenities.features.restaurant.title,
      description: t.home.amenities.features.restaurant.description,
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80'
    },
    {
      title: t.home.amenities.features.wifi.title,
      description: t.home.amenities.features.wifi.description,
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
    },
    {
      title: t.home.amenities.features.bar.title,
      description: t.home.amenities.features.bar.description,
      image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80'
    }
  ];

  return (
    <section className="py-16 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-sm text-primary font-medium uppercase tracking-wider">
            {t.home.amenities.subtitle}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
            {t.home.amenities.title}
          </h2>
          <p className="text-muted-foreground">
            {t.home.amenities.description}
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-8">
          {facilities.map((facility, index) => (
            <div key={index} className="animate-fade-in" style={{ animationDelay: `${(index + 1) * 100}ms` }}>
              <FacilityCard
                title={facility.title}
                description={facility.description}
                image={facility.image}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FacilitiesSection;
