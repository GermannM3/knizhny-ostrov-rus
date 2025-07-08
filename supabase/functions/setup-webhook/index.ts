import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN') || '8071472545:AAEJ8YYW26LfJpJg_pcbXDCs9sJnAFiDYhk'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🔧 Настройка webhook для Telegram бота...')
    
    // URL нашего бота для webhook
    const webhookUrl = 'https://48cd7bea-154b-4d35-b5f0-105caa1889cd.supabase.co/functions/v1/telegram-bot'
    
    // Устанавливаем webhook
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query', 'inline_query', 'pre_checkout_query']
      })
    })
    
    const result = await response.json()
    console.log('📡 Результат установки webhook:', result)
    
    if (result.ok) {
      // Проверяем webhook
      const checkResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`)
      const webhookInfo = await checkResponse.json()
      
      console.log('✅ Webhook успешно настроен:', webhookInfo.result)
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Webhook успешно настроен',
        webhook_url: webhookUrl,
        webhook_info: webhookInfo.result
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    } else {
      throw new Error(result.description || 'Не удалось установить webhook')
    }
    
  } catch (error) {
    console.error('❌ Ошибка настройки webhook:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Ошибка настройки webhook'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})