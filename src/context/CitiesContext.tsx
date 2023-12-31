import { createContext, useContext, useEffect, useReducer } from 'react';
import { createClient } from '@supabase/supabase-js';

export interface City {
  id: string;
  cityName: string;
  country: string;
  emoji: string;
  date: string | Date;
  notes: string;
  position: {
    lat: number;
    lng: number;
  };
}

type State = {
  cities: City[];
  isLoading: boolean;
  currentCity: City | Record<string, never>;
  error: string;
};

type Action =
  | { type: 'loading' }
  | { type: 'cities/loaded'; payload: City[] }
  | { type: 'city/loaded'; payload: City }
  | { type: 'city/created'; payload: City }
  | { type: 'city/deleted'; payload: string }
  | { type: 'rejected'; payload: string };

type CitiesProviderProps = {
  children: React.ReactNode;
};

const DefaultContext = {
  cities: [],
  isLoading: false,
  currentCity: {},
  error: '',
  getCity: () => {},
  createCity: () => {},
  deleteCity: () => {},
};

interface Context extends State {
  getCity: (id: string) => void;
  createCity: (newCity: City) => void;
  deleteCity: (id: string) => void;
}

const supabase = createClient(
  'https://bkkmhkpizbtpgcszpgsf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJra21oa3BpemJ0cGdjc3pwZ3NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTUyNDE1MTgsImV4cCI6MjAxMDgxNzUxOH0.LIk-aVkIcmtPfbM_1dYxbKd0VeYE2xhqrpJmEyxwWKw'
);

const CitiesContext = createContext<Context>(DefaultContext);

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return {
        ...state,
        isLoading: true,
      };
    case 'cities/loaded':
      return {
        ...state,
        isLoading: false,
        cities: action.payload,
      };
    case 'city/loaded':
      return {
        ...state,
        isLoading: false,
        currentCity: action.payload,
      };
    case 'city/created':
      return {
        ...state,
        isLoading: false,
        cities: [...state.cities, action.payload],
        currentCity: action.payload,
      };
    case 'city/deleted':
      return {
        ...state,
        isLoading: false,
        cities: state.cities.filter(city => city.id !== action.payload),
        currentCity: {},
      };
    case 'rejected':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    default:
      throw new Error('Uknown action type');
  }
}
const initialState: State = {
  cities: [],
  isLoading: false,
  currentCity: {} as City,
  error: '',
};

function CitiesProvider({ children }: CitiesProviderProps) {
  const [{ cities, isLoading, currentCity, error }, dispatch] = useReducer(
    reducer,
    initialState
  );

  useEffect(() => {
    async function fetchCities() {
      dispatch({ type: 'loading' });
      try {
        const { data } = await supabase.from('countries').select();
        dispatch({ type: 'cities/loaded', payload: data || [] });
      } catch {
        dispatch({
          type: 'rejected',
          payload: 'There was an error loading data...',
        });
      }
    }

    fetchCities();
  }, []);

  async function getCity(id: string) {
    dispatch({ type: 'loading' });
    try {
      const { data } = await supabase.from('countries').select().eq('id', id);
      dispatch({ type: 'city/loaded', payload: data?.shift() });
    } catch {
      dispatch({
        type: 'rejected',
        payload: 'There was an error loading data...',
      });
    }
  }

  async function createCity(newCity: City) {
    dispatch({ type: 'loading' });
    try {
      await supabase.from('countries').insert(newCity).select();

      dispatch({ type: 'city/created', payload: newCity });
    } catch {
      dispatch({
        type: 'rejected',
        payload: 'There was an error creating the city...',
      });
    }
  }

  async function deleteCity(id: string) {
    dispatch({ type: 'loading' });
    try {
      await supabase.from('countries').delete().eq('id', id);

      dispatch({ type: 'city/deleted', payload: id });
    } catch {
      dispatch({
        type: 'rejected',
        payload: 'There was an error deleting the city...',
      });
    }
  }

  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        currentCity,
        getCity,
        createCity,
        deleteCity,
        error,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  const context = useContext(CitiesContext);
  if (context === undefined)
    throw new Error('Cities context was used outside of CitiesProvider');
  return context;
}

export { CitiesProvider, useCities };
