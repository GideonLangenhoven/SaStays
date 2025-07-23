// src/test/pages/Index.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../utils';
import Index from '../../pages/Index';

// Mock components that might have complex dependencies
vi.mock('../../components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>,
}));

vi.mock('../../components/Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>,
}));

vi.mock('../../components/HeroSection', () => ({
  default: () => <div data-testid="hero">Hero Section</div>,
}));

vi.mock('../../components/BookingForm', () => ({
  default: () => <div data-testid="booking-form">Booking Form</div>,
}));

vi.mock('../../components/TestimonialsSection', () => ({
  default: () => <div data-testid="testimonials">Testimonials</div>,
}));

vi.mock('../../components/FacilitiesSection', () => ({
  default: () => <div data-testid="facilities">Facilities</div>,
}));

vi.mock('../../components/ApartmentCard', () => ({
  default: ({ title }: { title: string }) => <div data-testid="apartment-card">{title}</div>,
}));

describe('Index Page (Home)', () => {
  it('renders main page components', () => {
    render(<Index />);
    
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('hero')).toBeInTheDocument();
    expect(screen.getByTestId('booking-form')).toBeInTheDocument();
  });

  it('displays featured apartments section', () => {
    render(<Index />);
    
    // Check if there's some indication of featured apartments
    const featuredSection = screen.getByText(/featured/i) || 
                           screen.getByText(/popular/i) || 
                           screen.getByTestId('featured-apartments');
    
    if (featuredSection) {
      expect(featuredSection).toBeInTheDocument();
    }
  });

  it('renders testimonials and facilities sections', () => {
    render(<Index />);
    
    expect(screen.getByTestId('testimonials')).toBeInTheDocument();
    expect(screen.getByTestId('facilities')).toBeInTheDocument();
  });

  it('displays "View All Apartments" link', () => {
    render(<Index />);
    
    const viewAllLink = screen.getByRole('link', { name: /view all/i }) ||
                       screen.getByText(/view all/i);
    
    if (viewAllLink) {
      expect(viewAllLink).toBeInTheDocument();
    }
  });
});