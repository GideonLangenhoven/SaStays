import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
interface User {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'customer';
  phone?: string;
}

interface Property {
  id: string;
  title: string;
  description: string;
  images: string[];
  amenities: string[];
  price: number;
  location: string;
  rules: string[];
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  ownerId: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface Booking {
  id: string;
  propertyId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentMethod?: string;
  createdAt: string;
}

interface AppState {
  user: User | null;
  properties: Property[];
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  selectedProperty: Property | null;
  selectedDates: {
    startDate: Date | null;
    endDate: Date | null;
  };
}

// Actions
type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_PROPERTIES'; payload: Property[] }
  | { type: 'ADD_PROPERTY'; payload: Property }
  | { type: 'UPDATE_PROPERTY'; payload: Property }
  | { type: 'DELETE_PROPERTY'; payload: string }
  | { type: 'SET_BOOKINGS'; payload: Booking[] }
  | { type: 'ADD_BOOKING'; payload: Booking }
  | { type: 'UPDATE_BOOKING'; payload: Booking }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SELECTED_PROPERTY'; payload: Property | null }
  | { type: 'SET_SELECTED_DATES'; payload: { startDate: Date | null; endDate: Date | null } }
  | { type: 'CLEAR_SELECTED_DATES' };

// Initial state
const initialState: AppState = {
  user: null,
  properties: [],
  bookings: [],
  loading: false,
  error: null,
  selectedProperty: null,
  selectedDates: {
    startDate: null,
    endDate: null,
  },
};

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'SET_PROPERTIES':
      return { ...state, properties: action.payload };
    
    case 'ADD_PROPERTY':
      return { ...state, properties: [...state.properties, action.payload] };
    
    case 'UPDATE_PROPERTY':
      return {
        ...state,
        properties: state.properties.map(p => 
          p.id === action.payload.id ? action.payload : p
        ),
      };
    
    case 'DELETE_PROPERTY':
      return {
        ...state,
        properties: state.properties.filter(p => p.id !== action.payload),
      };
    
    case 'SET_BOOKINGS':
      return { ...state, bookings: action.payload };
    
    case 'ADD_BOOKING':
      return { ...state, bookings: [...state.bookings, action.payload] };
    
    case 'UPDATE_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map(b => 
          b.id === action.payload.id ? action.payload : b
        ),
      };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_SELECTED_PROPERTY':
      return { ...state, selectedProperty: action.payload };
    
    case 'SET_SELECTED_DATES':
      return { ...state, selectedDates: action.payload };
    
    case 'CLEAR_SELECTED_DATES':
      return { 
        ...state, 
        selectedDates: { startDate: null, endDate: null } 
      };
    
    default:
      return state;
  }
};

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Helper functions
  login: (user: User) => void;
  logout: () => void;
  selectProperty: (property: Property) => void;
  selectDates: (startDate: Date, endDate: Date) => void;
  clearSelection: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Helper functions
  const login = (user: User) => {
    dispatch({ type: 'SET_USER', payload: user });
    localStorage.setItem('user', JSON.stringify(user));
  };

  const logout = () => {
    dispatch({ type: 'SET_USER', payload: null });
    localStorage.removeItem('user');
  };

  const selectProperty = (property: Property) => {
    dispatch({ type: 'SET_SELECTED_PROPERTY', payload: property });
  };

  const selectDates = (startDate: Date, endDate: Date) => {
    dispatch({ 
      type: 'SET_SELECTED_DATES', 
      payload: { startDate, endDate } 
    });
  };

  const clearSelection = () => {
    dispatch({ type: 'SET_SELECTED_PROPERTY', payload: null });
    dispatch({ type: 'CLEAR_SELECTED_DATES' });
  };

  // Initialize user from localStorage
  React.useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: 'SET_USER', payload: user });
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const value: AppContextType = {
    state,
    dispatch,
    login,
    logout,
    selectProperty,
    selectDates,
    clearSelection,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Selectors
export const useAuth = () => {
  const { state } = useApp();
  return {
    user: state.user,
    isAuthenticated: !!state.user,
    isOwner: state.user?.role === 'owner',
    isCustomer: state.user?.role === 'customer',
  };
};

export const useProperties = () => {
  const { state } = useApp();
  return {
    properties: state.properties,
    selectedProperty: state.selectedProperty,
  };
};

export const useBookings = () => {
  const { state } = useApp();
  return {
    bookings: state.bookings,
    selectedDates: state.selectedDates,
  };
};

// Demo component to show context usage
const AppContextDemo = () => {
  const { state, login, logout, selectProperty } = useApp();
  const { isAuthenticated, user } = useAuth();

  const handleLogin = () => {
    const mockUser: User = {
      id: '1',
      email: 'owner@example.com',
      name: 'John Doe',
      role: 'owner',
      phone: '+27123456789',
    };
    login(mockUser);
  };

  const mockProperty: Property = {
    id: '1',
    title: 'Beachfront Villa',
    description: 'Stunning beachfront property with ocean views',
    images: ['/api/placeholder/400/300'],
    amenities: ['WiFi', 'Pool', 'Parking'],
    price: 1500,
    location: 'Cape Town, South Africa',
    rules: ['No smoking', 'No pets'],
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2,
    ownerId: '1',
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">SaStays App Context Demo</h2>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Authentication Status</h3>
          <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
          {user && (
            <div className="mt-2">
              <p>Name: {user.name}</p>
              <p>Email: {user.email}</p>
              <p>Role: {user.role}</p>
            </div>
          )}
        </div>

        <div className="space-x-2">
          {!isAuthenticated ? (
            <button 
              onClick={handleLogin}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Login as Owner
            </button>
          ) : (
            <button 
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          )}
        </div>

        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Application State</h3>
          <p>Properties: {state.properties.length}</p>
          <p>Bookings: {state.bookings.length}</p>
          <p>Loading: {state.loading ? 'Yes' : 'No'}</p>
          <p>Selected Property: {state.selectedProperty?.title || 'None'}</p>
        </div>

        <button 
          onClick={() => selectProperty(mockProperty)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Select Mock Property
        </button>
      </div>
    </div>
  );
};

export default AppContextDemo; 