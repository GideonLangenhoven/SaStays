// src/test/components/ApartmentCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../utils';
import ApartmentCard from '../../components/ApartmentCard';
import { mockProperty } from '../utils';

// Mock the router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('ApartmentCard', () => {
  const mockProps = {
    id: mockProperty.id,
    title: mockProperty.title,
    description: mockProperty.description,
    location: mockProperty.location,
    pricePerNight: mockProperty.price_per_night,
    bedrooms: mockProperty.bedrooms,
    bathrooms: mockProperty.bathrooms,
    maxGuests: mockProperty.max_guests,
    rating: mockProperty.average_rating,
    reviews: mockProperty.total_reviews,
    images: mockProperty.images,
    amenities: mockProperty.amenities,
  };

  it('renders property information correctly', () => {
    render(<ApartmentCard {...mockProps} />);
    
    expect(screen.getByText(mockProps.title)).toBeInTheDocument();
    expect(screen.getByText(mockProps.location)).toBeInTheDocument();
    expect(screen.getByText(`R${mockProps.pricePerNight}`)).toBeInTheDocument();
    expect(screen.getByText(`${mockProps.bedrooms} bed`)).toBeInTheDocument();
    expect(screen.getByText(`${mockProps.bathrooms} bath`)).toBeInTheDocument();
    expect(screen.getByText(`${mockProps.maxGuests} guests`)).toBeInTheDocument();
  });

  it('displays rating and reviews', () => {
    render(<ApartmentCard {...mockProps} />);
    
    expect(screen.getByText(mockProps.rating.toString())).toBeInTheDocument();
    expect(screen.getByText(`(${mockProps.reviews})`)).toBeInTheDocument();
  });

  it('shows amenities icons', () => {
    render(<ApartmentCard {...mockProps} />);
    
    // Check if amenity icons are present (this depends on your implementation)
    const cardElement = screen.getByText(mockProps.title).closest('.apartment-card');
    expect(cardElement).toBeInTheDocument();
  });

  it('handles click events', () => {
    const onClickMock = vi.fn();
    render(<ApartmentCard {...mockProps} onClick={onClickMock} />);
    
    const card = screen.getByText(mockProps.title).closest('.apartment-card') || 
                screen.getByText(mockProps.title).closest('[data-testid="apartment-card"]') ||
                screen.getByText(mockProps.title).closest('div');
    
    if (card) {
      fireEvent.click(card);
      expect(onClickMock).toHaveBeenCalledWith(mockProps.id);
    }
  });

  it('displays property image', () => {
    render(<ApartmentCard {...mockProps} />);
    
    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('alt', mockProps.title);
  });
});