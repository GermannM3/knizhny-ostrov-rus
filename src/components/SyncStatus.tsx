import { useState, useEffect, useRef } from 'react';
import { useDebouncedEffect } from '@/hooks/useDebouncedEffect';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, CloudOff, AlertTriangle, CheckCircle, RefreshCw, WifiOff } from 'lucide-react';
import { useTelegram } from '@/hooks/useTelegram';
import { useManualSync } from '@/utils/manualSync';
import { useTelegramSync } from '@/utils/telegramSync';
import { toast } from '@/hooks/use-toast';

const SyncStatus = () => {
  const tg = useTelegram();
  const manualSync = useManualSync();
  const telegramSync = useTelegramSync();
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<string>('unknown');
  const didAutoSyncOnce = useRef(false);

  // Обновляем статус синхронизации с debounce
  const updateStatus = () => {
    const timestamp = localStorage.getItem('sync_timestamp');
    const status = localStorage.getItem('sync_status') || 'unknown';
    
    setLastSyncTime(timestamp ? new Date(parseInt(timestamp)) : null);
    setSyncStatus(status);
  };

  useDebouncedEffect(() => {
    updateStatus();
  }, [], 300);

  useEffect(() => {
    // Обновляем каждые 30 секунд
    const interval = setInterval(updateStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Автосинхронизация только один раз за сессию
  useEffect(() => {
    const didSync = localStorage.getItem('sync_completed');
    if (!didAutoSyncOnce.current && tg.cloudStorageReady && !didSync) {
      handleAutoSync();
      didAutoSyncOnce.current = true;
      localStorage.setItem('sync_completed', 'true');
    }
  }, [tg.cloudStorageReady]);

  // Не показываем компонент если не в Telegram
  if (!tg.isTelegramApp) {
    return null;
  }

  const handleManualSync = async () => {
    setIsLoading(true);
    
    try {
      const result = await manualSync.fullSync();
      
      if (result.success) {
        toast({
          title: "Синхронизация завершена",
          description: result.message,
        });
        
        // Обновляем статус
        setLastSyncTime(new Date());
        setSyncStatus('success');
        
        // Перезагружаем страницу только если были изменения
        if (result.message !== 'Синхронизация завершена без изменений') {
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      } else {
        toast({
          title: "Ошибка синхронизации",
          description: result.message,
          variant: "destructive",
        });
        setSyncStatus('error');
      }
    } catch (error) {
      console.error('❌ Ошибка ручной синхронизации:', error);
      toast({
        title: "Ошибка синхронизации",
        description: "Попробуйте еще раз через несколько секунд",
        variant: "destructive",
      });
      setSyncStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoSync = async () => {
    if (!tg.cloudStorageReady) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await telegramSync.sync();
      
      if (result.success) {
        toast({
          title: "Синхронизация завершена",
          description: result.message,
        });
        
        setLastSyncTime(new Date());
        setSyncStatus('success');
        
        // Перезагружаем только если были изменения
        if (result.message !== 'Синхронизация завершена без изменений') {
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      } else {
        toast({
          title: "Синхронизация завершена",
          description: result.message,
          variant: result.hasCloudStorage ? "default" : "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Ошибка автосинхронизации:', error);
      toast({
        title: "Ошибка синхронизации",
        description: "Попробуйте еще раз через несколько секунд",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
      {!tg.cloudStorageReady && (
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
            {tg.cloudStorageReady ? (
              <Cloud className="h-4 w-4 text-blue-500" />
            ) : (
              <CloudOff className="h-4 w-4 text-gray-500" />
            )}
            Статус синхронизации
          </CardTitle>
          <CardDescription>
            {tg.cloudStorageReady 
              ? `Автоматическая синхронизация (Telegram ${tg.tg?.version})`
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
            {tg.cloudStorageReady ? (
              <Button
                onClick={handleAutoSync}
                disabled={isLoading}
                size="sm"
                className="flex-1"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Cloud className="h-4 w-4 mr-2" />
                )}
                {isLoading ? 'Синхронизация...' : 'Автосинхронизация'}
              </Button>
            ) : (
              <Button
                onClick={handleManualSync}
                disabled={isLoading || !manualSync.isReady}
                size="sm"
                variant="outline"
                className="flex-1"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <WifiOff className="h-4 w-4 mr-2" />
                )}
                {isLoading ? 'Синхронизация...' : 'Синхронизировать вручную'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SyncStatus;