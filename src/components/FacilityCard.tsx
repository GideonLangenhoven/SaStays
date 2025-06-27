import React from 'react';

interface FacilityCardProps {
  title: string;
  description: string;
  image: string;
}

const FacilityCard: React.FC<FacilityCardProps> = ({ title, description, image }) => {
  return (
    <div className="relative h-[360px] w-[280px] rounded-xl overflow-hidden group cursor-pointer">
      <img 
        src={image} 
        alt={title} 
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
        <div className="text-white">
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {description}
          </p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full p-6 text-white">
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
    </div>
  );
};

export default FacilityCard;
