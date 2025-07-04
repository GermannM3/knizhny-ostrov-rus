
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

// Функции синхронизации
export const syncToCloud = async (tg: ReturnType<typeof useTelegram>): Promise<boolean> => {
  if (!tg.cloudStorageReady) {
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
          await tg.setCloudData(key, localData);
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
      await updateSyncTime(tg);
      console.log('✅ Отправка в облако завершена успешно');
    } else {
      console.log('⚠️ Отправка в облако завершена с ошибками');
    }

  } catch (error) {
    console.error('❌ Критическая ошибка отправки в облако:', error);
    syncSuccess = false;
  }

  return syncSuccess;
};

// Загружаем данные из облака в localStorage (облако -> Telegram WebApp)
export const loadFromCloud = async (tg: ReturnType<typeof useTelegram>): Promise<boolean> => {
  if (!tg.cloudStorageReady) {
    console.log('❌ Telegram Cloud Storage недоступен для загрузки');
    return false;
  }

  console.log('📥 Загружаем данные из облака в Telegram WebApp...');
  let loadSuccess = true;

  for (const key of SYNC_KEYS) {
    try {
      const cloudData = await tg.getCloudData(key);
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
};

// Полная синхронизация для Telegram WebApp (загрузка + отправка)
export const fullSync = async (tg: ReturnType<typeof useTelegram>): Promise<boolean> => {
  console.log('🔄 Запускаем полную синхронизацию в Telegram WebApp...');
  
  // Сначала загружаем данные из облака
  const loadResult = await loadFromCloud(tg);
  
  // Небольшая пауза для обработки загруженных данных
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Затем отправляем обновленные данные обратно в облако
  const syncResult = await syncToCloud(tg);
  
  return loadResult && syncResult;
};

// Обновляем время синхронизации
const updateSyncTime = async (tg: ReturnType<typeof useTelegram>): Promise<void> => {
  try {
    await tg.setCloudData('sync_timestamp', Date.now().toString());
  } catch (error) {
    console.error('Ошибка обновления времени синхронизации:', error);
  }
};

// Хук для использования синхронизации
export const useTelegramSync = () => {
  const tg = useTelegram();
  
  return {
    // Полная синхронизация (для Telegram WebApp)
    sync: () => fullSync(tg),
    // Только загрузка из облака
    loadFromCloud: () => loadFromCloud(tg),
    // Только отправка в облако (для веб-версии)
    syncToCloud: () => syncToCloud(tg),
    // Готовность к синхронизации
    isReady: tg.cloudStorageReady,
    // Telegram-режим
    isTelegramApp: tg.isTelegramApp
  };
};
