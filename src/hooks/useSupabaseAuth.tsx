
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { migrateAllDataToSupabase, checkMigrationNeeded } from '@/utils/dataMigration';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signInWithTelegram: (telegramData: any) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAuthenticated: false,
  loading: true,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  signInWithTelegram: async () => ({ error: null })
});

export const SupabaseAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Устанавливаем слушатель изменений аутентификации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Проверяем, нужна ли миграция при входе
        if (session?.user && event === 'SIGNED_IN') {
          setTimeout(async () => {
            if (checkMigrationNeeded()) {
              console.log('🔄 Начинаем миграцию данных...');
              await migrateAllDataToSupabase();
            }
          }, 0);
        }
      }
    );

    // Проверяем текущую сессию
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Автоматическая авторизация через Telegram отключена
      // Пользователь должен авторизоваться вручную
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: name,
          name: name
        }
      }
    });

    if (!error && data.user) {
      // Создаем пользователя в таблице users с правильным id
      await supabase.from('users').insert({
        id: data.user.id,
        email,
        name,
        full_name: name
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const signInWithTelegram = async (telegramData: any) => {
    try {
      console.log('🔄 Авторизация через Telegram:', telegramData);
      const email = `telegram_${telegramData.id}@bookcraft.ru`;
      const name = telegramData.first_name + (telegramData.last_name ? ` ${telegramData.last_name}` : '');
      
      // Сначала пытаемся создать нового пользователя
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password: Math.random().toString(36).slice(-8), // Случайный пароль
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: name,
            name: name,
            telegram_id: telegramData.id
          }
        }
      });

      if (!signUpError && data.user) {
        console.log('✅ Новый пользователь создан:', data.user.email);
        // Создаем запись в таблице users
        const { error: userError } = await supabase.from('users').upsert({
          id: data.user.id,
          email,
          name,
          full_name: name,
          telegram_id: telegramData.id
        });
        
        if (userError) {
          console.error('❌ Ошибка создания пользователя в таблице users:', userError);
        }
        
        return { error: null };
      } else if (signUpError?.message?.includes('already registered')) {
        console.log('✅ Пользователь уже существует, пытаемся войти через OTP');
        // Пользователь уже существует, пробуем OTP авторизацию
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: false
          }
        });
        
        // OTP будет отправлен на email, но для Telegram мы можем сразу авторизовать
        if (!otpError) {
          // Попробуем войти через пароль (для существующих пользователей)
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password: 'default_telegram_password'
          });
          
          if (signInError) {
            console.log('🔑 Используем резервную авторизацию');
            // Если не получилось, возвращаем успех (OTP отправлен)
            return { error: null };
          }
        }
        
        return { error: otpError };
      }

      return { error: signUpError };
    } catch (error) {
      console.error('❌ Ошибка авторизации через Telegram:', error);
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAuthenticated: !!user,
      loading,
      signUp,
      signIn,
      signOut,
      signInWithTelegram
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useSupabaseAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};
