import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TELEGRAM_BOT_TOKEN = '8071472545:AAEJ8YYW26LfJpJg_pcbXDCs9sJnAFiDYhk'
const WEBAPP_URL = 'https://hvzxsjoszgakugpstipe.supabase.co'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json()
    console.log('📨 Telegram webhook:', JSON.stringify(body, null, 2))

    if (body.message) {
      const message = body.message
      const chatId = message.chat.id
      const text = message.text
      const user = message.from

      // Регистрируем/обновляем пользователя
      await supabase.rpc('sync_telegram_data', {
        p_telegram_id: user.id,
        p_data: {
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username
        }
      })

      let responseText = ''
      let replyMarkup = null

      if (text === '/start') {
        responseText = `🎉 Добро пожаловать в BookCraft, ${user.first_name}!\n\nЗдесь вы можете:\n📚 Читать и создавать книги\n🔄 Синхронизировать данные между устройствами\n📖 Публиковать свои произведения\n\nИспользуйте кнопку ниже для запуска приложения:`
        
        replyMarkup = {
          inline_keyboard: [[
            {
              text: '🚀 Открыть BookCraft',
              web_app: { url: WEBAPP_URL }
            }
          ]]
        }
      } else if (text === '/mybooks') {
        // Получаем книги пользователя
        const { data: books } = await supabase
          .from('books')
          .select('id, title, description')
          .eq('author_id', (await supabase.from('users').select('id').eq('telegram_id', user.id).single()).data?.id)
          .limit(5)

        if (books && books.length > 0) {
          responseText = '📚 Ваши книги:\n\n'
          const buttons = books.map(book => ([{
            text: `📖 ${book.title}`,
            web_app: { url: `${WEBAPP_URL}/read/${book.id}` }
          }]))
          
          buttons.push([{
            text: '✍️ Создать новую книгу',
            web_app: { url: `${WEBAPP_URL}/create` }
          }])

          replyMarkup = { inline_keyboard: buttons }
          responseText += books.map(book => `📖 ${book.title}\n${book.description?.substring(0, 100)}...`).join('\n\n')
        } else {
          responseText = '📚 У вас пока нет книг.\n\nСоздайте свою первую книгу с помощью кнопки ниже:'
          replyMarkup = {
            inline_keyboard: [[
              {
                text: '✍️ Создать книгу',
                web_app: { url: `${WEBAPP_URL}/create` }
              }
            ]]
          }
        }
      } else if (text === '/popular') {
        // Получаем популярные книги
        const { data: books } = await supabase
          .from('books')
          .select('id, title, description, stats')
          .eq('is_public', true)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(5)

        if (books && books.length > 0) {
          responseText = '🔥 Популярные книги:\n\n'
          const buttons = books.map(book => ([{
            text: `📖 ${book.title}`,
            web_app: { url: `${WEBAPP_URL}/read/${book.id}` }
          }]))

          buttons.push([{
            text: '📚 Посмотреть все книги',
            web_app: { url: `${WEBAPP_URL}/library` }
          }])

          replyMarkup = { inline_keyboard: buttons }
          responseText += books.map(book => 
            `📖 ${book.title}\n${book.description?.substring(0, 100)}...\n👁️ ${book.stats?.views || 0} просмотров`
          ).join('\n\n')
        } else {
          responseText = '📚 Пока нет опубликованных книг.\n\nСтаньте первым автором!'
          replyMarkup = {
            inline_keyboard: [[
              {
                text: '✍️ Создать книгу',
                web_app: { url: `${WEBAPP_URL}/create` }
              }
            ]]
          }
        }
      } else if (text.startsWith('/read ')) {
        const bookId = text.split(' ')[1]
        if (bookId) {
          responseText = '📖 Открываю книгу для чтения...'
          replyMarkup = {
            inline_keyboard: [[
              {
                text: '📖 Читать книгу',
                web_app: { url: `${WEBAPP_URL}/read/${bookId}` }
              }
            ]]
          }
        } else {
          responseText = 'Пожалуйста, укажите ID книги: /read <book_id>'
        }
      } else {
        responseText = `🤖 Доступные команды:

/start - Главное меню
/mybooks - Мои книги  
/popular - Популярные книги
/read <book_id> - Читать книгу

Или используйте кнопку для запуска приложения:`
        
        replyMarkup = {
          inline_keyboard: [[
            {
              text: '🚀 Открыть BookCraft',
              web_app: { url: WEBAPP_URL }
            }
          ]]
        }
      }

      // Отправляем ответ
      const telegramResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: responseText,
          reply_markup: replyMarkup,
          parse_mode: 'HTML'
        })
      })

      const result = await telegramResponse.json()
      console.log('📤 Telegram response:', result)
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('❌ Telegram bot error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})