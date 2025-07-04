
import { useState, useEffect } from 'react';
import { Book } from '@/types';
import Navigation from '@/components/Navigation';
import BookCard from '@/components/BookCard';
import { Heart, BookOpen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getUserFavorites } from '@/utils/storage';

const FavoritesPage = () => {
  const [favoriteBooks, setFavoriteBooks] = useState<Book[]>([]);
  const { user, isAuthenticated } = useAuth();

  const loadFavorites = () => {
    if (user) {
      const favorites = getUserFavorites(user.id);
      setFavoriteBooks(favorites);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [user]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="glass-card p-8 max-w-md mx-auto">
              <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Требуется авторизация
              </h3>
              <p className="text-gray-300">
                Войдите в систему для просмотра избранных книг
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-3 mb-8">
          <Heart className="h-8 w-8 text-amber-400" />
          <h1 className="text-3xl font-bold text-white">Избранные книги</h1>
        </div>

        <p className="text-gray-300 mb-6">
          В избранном: {favoriteBooks.length} {favoriteBooks.length === 1 ? 'книга' : 'книг'}
        </p>

        {/* Список книг */}
        {favoriteBooks.length === 0 ? (
          <div className="text-center py-12">
            <div className="glass-card p-8 max-w-md mx-auto">
              <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                У вас пока нет избранных книг
              </h3>
              <p className="text-gray-300 mb-4">
                Добавляйте понравившиеся книги в избранное, нажимая на сердечко
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onUpdate={loadFavorites}
                showActions={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
