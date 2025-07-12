import React, { useState, useEffect } from 'react';

interface FacilityCardProps {
  title: string;
  description: string;
  image: string | string[];
}

const FacilityCard: React.FC<FacilityCardProps> = ({ title, description, image }) => {
  const [hovered, setHovered] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const images = Array.isArray(image) ? image : [image];

  useEffect(() => {
    if (images.length > 1 && hovered) {
      const interval = setInterval(() => {
        setImgIndex((prev) => (prev + 1) % images.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [images, hovered]);

  return (
    <div
      className="relative h-[360px] w-[280px] rounded-xl overflow-hidden group cursor-pointer xl:w-[247px] xl:h-[185px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={images[imgIndex]}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
      {/* Overlay: only show on hover */}
      {hovered && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-100 transition-opacity duration-300 flex items-end p-6">
          <div className="text-white">
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-sm opacity-100 transition-opacity duration-300">{description}</p>
          </div>
        </div>
      )}
      {/* Bottom heading: only show when not hovered */}
      {!hovered && (
        <div className="absolute bottom-0 left-0 w-full p-6 text-white">
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
      )}
    </div>
  );
};

export default FacilityCard;
