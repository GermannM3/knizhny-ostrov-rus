
import { useTelegram } from '@/hooks/useTelegram';

// Ключи для синхронизации
const SYNC_KEYS = [
  'bookplatform_users',
  'bookplatform_books', 
  'bookplatform_chapters',
  'bookplatform_current_user'
];

// Простой RPC-подобный синхронизатор
export class TelegramRPCSync {
  private tg: ReturnType<typeof useTelegram>;
  
  constructor(telegramHook: ReturnType<typeof useTelegram>) {
    this.tg = telegramHook;
  }

  // Основной метод синхронизации - Telegram как клиент запрашивает данные у веб-версии
  async syncFromMaster(): Promise<boolean> {
    if (!this.tg.cloudStorageReady || !this.tg.isTelegramApp) {
      console.log('Telegram синхронизация недоступна');
      return false;
    }

    console.log('🔄 Начинаем синхронизацию данных с мастер-версии...');
    let syncSuccess = true;

    try {
      // Получаем текущий timestamp синхронизации
      const lastSyncTime = await this.getLastSyncTime();
      console.log('Последняя синхронизация:', new Date(lastSyncTime).toLocaleString());

      // Синхронизируем каждый ключ
      for (const key of SYNC_KEYS) {
        try {
          await this.syncSingleKey(key);
        } catch (error) {
          console.error(`❌ Ошибка синхронизации ключа ${key}:`, error);
          syncSuccess = false;
        }
      }

      // Обновляем время последней синхронизации
      if (syncSuccess) {
        await this.updateSyncTime();
        console.log('✅ Синхронизация завершена успешно');
      } else {
        console.log('⚠️ Синхронизация завершена с ошибками');
      }

    } catch (error) {
      console.error('❌ Критическая ошибка синхронизации:', error);
      syncSuccess = false;
    }

    return syncSuccess;
  }

  // Синхронизируем один ключ
  private async syncSingleKey(key: string): Promise<void> {
    // Получаем данные из localStorage (мастер-источник)
    const masterData = localStorage.getItem(key);
    
    if (!masterData) {
      console.log(`📋 Нет данных для ключа ${key} в мастер-версии`);
      return;
    }

    // Получаем данные из Telegram Cloud Storage
    const cloudData = await this.tg.getCloudData(key);

    // Если данные отличаются, обновляем облако
    if (masterData !== cloudData) {
      console.log(`🔄 Обновляем облачные данные для ключа: ${key}`);
      await this.tg.setCloudData(key, masterData);
    } else {
      console.log(`✅ Данные для ключа ${key} уже синхронизированы`);
    }
  }

  // Загружаем данные из облака в localStorage (клиентский режим)
  async loadFromCloud(): Promise<boolean> {
    if (!this.tg.cloudStorageReady || !this.tg.isTelegramApp) {
      console.log('Загрузка из облака недоступна');
      return false;
    }

    console.log('📥 Загружаем данные из Telegram Cloud Storage...');
    let loadSuccess = true;

    for (const key of SYNC_KEYS) {
      try {
        const cloudData = await this.tg.getCloudData(key);
        if (cloudData) {
          localStorage.setItem(key, cloudData);
          console.log(`✅ Загружен ключ: ${key}`);
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

  // Полная синхронизация: сначала загружаем из облака, потом обновляем облако
  async fullSync(): Promise<boolean> {
    console.log('🔄 Запускаем полную синхронизацию...');
    
    // Сначала загружаем данные из облака
    const loadResult = await this.loadFromCloud();
    
    // Затем синхронизируем текущие данные в облако
    const syncResult = await this.syncFromMaster();
    
    return loadResult && syncResult;
  }
}

// Хук для использования синхронизации
export const useTelegramSync = () => {
  const tg = useTelegram();
  const sync = new TelegramRPCSync(tg);
  
  return {
    // Основной метод синхронизации
    sync: () => sync.fullSync(),
    // Только загрузка из облака
    loadFromCloud: () => sync.loadFromCloud(),
    // Только отправка в облако
    syncToCloud: () => sync.syncFromMaster(),
    // Готовность к синхронизации
    isReady: tg.cloudStorageReady && tg.isTelegramApp,
    // Telegram-режим
    isTelegramApp: tg.isTelegramApp
  };
};
