
import { useState, useEffect } from 'react';
import { Book } from '@/types';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ShoppingBag, BookOpen, Download, Eye, Play } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getPurchasedBooks, getUserReadingProgress } from '@/utils/storage';
import { useToast } from '@/hooks/use-toast';

const PurchasedBooksPage = () => {
  const [purchasedBooks, setPurchasedBooks] = useState<Book[]>([]);
  const [readingProgress, setReadingProgress] = useState<{ [key: string]: number }>({});
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      const books = getPurchasedBooks(user.id);
      setPurchasedBooks(books);
      
      // Загружаем прогресс чтения для каждой книги
      const progressMap: { [key: string]: number } = {};
      books.forEach(book => {
        const progress = getUserReadingProgress(user.id, book.id);
        progressMap[book.id] = progress?.progress || 0;
      });
      setReadingProgress(progressMap);
    }
  }, [user]);

  const handleDownload = (book: Book) => {
    toast({
      title: "Скачивание начато",
      description: `Скачивание книги "${book.title}" (${book.format?.toUpperCase()}) начато`,
    });
    
    // Создаем фиктивную ссылку для скачивания
    const link = document.createElement('a');
    link.href = '#';
    link.download = `${book.title}.${book.format}`;
    link.click();
  };

  const handleRead = (book: Book) => {
    window.open(`/read/${book.id}`, '_blank');
  };

  const handleContinueReading = (book: Book) => {
    window.location.href = `/read/${book.id}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="glass-card p-8 max-w-md mx-auto">
              <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Требуется авторизация
              </h3>
              <p className="text-gray-300">
                Войдите в систему для просмотра купленных книг
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
          <ShoppingBag className="h-8 w-8 text-amber-400" />
          <h1 className="text-3xl font-bold text-white">Купленные книги</h1>
        </div>

        <p className="text-gray-300 mb-6">
          Ваша коллекция: {purchasedBooks.length} {purchasedBooks.length === 1 ? 'книга' : 'книг'}
        </p>

        {/* Список книг */}
        {purchasedBooks.length === 0 ? (
          <div className="text-center py-12">
            <div className="glass-card p-8 max-w-md mx-auto">
              <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                У вас пока нет купленных книг
              </h3>
              <p className="text-gray-300 mb-4">
                Найдите интересные книги и добавьте их в свою библиотеку
              </p>
              <Button 
                onClick={() => window.location.href = '/find-books'}
                className="bg-amber-500 hover:bg-amber-600 text-black"
              >
                Найти книги
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {purchasedBooks.map((book) => {
              const progress = readingProgress[book.id] || 0;
              const hasStartedReading = progress > 0;
              
              return (
                <Card key={book.id} className="book-card group">
                  <div className="relative">
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <Badge className="absolute top-2 right-2 bg-green-500/20 text-green-400 border-green-500/50">
                      Куплена
                    </Badge>
                    <Badge className="absolute top-2 left-2 bg-blue-500/20 text-blue-400 border-blue-500/50">
                      {book.format?.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white line-clamp-2">
                      {book.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {book.description}
                    </p>
                    
                    {hasStartedReading && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Прогресс чтения</span>
                          <span className="text-amber-400 font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{book.genre}</span>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{book.views}</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      {hasStartedReading ? (
                        <Button 
                          onClick={() => handleContinueReading(book)}
                          className="w-full bg-green-500 hover:bg-green-600 text-white"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Продолжить чтение
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleRead(book)}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-black"
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          Начать чтение
                        </Button>
                      )}
                      
                      <Button 
                        onClick={() => handleDownload(book)}
                        variant="outline" 
                        size="sm"
                        className="w-full"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Скачать {book.format?.toUpperCase()}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchasedBooksPage;
