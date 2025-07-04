import { useState } from 'react';

interface SyncResult {
  success: boolean;
  message: string;
}

export const useSimpleSync = (telegramId?: number | null) => {
  const [isLoading, setIsLoading] = useState(false);

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
          message: updatedCount > 0 ? `Загружено ${updatedCount} элементов` : 'Нет новых данных' 
        };
      }
      
      return result;
    } catch (error) {
      return { success: false, message: 'Ошибка загрузки: ' + error };
    }
  };

  const sync = async (): Promise<SyncResult> => {
    setIsLoading(true);
    
    try {
      console.log('🔄 Начинаем синхронизацию...');
      
      // Сначала загружаем данные с сервера
      const loadResult = await loadFromServer();
      
      // Затем сохраняем локальные данные на сервер
      const saveResult = await saveToServer();
      
      const success = loadResult.success || saveResult.success;
      const message = success ? 'Синхронизация завершена' : 'Ошибка синхронизации';
      
      return { success, message };
    } catch (error) {
      return { success: false, message: 'Ошибка синхронизации: ' + error };
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    sync,
    isLoading, 
    canSync: !!telegramId
  };
};