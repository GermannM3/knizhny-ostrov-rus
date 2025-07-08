import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, BookOpen, Download, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LibgenBook {
  title: string;
  author: string;
  size: string;
  format: string;
  downloadLink: string;
  torrentLink?: string;
}

export default function LibgenSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LibgenBook[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const searchBooks = async () => {
    if (!query.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите название книги для поиска",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Пробуем разные прокси для обхода CORS
      const proxies = [
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?',
        'https://cors-anywhere.herokuapp.com/'
      ];
      
      const libgenUrl = `https://libgen.rs/search.php?req=${encodeURIComponent(query)}&res=10&sort=year&sortmode=DESC`;
      
      let response;
      let lastError;
      
      for (const proxyUrl of proxies) {
        try {
          console.log(`🔍 Пробуем прокси: ${proxyUrl}`);
          response = await fetch(proxyUrl + encodeURIComponent(libgenUrl), {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });
          
          if (response.ok) {
            console.log(`✅ Успешный ответ от ${proxyUrl}`);
            break;
          } else {
            console.log(`❌ Ошибка от ${proxyUrl}: ${response.status}`);
          }
        } catch (error) {
          console.log(`❌ Ошибка прокси ${proxyUrl}:`, error);
          lastError = error;
          continue;
        }
      }
      
      if (!response || !response.ok) {
        throw new Error(`Все прокси недоступны. Последняя ошибка: ${lastError}`);
      }
      const html = await response.text();
      
      // Парсим HTML для извлечения информации о книгах
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const rows = doc.querySelectorAll('table[width="100%"] tr');
      
      const books: LibgenBook[] = [];
      
      rows.forEach((row, index) => {
        if (index === 0) return; // Пропускаем заголовок
        
        const cells = row.querySelectorAll('td');
        if (cells.length >= 9) {
          const titleCell = cells[2];
          const authorCell = cells[1];
          const sizeCell = cells[7];
          const formatCell = cells[8];
          
          const titleLink = titleCell.querySelector('a');
          const downloadLinks = cells[9]?.querySelectorAll('a') || [];
          
          if (titleLink) {
            const title = titleLink.textContent?.trim() || 'Неизвестно';
            const author = authorCell.textContent?.trim() || 'Неизвестно';
            const size = sizeCell.textContent?.trim() || '';
            const format = formatCell.textContent?.trim() || '';
            
            let downloadLink = '';
            let torrentLink = '';
            
            downloadLinks.forEach(link => {
              const href = link.getAttribute('href');
              const text = link.textContent?.toLowerCase();
              
              if (href) {
                if (text?.includes('get') || text?.includes('download')) {
                  downloadLink = href.startsWith('http') ? href : `https://libgen.rs${href}`;
                } else if (text?.includes('torrent')) {
                  torrentLink = href.startsWith('http') ? href : `https://libgen.rs${href}`;
                }
              }
            });

            if (downloadLink) {
              books.push({
                title,
                author,
                size,
                format,
                downloadLink,
                torrentLink
              });
            }
          }
        }
      });
      
      setResults(books);
      
      if (books.length === 0) {
        toast({
          title: "Результаты поиска",
          description: "Книги не найдены. Попробуйте изменить запрос.",
        });
      } else {
        toast({
          title: "Поиск завершен",
          description: `Найдено ${books.length} книг`,
        });
      }
      
    } catch (error) {
      console.error('Ошибка поиска:', error);
      toast({
        title: "Ошибка поиска",
        description: "Не удалось выполнить поиск. Попробуйте позже.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchBooks();
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Search className="h-5 w-5" />
          <span>Поиск книг через Libgen</span>
        </CardTitle>
        <p className="text-gray-300 text-sm">
          Найдите и скачайте книги бесплатно из библиотеки Genesis
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            placeholder="Введите название книги или автора..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
          <Button 
            onClick={searchBooks} 
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Поиск...</span>
              </div>
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <h3 className="text-white font-semibold">
              Найдено книг: {results.length}
            </h3>
            
            {results.map((book, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium truncate">
                      📚 {book.title}
                    </h4>
                    <p className="text-gray-300 text-sm">
                      👤 {book.author}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                      {book.format && (
                        <span className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded">
                          {book.format.toUpperCase()}
                        </span>
                      )}
                      {book.size && (
                        <span>📁 {book.size}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-3">
                    <a
                      href={book.downloadLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      <span>Скачать</span>
                    </a>
                    
                    {book.torrentLink && (
                      <a
                        href={book.torrentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>Torrent</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {results.length === 0 && !loading && (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-300">
              Введите название книги и нажмите "Поиск"
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}