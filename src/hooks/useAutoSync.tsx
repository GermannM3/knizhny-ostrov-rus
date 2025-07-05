import { useEffect } from 'react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useSimpleSync } from '@/hooks/useSimpleSync';

export const useAutoSync = () => {
  const { telegramId, isTelegramWebApp } = useTelegramWebApp();
  const { sync } = useSimpleSync(telegramId);

  const syncData = async () => {
    if (!isTelegramWebApp || !telegramId) return;
    
    try {
      const result = await sync();
      if (result.success) {
        console.log('🔄 Автосинхронизация выполнена:', result.message);
      }
    } catch (error) {
      console.error('❌ Ошибка автосинхронизации:', error);
    }
  };

  return { syncData, canSync: isTelegramWebApp && !!telegramId };
};