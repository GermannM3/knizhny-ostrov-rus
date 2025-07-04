import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, User, Mail, Lock, LogIn, UserPlus } from 'lucide-react';

// Используем существующий тип из useTelegramWebApp

interface TelegramAuthComponentProps {
  onAuthSuccess: () => void;
}

export default function TelegramAuthComponent({ onAuthSuccess }: TelegramAuthComponentProps) {
  const [telegramUser, setTelegramUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      const user = tg.initDataUnsafe?.user;
      if (user && user.id) {
        console.log('🔍 Telegram пользователь найден:', user);
        setTelegramUser(user);
      }
    }
  }, []);

  async function handleTelegramLogin() {
    if (!telegramUser) {
      setError('Данные Telegram недоступны.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log('🔄 Начинаем Telegram авторизацию:', telegramUser);
      
      // Вызываем функцию синхронизации
      const { data: syncResult, error: syncError } = await supabase.rpc('sync_telegram_data', {
        p_telegram_id: telegramUser.id,
        p_data: {
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name,
          username: telegramUser.username
        }
      });

      if (syncError) {
        console.error('❌ Ошибка синхронизации:', syncError);
        throw syncError;
      }

      console.log('✅ Синхронизация успешна:', syncResult);
      
      // Успешная авторизация через Telegram
      onAuthSuccess();
      
    } catch (e: any) {
      console.error('❌ Telegram login error:', e);
      setError(e.message || 'Ошибка авторизации через Telegram');
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailAuth() {
    setLoading(true);
    setError('');
    
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: email.split('@')[0]
            }
          }
        });
        if (error) throw error;
      }
      
      onAuthSuccess();
    } catch (e: any) {
      console.error('❌ Email auth error:', e);
      setError(e.message || 'Ошибка при входе/регистрации');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <BookOpen className="h-8 w-8 text-amber-400" />
            <h1 className="text-3xl font-bold text-white">BookCraft</h1>
          </div>
          <p className="text-gray-300">Создавайте и читайте книги</p>
        </div>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-center">
              Добро пожаловать
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Telegram авторизация */}
            {telegramUser && (
              <div className="space-y-4">
                <Button
                  onClick={handleTelegramLogin}
                  disabled={loading}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <User className="h-4 w-4 mr-2" />
                  {loading ? 'Загрузка...' : `Войти как ${telegramUser.first_name}`}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/20" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white/10 px-2 text-gray-400">или</span>
                  </div>
                </div>
              </div>
            )}

            {/* Email/Password форма */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Введите email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Пароль</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder={mode === 'login' ? 'Введите пароль' : 'Создайте пароль'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    disabled={loading}
                    required
                    minLength={mode === 'register' ? 6 : undefined}
                  />
                </div>
              </div>

              <Button
                onClick={handleEmailAuth}
                disabled={loading || !email || !password}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                {loading ? (
                  'Загрузка...'
                ) : mode === 'login' ? (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Войти
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Зарегистрироваться
                  </>
                )}
              </Button>

              <Button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                disabled={loading}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                {mode === 'login' ? 'Нет аккаунта? Зарегистрироваться' : 'Есть аккаунт? Войти'}
              </Button>
            </div>

            {error && (
              <Alert className="bg-red-500/10 border-red-500/20">
                <AlertDescription className="text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}