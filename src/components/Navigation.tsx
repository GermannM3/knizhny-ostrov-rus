
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Book, Heart, Plus, LogOut, Menu, X } from 'lucide-react';

const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Мои книги', icon: Book },
    { path: '/create', label: 'Создать книгу', icon: Plus },
    { path: '/favorites', label: 'Избранное', icon: Heart },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="glass-card m-4 p-4 sticky top-4 z-50">
      <div className="flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <Book className="h-8 w-8 text-amber-400" />
          <span className="text-xl font-bold gradient-text">BookCraft</span>
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
          
          <div className="flex items-center space-x-2 text-gray-300">
            <span>{user?.name}</span>
          </div>
          
          <Button 
            onClick={logout}
            variant="ghost" 
            size="sm"
            className="text-gray-300 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
          </Button>
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
          
          <div className="flex items-center justify-between pt-2 border-t border-white/20">
            <div className="flex items-center space-x-2 text-gray-300">
              <span>{user?.name}</span>
            </div>
            <Button 
              onClick={logout}
              variant="ghost" 
              size="sm"
              className="text-gray-300 hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
