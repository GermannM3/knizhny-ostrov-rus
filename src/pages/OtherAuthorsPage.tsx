
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getOtherAuthorsBooks, debugLogAllBooks } from '@/utils/storage';
import { Book } from '@/types';
import BookCard from '@/components/BookCard';
import Navigation from '@/components/Navigation';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Users, Filter } from 'lucide-react';
import { genres } from '@/data/bookCovers';

const OtherAuthorsPage = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('views');

  const loadBooks = () => {
    if (user) {
      const otherBooks = getOtherAuthorsBooks(user.id);
      setBooks(otherBooks);
      setFilteredBooks(otherBooks);
      
      // Отладочный вывод
      console.log('📚 Книги других авторов загружены:', otherBooks.length);
      debugLogAllBooks();
    }
  };

  useEffect(() => {
    loadBooks();
  }, [user]);

  useEffect(() => {
    let filtered = [...books];

    // Поиск
    if (searchTerm) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Фильтр по жанру
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(book => book.genre === selectedGenre);
    }

    // Сортировка
    switch (sortBy) {
      case 'views':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'date':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
        break;
      case 'author':
        filtered.sort((a, b) => {
          const authorA = a.author?.name || '';
          const authorB = b.author?.name || '';
          return authorA.localeCompare(authorB, 'ru');
        });
        break;
    }

    setFilteredBooks(filtered);
  }, [books, searchTerm, selectedGenre, sortBy]);

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-3 mb-8">
          <Users className="h-8 w-8 text-purple-400" />
          <h1 className="text-3xl font-bold text-white">Книги других авторов</h1>
        </div>

        {/* Фильтры и поиск */}
        <div className="glass-card p-6 mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск по названию, автору..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
            
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Все жанры" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все жанры</SelectItem>
                {genres.map(genre => (
                  <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Сортировка" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="views">По популярности</SelectItem>
                <SelectItem value="date">По дате добавления</SelectItem>
                <SelectItem value="title">По названию</SelectItem>
                <SelectItem value="author">По автору</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              onClick={() => {
                setSearchTerm('');
                setSelectedGenre('all');
                setSortBy('views');
              }}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Filter className="h-4 w-4 mr-2" />
              Сбросить
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-300">
            Найдено книг: {filteredBooks.length}
          </p>
        </div>

        {/* Список книг */}
        {filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <div className="glass-card p-8 max-w-md mx-auto">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {books.length === 0 ? 'Пока нет публичных книг' : 'Книги не найдены'}
              </h3>
              <p className="text-gray-300">
                {books.length === 0 
                  ? 'Станьте первым, кто опубликует книгу для сообщества!'
                  : 'Попробуйте изменить фильтры поиска'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <div key={book.id} className="space-y-2">
                <BookCard
                  book={book}
                  onUpdate={loadBooks}
                  showActions={false}
                />
                <div className="text-center">
                  <p className="text-sm text-gray-400">
                    ✍️ {book.author?.name || 'Неизвестный автор'}
                  </p>
                  {book.author?.telegram_id && (
                    <p className="text-xs text-blue-400">
                      TG ID: {book.author.telegram_id}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OtherAuthorsPage;
