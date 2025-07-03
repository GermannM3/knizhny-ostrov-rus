
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserBooks } from '@/utils/storage';
import { Book } from '@/types';
import BookCard from '@/components/BookCard';
import Navigation from '@/components/Navigation';
import { Heart } from 'lucide-react';

const FavoritesPage = () => {
  const { user } = useAuth();
  const [favoriteBooks, setFavoriteBooks] = useState<Book[]>([]);

  const loadFavoriteBooks = () => {
    if (user) {
      const userBooks = getUserBooks(user.id);
      const favorites = userBooks.filter(book => book.isFavorite);
      setFavoriteBooks(favorites);
    }
  };

  useEffect(() => {
    loadFavoriteBooks();
  }, [user]);

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-3 mb-8">
          <Heart className="h-8 w-8 text-red-500 fill-current" />
          <h1 className="text-3xl font-bold text-white">Избранные книги</h1>
        </div>

        {favoriteBooks.length === 0 ? (
          <div className="text-center py-12">
            <div className="glass-card p-8 max-w-md mx-auto">
              <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                У вас пока нет избранных книг
              </h3>
              <p className="text-gray-300">
                Добавляйте книги в избранное, нажимая на сердечко на карточке книги
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onUpdate={loadFavoriteBooks}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
