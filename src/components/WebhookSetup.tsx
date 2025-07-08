import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function WebhookSetup() {
  const [loading, setLoading] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<'unknown' | 'success' | 'error'>('unknown');
  const { toast } = useToast();

  const setupWebhook = async () => {
    setLoading(true);
    try {
      console.log('🔧 Настройка webhook...');
      
      const response = await fetch('https://48cd7bea-154b-4d35-b5f0-105caa1889cd.supabase.co/functions/v1/setup-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('📡 Результат настройки webhook:', data);
      
      if (data.success) {
        setWebhookStatus('success');
        toast({
          title: "✅ Webhook настроен",
          description: "Telegram бот готов к работе!",
        });
      } else {
        setWebhookStatus('error');
        toast({
          title: "❌ Ошибка webhook",
          description: data.error || "Не удалось настроить webhook",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('❌ Ошибка настройки webhook:', error);
      setWebhookStatus('error');
      toast({
        title: "❌ Ошибка",
        description: "Не удалось настроить webhook",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Настройка Telegram Bot</span>
        </CardTitle>
        <p className="text-gray-300 text-sm">
          Настройте webhook для работы бота @BookCraft_Russ_bot
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-medium">Статус webhook</h3>
            <p className="text-gray-400 text-sm">
              Webhook: https://48cd7bea-154b-4d35-b5f0-105caa1889cd.supabase.co/functions/v1/telegram-bot
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {webhookStatus === 'success' && (
              <CheckCircle className="h-6 w-6 text-green-500" />
            )}
            {webhookStatus === 'error' && (
              <XCircle className="h-6 w-6 text-red-500" />
            )}
            {webhookStatus === 'unknown' && (
              <div className="h-6 w-6 rounded-full bg-gray-500" />
            )}
          </div>
        </div>

        <Button 
          onClick={setupWebhook} 
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Настройка...</span>
            </div>
          ) : (
            <>
              <Settings className="h-4 w-4 mr-2" />
              Настроить Webhook
            </>
          )}
        </Button>

        <div className="text-xs text-gray-400 space-y-1">
          <p>📱 Бот: @BookCraft_Russ_bot</p>
          <p>🌐 WebApp: knizhny-ostrov-rus.lovable.app</p>
          <p>🔑 Admin ID: 389694638</p>
        </div>
      </CardContent>
    </Card>
  );
}