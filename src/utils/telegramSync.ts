
import { useTelegram } from '@/hooks/useTelegram';

const SYNC_KEYS = [
  'bookplatform_users',
  'bookplatform_books', 
  'bookplatform_chapters',
  'bookplatform_current_user'
];

export class TelegramStorageSync {
  private tg: ReturnType<typeof useTelegram>;
  
  constructor(telegramHook: ReturnType<typeof useTelegram>) {
    this.tg = telegramHook;
  }

  // Синхронизация данных из localStorage в Telegram Cloud Storage
  async syncToCloud(): Promise<void> {
    if (!this.tg.cloudStorageReady) {
      console.log('Telegram Cloud Storage недоступен для синхронизации');
      return;
    }

    console.log('Начинаем синхронизацию в облако...');
    
    for (const key of SYNC_KEYS) {
      const localData = localStorage.getItem(key);
      if (localData) {
        try {
          await this.tg.setCloudData(key, localData);
          console.log(`Синхронизирован ключ ${key} в облако`);
        } catch (error) {
          console.error(`Ошибка синхронизации ключа ${key}:`, error);
        }
      }
    }
    
    console.log('Синхронизация в облако завершена');
  }

  // Синхронизация данных из Telegram Cloud Storage в localStorage
  async syncFromCloud(): Promise<void> {
    if (!this.tg.cloudStorageReady) {
      console.log('Telegram Cloud Storage недоступен для загрузки');
      return;
    }

    console.log('Начинаем загрузку из облака...');
    
    for (const key of SYNC_KEYS) {
      try {
        const cloudData = await this.tg.getCloudData(key);
        if (cloudData) {
          const localData = localStorage.getItem(key);
          
          // Если данных в localStorage нет, или данные в облаке новее
          if (!localData || this.shouldUpdateLocal(localData, cloudData)) {
            localStorage.setItem(key, cloudData);
            console.log(`Обновлен ключ ${key} из облака`);
          }
        }
      } catch (error) {
        console.error(`Ошибка загрузки ключа ${key}:`, error);
      }
    }
    
    console.log('Загрузка из облака завершена');
  }

  // Определяем, нужно ли обновлять локальные данные
  private shouldUpdateLocal(localData: string, cloudData: string): boolean {
    try {
      const local = JSON.parse(localData);
      const cloud = JSON.parse(cloudData);
      
      // Если это массив объектов с датами, сравниваем по последней дате обновления
      if (Array.isArray(local) && Array.isArray(cloud)) {
        const getLatestDate = (arr: any[]) => {
          return arr.reduce((latest, item) => {
            const itemDate = new Date(item.updatedAt || item.createdAt || 0);
            return itemDate > latest ? itemDate : latest;
          }, new Date(0));
        };
        
        return getLatestDate(cloud) > getLatestDate(local);
      }
      
      // Для других случаев просто берем данные из облака
      return true;
    } catch {
      return false;
    }
  }

  // Автоматическая синхронизация при изменениях
  async autoSync(): Promise<void> {
    if (!this.tg.isTelegramApp) return;
    
    // Сначала загружаем данные из облака
    await this.syncFromCloud();
    
    // Затем отправляем локальные изменения в облако
    await this.syncToCloud();
  }
}

// Хук для использования синхронизации
export const useTelegramSync = () => {
  const tg = useTelegram();
  const sync = new TelegramStorageSync(tg);
  
  return {
    syncToCloud: () => sync.syncToCloud(),
    syncFromCloud: () => sync.syncFromCloud(), 
    autoSync: () => sync.autoSync(),
    isReady: tg.cloudStorageReady && tg.isTelegramApp
  };
};
