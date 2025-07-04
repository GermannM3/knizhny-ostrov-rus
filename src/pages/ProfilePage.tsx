
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserBooks, updateUser, getPurchases } from '@/utils/storage';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Book, Calendar, Edit2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ProfilePage = () => {
  const { user, updateAuthUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const { toast } = useToast();

  if (!user) return null;

  const userBooks = getUserBooks(user.id);
  const publishedBooks = userBooks.filter(book => book.status === 'published');
  const draftBooks = userBooks.filter(book => book.status === 'draft');
  const purchases = getPurchases().filter(p => p.userId === user.id && p.paid);

  const handleSaveName = () => {
    if (newName.trim()) {
      const updatedUser = updateUser(user.id, { name: newName.trim() });
      if (updatedUser) {
        updateAuthUser(updatedUser);
        setIsEditing(false);
        toast({
          title: "Имя обновлено",
          description: "Ваше имя успешно изменено",
        });
      }
    }
  };

  const handleCancelEdit = () => {
    setNewName(user.name);
    setIsEditing(false);
  };

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
                {isEditing ? (
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Введите имя"
                    />
                    <Button
                      onClick={handleSaveName}
                      size="sm"
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      size="sm"
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-white font-medium">{user.name}</p>
                    <Button
                      onClick={() => setIsEditing(true)}
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-white"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
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
                  <div className="text-2xl font-bold text-purple-400">{purchases.length}</div>
                  <div className="text-gray-300 text-sm">Куплено книг</div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/20">
                <h4 className="text-white font-medium mb-2">Активность</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Общие просмотры:</span>
                    <span className="text-white">{userBooks.reduce((sum, book) => sum + (book.views || 0), 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Средние просмотры:</span>
                    <span className="text-white">
                      {userBooks.length > 0 
                        ? Math.round(userBooks.reduce((sum, book) => sum + (book.views || 0), 0) / userBooks.length)
                        : 0
                      }
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Избранные жанры */}
        {userBooks.length > 0 && (
          <Card className="glass-card border-white/20 mt-6">
            <CardHeader>
              <CardTitle className="text-white">Ваши любимые жанры</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(userBooks.map(book => book.genre))).map(genre => (
                  <span
                    key={genre}
                    className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm border border-amber-500/30"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
