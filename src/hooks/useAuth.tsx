
import { useState, useEffect, createContext, useContext } from 'react';
import { User } from '@/types';
import { getCurrentUser, loginUser, logoutUser, saveUser } from '@/utils/storage';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      console.log('Найден сохраненный пользователь:', currentUser.email);
      setUser(currentUser);
      setIsAuthenticated(true);
    } else {
      console.log('Сохраненный пользователь не найден');
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Попытка входа через AuthProvider:', email);
      const loggedUser = loginUser(email, password);
      if (loggedUser) {
        console.log('Пользователь успешно вошел:', loggedUser.email);
        setUser(loggedUser);
        setIsAuthenticated(true);
        return true;
      } else {
        console.log('Ошибка входа в AuthProvider');
        return false;
      }
    } catch (error) {
      console.error('Ошибка в AuthProvider.login:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      console.log('Попытка регистрации через AuthProvider:', email);
      const newUser = saveUser({ email, password, name });
      console.log('Пользователь успешно зарегистрирован:', newUser.email);
      setUser(newUser);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Ошибка в AuthProvider.register:', error);
      return false;
    }
  };

  const logout = () => {
    console.log('Выход из системы');
    logoutUser();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
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
