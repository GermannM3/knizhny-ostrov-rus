
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getBooks, getChapters, saveChapter, updateChapter, getBookChapters } from '@/utils/storage';
import { Book, Chapter } from '@/types';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const EditChapter = () => {
  const { bookId, chapterId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [book, setBook] = useState<Book | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    chapterNumber: 1
  });

  useEffect(() => {
    if (bookId && user) {
      const books = getBooks();
      const foundBook = books.find(b => b.id === bookId && b.authorId === user.id);
      
      if (!foundBook) {
        navigate('/dashboard');
        return;
      }
      
      setBook(foundBook);
      
      if (chapterId) {
        // Редактирование существующей главы
        const chapters = getChapters();
        const foundChapter = chapters.find(c => c.id === chapterId && c.bookId === bookId);
        
        if (foundChapter) {
          setChapter(foundChapter);
          setFormData({
            title: foundChapter.title,
            content: foundChapter.content,
            chapterNumber: foundChapter.chapterNumber
          });
        } else {
          navigate(`/edit/${bookId}`);
        }
      } else {
        // Создание новой главы
        setIsNew(true);
        const bookChapters = getBookChapters(bookId);
        const nextChapterNumber = bookChapters.length + 1;
        setFormData({
          title: '',
          content: '',
          chapterNumber: nextChapterNumber
        });
      }
    }
  }, [bookId, chapterId, user, navigate]);

  const handleSave = () => {
    if (!book || !user) return;

    if (!formData.title || !formData.content) {
      toast({
        title: "Заполните все поля",
        description: "Название и содержание главы обязательны.",
        variant: "destructive",
      });
      return;
    }

    if (isNew) {
      saveChapter({
        bookId: book.id,
        title: formData.title,
        content: formData.content,
        chapterNumber: formData.chapterNumber
      });
      
      toast({
        title: "Глава создана!",
        description: "Новая глава была успешно добавлена.",
      });
    } else if (chapter) {
      updateChapter(chapter.id, {
        title: formData.title,
        content: formData.content,
        chapterNumber: formData.chapterNumber
      });
      
      toast({
        title: "Глава обновлена!",
        description: "Изменения успешно сохранены.",
      });
    }

    navigate(`/edit/${book.id}`);
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
              <Link to={`/edit/${book.id}`}>
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Назад к книге
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-white">
                {isNew ? 'Добавить главу' : 'Редактировать главу'}
              </h1>
            </div>
            
            <Button onClick={handleSave} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
              <Save className="h-4 w-4 mr-2" />
              Сохранить
            </Button>
          </div>

          <div className="glass-card p-6">
            <div className="space-y-6">
              <div>
                <Label htmlFor="chapterNumber" className="text-white">Номер главы</Label>
                <Input
                  id="chapterNumber"
                  type="number"
                  value={formData.chapterNumber}
                  onChange={(e) => setFormData({...formData, chapterNumber: parseInt(e.target.value) || 1})}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  min="1"
                />
              </div>
              
              <div>
                <Label htmlFor="title" className="text-white">Название главы</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Введите название главы"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              
              <div>
                <Label htmlFor="content" className="text-white">Содержание главы</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Напишите содержание главы..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[400px]"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center space-x-4">
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              {isNew ? 'Создать главу' : 'Сохранить изменения'}
            </Button>
            
            <Link to={`/edit/${book.id}`}>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Отмена
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditChapter;
