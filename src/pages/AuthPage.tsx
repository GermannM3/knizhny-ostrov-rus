
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, Home, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getUserByEmail } from '@/utils/storage';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let success = false;
      
      if (isLogin) {
        console.log('Попытка входа с данными:', { email: formData.email, password: '[HIDDEN]' });
        success = await login(formData.email, formData.password);
        if (success) {
          toast({
            title: "Добро пожаловать!",
            description: "Вы успешно вошли в систему.",
          });
          navigate('/dashboard');
        } else {
          toast({
            title: "Ошибка входа",
            description: "Неверный email или пароль. Проверьте данные или используйте восстановление пароля.",
            variant: "destructive",
          });
        }
      } else {
        success = await register(formData.email, formData.password, formData.name);
        if (success) {
          toast({
            title: "Регистрация успешна!",
            description: "Добро пожаловать в BookCraft!",
          });
          navigate('/dashboard');
        } else {
          toast({
            title: "Ошибка регистрации",
            description: "Пользователь с таким email уже существует. Попробуйте войти или используйте другой email.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Ошибка аутентификации:', error);
      toast({
        title: "Произошла ошибка",
        description: "Попробуйте еще раз или обратитесь к администратору.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!formData.email) {
      toast({
        title: "Введите email",
        description: "Сначала введите ваш email адрес.",
        variant: "destructive",
      });
      return;
    }

    const user = getUserByEmail(formData.email);
    
    if (user) {
      // В реальном приложении здесь бы отправлялось письмо с временной ссылкой
      // Для демонстрации показываем напоминание о тестовом пользователе
      if (formData.email === 'germannm@vk.com') {
        toast({
          title: "Напоминание пароля",
          description: "Для тестового аккаунта используйте пароль: Germ@nnM3",
        });
      } else {
        toast({
          title: "Письмо отправлено",
          description: "Проверьте почту. Мы отправили инструкции по восстановлению пароля.",
        });
      }
    } else {
      toast({
        title: "Пользователь не найден",
        description: "Пользователь с таким email не зарегистрирован. Попробуйте зарегистрироваться.",
        variant: "destructive",
      });
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-4">
            <Link to="/library">
              <Button variant="ghost" className="text-gray-300 hover:text-amber-400">
                <Home className="h-4 w-4 mr-2" />
                На главную
              </Button>
            </Link>
          </div>
          
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Book className="h-12 w-12 text-amber-400" />
            </div>
            <h1 className="text-3xl font-bold gradient-text mb-2">BookCraft</h1>
            <p className="text-gray-300">Восстановление пароля</p>
          </div>

          <Card className="glass-card border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Забыли пароль?</CardTitle>
              <CardDescription className="text-gray-300">
                Введите ваш email для восстановления пароля
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@mail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
                
                <Button 
                  onClick={handleForgotPassword}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  Восстановить пароль
                </Button>
                
                <div className="text-center">
                  <button
                    onClick={() => setShowForgotPassword(false)}
                    className="text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Вернуться к входу
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-4">
          <Link to="/library">
            <Button variant="ghost" className="text-gray-300 hover:text-amber-400">
              <Home className="h-4 w-4 mr-2" />
              На главную
            </Button>
          </Link>
        </div>
        
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Book className="h-12 w-12 text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">BookCraft</h1>
          <p className="text-gray-300">Платформа для создания и публикации книг</p>
        </div>

        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="text-white">
              {isLogin ? 'Вход' : 'Регистрация'}
            </CardTitle>
            <CardDescription className="text-gray-300">
              {isLogin 
                ? 'Войдите в свой аккаунт' 
                : 'Создайте новый аккаунт'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Имя</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Ваше имя"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required={!isLogin}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@mail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Пароль</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                disabled={isLoading}
              >
                {isLoading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
              </Button>
            </form>
            
            <div className="mt-4 space-y-2 text-center">
              {isLogin && (
                <button
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-gray-400 hover:text-amber-300 transition-colors block w-full"
                >
                  Забыли пароль?
                </button>
              )}
              
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-amber-400 hover:text-amber-300 transition-colors"
              >
                {isLogin 
                  ? 'Нет аккаунта? Зарегистрируйтесь' 
                  : 'Уже есть аккаунт? Войдите'
                }
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
