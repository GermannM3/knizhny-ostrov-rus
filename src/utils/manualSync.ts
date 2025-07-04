import { useTelegram } from '@/hooks/useTelegram';

// Ключи для синхронизации
const SYNC_KEYS = [
  'bookplatform_users',
  'bookplatform_books', 
  'bookplatform_chapters',
  'bookplatform_current_user',
  'bookplatform_purchases',
  'bookplatform_reading_progress',
  'bookplatform_favorites'
];

// Типы для API ответов
interface SyncResponse {
  success: boolean;
  message: string;
  data?: Record<string, string>;
  timestamp?: number;
}

// Ручная загрузка данных с сервера
export const manualLoadFromServer = async (telegramId: number): Promise<SyncResponse> => {
  try {
    console.log('📥 Запрос данных с сервера для Telegram ID:', telegramId);
    
    const response = await fetch('/api/telegram-sync/load', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ telegram_id: telegramId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: SyncResponse = await response.json();
    
    if (result.success && result.data) {
      // Применяем загруженные данные
      let updatedCount = 0;
      for (const [key, value] of Object.entries(result.data)) {
        const currentValue = localStorage.getItem(key);
        if (currentValue !== value) {
          localStorage.setItem(key, value);
          updatedCount++;
          console.log(`✅ Обновлен ключ: ${key}`);
        }
      }
      
      // Сохраняем время синхронизации
      localStorage.setItem('sync_timestamp', Date.now().toString());
      localStorage.setItem('sync_status', 'success');
      
      return {
        success: true,
        message: `Загружено ${updatedCount} ключей с сервера`,
        timestamp: Date.now()
      };
    }
    
    return result;
  } catch (error) {
    console.error('❌ Ошибка загрузки с сервера:', error);
    localStorage.setItem('sync_status', 'error');
    return {
      success: false,
      message: 'Ошибка связи с сервером: ' + error
    };
  }
};

// Ручная отправка данных на сервер
export const manualSaveToServer = async (telegramId: number): Promise<SyncResponse> => {
  try {
    console.log('📤 Отправка данных на сервер для Telegram ID:', telegramId);
    
    // Собираем данные для отправки
    const currentData: Record<string, string> = {};
    for (const key of SYNC_KEYS) {
      const value = localStorage.getItem(key);
      if (value) {
        currentData[key] = value;
      }
    }
    
    const response = await fetch('/api/telegram-sync/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        telegram_id: telegramId,
        data: currentData
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: SyncResponse = await response.json();
    
    if (result.success) {
      // Сохраняем время синхронизации
      localStorage.setItem('sync_timestamp', Date.now().toString());
      localStorage.setItem('sync_status', 'success');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Ошибка отправки на сервер:', error);
    localStorage.setItem('sync_status', 'error');
    return {
      success: false,
      message: 'Ошибка связи с сервером: ' + error
    };
  }
};

// Полная ручная синхронизация
export const manualFullSync = async (telegramId: number): Promise<SyncResponse> => {
  try {
    console.log('🔄 Запуск полной ручной синхронизации...');
    
    // Сначала загружаем данные с сервера
    const loadResult = await manualLoadFromServer(telegramId);
    
    // Пауза для обработки
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Затем отправляем наши данные на сервер
    const saveResult = await manualSaveToServer(telegramId);
    
    const success = loadResult.success && saveResult.success;
    const message = success 
      ? 'Синхронизация завершена успешно'
      : `Ошибки: ${!loadResult.success ? 'загрузка' : ''} ${!saveResult.success ? 'сохранение' : ''}`;
    
    return {
      success,
      message,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('❌ Ошибка полной синхронизации:', error);
    return {
      success: false,
      message: 'Критическая ошибка синхронизации: ' + error
    };
  }
};

// Хук для ручной синхронизации
export const useManualSync = () => {
  const { telegramId, isTelegramApp, cloudStorageReady } = useTelegram();
  
  return {
    // Функции синхронизации
    loadFromServer: () => telegramId ? manualLoadFromServer(telegramId) : Promise.resolve({ success: false, message: 'Telegram ID не найден' }),
    saveToServer: () => telegramId ? manualSaveToServer(telegramId) : Promise.resolve({ success: false, message: 'Telegram ID не найден' }),
    fullSync: () => telegramId ? manualFullSync(telegramId) : Promise.resolve({ success: false, message: 'Telegram ID не найден' }),
    
    // Статусы
    isReady: !!telegramId,
    isTelegramApp,
    hasCloudStorage: cloudStorageReady,
    needsManualSync: isTelegramApp && !cloudStorageReady,
    
    // Утилиты для статуса
    getLastSyncTime: () => {
      const timestamp = localStorage.getItem('sync_timestamp');
      return timestamp ? new Date(parseInt(timestamp)) : null;
    },
    getSyncStatus: () => localStorage.getItem('sync_status') || 'unknown'
  };
};