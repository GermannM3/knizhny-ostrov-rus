import { useState } from 'react';
import { useTelegram } from '@/hooks/useTelegram';

interface SyncResult {
  success: boolean;
  message: string;
}

export const useSync = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { telegramId, tg, cloudStorageReady } = useTelegram();

  const saveToServer = async (): Promise<SyncResult> => {
    if (!telegramId) {
      return { success: false, message: 'Telegram ID не найден' };
    }

    const data: Record<string, string> = {};
    const keys = [
      'bookplatform_users',
      'bookplatform_books', 
      'bookplatform_chapters',
      'bookplatform_current_user',
      'bookplatform_purchases',
      'bookplatform_reading_progress',
      'bookplatform_favorites'
    ];

    keys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) data[key] = value;
    });

    try {
      const response = await fetch('/api/telegram-sync/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegram_id: telegramId, data }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return { success: false, message: 'Ошибка сохранения: ' + error };
    }
  };

  const loadFromServer = async (): Promise<SyncResult> => {
    if (!telegramId) {
      return { success: false, message: 'Telegram ID не найден' };
    }

    try {
      const response = await fetch('/api/telegram-sync/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegram_id: telegramId }),
      });

      const result = await response.json();
      
      if (result?.success && result?.data) {
        let updatedCount = 0;
        for (const [key, value] of Object.entries(result.data)) {
          const currentValue = localStorage.getItem(key);
          if (currentValue !== value) {
            localStorage.setItem(key, value as string);
            updatedCount++;
          }
        }
        return { 
          success: true, 
          message: updatedCount > 0 ? `Обновлено ${updatedCount} ключей` : 'Нет изменений' 
        };
      }
      
      return result;
    } catch (error) {
      return { success: false, message: 'Ошибка загрузки: ' + error };
    }
  };

  const cloudSave = async (key: string, value: string): Promise<boolean> => {
    if (!cloudStorageReady || !tg?.CloudStorage) return false;
    
    return new Promise((resolve) => {
      tg.CloudStorage!.setItem(key, value, (error) => {
        resolve(!error);
      });
    });
  };

  const cloudLoad = async (key: string): Promise<string | null> => {
    if (!cloudStorageReady || !tg?.CloudStorage) return null;
    
    return new Promise((resolve) => {
      tg.CloudStorage!.getItem(key, (error, value) => {
        resolve(error ? null : (value || null));
      });
    });
  };

  const sync = async (): Promise<SyncResult> => {
    setIsLoading(true);
    
    try {
      if (cloudStorageReady) {
        // Облачная синхронизация для версий 6.9+
        const keys = [
          'bookplatform_users',
          'bookplatform_books', 
          'bookplatform_chapters',
          'bookplatform_current_user',
          'bookplatform_purchases',
          'bookplatform_reading_progress',
          'bookplatform_favorites'
        ];

        let updatedCount = 0;
        
        // Загружаем из облака
        for (const key of keys) {
          const cloudValue = await cloudLoad(key);
          if (cloudValue) {
            const localValue = localStorage.getItem(key);
            if (localValue !== cloudValue) {
              localStorage.setItem(key, cloudValue);
              updatedCount++;
            }
          }
        }

        // Сохраняем в облако
        for (const key of keys) {
          const localValue = localStorage.getItem(key);
          if (localValue) {
            await cloudSave(key, localValue);
          }
        }

        localStorage.setItem('sync_timestamp', Date.now().toString());
        localStorage.setItem('sync_status', 'success');

        return { 
          success: true, 
          message: updatedCount > 0 ? `Синхронизировано ${updatedCount} ключей` : 'Нет изменений' 
        };
      } else {
        // Ручная синхронизация через API для версий < 6.9
        const loadResult = await loadFromServer();
        await new Promise(resolve => setTimeout(resolve, 500)); // Пауза
        const saveResult = await saveToServer();
        
        localStorage.setItem('sync_timestamp', Date.now().toString());
        localStorage.setItem('sync_status', loadResult.success && saveResult.success ? 'success' : 'error');

        return {
          success: loadResult.success || saveResult.success,
          message: loadResult.success ? loadResult.message : 'Синхронизация через сервер'
        };
      }
    } catch (error) {
      localStorage.setItem('sync_status', 'error');
      return { success: false, message: 'Ошибка синхронизации: ' + error };
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    sync, 
    isLoading, 
    canSync: !!telegramId,
    hasCloudStorage: cloudStorageReady 
  };
};