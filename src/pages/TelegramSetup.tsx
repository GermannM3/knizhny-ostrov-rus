import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const TelegramSetup = () => {
  const [webhookStatus, setWebhookStatus] = useState<'unknown' | 'success' | 'error'>('unknown');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const setupWebhook = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('telegram-stars', {
        body: { action: 'setup_webhook' }
      });

      if (error) throw error;

      if (data.success) {
        setWebhookStatus('success');
        toast({
          title: "Webhook настроен!",
          description: `URL: ${data.webhook_url}`,
        });
      } else {
        setWebhookStatus('error');
        toast({
          title: "Ошибка настройки webhook",
          description: data.description,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      setWebhookStatus('error');
      console.error('Setup webhook error:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось настроить webhook",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🤖 Настройка Telegram Bot
          </h1>
          <p className="text-gray-300">
            Настройка системы оплаты Telegram Stars
          </p>
        </div>

        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Settings className="h-5 w-5" />
              Конфигурация бота
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Telegram Bot</p>
                <p className="text-white font-mono">@BookCraft_Russ_bot</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Bot Token</p>
                <p className="text-white font-mono">8071472545:***</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">WebApp URL</p>
                <p className="text-white font-mono">knizhny-ostrov-rus.lovable.app</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Owner ID</p>
                <p className="text-white font-mono">389694638</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <CheckCircle className="h-5 w-5" />
              Webhook Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Webhook Status:</span>
              <Badge variant={
                webhookStatus === 'success' ? 'default' : 
                webhookStatus === 'error' ? 'destructive' : 'secondary'
              }>
                {webhookStatus === 'success' && <CheckCircle className="h-3 w-3 mr-1" />}
                {webhookStatus === 'error' && <XCircle className="h-3 w-3 mr-1" />}
                {webhookStatus === 'unknown' ? 'Не настроен' : 
                 webhookStatus === 'success' ? 'Активен' : 'Ошибка'}
              </Badge>
            </div>

            <div className="text-sm text-gray-400">
              <p className="mb-2">Webhook URL:</p>
              <code className="block bg-gray-800 p-2 rounded text-xs text-gray-300">
                https://hvzxsjoszgakugpstipe.supabase.co/functions/v1/telegram-stars/webhook
              </code>
            </div>

            <Button 
              onClick={setupWebhook}
              disabled={loading}
              className="w-full"
              variant={webhookStatus === 'success' ? 'outline' : 'default'}
            >
              {loading ? 'Настройка...' : 
               webhookStatus === 'success' ? 'Перенастроить Webhook' : 'Настроить Webhook'}
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white">Инструкции по тестированию</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-300">
            <div className="space-y-2">
              <h4 className="font-semibold text-white">1. Настройка Telegram Stars</h4>
              <p className="text-sm">
                • Перейдите в @BotFather → /mybots → BookCraft_Russ_bot → Monetization → Telegram Stars<br/>
                • Укажите user_id = 389694638 как получателя выплат
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-white">2. Тестирование оплаты</h4>
              <p className="text-sm">
                • Перейдите в /torrent-library<br/>
                • Добавьте тестовую книгу<br/>
                • Нажмите "Купить за 100 ⭐"<br/>
                • Проверьте, что платеж обрабатывается корректно
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-white">3. Проверка логов</h4>
              <p className="text-sm">
                • Откройте логи Edge Function для отладки<br/>
                • Проверьте, что webhook получает события от Telegram
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TelegramSetup;