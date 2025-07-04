
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
      
      // Если нет сессии и мы в Telegram WebApp, пытаемся авторизоваться автоматически
      if (!session && window.Telegram?.WebApp?.initDataUnsafe?.user) {
        const telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
        console.log('🔄 Автоматическая авторизация через Telegram:', telegramUser);
        signInWithTelegram(telegramUser).then(({ error }) => {
          if (error) {
            console.error('❌ Ошибка автоматической авторизации через Telegram:', error);
          } else {
            console.log('✅ Автоматическая авторизация через Telegram успешна');
          }
        });
      }
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
      // Пытаемся найти пользователя по Telegram ID
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramData.id)
        .single();

      if (existingUser) {
        // Если пользователь существует, авторизуем через специальный Telegram токен
        const { data, error } = await supabase.auth.signInWithPassword({
          email: existingUser.email,
          password: 'telegram_auth_' + telegramData.id
        });
        
        if (error) {
          // Если пароль не подошел, обновляем его
          await supabase.from('users').update({
            password: 'telegram_auth_' + telegramData.id
          }).eq('telegram_id', telegramData.id);
          
          // Пробуем снова
          const { error: retryError } = await supabase.auth.signInWithPassword({
            email: existingUser.email,
            password: 'telegram_auth_' + telegramData.id
          });
          return { error: retryError };
        }
        
        return { error };
      } else {
        // Создаем нового пользователя
        const email = `telegram_${telegramData.id}@bookcraft.ru`;
        const name = telegramData.first_name + (telegramData.last_name ? ` ${telegramData.last_name}` : '');
        const password = 'telegram_auth_' + telegramData.id;
        
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
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
          // Создаем пользователя в таблице users с правильным id и паролем
          await supabase.from('users').insert({
            id: data.user.id,
            email,
            name,
            full_name: name,
            telegram_id: telegramData.id,
            password: password
          });
        }

        return { error: signUpError };
      }
    } catch (error) {
      console.error('Telegram auth error:', error);
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
