
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { getUserBooks } from '@/utils/storage';
import { getUserSupabaseBooks } from '@/utils/supabaseStorage';
import { Book } from '@/types';
import BookCard from '@/components/BookCard';
import Navigation from '@/components/Navigation';
import DiagnosticPanel from '@/components/DiagnosticPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { genres } from '@/data/bookCovers';

const Dashboard = () => {
  const { user: localUser } = useAuth();
  const { user: supabaseUser, isAuthenticated } = useSupabaseAuth();
  const navigate = useNavigate();
  
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Проверяем аутентификацию
  useEffect(() => {
    if (!isAuthenticated && !localUser) {
      navigate('/auth');
    }
  }, [isAuthenticated, localUser, navigate]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      if (supabaseUser) {
        // Загружаем книги из Supabase с правильным маппингом
        const supabaseBooks = await getUserSupabaseBooks(supabaseUser.id);
        setBooks(supabaseBooks);
        setFilteredBooks(supabaseBooks);
      } else if (localUser) {
        // Загружаем книги из localStorage
        const userBooks = getUserBooks(localUser.id);
        setBooks(userBooks);
        setFilteredBooks(userBooks);
      }
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, [supabaseUser, localUser]);

  useEffect(() => {
    let filtered = books;

    if (searchTerm) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedGenre !== 'all') {
      filtered = filtered.filter(book => book.genre === selectedGenre);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(book => book.status === selectedStatus);
    }

    setFilteredBooks(filtered);
  }, [books, searchTerm, selectedGenre, selectedStatus]);

  const currentUser = supabaseUser || localUser;

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Мои книги</h1>
            <p className="text-gray-300">
              Управляйте своими произведениями{' '}
              {supabaseUser ? '(Supabase)' : '(localStorage)'}
            </p>
          </div>
          
          <Link to="/create">
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 mt-4 md:mt-0">
              <Plus className="h-4 w-4 mr-2" />
              Создать книгу
            </Button>
          </Link>
        </div>


        {/* Фильтры */}
        <div className="glass-card p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск по названию или описанию..."
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
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="draft">Черновик</SelectItem>
                <SelectItem value="published">Опубликовано</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Список книг */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-white">Загрузка...</div>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <div className="glass-card p-8 max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-white mb-2">
                {books.length === 0 ? 'У вас пока нет книг' : 'Книги не найдены'}
              </h3>
              <p className="text-gray-300 mb-4">
                {books.length === 0 
                  ? 'Создайте свою первую книгу и начните творить!'
                  : 'Попробуйте изменить фильтры поиска'
                }
              </p>
              {books.length === 0 && (
                <Link to="/create">
                  <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Создать первую книгу
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onUpdate={loadBooks}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Админская панель */}
      <DiagnosticPanel />
    </div>
  );
};

export default Dashboard;
