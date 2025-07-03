
import { useAuth } from '@/hooks/useAuth';
import { getUserBooks } from '@/utils/storage';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Book, Calendar } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();

  if (!user) return null;

  const userBooks = getUserBooks(user.id);
  const publishedBooks = userBooks.filter(book => book.status === 'published');
  const draftBooks = userBooks.filter(book => book.status === 'draft');

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-3 mb-8">
          <User className="h-8 w-8 text-amber-400" />
          <h1 className="text-3xl font-bold text-white">Профиль</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-card border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <User className="h-5 w-5 text-amber-400" />
                <span>Информация о пользователе</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-gray-300 text-sm">Имя</label>
                <p className="text-white font-medium">{user.name}</p>
              </div>
              <div>
                <label className="text-gray-300 text-sm">Email</label>
                <p className="text-white font-medium">{user.email}</p>
              </div>
              <div>
                <label className="text-gray-300 text-sm">Дата регистрации</label>
                <p className="text-white font-medium flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(user.createdAt).toLocaleDateString('ru-RU')}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Book className="h-5 w-5 text-amber-400" />
                <span>Статистика</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400">{userBooks.length}</div>
                  <div className="text-gray-300 text-sm">Всего книг</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{publishedBooks.length}</div>
                  <div className="text-gray-300 text-sm">Опубликовано</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{draftBooks.length}</div>
                  <div className="text-gray-300 text-sm">Черновиков</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {userBooks.filter(book => book.isFavorite).length}
                  </div>
                  <div className="text-gray-300 text-sm">Избранных</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
