import { useState, useEffect } from 'react';

interface TelegramWebApp {
  ready: () => void;
  close: () => void;
  expand: () => void;
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
  };
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color: string;
    text_color: string;
    hint_color: string;
    link_color: string;
    button_color: string;
    button_text_color: string;
  };
  version: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export const useTelegramWebApp = () => {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isTelegramWebApp, setIsTelegramWebApp] = useState(false);

  useEffect(() => {
    const app = window.Telegram?.WebApp;
    
    if (app) {
      console.log('🔍 Telegram WebApp обнаружен, версия:', app.version);
      app.ready();
      app.expand();
      
      setIsTelegramWebApp(true);
      
      const telegramUser = app.initDataUnsafe?.user;
      if (telegramUser) {
        console.log('👤 Пользователь Telegram:', telegramUser);
        setUser(telegramUser);
      }
      
      setIsReady(true);
    } else {
      console.log('❌ Telegram WebApp не обнаружен - работаем в обычном браузере');
      setIsReady(true);
    }
  }, []);

  return {
    isReady,
    user,
    isTelegramWebApp,
    telegramId: user?.id || null
  };
};