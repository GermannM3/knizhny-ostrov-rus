
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBooks, getBookChapters, updateBook } from '@/utils/storage';
import { Book, Chapter } from '@/types';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Sun, Moon } from 'lucide-react';

const ReadBook = () => {
  const { id } = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  useEffect(() => {
    if (id) {
      const books = getBooks();
      const foundBook = books.find(b => b.id === id && b.status === 'published');
      
      if (foundBook) {
        setBook(foundBook);
        
        // Увеличиваем счетчик просмотров
        updateBook(foundBook.id, { views: foundBook.views + 1 });
        
        const bookChapters = getBookChapters(id);
        setChapters(bookChapters);
      }
    }
  }, [id]);

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

  if (!book) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Книга не найдена</h1>
            <p className="text-gray-300 mt-2">Возможно, книга еще не опубликована или была удалена.</p>
            <Link to="/dashboard">
              <Button className="mt-4">Вернуться к книгам</Button>
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
            <Link to="/dashboard">
              <Button className="mt-4">Вернуться к книгам</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentChapterData = chapters[currentChapter];

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
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
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
