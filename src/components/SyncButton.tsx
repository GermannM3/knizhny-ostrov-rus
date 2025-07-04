
import { Button } from '@/components/ui/button';
import { Cloud, RefreshCw, WifiOff } from 'lucide-react';
import { useSync } from '@/hooks/useSync';
import { useTelegram } from '@/hooks/useTelegram';
import { toast } from '@/hooks/use-toast';

const SyncButton = () => {
  const { sync, isLoading, canSync, hasCloudStorage } = useSync();
  const { isTelegramApp } = useTelegram();

  const handleSync = async () => {
    const result = await sync();
    
    toast({
      title: result.success ? "Синхронизация завершена" : "Ошибка синхронизации",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });

    // Перезагружаем только если были реальные изменения
    if (result.success && result.message.includes('Синхронизировано') && !result.message.includes('Нет изменений')) {
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  if (!isTelegramApp) return null;

  const getIcon = () => {
    if (isLoading) return <RefreshCw className="h-4 w-4 mr-2 animate-spin" />;
    if (hasCloudStorage) return <Cloud className="h-4 w-4 mr-2" />;
    return <WifiOff className="h-4 w-4 mr-2" />;
  };

  const getButtonText = () => {
    if (isLoading) return 'Синхронизация...';
    if (hasCloudStorage) return 'Синхронизировать';
    return 'Синхронизация вручную';
  };

  return (
    <Button
      onClick={handleSync}
      disabled={isLoading || !canSync}
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
