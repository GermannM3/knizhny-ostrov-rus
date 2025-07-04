import { useState, useRef, useEffect } from 'react';
import { useTelegram } from '@/hooks/useTelegram';

interface SyncResult {
  success: boolean;
  message: string;
}

export const useSync = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { telegramId, tg, cloudStorageReady } = useTelegram();
  const syncedOnce = useRef(false);

  const SYNC_KEYS = [
    'bookplatform_users',
    'bookplatform_books', 
    'bookplatform_chapters',
    'bookplatform_current_user',
    'bookplatform_purchases',
    'bookplatform_reading_progress',
    'bookplatform_favorites'
  ];

  const saveToServer = async (): Promise<SyncResult> => {
    if (!telegramId) {
      return { success: false, message: 'Telegram ID не найден' };
    }

    const data: Record<string, string> = {};
    SYNC_KEYS.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) data[key] = value;
    });

    try {
      const response = await fetch('https://hvzxsjoszgakugpstipe.supabase.co/functions/v1/sync-save', {
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
      const response = await fetch('https://hvzxsjoszgakugpstipe.supabase.co/functions/v1/sync-load', {
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
        if (error) {
          console.warn(`❌ CloudStorage setItem error for ${key}:`, error);
          resolve(false);
        } else {
          console.log(`✅ CloudStorage saved: ${key}`);
          resolve(true);
        }
      });
    });
  };

  const cloudLoadAll = async (): Promise<Record<string, string>> => {
    if (!cloudStorageReady || !tg?.CloudStorage) return {};
    
    return new Promise((resolve) => {
      tg.CloudStorage!.getItems(SYNC_KEYS, (error, result) => {
        if (error || !result || Object.keys(result).length === 0) {
          console.log('📋 В облаке нет данных');
          resolve({});
        } else {
          console.log('✅ CloudStorage loaded:', Object.keys(result).length, 'keys');
          resolve(result);
        }
      });
    });
  };

  const autoSync = async (): Promise<SyncResult> => {
    if (syncedOnce.current || !telegramId) return { success: false, message: 'Уже синхронизировано' };
    
    console.log('🔄 Автосинхронизация запущена...');
    syncedOnce.current = true;
    
    try {
      if (cloudStorageReady) {
        const cloudData = await cloudLoadAll();
        let updatedCount = 0;
        
        // Загружаем из облака
        for (const [key, value] of Object.entries(cloudData)) {
          if (value) {
            const localValue = localStorage.getItem(key);
            if (localValue !== value) {
              localStorage.setItem(key, value);
              updatedCount++;
            }
          }
        }

        // Сохраняем локальные данные в облако
        for (const key of SYNC_KEYS) {
          const localValue = localStorage.getItem(key);
          if (localValue) {
            await cloudSave(key, localValue);
          }
        }

        localStorage.setItem('sync_timestamp', Date.now().toString());
        localStorage.setItem('sync_status', 'success');
        localStorage.setItem('sync_completed', 'true');

        return { 
          success: true, 
          message: updatedCount > 0 ? `Автосинхронизация: ${updatedCount} ключей` : 'Синхронизация завершена без изменений' 
        };
      } else {
        // Для версий < 6.9 - только загрузка из сервера один раз
        const loadResult = await loadFromServer();
        localStorage.setItem('sync_timestamp', Date.now().toString());
        localStorage.setItem('sync_status', loadResult.success ? 'success' : 'error');
        localStorage.setItem('sync_completed', 'true');
        
        return loadResult;
      }
    } catch (error) {
      localStorage.setItem('sync_status', 'error');
      return { success: false, message: 'Ошибка автосинхронизации: ' + error };
    }
  };

  const manualSync = async (): Promise<SyncResult> => {
    setIsLoading(true);
    
    try {
      console.log('🔄 Ручная синхронизация...');
      
      if (cloudStorageReady) {
        // Полная синхронизация для версий 6.9+
        const cloudData = await cloudLoadAll();
        let updatedCount = 0;
        
        // Загружаем из облака
        for (const [key, value] of Object.entries(cloudData)) {
          if (value) {
            const localValue = localStorage.getItem(key);
            if (localValue !== value) {
              localStorage.setItem(key, value);
              updatedCount++;
            }
          }
        }

        // Сохраняем в облако
        for (const key of SYNC_KEYS) {
          const localValue = localStorage.getItem(key);
          if (localValue) {
            await cloudSave(key, localValue);
          }
        }

        localStorage.setItem('sync_timestamp', Date.now().toString());
        localStorage.setItem('sync_status', 'success');

        return { 
          success: true, 
          message: updatedCount > 0 ? `Синхронизировано ${updatedCount} ключей` : 'Синхронизация завершена без изменений' 
        };
      } else {
        // Ручная синхронизация через API для версий < 6.9
        const loadResult = await loadFromServer();
        await new Promise(resolve => setTimeout(resolve, 500));
        const saveResult = await saveToServer();
        
        localStorage.setItem('sync_timestamp', Date.now().toString());
        localStorage.setItem('sync_status', loadResult.success && saveResult.success ? 'success' : 'error');

        const hasChanges = loadResult.message !== 'Нет изменений' || saveResult.message !== 'Нет изменений для сохранения';
        
        return {
          success: loadResult.success || saveResult.success,
          message: hasChanges ? 'Синхронизация через сервер завершена' : 'Синхронизация завершена без изменений'
        };
      }
    } catch (error) {
      localStorage.setItem('sync_status', 'error');
      return { success: false, message: 'Ошибка синхронизации: ' + error };
    } finally {
      setIsLoading(false);
    }
  };

  // Автосинхронизация один раз при загрузке
  useEffect(() => {
    const syncCompleted = localStorage.getItem('sync_completed');
    if (!syncCompleted && telegramId && !syncedOnce.current) {
      const timer = setTimeout(() => {
        autoSync();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [telegramId, cloudStorageReady]);

  return { 
    sync: manualSync,
    autoSync,
    isLoading, 
    canSync: !!telegramId,
    hasCloudStorage: cloudStorageReady 
  };
};