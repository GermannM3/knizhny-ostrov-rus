
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

// Улучшенный RPC-подобный синхронизатор
export class TelegramRPCSync {
  private tg: ReturnType<typeof useTelegram>;
  
  constructor(telegramHook: ReturnType<typeof useTelegram>) {
    this.tg = telegramHook;
  }

  // Отправляем данные из localStorage в облако (веб-версия -> облако)
  async syncToCloud(): Promise<boolean> {
    if (!this.tg.cloudStorageReady) {
      console.log('❌ Telegram Cloud Storage недоступен для отправки');
      return false;
    }

    console.log('🌐 Отправляем данные из веб-версии в облако...');
    let syncSuccess = true;

    try {
      // Синхронизируем каждый ключ
      for (const key of SYNC_KEYS) {
        try {
          const localData = localStorage.getItem(key);
          if (localData) {
            console.log(`📤 Отправляем в облако: ${key}`);
            await this.tg.setCloudData(key, localData);
          } else {
            console.log(`📋 Нет локальных данных для ключа: ${key}`);
          }
        } catch (error) {
          console.error(`❌ Ошибка отправки ключа ${key}:`, error);
          syncSuccess = false;
        }
      }

      // Обновляем время синхронизации
      if (syncSuccess) {
        await this.updateSyncTime();
        console.log('✅ Отправка в облако завершена успешно');
      } else {
        console.log('⚠️ Отправка в облако завершена с ошибками');
      }

    } catch (error) {
      console.error('❌ Критическая ошибка отправки в облако:', error);
      syncSuccess = false;
    }

    return syncSuccess;
  }

  // Загружаем данные из облака в localStorage (облако -> Telegram WebApp)
  async loadFromCloud(): Promise<boolean> {
    if (!this.tg.cloudStorageReady) {
      console.log('❌ Telegram Cloud Storage недоступен для загрузки');
      return false;
    }

    console.log('📥 Загружаем данные из облака в Telegram WebApp...');
    let loadSuccess = true;

    for (const key of SYNC_KEYS) {
      try {
        const cloudData = await this.tg.getCloudData(key);
        if (cloudData) {
          localStorage.setItem(key, cloudData);
          console.log(`✅ Загружен из облака: ${key}`);
        } else {
          console.log(`📋 Нет облачных данных для ключа: ${key}`);
        }
      } catch (error) {
        console.error(`❌ Ошибка загрузки ключа ${key}:`, error);
        loadSuccess = false;
      }
    }

    return loadSuccess;
  }

  // Полная синхронизация для Telegram WebApp (загрузка + отправка)
  async fullSync(): Promise<boolean> {
    console.log('🔄 Запускаем полную синхронизацию в Telegram WebApp...');
    
    // Сначала загружаем данные из облака
    const loadResult = await this.loadFromCloud();
    
    // Небольшая пауза для обработки загруженных данных
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Затем отправляем обновленные данные обратно в облако
    const syncResult = await this.syncToCloud();
    
    return loadResult && syncResult;
  }

  // Получаем время последней синхронизации
  private async getLastSyncTime(): Promise<number> {
    try {
      const syncTimeStr = await this.tg.getCloudData('sync_timestamp');
      return syncTimeStr ? parseInt(syncTimeStr) : 0;
    } catch {
      return 0;
    }
  }

  // Обновляем время синхронизации
  private async updateSyncTime(): Promise<void> {
    try {
      await this.tg.setCloudData('sync_timestamp', Date.now().toString());
    } catch (error) {
      console.error('Ошибка обновления времени синхронизации:', error);
    }
  }
}

// Хук для использования синхронизации
export const useTelegramSync = () => {
  const tg = useTelegram();
  const sync = new TelegramRPCSync(tg);
  
  return {
    // Полная синхронизация (для Telegram WebApp)
    sync: () => sync.fullSync(),
    // Только загрузка из облака
    loadFromCloud: () => sync.loadFromCloud(),
    // Только отправка в облако (для веб-версии)
    syncToCloud: () => sync.syncToCloud(),
    // Готовность к синхронизации
    isReady: tg.cloudStorageReady,
    // Telegram-режим
    isTelegramApp: tg.isTelegramApp
  };
};
