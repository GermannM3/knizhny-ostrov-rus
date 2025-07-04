import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getBooks, updateBook, getBookChapters, deleteChapter } from '@/utils/storage';
import { bookCovers, genres, genreCovers } from '@/data/bookCovers';
import { Book, Chapter } from '@/types';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash, ArrowLeft, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const EditBook = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    status: 'draft' as 'draft' | 'published',
    coverImage: ''
  });

  useEffect(() => {
    if (id && user) {
      const books = getBooks();
      const foundBook = books.find(b => b.id === id && b.authorId === user.id);
      
      if (!foundBook) {
        navigate('/dashboard');
        return;
      }
      
      setBook(foundBook);
      setFormData({
        title: foundBook.title,
        description: foundBook.description,
        genre: foundBook.genre,
        status: foundBook.status,
        coverImage: foundBook.coverImage
      });
      
      loadChapters();
    }
  }, [id, user, navigate]);

  const loadChapters = () => {
    if (id) {
      const bookChapters = getBookChapters(id);
      setChapters(bookChapters);
    }
  };

  const getGenreCovers = () => {
    if (!formData.genre) return Object.values(bookCovers).flat().slice(0, 10);
    return genreCovers[formData.genre as keyof typeof genreCovers] || Object.values(bookCovers).flat().slice(0, 10);
  };

  const handleSave = () => {
    if (!book || !user) return;

    if (!formData.title || !formData.description || !formData.genre) {
      toast({
        title: "Заполните все поля",
        description: "Все поля обязательны для заполнения.",
        variant: "destructive",
      });
      return;
    }

    updateBook(book.id, {
      title: formData.title,
      description: formData.description,
      genre: formData.genre,
      status: formData.status,
      coverImage: formData.coverImage
    });

    toast({
      title: "Книга обновлена!",
      description: "Изменения успешно сохранены.",
    });
  };

  const handleDeleteChapter = (chapterId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту главу?')) {
      deleteChapter(chapterId);
      loadChapters();
      toast({
        title: "Глава удалена",
        description: "Глава была успешно удалена.",
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
            <Link to="/dashboard">
              <Button className="mt-4">Вернуться к книгам</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Назад
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-white">Редактировать книгу</h1>
            </div>
            
            <Button onClick={handleSave} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
              <Save className="h-4 w-4 mr-2" />
              Сохранить
            </Button>
          </div>

          {/* Информация о книге */}
          <div className="glass-card p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Информация о книге</h2>
            
            {/* Выбор обложки */}
            <div className="mb-6">
              <Label className="text-white mb-2 block">Обложка</Label>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {getGenreCovers().map((cover, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
                      formData.coverImage === cover
                        ? 'ring-4 ring-amber-400 scale-105'
                        : 'hover:scale-105 hover:ring-2 hover:ring-white/50'
                    }`}
                    onClick={() => setFormData({...formData, coverImage: cover})}
                  >
                    <img
                      src={cover}
                      alt={`Обложка ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-white">Название книги</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
                
                <div>
                  <Label htmlFor="genre" className="text-white">Жанр</Label>
                  <Select value={formData.genre} onValueChange={(value) => setFormData({...formData, genre: value})}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map(genre => (
                        <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="status" className="text-white">Статус</Label>
                  <Select value={formData.status} onValueChange={(value: 'draft' | 'published') => setFormData({...formData, status: value})}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Черновик</SelectItem>
                      <SelectItem value="published">Опубликовать</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description" className="text-white">Описание</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-32"
                />
              </div>
            </div>
          </div>

          {/* Главы */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Главы</h2>
              <Link to={`/edit/${book.id}/add-chapter`}>
                <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить главу
                </Button>
              </Link>
            </div>
            
            {chapters.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-300 mb-4">У этой книги пока нет глав</p>
                <Link to={`/edit/${book.id}/add-chapter`}>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    Создать первую главу
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {chapters.map((chapter) => (
                  <Card key={chapter.id} className="bg-white/5 border-white/20 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">
                          Глава {chapter.chapterNumber}: {chapter.title}
                        </h3>
                        <p className="text-sm text-gray-300 mt-1">
                          {chapter.content.length > 100 
                            ? `${chapter.content.substring(0, 100)}...` 
                            : chapter.content}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Link to={`/edit/${book.id}/chapter/${chapter.id}`}>
                          <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          onClick={() => handleDeleteChapter(chapter.id)}
                          variant="outline" 
                          size="sm"
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditBook;
