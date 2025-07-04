
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { useTelegramSync } from '@/utils/telegramSync';
import { toast } from '@/hooks/use-toast';

const SyncButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const telegramSync = useTelegramSync();

  const handleSync = async () => {
    if (!telegramSync.hasCloudStorage) {
      toast({
        title: "Синхронизация недоступна",
        description: "Требуется Telegram версии 6.1+ для синхронизации данных",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🔄 Запуск ручной синхронизации...');
      const result = await telegramSync.sync();
      
      if (result.success) {
        toast({
          title: "Синхронизация завершена",
          description: result.message,
        });
        
        // Перезагружаем страницу если были изменения
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast({
          title: "Синхронизация завершена",
          description: result.message,
          variant: result.hasCloudStorage ? "default" : "destructive",
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

  if (!telegramSync.isTelegramApp) {
    return null; // Показываем только в Telegram WebApp
  }

  return (
    <Button
      onClick={handleSync}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="border-white/20 text-white hover:bg-white/10"
    >
      {isLoading ? (
        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
      ) : telegramSync.hasCloudStorage ? (
        <Cloud className="h-4 w-4 mr-2" />
      ) : (
        <CloudOff className="h-4 w-4 mr-2" />
      )}
      {isLoading ? 'Синхронизация...' : 'Синхронизировать'}
    </Button>
  );
};

export default SyncButton;
