// App utilities and constants - separate from context for fast refresh

export interface User {
  id: string;
  email: string;
  name?: string;
  isAdmin?: boolean;
}

export interface Experience {
  id: string;
  title: string;
  duration: string;
  difficulty: string;
  price: number;
  description: string;
  features: string[];
  images: string[];
  location: string;
  rating?: number;
  reviews?: number;
}

export interface AppState {
  user: User | null;
  isLoading: boolean;
  currentExperience: Experience | null;
  experiences: Experience[];
}

export const initialState: AppState = {
  user: null,
  isLoading: false,
  currentExperience: null,
  experiences: [],
};

export type AppAction = 
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CURRENT_EXPERIENCE'; payload: Experience | null }
  | { type: 'SET_EXPERIENCES'; payload: Experience[] }
  | { type: 'CLEAR_STATE' };

export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_CURRENT_EXPERIENCE':
      return { ...state, currentExperience: action.payload };
    case 'SET_EXPERIENCES':
      return { ...state, experiences: action.payload };
    case 'CLEAR_STATE':
      return initialState;
    default:
      return state;
  }
};
