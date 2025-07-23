import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { User, Vehicle, Booking, Region } from '../types';
import { regions, vehicles } from '../data/mockData';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

interface AppState {
  user: User | null;
  selectedRegion: Region;
  vehicles: Vehicle[];
  bookings: Booking[];
  isLoading: boolean;
  showAuthModal: boolean;
  authSuccessCallback?: () => void;
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_REGION'; payload: Region }
  | { type: 'ADD_BOOKING'; payload: Booking }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SHOW_AUTH_MODAL'; payload?: () => void }
  | { type: 'HIDE_AUTH_MODAL' };

const initialState: AppState = {
  user: null,
  selectedRegion: regions[0],
  vehicles,
  bookings: [],
  isLoading: true, // Start with loading while checking auth
  showAuthModal: false,
  authSuccessCallback: undefined,
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_REGION':
      return { ...state, selectedRegion: action.payload };
    case 'ADD_BOOKING':
      return { ...state, bookings: [...state.bookings, action.payload] };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'UPDATE_USER':
      return { ...state, user: state.user ? { ...state.user, ...action.payload } : null };
    case 'SHOW_AUTH_MODAL':
      return { 
        ...state, 
        showAuthModal: true, 
        authSuccessCallback: action.payload 
      };
    case 'HIDE_AUTH_MODAL':
      return { 
        ...state, 
        showAuthModal: false, 
        authSuccessCallback: undefined 
      };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize Firebase auth state
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user) => {
      dispatch({ type: 'SET_USER', payload: user });
      if (user) {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    });

    // Check for existing user on app start
    authService.getCurrentUser().then((user) => {
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_LOADING', payload: false });
    }).catch((error) => {
      console.error('Error getting current user:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    });

    return unsubscribe;
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}