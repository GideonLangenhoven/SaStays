import React from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import FacilityCard from "./FacilityCard";

export interface AmenityItem {
  title: string;
  description: string;
  image: string;
}

export interface AmenityCategorySectionProps {
  key: string;
  title: string;
  description: string;
  items: AmenityItem[];
}

const AmenityCategorySection: React.FC<{ category: AmenityCategorySectionProps }> = ({ category }) => {
  const { t } = useLanguage();
  
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
            {category.title}
          </h2>
          {category.description && (
            <p className="text-muted-foreground">
              {category.description}
            </p>
          )}
        </div>
        
        <div className="flex flex-wrap justify-center gap-8">
          {category.items.map((item, index) => (
            <div key={index} className="animate-fade-in" style={{ animationDelay: `${(index + 1) * 100}ms` }}>
              <FacilityCard
                title={item.title}
                description={item.description}
                image={item.image}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AmenityCategorySection;
