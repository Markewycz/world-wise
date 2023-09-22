import { createContext, useContext, useReducer } from 'react';

const AuthContext = createContext<{
  user: User | undefined;
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  logout: () => void;
}>({
  user: undefined,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

type AuthProviderProps = {
  children: React.ReactNode;
};

type User = null | {
  name: string;
  email: string;
  password: string;
  avatar: string;
};

type State = {
  user: User | undefined;
  isAuthenticated: boolean;
};

interface Action<T, P = undefined> {
  type: T;
  payload?: P;
}

type TypeAction = Action<'login', User> | Action<'logout'>;

type reducerFunc = (state: State, action: TypeAction) => State;

function reducer(state: State, action: TypeAction) {
  switch (action.type) {
    case 'login':
      return { ...state, user: action.payload, isAuthenticated: true };
    case 'logout':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
      };
    default:
      throw new Error('Uknown action');
  }
}

const initialState = {
  user: null,
  isAuthenticated: false,
};

const FAKE_USER = {
  name: 'John',
  email: 'john@example.com',
  password: 'qwerty',
  avatar: 'https://i.pravatar.cc/100?u=zz',
};

function AuthProvider({ children }: AuthProviderProps) {
  const [{ user, isAuthenticated }, dispatch] = useReducer<reducerFunc>(
    reducer,
    initialState
  );

  function login(email: string, password: string) {
    if (email == FAKE_USER.email && password === FAKE_USER.password)
      dispatch({ type: 'login', payload: FAKE_USER });
  } 
  function logout() {
    dispatch({ type: 'logout' });
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw new Error('AuthContext was used outside of AuthProvider');

  return context;
}

export { AuthProvider, useAuth };
