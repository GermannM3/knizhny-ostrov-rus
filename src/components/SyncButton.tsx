
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Cloud, CloudOff, RefreshCw, WifiOff } from 'lucide-react';
import { useTelegramSync } from '@/utils/telegramSync';
import { useManualSync } from '@/utils/manualSync';
import { useTelegram } from '@/hooks/useTelegram';
import { toast } from '@/hooks/use-toast';

const SyncButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const tg = useTelegram();
  const telegramSync = useTelegramSync();
  const manualSync = useManualSync();

  const handleSync = async () => {
    setIsLoading(true);
    
    try {
      let result;
      
      if (tg.cloudStorageReady) {
        // Автоматическая синхронизация для версий 6.9+
        console.log('🔄 Запуск автоматической синхронизации...');
        result = await telegramSync.sync();
      } else {
        // Ручная синхронизация для старых версий
        console.log('🔄 Запуск ручной синхронизации...');
        result = await manualSync.fullSync();
      }
      
      if (result.success) {
        toast({
          title: "Синхронизация завершена",
          description: result.message,
        });
        
        // Перезагружаем страницу только если были изменения
        if (result.message !== 'Синхронизация завершена без изменений') {
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      } else {
        toast({
          title: "Синхронизация завершена",
          description: result.message,
          variant: (result as any).hasCloudStorage !== false ? "default" : "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Ошибка синхронизации:', error);
      toast({
        title: "Ошибка синхронизации",
        description: "Попробуйте еще раз через несколько секунд",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!tg.isTelegramApp) {
    return null; // Показываем только в Telegram WebApp
  }

  const getIcon = () => {
    if (isLoading) {
      return <RefreshCw className="h-4 w-4 mr-2 animate-spin" />;
    }
    
    if (tg.cloudStorageReady) {
      return <Cloud className="h-4 w-4 mr-2" />;
    }
    
    return <WifiOff className="h-4 w-4 mr-2" />;
  };

  const getButtonText = () => {
    if (isLoading) {
      return 'Синхронизация...';
    }
    
    if (tg.cloudStorageReady) {
      return 'Синхронизировать';
    }
    
    return 'Синхронизация вручную';
  };

  return (
    <Button
      onClick={handleSync}
      disabled={isLoading || (!tg.cloudStorageReady && !manualSync.isReady)}
      variant="outline"
      size="sm"
      className="border-white/20 text-white hover:bg-white/10"
    >
      {getIcon()}
      {getButtonText()}
    </Button>
  );
};

export default SyncButton;
