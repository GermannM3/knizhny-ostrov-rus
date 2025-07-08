import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, BookOpen, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import TelegramStarsPayment from '@/components/TelegramStarsPayment';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

interface TorrentBook {
  id: string;
  title: string;
  magnet_link: string;
  size?: string;
  seeds?: number;
  created_at: string;
}

export default function TorrentLibrary() {
  const [books, setBooks] = useState<TorrentBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [newBook, setNewBook] = useState({
    title: '',
    magnet_link: '',
    size: '',
    seeds: 0
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();
  const { user: telegramUser } = useTelegramWebApp();

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('torrent_books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBooks(data || []);
    } catch (error: any) {
      console.error('Failed to load books:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить книги",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addBook = async () => {
    if (!newBook.title || !newBook.magnet_link) {
      toast({
        title: "Ошибка",
        description: "Заполните обязательные поля",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('torrent_books')
        .insert([{
          title: newBook.title,
          magnet_link: newBook.magnet_link,
          size: newBook.size || null,
          seeds: newBook.seeds || 0
        }])
        .select()
        .single();

      if (error) throw error;

      setBooks([data, ...books]);
      setNewBook({ title: '', magnet_link: '', size: '', seeds: 0 });
      setShowAddForm(false);
      
      toast({
        title: "Успешно",
        description: "Книга добавлена в библиотеку",
      });
    } catch (error: any) {
      console.error('Failed to add book:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить книгу",
        variant: "destructive"
      });
    }
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p>Загрузка библиотеки...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Star className="h-8 w-8 text-yellow-400" />
            <h1 className="text-3xl font-bold text-white">Торрент Библиотека</h1>
          </div>
          <p className="text-gray-300">Купите и скачайте книги за Telegram Stars</p>
        </div>

        <div className="mb-6 space-y-4">
          {/* Поиск */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Поиск книг..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>

          {/* Кнопка добавления */}
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            {showAddForm ? 'Отменить' : 'Добавить книгу'}
          </Button>

          {/* Форма добавления */}
          {showAddForm && (
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Добавить новую книгу</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Название книги *"
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
                <Input
                  placeholder="Magnet-ссылка *"
                  value={newBook.magnet_link}
                  onChange={(e) => setNewBook({ ...newBook, magnet_link: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
                <Input
                  placeholder="Размер файла (например: 2.5GB)"
                  value={newBook.size}
                  onChange={(e) => setNewBook({ ...newBook, size: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
                <Input
                  type="number"
                  placeholder="Количество сидов"
                  value={newBook.seeds}
                  onChange={(e) => setNewBook({ ...newBook, seeds: parseInt(e.target.value) || 0 })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
                <Button onClick={addBook} className="w-full">
                  Добавить книгу
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Список книг */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <div key={book.id} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-4">
              {telegramUser?.id ? (
                <TelegramStarsPayment book={book} userId={telegramUser.id} />
              ) : (
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>{book.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {book.size && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Размер:</span>
                          <span>{book.size}</span>
                        </div>
                      )}
                      {book.seeds !== undefined && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Сиды:</span>
                          <Badge variant={book.seeds > 10 ? "default" : "secondary"}>
                            {book.seeds}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="text-center text-muted-foreground">
                      Войдите через Telegram для покупки
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchQuery ? 'Книги не найдены' : 'Библиотека пуста'}
            </h3>
            <p className="text-gray-400">
              {searchQuery 
                ? 'Попробуйте изменить поисковый запрос' 
                : 'Добавьте первую книгу в библиотеку'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}