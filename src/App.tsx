
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SupabaseAuthProvider } from "@/hooks/useSupabaseAuth";
import TelegramAuth from "@/components/TelegramAuth";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import CreateBook from "./pages/CreateBook";
import EditBook from "./pages/EditBook";
import EditChapter from "./pages/EditChapter";
import ReadBook from "./pages/ReadBook";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import LibraryPage from "./pages/LibraryPage";
import FindBooksPage from "./pages/FindBooksPage";
import OtherAuthorsPage from "./pages/OtherAuthorsPage";
import PurchasedBooksPage from "./pages/PurchasedBooksPage";
import FavoritesPage from "./pages/FavoritesPage";
import NotFound from "./pages/NotFound";
import TorrentLibrary from "./pages/TorrentLibrary";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SupabaseAuthProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <TelegramAuth />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/create" element={<CreateBook />} />
                <Route path="/edit/:id" element={<EditBook />} />
                <Route path="/edit/:bookId/add-chapter" element={<EditChapter />} />
                <Route path="/edit/:bookId/chapter/:chapterId" element={<EditChapter />} />
                <Route path="/read/:id" element={<ReadBook />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/library" element={<LibraryPage />} />
                <Route path="/find-books" element={<FindBooksPage />} />
                <Route path="/other-authors" element={<OtherAuthorsPage />} />
                <Route path="/purchased" element={<PurchasedBooksPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/torrent-library" element={<TorrentLibrary />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </SupabaseAuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
