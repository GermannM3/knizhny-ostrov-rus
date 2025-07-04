
import { useEffect, useState } from 'react';

interface TelegramWebApp {
  ready: () => void;
  close: () => void;
  expand: () => void;
  CloudStorage: {
    setItem: (key: string, value: string, callback?: (error: string | null, result?: boolean) => void) => void;
    getItem: (key: string, callback: (error: string | null, result?: string) => void) => void;
    getItems: (keys: string[], callback: (error: string | null, result?: Record<string, string>) => void) => void;
    removeItem: (key: string, callback?: (error: string | null, result?: boolean) => void) => void;
    removeItems: (keys: string[], callback?: (error: string | null, result?: boolean) => void) => void;
    getKeys: (callback: (error: string | null, result?: string[]) => void) => void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
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
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export const useTelegram = () => {
  const [tg, setTg] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [cloudStorageReady, setCloudStorageReady] = useState(false);

  useEffect(() => {
    const app = window.Telegram?.WebApp;
    if (app) {
      app.ready();
      app.expand();
      setTg(app);
      setUser(app.initDataUnsafe?.user);
      setIsReady(true);
      
      // Проверяем доступность CloudStorage
      if (app.CloudStorage) {
        setCloudStorageReady(true);
        console.log('Telegram Cloud Storage доступен');
      } else {
        console.log('Telegram Cloud Storage недоступен');
      }
      
      console.log('Telegram Web App инициализирован:', app);
      console.log('Telegram пользователь:', app.initDataUnsafe?.user);
    } else {
      console.log('Telegram Web App не найден, работаем как обычное веб-приложение');
      setIsReady(true);
    }
  }, []);

  const onClose = () => {
    tg?.close();
  };

  const onToggleButton = () => {
    if (tg?.MainButton.isVisible) {
      tg.MainButton.hide();
    } else {
      tg?.MainButton.show();
    }
  };

  // Методы для работы с облачным хранилищем
  const setCloudData = (key: string, value: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      if (!tg?.CloudStorage) {
        reject(new Error('Cloud Storage недоступен'));
        return;
      }
      
      tg.CloudStorage.setItem(key, value, (error, result) => {
        if (error) {
          reject(new Error(error));
        } else {
          resolve(result || false);
        }
      });
    });
  };

  const getCloudData = (key: string): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      if (!tg?.CloudStorage) {
        reject(new Error('Cloud Storage недоступен'));
        return;
      }
      
      tg.CloudStorage.getItem(key, (error, result) => {
        if (error) {
          reject(new Error(error));
        } else {
          resolve(result || null);
        }
      });
    });
  };

  const getCloudKeys = (): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      if (!tg?.CloudStorage) {
        reject(new Error('Cloud Storage недоступен'));
        return;
      }
      
      tg.CloudStorage.getKeys((error, result) => {
        if (error) {
          reject(new Error(error));
        } else {
          resolve(result || []);
        }
      });
    });
  };

  return {
    tg,
    user,
    isReady,
    onClose,
    onToggleButton,
    isTelegramApp: !!tg,
    cloudStorageReady,
    setCloudData,
    getCloudData,
    getCloudKeys
  };
};
