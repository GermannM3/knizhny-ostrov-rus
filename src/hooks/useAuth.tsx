
import { useState, useEffect, createContext, useContext } from 'react';
import { User } from '@/types';
import { getCurrentUser, loginUser, logoutUser, saveUser } from '@/utils/storage';
import { debugStorage } from '@/utils/debug';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateAuthUser: (updatedUser: User) => void;
}

const AuthContext = createContext<{
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateAuthUser: (updatedUser: User) => void;
}>({
  user: null,
  isAuthenticated: false,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  updateAuthUser: () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    console.log('🔍 AuthProvider: Инициализация...');
    
    // Запускаем диагностику при старте
    debugStorage();
    
    const currentUser = getCurrentUser();
    console.log('👤 Текущий пользователь из storage:', currentUser);
    
    if (currentUser) {
      setUser(currentUser);
      setIsAuthenticated(true);
      console.log('✅ Пользователь автоматически авторизован:', currentUser.email);
    } else {
      console.log('❌ Пользователь не найден в storage');
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Попытка входа:', { email, password: '[СКРЫТ]' });
      console.log('📊 Диагностика перед входом:');
      debugStorage();
      
      const loggedUser = loginUser(email, password);
      if (loggedUser) {
        console.log('✅ Пользователь успешно вошел:', loggedUser);
        setUser(loggedUser);
        setIsAuthenticated(true);
        return true;
      } else {
        console.log('❌ Ошибка входа - неверные данные');
        return false;
      }
    } catch (error) {
      console.error('💥 Критическая ошибка в AuthProvider.login:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      console.log('📝 Попытка регистрации:', { email, name, password: '[СКРЫТ]' });
      const newUser = saveUser({ email, password, name });
      console.log('✅ Пользователь успешно зарегистрирован:', newUser);
      setUser(newUser);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('💥 Ошибка в AuthProvider.register:', error);
      return false;
    }
  };

  const logout = () => {
    console.log('🚪 Выход из системы');
    logoutUser();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateAuthUser = (updatedUser: User) => {
    console.log('🔄 Обновление данных пользователя:', updatedUser);
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      register,
      logout,
      updateAuthUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
