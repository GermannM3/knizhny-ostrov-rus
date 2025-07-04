import { useEffect, useState } from 'react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useSimpleSync } from '@/hooks/useSimpleSync';

const TelegramAuth = () => {
  const { user, telegramId, isReady, isTelegramWebApp } = useTelegramWebApp();
  const { signInWithTelegram } = useSupabaseAuth();
  const { sync } = useSimpleSync(telegramId);
  const [authProcessed, setAuthProcessed] = useState(false);

  useEffect(() => {
    if (!isReady || !isTelegramWebApp || !user || authProcessed) return;

    const processAuth = async () => {
      console.log('🔄 Начинаем авторизацию через Telegram:', user);
      
      try {
        const { error } = await signInWithTelegram(user);
        
        if (!error) {
          console.log('✅ Авторизация успешна, загружаем данные...');
          // Загружаем данные после успешной авторизации
          await sync();
        } else {
          console.error('❌ Ошибка авторизации:', error);
        }
      } catch (error) {
        console.error('❌ Критическая ошибка авторизации:', error);
      } finally {
        setAuthProcessed(true);
      }
    };

    processAuth();
  }, [isReady, isTelegramWebApp, user, authProcessed, signInWithTelegram, sync]);

  // Инициализация WebApp
  useEffect(() => {
    if (isTelegramWebApp && isReady) {
      console.log('✅ Telegram WebApp инициализирован');
    }
  }, [isTelegramWebApp, isReady]);

  return null;
};

export default TelegramAuth;