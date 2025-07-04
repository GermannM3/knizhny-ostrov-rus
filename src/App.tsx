
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
import NotFound from "./pages/NotFound";
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
  const { isReady, isTelegramApp } = useTelegram();

  useEffect(() => {
    // Добавляем Telegram Web App скрипт если его нет
    if (!window.Telegram && !document.querySelector('script[src*="telegram-web-app.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-web-app.js';
      script.async = true;
      document.head.appendChild(script);
      console.log('Telegram Web App скрипт добавлен');
    }
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-white">Загрузка приложения...</p>
          {isTelegramApp && <p className="text-gray-300 text-sm mt-2">Инициализация Telegram Web App</p>}
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
          </AuthProvider>
        </TelegramWrapper>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
