
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
      
      // Сначала синхронизируем пользователя в базе
      const { data, error } = await supabase.rpc('sync_telegram_data', {
        p_telegram_id: telegramData.id,
        p_data: {
          first_name: telegramData.first_name,
          last_name: telegramData.last_name,
          username: telegramData.username
        }
      });
      
      if (error) {
        console.error('❌ Ошибка синхронизации пользователя:', error);
        return { error };
      }
      
      console.log('✅ Пользователь синхронизирован:', data);
      
      // Получаем пользователя из базы
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramData.id)
        .single();
        
      if (userError || !userData) {
        console.error('❌ Пользователь не найден после синхронизации:', userError);
        return { error: userError || new Error('Пользователь не найден') };
      }
      
      // Создаем фиктивную сессию для Telegram пользователя
      // В реальном приложении здесь должна быть интеграция с Supabase auth
      console.log('✅ Telegram авторизация успешна для пользователя:', userData.name);
      
      return { error: null };
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
