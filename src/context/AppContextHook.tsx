// App context hook - only exports the context and provider

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { User, Vehicle, Booking, Region, ExplorePlan, BikeTourPlan } from '../types';
import { regions } from '../data/mockData';
import { authService } from '../services/authService';
import { vehiclesService } from '../services/vehiclesService';
import { explorePlansService } from '../services/explorePlansService';
import { bikeToursService } from '../services/bikeToursService';

interface AppState {
  user: User | null;
  selectedRegion: Region;
  vehicles: Vehicle[];
  explorePlans: ExplorePlan[];
  bikeTours: BikeTourPlan[];
  bookings: Booking[];
  isLoading: boolean;
  showAuthModal: boolean;
  authSuccessCallback?: () => void;
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_REGION'; payload: Region }
  | { type: 'SET_VEHICLES'; payload: Vehicle[] }
  | { type: 'SET_EXPLORE_PLANS'; payload: ExplorePlan[] }
  | { type: 'SET_BIKE_TOURS'; payload: BikeTourPlan[] }
  | { type: 'ADD_BOOKING'; payload: Booking }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SHOW_AUTH_MODAL'; payload?: () => void }
  | { type: 'HIDE_AUTH_MODAL' };

const initialState: AppState = {
  user: null,
  selectedRegion: regions[0],
  vehicles: [],
  explorePlans: [],
  bikeTours: [],
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
    case 'SET_VEHICLES':
      return { ...state, vehicles: action.payload };
    case 'SET_EXPLORE_PLANS':
      return { ...state, explorePlans: action.payload };
    case 'SET_BIKE_TOURS':
      return { ...state, bikeTours: action.payload };
    case 'ADD_BOOKING':
      return { ...state, bookings: [...state.bookings, action.payload] };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'UPDATE_USER':
      return { 
        ...state, 
        user: state.user ? { ...state.user, ...action.payload } : null 
      };
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

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check authentication
        const user = await authService.getCurrentUser();
        dispatch({ type: 'SET_USER', payload: user });

        // Load initial data
        const [vehicles, explorePlans, bikeTours] = await Promise.all([
          vehiclesService.getAllVehicles(),
          explorePlansService.getAllExplorePlans(),
          bikeToursService.getAllBikeTours()
        ]);

        dispatch({ type: 'SET_VEHICLES', payload: vehicles });
        dispatch({ type: 'SET_EXPLORE_PLANS', payload: explorePlans });
        dispatch({ type: 'SET_BIKE_TOURS', payload: bikeTours });
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeApp();
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
