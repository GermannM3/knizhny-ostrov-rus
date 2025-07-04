
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
    console.log('⚠️ Telegram Cloud Storage недоступен для отправки данных');
    console.log('ℹ️ Возможные причины: устаревшая версия Telegram или CloudStorage не поддерживается');
    return false;
  }

  console.log('🌐 Отправляем данные из веб-версии в облако...');
  let syncSuccess = true;
  let syncedCount = 0;

  try {
    // Синхронизируем каждый ключ
    for (const key of SYNC_KEYS) {
      try {
        const localData = localStorage.getItem(key);
        if (localData) {
          console.log(`📤 Отправляем в облако: ${key}`);
          const success = await tg.setCloudData(key, localData);
          if (success) {
            syncedCount++;
          } else {
            console.log(`⚠️ Не удалось отправить ключ: ${key}`);
            syncSuccess = false;
          }
        } else {
          console.log(`📋 Нет локальных данных для ключа: ${key}`);
        }
      } catch (error) {
        console.error(`❌ Ошибка отправки ключа ${key}:`, error);
        syncSuccess = false;
      }
    }

    // Обновляем время синхронизации только если что-то отправили
    if (syncedCount > 0) {
      await updateSyncTime(tg);
      console.log(`✅ Отправка в облако завершена. Синхронизировано ключей: ${syncedCount}/${SYNC_KEYS.length}`);
    } else {
      console.log('ℹ️ Нет данных для синхронизации');
    }

  } catch (error) {
    console.error('❌ Критическая ошибка отправки в облако:', error);
    syncSuccess = false;
  }

  return syncSuccess && syncedCount > 0;
};

// Загружаем данные из облака в localStorage (облако -> Telegram WebApp)
export const loadFromCloud = async (tg: ReturnType<typeof useTelegram>): Promise<boolean> => {
  if (!tg.cloudStorageReady) {
    console.log('⚠️ Telegram Cloud Storage недоступен для загрузки данных');
    console.log('ℹ️ Возможные причины: устаревшая версия Telegram или CloudStorage не поддерживается');
    return false;
  }

  console.log('📥 Загружаем данные из облака в Telegram WebApp...');
  let loadSuccess = true;
  let loadedCount = 0;

  for (const key of SYNC_KEYS) {
    try {
      const cloudData = await tg.getCloudData(key);
      if (cloudData) {
        localStorage.setItem(key, cloudData);
        loadedCount++;
        console.log(`✅ Загружен из облака: ${key}`);
      } else {
        console.log(`📋 Нет облачных данных для ключа: ${key}`);
      }
    } catch (error) {
      console.error(`❌ Ошибка загрузки ключа ${key}:`, error);
      loadSuccess = false;
    }
  }

  console.log(`📊 Загрузка завершена. Загружено ключей: ${loadedCount}/${SYNC_KEYS.length}`);
  return loadSuccess;
};

// Полная синхронизация для Telegram WebApp (загрузка + отправка)
export const fullSync = async (tg: ReturnType<typeof useTelegram>): Promise<boolean> => {
  if (!tg.cloudStorageReady) {
    console.log('⚠️ Полная синхронизация невозможна - Cloud Storage недоступен');
    return false;
  }

  console.log('🔄 Запускаем полную синхронизацию в Telegram WebApp...');
  
  // Сначала загружаем данные из облака
  const loadResult = await loadFromCloud(tg);
  
  // Небольшая пауза для обработки загруженных данных
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Затем отправляем обновленные данные обратно в облако
  const syncResult = await syncToCloud(tg);
  
  return loadResult || syncResult; // Успех если хотя бы одна операция прошла
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
