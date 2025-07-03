
import { useState, useEffect } from 'react';
import { getPublishedBooks, getUsers } from '@/utils/storage';
import { Book, User } from '@/types';
import BookCard from '@/components/BookCard';
import Navigation from '@/components/Navigation';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, BookOpen } from 'lucide-react';
import { genres } from '@/data/bookCovers';

const LibraryPage = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [authors, setAuthors] = useState<{ [key: string]: string }>({});

  const loadBooks = () => {
    const publishedBooks = getPublishedBooks();
    setBooks(publishedBooks);
    setFilteredBooks(publishedBooks);
    
    // Загружаем информацию об авторах
    const users = getUsers();
    const authorsMap: { [key: string]: string } = {};
    users.forEach(user => {
      authorsMap[user.id] = user.name;
    });
    setAuthors(authorsMap);
  };

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    let filtered = books;

    if (searchTerm) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        authors[book.authorId]?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedGenre !== 'all') {
      filtered = filtered.filter(book => book.genre === selectedGenre);
    }

    setFilteredBooks(filtered);
  }, [books, searchTerm, selectedGenre, authors]);

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-3 mb-8">
          <BookOpen className="h-8 w-8 text-amber-400" />
          <h1 className="text-3xl font-bold text-white">Библиотека</h1>
        </div>

        {/* Фильтры */}
        <div className="glass-card p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск по названию, автору или описанию..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
            
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Выберите жанр" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все жанры</SelectItem>
                {genres.map(genre => (
                  <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="text-gray-300 mb-6">
          Найдено книг: {filteredBooks.length}
        </p>

        {/* Список книг */}
        {filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <div className="glass-card p-8 max-w-md mx-auto">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {books.length === 0 ? 'Пока нет опубликованных книг' : 'Книги не найдены'}
              </h3>
              <p className="text-gray-300">
                {books.length === 0 
                  ? 'Станьте первым автором и опубликуйте свою книгу!'
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
                    Автор: {authors[book.authorId] || 'Неизвестно'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryPage;
