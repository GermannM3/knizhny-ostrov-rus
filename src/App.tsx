
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useTelegram } from "@/hooks/useTelegram";
import AuthPage from "./pages/AuthPage";
import LibraryPage from "./pages/LibraryPage";
import Dashboard from "./pages/Dashboard";
import CreateBook from "./pages/CreateBook";
import EditBook from "./pages/EditBook";
import EditChapter from "./pages/EditChapter";
import ReadBook from "./pages/ReadBook";
import FavoritesPage from "./pages/FavoritesPage";
import ProfilePage from "./pages/ProfilePage";
import FindBooksPage from "./pages/FindBooksPage";
import OtherAuthorsPage from "./pages/OtherAuthorsPage";
import PurchasedBooksPage from "./pages/PurchasedBooksPage";
import NotFound from "./pages/NotFound";
import DiagnosticPanel from "./components/DiagnosticPanel";
import { useEffect } from "react";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/library" />;
};

const TelegramWrapper = ({ children }: { children: React.ReactNode }) => {
  const tg = useTelegram();

  useEffect(() => {
    // Добавляем Telegram Web App скрипт если его нет
    if (!window.Telegram && !document.querySelector('script[src*="telegram-web-app.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://telegram-web-app.js';
      script.async = true;
      document.head.appendChild(script);
      console.log('Telegram Web App скрипт добавлен');
    }
  }, []);

  // Автоматическая регистрация/авторизация через Telegram
  useEffect(() => {
    if (tg.isReady && tg.isTelegramApp && tg.telegramId && tg.user) {
      const initTelegramUser = async () => {
        try {
          console.log('🚀 Инициализация пользователя Telegram...');
          
          const { createOrGetUserByTelegramId, debugLogAllBooks, getPublicBooks } = await import('@/utils/storage');
          
          // Создаем или получаем пользователя по telegram_id
          const user = createOrGetUserByTelegramId(tg.telegramId!, tg.user);
          console.log('👤 Пользователь Telegram инициализирован:', user.name, user.telegram_id);
          
          // Загружаем публичные книги
          const publicBooks = getPublicBooks();
          console.log('📚 Загружено публичных книг:', publicBooks.length);
          
          // Отладочный вывод всех книг
          debugLogAllBooks();
          
          // Автоматическая синхронизация данных если доступна
          if (tg.cloudStorageReady) {
            console.log('🔄 Запуск автоматической синхронизации...');
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const { fullSync } = await import('@/utils/telegramSync');
            const result = await fullSync(tg);
            
            if (result.success) {
              console.log('✅ Автоматическая синхронизация выполнена');
              setTimeout(() => window.location.reload(), 1000);
            } else {
              console.log('ℹ️ Синхронизация завершена без изменений');
            }
          } else {
            console.log('⚠️ Cloud Storage недоступен, синхронизация отключена');
          }
          
        } catch (error) {
          console.error('❌ Ошибка инициализации Telegram пользователя:', error);
        }
      };
      
      // Выполняем только один раз за сессию
      const hasInitialized = sessionStorage.getItem('telegram_user_initialized');
      if (!hasInitialized) {
        sessionStorage.setItem('telegram_user_initialized', 'true');
        initTelegramUser();
      }
    }
  }, [tg.isReady, tg.isTelegramApp, tg.telegramId, tg.user, tg.cloudStorageReady]);

  // Режим гостя для обычного браузера
  useEffect(() => {
    if (tg.isReady && !tg.isTelegramApp) {
      console.log('🌐 Режим веб-браузера: загружаем публичные книги');
      
      const loadPublicBooks = async () => {
        try {
          const { getPublicBooks, debugLogAllBooks } = await import('@/utils/storage');
          const publicBooks = getPublicBooks();
          console.log('📚 Загружено публичных книг для гостевого режима:', publicBooks.length);
          debugLogAllBooks();
        } catch (error) {
          console.error('❌ Ошибка загрузки публичных книг:', error);
        }
      };
      
      loadPublicBooks();
    }
  }, [tg.isReady, tg.isTelegramApp]);

  if (!tg.isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-white">Загрузка BookCraft Russia...</p>
          {tg.isTelegramApp && (
            <div className="mt-2 space-y-1">
              <p className="text-gray-300 text-sm">
                Инициализация Telegram Web App
              </p>
              {tg.telegramId && (
                <p className="text-blue-400 text-xs">
                  Telegram ID: {tg.telegramId}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/auth" element={
        <PublicRoute>
          <AuthPage />
        </PublicRoute>
      } />
      <Route path="/library" element={<LibraryPage />} />
      <Route path="/find-books" element={<FindBooksPage />} />
      <Route path="/other-authors" element={<OtherAuthorsPage />} />
      <Route path="/purchased-books" element={
        <ProtectedRoute>
          <PurchasedBooksPage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/create" element={
        <ProtectedRoute>
          <CreateBook />
        </ProtectedRoute>
      } />
      <Route path="/edit/:id" element={
        <ProtectedRoute>
          <EditBook />
        </ProtectedRoute>
      } />
      <Route path="/edit/:bookId/add-chapter" element={
        <ProtectedRoute>
          <EditChapter />
        </ProtectedRoute>
      } />
      <Route path="/edit/:bookId/chapter/:chapterId" element={
        <ProtectedRoute>
          <EditChapter />
        </ProtectedRoute>
      } />
      <Route path="/read/:id" element={<ReadBook />} />
      <Route path="/favorites" element={
        <ProtectedRoute>
          <FavoritesPage />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/library" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <TelegramWrapper>
          <AuthProvider>
            <AppRoutes />
            <DiagnosticPanel />
          </AuthProvider>
        </TelegramWrapper>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
