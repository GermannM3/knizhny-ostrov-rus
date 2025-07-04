
import { useState, useEffect } from 'react';
import { Book } from '@/types';
import Navigation from '@/components/Navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { purchaseBook, isPurchased } from '@/utils/storage';
import { useToast } from '@/hooks/use-toast';

const FindBooksPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [externalBooks, setExternalBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [purchasedBooks, setPurchasedBooks] = useState<Set<string>>(new Set());
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Эмулируем внешние книги (позже можно заменить на API)
  const mockExternalBooks: Book[] = [
    {
      id: 'ext-1',
      title: 'Война и мир',
      description: 'Классический роман Льва Толстого о войне 1812 года и судьбах русского дворянства.',
      genre: 'Классическая литература',
      status: 'published',
      coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
      authorId: 'tolstoy',
      createdAt: new Date(),
      updatedAt: new Date(),
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
      createdAt: new Date(),
      updatedAt: new Date(),
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
      coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
      authorId: 'bulgakov',
      createdAt: new Date(),
      updatedAt: new Date(),
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
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 9870,
      isFavorite: false,
      source: 'external',
      format: 'epub',
      price: 279
    }
  ];

  useEffect(() => {
    setExternalBooks(mockExternalBooks);
    setFilteredBooks(mockExternalBooks);
    
    // Загружаем информацию о покупках пользователя
    if (user) {
      const purchased = new Set<string>();
      mockExternalBooks.forEach(book => {
        if (isPurchased(user.id, book.id)) {
          purchased.add(book.id);
        }
      });
      setPurchasedBooks(purchased);
    }
  }, [user]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = externalBooks.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBooks(filtered);
    } else {
      setFilteredBooks(externalBooks);
    }
  }, [searchTerm, externalBooks]);

  const handlePurchase = async (book: Book) => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Требуется авторизация",
        description: "Войдите в систему для покупки книг",
        variant: "destructive"
      });
      return;
    }

    try {
      purchaseBook(user.id, book.id);
      setPurchasedBooks(prev => new Set([...prev, book.id]));
      
      toast({
        title: "Покупка завершена!",
        description: `Книга "${book.title}" добавлена в вашу библиотеку`,
      });
    } catch (error) {
      toast({
        title: "Ошибка покупки",
        description: "Не удалось приобрести книгу",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-3 mb-8">
          <Search className="h-8 w-8 text-amber-400" />
          <h1 className="text-3xl font-bold text-white">Найти книгу</h1>
        </div>

        {/* Форма поиска */}
        <div className="glass-card p-6 mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Поиск книг по названию или описанию..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>
        </div>

        <p className="text-gray-300 mb-6">
          Найдено книг: {filteredBooks.length}
        </p>

        {/* Список книг */}
        {filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <div className="glass-card p-8 max-w-md mx-auto">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Книги не найдены
              </h3>
              <p className="text-gray-300">
                Попробуйте изменить поисковый запрос
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <Card key={book.id} className="book-card group">
                <div className="relative">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <Badge className="absolute top-2 right-2 bg-purple-500/20 text-purple-400 border-purple-500/50">
                    Внешняя
                  </Badge>
                  <Badge className="absolute top-2 left-2 bg-blue-500/20 text-blue-400 border-blue-500/50">
                    {book.format?.toUpperCase()}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white line-clamp-2">
                    {book.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {book.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{book.genre}</span>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{book.views}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-lg font-bold text-amber-400">
                      {book.price} ₽
                    </div>
                  </div>

                  <div className="pt-2">
                    {purchasedBooks.has(book.id) ? (
                      <div className="space-y-2">
                        <Badge className="w-full justify-center bg-green-500/20 text-green-400 border-green-500/50">
                          Куплена
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => window.open(`/read/${book.id}`, '_blank')}
                        >
                          Читать
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => handlePurchase(book)}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-black"
                        disabled={!isAuthenticated}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Купить и читать
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FindBooksPage;
