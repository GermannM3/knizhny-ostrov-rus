
import { useState, useEffect } from 'react';
import { getPublishedBooks, getUsers, getBooks } from '@/utils/storage';
import { Book, User } from '@/types';
import BookCard from '@/components/BookCard';
import Navigation from '@/components/Navigation';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, BookOpen, Filter } from 'lucide-react';
import { genres } from '@/data/bookCovers';

const LibraryPage = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [authors, setAuthors] = useState<{ [key: string]: string }>({});

  const loadBooks = () => {
    // Загружаем все опубликованные книги (внутренние и внешние)
    const allBooks = getBooks().filter(book => book.status === 'published');
    
    // Добавляем внешние книги из FindBooksPage
    const externalBooks: Book[] = [
      {
        id: 'ext-1',
        title: 'Война и мир',
        description: 'Классический роман Льва Толстого о войне 1812 года и судьбах русского дворянства.',
        genre: 'Классическая литература',
        status: 'published',
        coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
        authorId: 'tolstoy',
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date('2023-01-15'),
        views: 15420,
        isFavorite: false,
        source: 'external',
        format: 'pdf',
        price: 299
      },
      {
        id: 'ext-2',
        title: 'Преступление и наказание',
        description: 'Психологический роман Достоевского о моральном конфликте молодого студента.',
        genre: 'Классическая литература',
        status: 'published',
        coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop',
        authorId: 'dostoevsky',
        createdAt: new Date('2023-02-10'),
        updatedAt: new Date('2023-02-10'),
        views: 12350,
        isFavorite: false,
        source: 'external',
        format: 'epub',
        price: 249
      },
      {
        id: 'ext-3',
        title: 'Мастер и Маргарита',
        description: 'Мистический роман Булгакова, переплетающий современность и библейские мотивы.',
        genre: 'Мистика',
        status: 'published',
        coverImage: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=300&h=400&fit=crop',
        authorId: 'bulgakov',
        createdAt: new Date('2023-03-05'),
        updatedAt: new Date('2023-03-05'),
        views: 18900,
        isFavorite: false,
        source: 'external',
        format: 'pdf',
        price: 399
      },
      {
        id: 'ext-4',
        title: 'Анна Каренина',
        description: 'Роман о любви, страсти и трагических последствиях нарушения общественных норм.',
        genre: 'Классическая литература',
        status: 'published',
        coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop',
        authorId: 'tolstoy',
        createdAt: new Date('2023-01-20'),
        updatedAt: new Date('2023-01-20'),
        views: 9870,
        isFavorite: false,
        source: 'external',
        format: 'epub',
        price: 279
      }
    ];
    
    const combinedBooks = [...allBooks, ...externalBooks];
    setBooks(combinedBooks);
    setFilteredBooks(combinedBooks);
    
    // Загружаем информацию об авторах
    const users = getUsers();
    const authorsMap: { [key: string]: string } = {};
    users.forEach(user => {
      authorsMap[user.id] = user.name;
    });
    
    // Добавляем внешних авторов
    authorsMap['tolstoy'] = 'Лев Толстой';
    authorsMap['dostoevsky'] = 'Фёдор Достоевский';
    authorsMap['bulgakov'] = 'Михаил Булгаков';
    
    setAuthors(authorsMap);
  };

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    let filtered = [...books];

    // Поиск
    if (searchTerm) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        authors[book.authorId]?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Фильтр по жанру
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(book => book.genre === selectedGenre);
    }

    // Сортировка
    switch (sortBy) {
      case 'date':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'views':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
        break;
      case 'author':
        filtered.sort((a, b) => {
          const authorA = authors[a.authorId] || '';
          const authorB = authors[b.authorId] || '';
          return authorA.localeCompare(authorB, 'ru');
        });
        break;
    }

    setFilteredBooks(filtered);
  }, [books, searchTerm, selectedGenre, sortBy, authors]);

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-3 mb-8">
          <BookOpen className="h-8 w-8 text-amber-400" />
          <h1 className="text-3xl font-bold text-white">Библиотека</h1>
        </div>

        {/* Фильтры и поиск */}
        <div className="glass-card p-6 mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <SelectItem value="date">По дате добавления</SelectItem>
                <SelectItem value="views">По популярности</SelectItem>
                <SelectItem value="title">По названию</SelectItem>
                <SelectItem value="author">По автору</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              onClick={() => {
                setSearchTerm('');
                setSelectedGenre('all');
                setSortBy('date');
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
          <div className="text-sm text-gray-400">
            Внутренние: {filteredBooks.filter(b => b.source !== 'external').length} | 
            Внешние: {filteredBooks.filter(b => b.source === 'external').length}
          </div>
        </div>

        {/* Список книг */}
        {filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <div className="glass-card p-8 max-w-md mx-auto">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {books.length === 0 ? 'Пока нет книг' : 'Книги не найдены'}
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
                  {book.source === 'external' && (
                    <p className="text-xs text-purple-400">Внешняя книга</p>
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

export default LibraryPage;

