// src/contexts/AppContextDemo.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Property, Booking, Owner } from '@/types/database';

interface AppState {
  properties: Property[];
  bookings: Booking[];
  selectedProperty: Property | null;
  currentOwner: Owner | null;
  isLoading: boolean;
  error: string | null;
}

interface AppActions {
  setProperties: (properties: Property[]) => void;
  setBookings: (bookings: Booking[]) => void;
  setSelectedProperty: (property: Property | null) => void;
  setCurrentOwner: (owner: Owner | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (id: number, updates: Partial<Booking>) => void;
  addProperty: (property: Property) => void;
  updateProperty: (id: number, updates: Partial<Property>) => void;
}

type AppContextType = AppState & AppActions;

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, setState] = useState<AppState>({
    properties: [],
    bookings: [],
    selectedProperty: null,
    currentOwner: null,
    isLoading: false,
    error: null,
  });

  // Actions
  const setProperties = (properties: Property[]) => {
    setState(prev => ({ ...prev, properties }));
  };

  const setBookings = (bookings: Booking[]) => {
    setState(prev => ({ ...prev, bookings }));
  };

  const setSelectedProperty = (property: Property | null) => {
    setState(prev => ({ ...prev, selectedProperty: property }));
  };

  const setCurrentOwner = (owner: Owner | null) => {
    setState(prev => ({ ...prev, currentOwner: owner }));
  };

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const addBooking = (booking: Booking) => {
    setState(prev => ({
      ...prev,
      bookings: [...prev.bookings, booking]
    }));
  };

  const updateBooking = (id: number, updates: Partial<Booking>) => {
    setState(prev => ({
      ...prev,
      bookings: prev.bookings.map(booking =>
        booking.id === id ? { ...booking, ...updates } : booking
      )
    }));
  };

  const addProperty = (property: Property) => {
    setState(prev => ({
      ...prev,
      properties: [...prev.properties, property]
    }));
  };

  const updateProperty = (id: number, updates: Partial<Property>) => {
    setState(prev => ({
      ...prev,
      properties: prev.properties.map(property =>
        property.id === id ? { ...property, ...updates } : property
      )
    }));
  };

  const contextValue: AppContextType = {
    ...state,
    setProperties,
    setBookings,
    setSelectedProperty,
    setCurrentOwner,
    setLoading,
    setError,
    addBooking,
    updateBooking,
    addProperty,
    updateProperty,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;