
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import TelegramAuthComponent from '@/components/TelegramAuthComponent';

const AuthPage = () => {
  const { isAuthenticated } = useSupabaseAuth();
  const navigate = useNavigate();

  // Если пользователь уже авторизован, перенаправляем на дашборд
  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const handleAuthSuccess = () => {
    navigate('/dashboard');
  };

  return <TelegramAuthComponent onAuthSuccess={handleAuthSuccess} />;
};

export default AuthPage;
