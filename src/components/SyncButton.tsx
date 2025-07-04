import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useSimpleSync } from '@/hooks/useSimpleSync';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { toast } from '@/hooks/use-toast';

const SyncButton = () => {
  const { telegramId, isTelegramWebApp } = useTelegramWebApp();
  const { sync, isLoading, canSync } = useSimpleSync(telegramId);

  const handleSync = async () => {
    const result = await sync();
    
    toast({
      title: result.success ? "Синхронизация завершена" : "Ошибка синхронизации",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });
  };

  if (!isTelegramWebApp) return null;

  return (
    <Button
      onClick={handleSync}
      disabled={isLoading || !canSync}
      variant="outline"
      size="sm"
      className="border-white/20 text-white hover:bg-white/10"
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
      {isLoading ? 'Синхронизация...' : 'Синхронизировать'}
    </Button>
  );
};

export default SyncButton;