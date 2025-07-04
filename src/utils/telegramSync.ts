
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

// Отправка данных в облако (веб -> облако)
export const syncToCloud = async (tg: ReturnType<typeof useTelegram>): Promise<boolean> => {
  if (!tg.cloudStorageReady) {
    console.log('❌ СИНХРОНИЗАЦИЯ НЕВОЗМОЖНА: Cloud Storage недоступен');
    console.log('📱 Требуется Telegram версии 6.9+ для синхронизации данных');
    return false;
  }

  console.log('🌐 Отправляем данные из локального хранилища в облако...');
  let syncSuccess = true;
  let syncedCount = 0;

  try {
    for (const key of SYNC_KEYS) {
      try {
        const localData = localStorage.getItem(key);
        if (localData) {
          console.log(`📤 Отправляем: ${key} (${Math.round(localData.length/1024)}KB)`);
          const success = await tg.setCloudData(key, localData);
          if (success) {
            syncedCount++;
            console.log(`✅ Отправлен: ${key}`);
          } else {
            console.log(`❌ Не удалось отправить: ${key}`);
            syncSuccess = false;
          }
        } else {
          console.log(`⚪ Пропускаем пустой ключ: ${key}`);
        }
      } catch (error) {
        console.error(`❌ Ошибка отправки ${key}:`, error);
        syncSuccess = false;
      }
    }

    if (syncedCount > 0) {
      await updateSyncTime(tg);
      console.log(`📊 ОТПРАВКА ЗАВЕРШЕНА: ${syncedCount}/${SYNC_KEYS.length} ключей синхронизировано`);
    } else {
      console.log('⚠️ НЕТ ДАННЫХ ДЛЯ ОТПРАВКИ');
    }

  } catch (error) {
    console.error('💥 КРИТИЧЕСКАЯ ОШИБКА ОТПРАВКИ:', error);
    syncSuccess = false;
  }

  return syncSuccess && syncedCount > 0;
};

// Загрузка данных из облака (облако -> локальное хранилище)
export const loadFromCloud = async (tg: ReturnType<typeof useTelegram>): Promise<boolean> => {
  if (!tg.cloudStorageReady) {
    console.log('❌ ЗАГРУЗКА НЕВОЗМОЖНА: Cloud Storage недоступен');
    console.log('📱 Требуется Telegram версии 6.9+ для загрузки данных');
    return false;
  }

  console.log('📥 Загружаем данные из облака в локальное хранилище...');
  let loadSuccess = true;
  let loadedCount = 0;
  let foundDataCount = 0;

  for (const key of SYNC_KEYS) {
    try {
      console.log(`🔍 Проверяем облачные данные для: ${key}`);
      const cloudData = await tg.getCloudData(key);
      if (cloudData) {
        foundDataCount++;
        const currentLocal = localStorage.getItem(key);
        
        // Проверяем, отличаются ли данные
        if (currentLocal !== cloudData) {
          localStorage.setItem(key, cloudData);
          loadedCount++;
          console.log(`✅ Обновлен из облака: ${key} (${Math.round(cloudData.length/1024)}KB)`);
        } else {
          console.log(`⚪ Данные актуальны: ${key}`);
        }
      } else {
        console.log(`📋 В облаке нет данных для: ${key}`);
      }
    } catch (error) {
      console.error(`❌ Ошибка загрузки ${key}:`, error);
      loadSuccess = false;
    }
  }

  console.log(`📊 ЗАГРУЗКА ЗАВЕРШЕНА:`);
  console.log(`   📁 Найдено в облаке: ${foundDataCount}/${SYNC_KEYS.length} ключей`);
  console.log(`   🔄 Обновлено локально: ${loadedCount} ключей`);
  
  return loadSuccess && foundDataCount > 0;
};

// Полная синхронизация с улучшенной логикой для версий 6.9+
export const fullSync = async (tg: ReturnType<typeof useTelegram>): Promise<{ success: boolean, hasCloudStorage: boolean, message: string }> => {
  if (!tg.cloudStorageReady) {
    const message = 'Cloud Storage недоступен. Требуется Telegram версии 6.9+';
    console.log('❌ ПОЛНАЯ СИНХРОНИЗАЦИЯ НЕВОЗМОЖНА:', message);
    return { success: false, hasCloudStorage: false, message };
  }

  console.log('🔄 ЗАПУСК ПОЛНОЙ СИНХРОНИЗАЦИИ для версии 6.9+...');
  
  try {
    // Для версий 6.9+ используем getItems для загрузки всех данных сразу
    const loadResult = await loadFromCloudAdvanced(tg);
    
    // Пауза для обработки
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Затем отправляем актуальные данные
    const syncResult = await syncToCloud(tg);
    
    const success = loadResult || syncResult;
    const message = success 
      ? 'Синхронизация завершена успешно' 
      : 'Синхронизация завершена без изменений';
    
    // Сохраняем время и статус синхронизации
    localStorage.setItem('sync_timestamp', Date.now().toString());
    localStorage.setItem('sync_status', success ? 'success' : 'no_changes');
    
    console.log('🏁 ПОЛНАЯ СИНХРОНИЗАЦИЯ ЗАВЕРШЕНА:', message);
    return { success, hasCloudStorage: true, message };
    
  } catch (error) {
    console.error('💥 КРИТИЧЕСКАЯ ОШИБКА ПОЛНОЙ СИНХРОНИЗАЦИИ:', error);
    localStorage.setItem('sync_status', 'error');
    return { success: false, hasCloudStorage: true, message: 'Ошибка синхронизации: ' + error };
  }
};

// Улучшенная загрузка с использованием getItems для версий 6.9+
const loadFromCloudAdvanced = async (tg: ReturnType<typeof useTelegram>): Promise<boolean> => {
  if (!tg.cloudStorageReady || !tg.tg?.CloudStorage) {
    return false;
  }

  console.log('📥 Загружаем данные из облака (версия 6.9+)...');
  
  return new Promise((resolve) => {
    try {
      // Используем getItems для загрузки всех ключей сразу
      tg.tg!.CloudStorage!.getItems(SYNC_KEYS, (error, result) => {
        if (error) {
          console.error('❌ Ошибка загрузки всех ключей:', error);
          resolve(false);
          return;
        }
        
        if (!result) {
          console.log('📋 В облаке нет данных');
          resolve(false);
          return;
        }
        
        let loadedCount = 0;
        const foundDataCount = Object.keys(result).length;
        
        for (const [key, cloudData] of Object.entries(result)) {
          if (cloudData && SYNC_KEYS.includes(key)) {
            const currentLocal = localStorage.getItem(key);
            
            if (currentLocal !== cloudData) {
              localStorage.setItem(key, cloudData);
              loadedCount++;
              console.log(`✅ Обновлен из облака: ${key} (${Math.round(cloudData.length/1024)}KB)`);
            } else {
              console.log(`⚪ Данные актуальны: ${key}`);
            }
          }
        }
        
        console.log(`📊 ЗАГРУЗКА ЗАВЕРШЕНА (версия 6.9+):`);
        console.log(`   📁 Найдено в облаке: ${foundDataCount}/${SYNC_KEYS.length} ключей`);
        console.log(`   🔄 Обновлено локально: ${loadedCount} ключей`);
        
        resolve(foundDataCount > 0);
      });
    } catch (error) {
      console.error('❌ Исключение при загрузке:', error);
      resolve(false);
    }
  });
};

// Автоматическая синхронизация при изменении данных
export const autoSyncItem = async (tg: ReturnType<typeof useTelegram>, key: string, value: string): Promise<void> => {
  if (!tg.cloudStorageReady || !SYNC_KEYS.includes(key)) {
    return;
  }
  
  console.log(`🔄 Автосинхронизация: ${key}`);
  
  try {
    const success = await tg.setCloudData(key, value);
    if (success) {
      console.log(`✅ Автосинхронизация успешна: ${key}`);
      // Обновляем время последней синхронизации
      await tg.setCloudData('sync_timestamp', Date.now().toString());
    } else {
      console.log(`❌ Ошибка автосинхронизации: ${key}`);
    }
  } catch (error) {
    console.error(`❌ Исключение автосинхронизации ${key}:`, error);
  }
};

// Обновление времени синхронизации
const updateSyncTime = async (tg: ReturnType<typeof useTelegram>): Promise<void> => {
  try {
    await tg.setCloudData('sync_timestamp', Date.now().toString());
    console.log('🕐 Время синхронизации обновлено');
  } catch (error) {
    console.error('⚠️ Ошибка обновления времени синхронизации:', error);
  }
};

// Хук для использования синхронизации
export const useTelegramSync = () => {
  const tg = useTelegram();
  
  return {
    // Полная синхронизация
    sync: () => fullSync(tg),
    // Только загрузка
    loadFromCloud: () => loadFromCloud(tg),
    // Только отправка
    syncToCloud: () => syncToCloud(tg),
    // Автосинхронизация отдельного элемента
    autoSyncItem: (key: string, value: string) => autoSyncItem(tg, key, value),
    // Статусы
    isReady: tg.cloudStorageReady,
    isTelegramApp: tg.isTelegramApp,
    hasCloudStorage: tg.cloudStorageReady
  };
};
