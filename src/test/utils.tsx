// src/test/utils.tsx
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from '../contexts/AppContextDemo';
import { I18nProvider } from '../contexts/I18nContext';

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AppProvider>
          <BrowserRouter>
            {children}
          </BrowserRouter>
        </AppProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Mock data helpers
export const mockProperty = {
  id: 1,
  title: 'Test Property',
  description: 'A beautiful test property',
  location: 'Cape Town, South Africa',
  price_per_night: 850,
  bedrooms: 2,
  bathrooms: 1,
  max_guests: 4,
  amenities: ['wifi', 'parking', 'kitchen'],
  images: ['/test-image.jpg'],
  average_rating: 4.5,
  total_reviews: 23,
};

export const mockUser = {
  id: 1,
  email: 'test@example.com',
  fullName: 'Test User',
  phoneNumber: '+27123456789',
};

export const mockBooking = {
  id: 1,
  property_id: 1,
  customer_email: 'guest@example.com',
  customer_name: 'Test Guest',
  customer_phone: '+27987654321',
  start_date: '2024-03-01',
  end_date: '2024-03-05',
  guests: 2,
  total_amount: 3400,
  status: 'confirmed',
};

export default mockBooking;