import { createContext, useContext, useEffect, useReducer } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bkkmhkpizbtpgcszpgsf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJra21oa3BpemJ0cGdjc3pwZ3NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTUyNDE1MTgsImV4cCI6MjAxMDgxNzUxOH0.LIk-aVkIcmtPfbM_1dYxbKd0VeYE2xhqrpJmEyxwWKw'
);

// const BASE_URL = 'http://localhost:8000';

const CitiesContext = createContext();

function reducer(state, action) {
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

const initialState = {
  cities: [],
  isLoading: false,
  currentCity: {},
  error: '',
};

function CitiesProvider({ children }) {
  const [{ cities, isLoading, currentCity, error }, dispatch] = useReducer(
    reducer,
    initialState
  );

  useEffect(() => {
    async function fetchCities() {
      dispatch({ type: 'loading' });
      try {
        const { data } = await supabase.from('countries').select();
        dispatch({ type: 'cities/loaded', payload: data });
      } catch {
        dispatch({
          type: 'rejected',
          payload: 'There was an error loading data...',
        });
      }
    }

    fetchCities();
  }, []);

  async function getCity(id) {
    if (Number(id) === currentCity.id) return;

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

  async function createCity(newCity) {
    dispatch({ type: 'loading' });
    try {
      const { data } = await supabase
        .from('countries')
        .insert(newCity)
        .select();

      dispatch({ type: 'city/created', payload: newCity });
    } catch {
      dispatch({
        type: 'rejected',
        payload: 'There was an error creating the city...',
      });
    }
  }

  async function deleteCity(id) {
    dispatch({ type: 'loading' });
    try {
      const { data } = await supabase.from('countries').delete().eq('id', id);

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
