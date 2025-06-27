// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/hooks/use-theme';
import Index from '@/pages/Index';
import Amenities from '@/pages/Amenities';
import Apartments from '@/pages/Apartments';
import BookingPage from '@/pages/BookingPage';
import Contact from '@/pages/Contact';
import Gallery from '@/pages/Gallery';
import NotFound from '@/pages/NotFound';

const App = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/amenities" element={<Amenities />} />
            <Route path="/apartments" element={<Apartments />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;