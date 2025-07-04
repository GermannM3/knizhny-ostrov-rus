import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSync } from '@/hooks/useSync';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Search, 
  ShoppingBag, 
  Heart,
  PenTool,
  RefreshCw,
  Library
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Navigation = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toast } = useToast();
  
  const { sync, isLoading, canSync, hasCloudStorage } = useSync();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const handleSync = async () => {
    if (isLoading) return;
    
    if (!canSync) {
      toast({
        title: "Синхронизация недоступна",
        description: "Telegram ID не найден",
        variant: "destructive"
      });
      return;
    }
    
    const result = await sync();
    
    toast({
      title: result.success ? "Синхронизация завершена" : "Ошибка синхронизации",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });

    // Перезагружаем только если были реальные изменения
    if (result.success && result.message.includes('Синхронизировано') && !result.message.includes('Нет изменений')) {
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  const navItems = [
    { 
      path: '/library', 
      label: 'Библиотека', 
      icon: Library,
      public: true 
    },
    { 
      path: '/find-books', 
      label: 'Найти книгу', 
      icon: Search,
      public: true 
    },
    ...(isAuthenticated ? [
      { 
        path: '/purchased', 
        label: 'Купленные', 
        icon: ShoppingBag,
        public: false 
      },
      { 
        path: '/favorites', 
        label: 'Избранное', 
        icon: Heart,
        public: false 
      },
      { 
        path: '/dashboard', 
        label: 'Мои публикации', 
        icon: PenTool,
        public: false 
      },
      { 
        path: '/profile', 
        label: 'Профиль', 
        icon: User,
        public: false 
      }
    ] : [])
  ];

  return (
    <nav className="glass-card sticky top-0 z-50 border-b border-white/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Логотип */}
          <Link 
            to="/library" 
            className="flex items-center space-x-2 text-white hover:text-amber-400 transition-colors"
          >
            <BookOpen className="h-8 w-8 text-amber-400" />
            <span className="font-bold text-xl">Книжный остров</span>
          </Link>

          {/* Десктопная навигация */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Кнопки действий */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Кнопка синхронизации */}
            {canSync && (
              <Button
                onClick={handleSync}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Синхронизация...' : 'Синхронизация'}
              </Button>
            )}

            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-300">
                  Привет, {user?.name}!
                </span>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Выход
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <User className="h-4 w-4 mr-2" />
                  Войти
                </Button>
              </Link>
            )}
          </div>

          {/* Мобильное меню кнопка */}
          <Button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            variant="ghost"
            size="sm"
            className="md:hidden text-white hover:bg-white/10"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Мобильная навигация */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
              <div className="pt-4 mt-4 border-t border-white/20">
                {/* Кнопка синхронизации */}
                {canSync && (
                  <Button
                    onClick={() => {
                      handleSync();
                      setIsMenuOpen(false);
                    }}
                    disabled={isLoading}
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10 w-full mb-2"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    {isLoading ? 'Синхронизация...' : 'Синхронизация'}
                  </Button>
                )}

                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-300 px-3">
                      Привет, {user?.name}!
                    </div>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-white hover:bg-white/10 w-full"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Выход
                    </Button>
                  </div>
                ) : (
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-white hover:bg-white/10 w-full"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Войти
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
