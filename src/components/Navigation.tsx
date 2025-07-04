
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTelegram } from '@/hooks/useTelegram';
import { Button } from '@/components/ui/button';
import { Book, Heart, Plus, LogOut, Menu, X, BookOpen, User, RefreshCw } from 'lucide-react';
import { useTelegramSync } from '@/utils/telegramSync';
import { useToast } from '@/hooks/use-toast';

const Navigation = () => {
  const { user, logout } = useAuth();
  const { isTelegramApp, user: tgUser } = useTelegram();
  const { isReady: syncReady, sync, syncToCloud, loadFromCloud } = useTelegramSync();
  const { toast } = useToast();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const navItems = [
    { path: '/library', label: 'Библиотека', icon: BookOpen },
    { path: '/find-books', label: 'Найти книги', icon: BookOpen },
    { path: '/purchased-books', label: 'Купленные книги', icon: Heart },
    { path: '/dashboard', label: 'Мои книги', icon: Book },
    { path: '/create', label: 'Создать книгу', icon: Plus },
    { path: '/favorites', label: 'Избранное', icon: Heart },
    { path: '/profile', label: 'Профиль', icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSync = async () => {
    if (syncing) return;
    
    setSyncing(true);
    try {
      console.log('🔄 Запускаем синхронизацию...');
      
      if (isTelegramApp) {
        // В Telegram WebApp: загружаем данные из облака и синхронизируем обратно
        console.log('📱 Telegram WebApp: полная синхронизация');
        const result = await sync();
        
        if (result) {
          console.log('✅ Синхронизация в Telegram WebApp успешна');
          toast({
            title: "Синхронизация выполнена",
            description: "Данные успешно синхронизированы с облаком",
          });
          // Обновляем страницу для отображения синхронизированных данных
          setTimeout(() => window.location.reload(), 500);
        } else {
          console.log('⚠️ Синхронизация в Telegram WebApp с предупреждениями');
          toast({
            title: "Синхронизация частично выполнена",
            description: "Некоторые данные могли не синхронизироваться",
            variant: "destructive",
          });
        }
      } else {
        // В веб-версии: отправляем данные в облако
        console.log('🌐 Веб-версия: отправляем данные в облако');
        if (syncReady) {
          const result = await syncToCloud();
          
          if (result) {
            console.log('✅ Отправка данных в облако успешна');
            toast({
              title: "Данные отправлены в облако",
              description: "Ваши изменения синхронизированы с Telegram",
            });
          } else {
            console.log('⚠️ Отправка данных в облако с ошибками');
            toast({
              title: "Ошибка синхронизации",
              description: "Не удалось отправить данные в облако",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Синхронизация недоступна",
            description: "Telegram Cloud Storage недоступен",
            variant: "destructive",
          });
        }
      }
      
    } catch (error) {
      console.error('❌ Ошибка синхронизации:', error);
      toast({
        title: "Ошибка синхронизации",
        description: "Произошла ошибка при синхронизации данных",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  // Показываем кнопку синхронизации если есть Telegram WebApp или если это веб-версия с доступом к Cloud Storage
  const showSyncButton = isTelegramApp || syncReady;

  return (
    <nav className="glass-card m-4 p-4 sticky top-4 z-50">
      <div className="flex items-center justify-between">
        <Link to="/library" className="flex items-center space-x-2">
          <Book className="h-8 w-8 text-amber-400" />
          <div className="flex items-center">
            <span className="text-xl font-bold gradient-text">BookCraft</span>
            {isTelegramApp && (
              <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full ml-2">
                Telegram
              </span>
            )}
          </div>
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
              
              {showSyncButton && (
                <Button
                  onClick={handleSync}
                  disabled={syncing}
                  variant="outline"
                  size="sm"
                  className="text-green-400 border-green-500/50 hover:bg-green-500/20"
                  title={isTelegramApp ? "Синхронизировать с веб-версией" : "Отправить данные в Telegram"}
                >
                  <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                </Button>
              )}
              
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
              <div className="flex items-center space-x-2">
                {showSyncButton && (
                  <Button
                    onClick={handleSync}
                    disabled={syncing}
                    variant="outline"
                    size="sm"
                    className="text-green-400 border-green-500/50"
                    title={isTelegramApp ? "Синхронизировать" : "Отправить в Telegram"}
                  >
                    <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                  </Button>
                )}
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
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navigation;
