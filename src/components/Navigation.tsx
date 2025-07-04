
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTelegram } from '@/hooks/useTelegram';
import { Button } from '@/components/ui/button';
import { Book, Heart, Plus, LogOut, Menu, X, BookOpen, User } from 'lucide-react';

const Navigation = () => {
  const { user, logout } = useAuth();
  const { isTelegramApp, user: tgUser } = useTelegram();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/library', label: 'Библиотека', icon: BookOpen },
    { path: '/dashboard', label: 'Мои книги', icon: Book },
    { path: '/create', label: 'Создать книгу', icon: Plus },
    { path: '/favorites', label: 'Избранное', icon: Heart },
    { path: '/profile', label: 'Профиль', icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="glass-card m-4 p-4 sticky top-4 z-50">
      <div className="flex items-center justify-between">
        <Link to="/library" className="flex items-center space-x-2">
          <Book className="h-8 w-8 text-amber-400" />
          <span className="text-xl font-bold gradient-text">
            BookCraft
            {isTelegramApp && (
              <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full ml-2">
                Telegram
              </span>
            )}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive(path)
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-gray-300 hover:text-amber-400 hover:bg-white/10'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          ))}
          
          {user && (
            <>
              <div className="flex items-center space-x-2 text-gray-300">
                <span>{user.name}</span>
                {isTelegramApp && tgUser && (
                  <span className="text-xs text-blue-400">(@{tgUser.username || tgUser.first_name})</span>
                )}
              </div>
              
              <Button 
                onClick={logout}
                variant="ghost" 
                size="sm"
                className="text-gray-300 hover:text-red-400"
                title="Выход"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          variant="ghost"
          size="sm"
          className="md:hidden text-white"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 space-y-2">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 w-full ${
                isActive(path)
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-gray-300 hover:text-amber-400 hover:bg-white/10'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          ))}
          
          {user && (
            <div className="flex items-center justify-between pt-2 border-t border-white/20">
              <div className="flex flex-col space-y-1 text-gray-300">
                <span>{user.name}</span>
                {isTelegramApp && tgUser && (
                  <span className="text-xs text-blue-400">(@{tgUser.username || tgUser.first_name})</span>
                )}
              </div>
              <Button 
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                variant="ghost" 
                size="sm"
                className="text-gray-300 hover:text-red-400"
                title="Выход"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navigation;
