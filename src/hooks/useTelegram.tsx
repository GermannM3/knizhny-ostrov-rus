
import { useEffect, useState } from 'react';

interface TelegramWebApp {
  ready: () => void;
  close: () => void;
  expand: () => void;
  CloudStorage?: {
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
  version: string;
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
      
      // Проверяем версию для CloudStorage
      const version = parseFloat(app.version || '0');
      const hasCloudStorage = app.CloudStorage && 
        typeof app.CloudStorage.setItem === 'function' &&
        typeof app.CloudStorage.getItem === 'function';
      
      if (hasCloudStorage && version >= 6.1) {
        setCloudStorageReady(true);
        console.log('✅ Telegram Cloud Storage доступен (версия ' + app.version + ')');
      } else {
        setCloudStorageReady(false);
        console.log('❌ Telegram Cloud Storage недоступен');
        console.log('📱 Версия Telegram Web App:', app.version || 'неизвестно');
        console.log('⚠️ Требуется версия 6.1+ для Cloud Storage');
        console.log('💡 Обновите Telegram или используйте веб-версию');
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

  // Методы для работы с облачным хранилищем - только если действительно доступно
  const setCloudData = async (key: string, value: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!tg?.CloudStorage || !cloudStorageReady) {
        console.log('❌ Cloud Storage недоступен для записи');
        resolve(false);
        return;
      }
      
      console.log(`📤 Сохраняем в облако ключ: ${key}`);
      
      try {
        tg.CloudStorage.setItem(key, value, (error, result) => {
          if (error) {
            console.error(`❌ Ошибка сохранения ${key}:`, error);
            resolve(false);
          } else {
            console.log(`✅ Успешно сохранен ключ: ${key}`);
            resolve(result || true);
          }
        });
      } catch (error) {
        console.error(`❌ Исключение при сохранении ${key}:`, error);
        resolve(false);
      }
    });
  };

  const getCloudData = async (key: string): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!tg?.CloudStorage || !cloudStorageReady) {
        console.log('❌ Cloud Storage недоступен для чтения');
        resolve(null);
        return;
      }
      
      console.log(`📥 Загружаем из облака ключ: ${key}`);
      
      try {
        tg.CloudStorage.getItem(key, (error, result) => {
          if (error) {
            console.error(`❌ Ошибка загрузки ${key}:`, error);
            resolve(null);
          } else {
            console.log(`✅ Загружен ключ ${key}:`, result ? 'данные найдены' : 'данных нет');
            resolve(result || null);
          }
        });
      } catch (error) {
        console.error(`❌ Исключение при загрузке ${key}:`, error);
        resolve(null);
      }
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
    getCloudData
  };
};
