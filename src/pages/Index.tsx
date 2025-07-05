
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

const Index = () => {
  const { user: localUser } = useAuth();
  const { user: supabaseUser, isAuthenticated } = useSupabaseAuth();
  
  // Проверяем авторизацию
  const isLoggedIn = isAuthenticated || localUser;
  
  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  } else {
    return <Navigate to="/auth" replace />;
  }
};

export default Index;
