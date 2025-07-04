import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, CloudOff, AlertTriangle, CheckCircle, RefreshCw, WifiOff } from 'lucide-react';
import { useTelegram } from '@/hooks/useTelegram';
import { useSync } from '@/hooks/useSync';
import { toast } from '@/hooks/use-toast';

const SyncStatus = () => {
  const { cloudStorageReady, isTelegramApp, tg } = useTelegram();
  const { sync, isLoading, canSync, hasCloudStorage } = useSync();
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<string>('unknown');

  // Обновляем статус синхронизации
  useEffect(() => {
    const updateStatus = () => {
      const timestamp = localStorage.getItem('sync_timestamp');
      const status = localStorage.getItem('sync_status') || 'unknown';
      
      setLastSyncTime(timestamp ? new Date(parseInt(timestamp)) : null);
      setSyncStatus(status);
    };

    updateStatus();
    const interval = setInterval(updateStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!isTelegramApp) return null;

  const handleSync = async () => {
    const result = await sync();
    
    toast({
      title: result.success ? "Синхронизация завершена" : "Ошибка синхронизации",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });

    // Обновляем статус
    setLastSyncTime(new Date());
    setSyncStatus(result.success ? 'success' : 'error');

    // Перезагружаем только если были реальные изменения
    if (result.success && result.message.includes('Синхронизировано') && !result.message.includes('Нет изменений')) {
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'no_changes':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case 'success':
        return 'Синхронизировано';
      case 'error':
        return 'Ошибка';
      case 'no_changes':
        return 'Без изменений';
      default:
        return 'Не синхронизировано';
    }
  };

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Никогда';
    
    const now = new Date();
    const diffMs = now.getTime() - lastSyncTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} ч назад`;
    
    return lastSyncTime.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {/* Баннер для версий < 6.9 */}
      {!hasCloudStorage && (
        <Alert>
          <CloudOff className="h-4 w-4" />
          <AlertDescription>
            Cloud Storage доступен только в Telegram 6.9+. 
            Используйте ручную синхронизацию для обмена данными между устройствами.
          </AlertDescription>
        </Alert>
      )}

      {/* Карточка статуса */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            {hasCloudStorage ? (
              <Cloud className="h-4 w-4 text-blue-500" />
            ) : (
              <CloudOff className="h-4 w-4 text-gray-500" />
            )}
            Статус синхронизации
          </CardTitle>
          <CardDescription>
            {hasCloudStorage 
              ? `Автоматическая синхронизация (Telegram ${tg?.version})`
              : 'Только ручная синхронизация'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="text-sm">{getStatusText()}</span>
            </div>
            <Badge variant="outline">
              {formatLastSync()}
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleSync}
              disabled={isLoading || !canSync}
              size="sm"
              variant={hasCloudStorage ? "default" : "outline"}
              className="flex-1"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : hasCloudStorage ? (
                <Cloud className="h-4 w-4 mr-2" />
              ) : (
                <WifiOff className="h-4 w-4 mr-2" />
              )}
              {isLoading ? 'Синхронизация...' : hasCloudStorage ? 'Автосинхронизация' : 'Синхронизировать вручную'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SyncStatus;