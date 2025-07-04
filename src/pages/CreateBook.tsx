import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { saveBook } from '@/utils/storage';
import { bookCovers, getRandomCover, genres, genreCovers } from '@/data/bookCovers';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

const CreateBook = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCover, setSelectedCover] = useState(getRandomCover());
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    status: 'draft' as 'draft' | 'published'
  });

  const handleGenreChange = (genre: string) => {
    setFormData({...formData, genre});
    // Автоматически предлагаем обложки для выбранного жанра
    const genreSpecificCovers = genreCovers[genre as keyof typeof genreCovers] || Object.values(bookCovers).flat().slice(0, 5);
    if (genreSpecificCovers.length > 0) {
      setSelectedCover(genreSpecificCovers[0]);
    }
  };

  const getGenreCovers = () => {
    if (!formData.genre) return Object.values(bookCovers).flat().slice(0, 5);
    return genreCovers[formData.genre as keyof typeof genreCovers] || Object.values(bookCovers).flat().slice(0, 5);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    if (!formData.title || !formData.description || !formData.genre) {
      toast({
        title: "Заполните все поля",
        description: "Все поля обязательны для заполнения.",
        variant: "destructive",
      });
      return;
    }

    const newBook = saveBook({
      ...formData,
      coverImage: selectedCover,
      authorId: user.id,
      views: 0,
      isFavorite: false
    });

    toast({
      title: "Книга создана!",
      description: "Теперь вы можете добавить главы.",
    });

    navigate(`/edit/${newBook.id}`);
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Создать новую книгу</h1>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Выбор обложки */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Выберите обложку</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                {getGenreCovers().map((cover, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
                      selectedCover === cover
                        ? 'ring-4 ring-amber-400 scale-105'
                        : 'hover:scale-105 hover:ring-2 hover:ring-white/50'
                    }`}
                    onClick={() => setSelectedCover(cover)}
                  >
                    <img
                      src={cover}
                      alt={`Обложка ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Информация о книге */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Информация о книге</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-white">Название книги *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Введите название книги"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="genre" className="text-white">Жанр *</Label>
                    <Select value={formData.genre} onValueChange={handleGenreChange}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Выберите жанр" />
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
                  <Label htmlFor="description" className="text-white">Описание *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Расскажите о чем ваша книга..."
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-32"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Предварительный просмотр */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Предварительный просмотр</h2>
              <div className="max-w-sm">
                <Card className="book-card">
                  <img
                    src={selectedCover}
                    alt="Обложка"
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                    {formData.title || 'Название книги'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    {formData.description || 'Описание книги'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                    <span>{formData.genre || 'Жанр'}</span>
                    <span>{formData.status === 'published' ? 'Опубликовано' : 'Черновик'}</span>
                  </div>
                </Card>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                type="submit"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                Создать книгу
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Отмена
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateBook;
