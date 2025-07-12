// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/hooks/use-theme';
import Index from '@/pages/Index';
import Amenities from '@/pages/Amenities';
import Apartments from '@/pages/Apartments';
import ApartmentPage from '@/pages/ApartmentPage'; // <-- Import ApartmentPage
import BookingPage from '@/pages/BookingPage';
import Contact from '@/pages/Contact';
import Gallery from '@/pages/Gallery';
import RateYourStay from '@/pages/RateYourStay'; // <-- Import RateYourStay
import NotFound from '@/pages/NotFound';
import OwnerLogin from '@/pages/OwnerLogin';
import OwnerDashboard from '@/pages/OwnerDashboard';
import OwnerRegister from '@/pages/OwnerRegister';

const App = () => {
  return (
    <ThemeProvider defaultTheme="light">
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/amenities" element={<Amenities />} />
            <Route path="/apartments" element={<Apartments />} />
            <Route path="/apartments/:id" element={<ApartmentPage />} /> {/* <-- Add route for single apartment */}
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/rate-your-stay" element={<RateYourStay />} /> {/* <-- Add route for rating */}
            <Route path="/owner-login" element={<OwnerLogin />} />
            <Route path="/owner-dashboard" element={<OwnerDashboard />} />
            <Route path="/owner-register" element={<OwnerRegister />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;