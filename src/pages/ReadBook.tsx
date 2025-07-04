import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBooks, getBookChapters, updateBook, saveReadingProgress, getUserReadingProgress, addToFavorites, removeFromFavorites, isFavorite } from '@/utils/storage';
import { Book, Chapter } from '@/types';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Sun, Moon, Heart, BookOpen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const ReadBook = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [isBookFavorite, setIsBookFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      const books = getBooks();
      let foundBook = books.find(b => b.id === id && b.status === 'published');
      
      // Если не найдена среди внутренних, ищем среди внешних
      if (!foundBook) {
        const externalBooks: Book[] = [
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
            price: 299,
            is_public: true
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
            price: 249,
            is_public: true
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
            price: 399,
            is_public: true
          },
          {
            id: 'ext-4',
            title: 'Анна Каренина',
            description: 'Роман о любви, страсти и трагических последствиям нарушения общественных норм.',
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
            price: 279,
            is_public: true
          }
        ];
        foundBook = externalBooks.find(b => b.id === id);
      }
      
      if (foundBook) {
        setBook(foundBook);
        
        // Увеличиваем счетчик просмотров только для внутренних книг
        if (foundBook.source !== 'external') {
          updateBook(foundBook.id, { views: foundBook.views + 1 });
        }
        
        // Загружаем главы или создаем фиктивные для внешних книг
        if (foundBook.source === 'external') {
          const mockChapters: Chapter[] = [
            {
              id: `${id}-chapter-1`,
              bookId: id,
              title: 'Глава 1',
              content: `Это первая глава книги "${foundBook.title}". \n\nВ данной версии представлена демонстрационная глава для показа функциональности чтения. \n\nВ полной версии здесь будет настоящий текст книги со всеми главами и содержанием.`,
              chapterNumber: 1,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              id: `${id}-chapter-2`,
              bookId: id,
              title: 'Глава 2',
              content: `Это вторая глава книги "${foundBook.title}". \n\nДемонстрационный контент для показа навигации между главами. \n\nВ реальной версии здесь будет полный текст всех глав книги.`,
              chapterNumber: 2,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ];
          setChapters(mockChapters);
        } else {
          const bookChapters = getBookChapters(id);
          setChapters(bookChapters);
        }
        
        // Загружаем прогресс чтения
        if (user) {
          const progress = getUserReadingProgress(user.id, id);
          if (progress) {
            setCurrentChapter(progress.currentChapter);
          }
          
          // Проверяем, в избранном ли книга
          setIsBookFavorite(isFavorite(user.id, id));
        }
      }
    }
  }, [id, user]);

  // Сохраняем прогресс при смене главы
  useEffect(() => {
    if (user && book && chapters.length > 0) {
      const progress = Math.round(((currentChapter + 1) / chapters.length) * 100);
      saveReadingProgress({
        userId: user.id,
        bookId: book.id,
        currentChapter,
        totalChapters: chapters.length,
        progress
      });
    }
  }, [currentChapter, user, book, chapters]);

  const nextChapter = () => {
    if (currentChapter < chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
    }
  };

  const prevChapter = () => {
    if (currentChapter > 0) {
      setCurrentChapter(currentChapter - 1);
    }
  };

  const increaseFontSize = () => {
    if (fontSize < 24) {
      setFontSize(fontSize + 2);
    }
  };

  const decreaseFontSize = () => {
    if (fontSize > 12) {
      setFontSize(fontSize - 2);
    }
  };

  const handleToggleFavorite = () => {
    if (!user || !book) return;

    try {
      if (isBookFavorite) {
        removeFromFavorites(user.id, book.id);
        setIsBookFavorite(false);
        toast({
          title: "Удалено из избранного",
          description: `Книга "${book.title}" удалена из избранного`,
        });
      } else {
        addToFavorites(user.id, book.id);
        setIsBookFavorite(true);
        toast({
          title: "Добавлено в избранное",
          description: `Книга "${book.title}" добавлена в избранное`,
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить избранное",
        variant: "destructive"
      });
    }
  };

  if (!book) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Книга не найдена</h1>
            <p className="text-gray-300 mt-2">Возможно, книга еще не опубликована или была удалена.</p>
            <Link to="/library">
              <Button className="mt-4">Вернуться в библиотеку</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">В книге пока нет глав</h1>
            <Link to="/library">
              <Button className="mt-4">Вернуться в библиотеку</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentChapterData = chapters[currentChapter];
  const readingProgress = Math.round(((currentChapter + 1) / chapters.length) * 100);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkTheme 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50'
    }`}>
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Заголовок и управление */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <Link to="/library">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`${
                    isDarkTheme 
                      ? 'border-white/20 text-white hover:bg-white/10' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Назад
                </Button>
              </Link>
              <div>
                <h1 className={`text-2xl md:text-3xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                  {book.title}
                </h1>
                <p className={`text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                  Глава {currentChapter + 1} из {chapters.length}
                </p>
              </div>
            </div>
            
            {/* Управление отображением */}
            <div className="flex items-center space-x-2">
              {user && (
                <Button
                  onClick={handleToggleFavorite}
                  variant="outline"
                  size="sm"
                  className={`${
                    isBookFavorite
                      ? 'bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30'
                      : isDarkTheme 
                      ? 'border-white/20 text-white hover:bg-white/10' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isBookFavorite ? 'fill-current' : ''}`} />
                </Button>
              )}
              
              <Button
                onClick={decreaseFontSize}
                variant="outline"
                size="sm"
                className={`${
                  isDarkTheme 
                    ? 'border-white/20 text-white hover:bg-white/10' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              
              <span className={`text-sm px-2 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                {fontSize}px
              </span>
              
              <Button
                onClick={increaseFontSize}
                variant="outline"
                size="sm"
                className={`${
                  isDarkTheme 
                    ? 'border-white/20 text-white hover:bg-white/10' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              
              <Button
                onClick={() => setIsDarkTheme(!isDarkTheme)}
                variant="outline"
                size="sm"
                className={`${
                  isDarkTheme 
                    ? 'border-white/20 text-white hover:bg-white/10' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {isDarkTheme ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Прогресс чтения */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                Прогресс чтения
              </span>
              <span className={`text-sm font-medium ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                {readingProgress}%
              </span>
            </div>
            <Progress value={readingProgress} className="h-2" />
          </div>

          {/* Книжная страница */}
          <Card className={`flipbook-page transition-all duration-500 ${
            isDarkTheme 
              ? 'bg-white/5 border-white/20' 
              : 'bg-white border-gray-200 shadow-2xl'
          } p-8 min-h-[600px]`}>
            <div className="h-full flex flex-col">
              <h2 className={`text-xl font-bold mb-6 ${
                isDarkTheme ? 'text-white' : 'text-gray-900'
              }`}>
                {currentChapterData.title}
              </h2>
              
              <div className="flex-1 overflow-y-auto">
                <div 
                  className={`leading-relaxed whitespace-pre-wrap ${
                    isDarkTheme ? 'text-gray-200' : 'text-gray-800'
                  }`}
                  style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
                >
                  {currentChapterData.content}
                </div>
              </div>
            </div>
          </Card>

          {/* Навигация по главам */}
          <div className="flex items-center justify-between mt-8">
            <Button
              onClick={prevChapter}
              disabled={currentChapter === 0}
              className={`${
                currentChapter === 0 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
              }`}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Предыдущая глава
            </Button>
            
            <div className="flex items-center space-x-2">
              {chapters.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentChapter(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentChapter
                      ? 'bg-amber-500'
                      : isDarkTheme
                      ? 'bg-white/30 hover:bg-white/50'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
            
            <Button
              onClick={nextChapter}
              disabled={currentChapter === chapters.length - 1}
              className={`${
                currentChapter === chapters.length - 1
                  ? 'opacity-50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
              }`}
            >
              Следующая глава
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadBook;
