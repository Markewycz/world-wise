import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/FakeAuthContext';
import { useEffect } from 'react';

type ProtectedRoute = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRoute) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? children : null;
}
