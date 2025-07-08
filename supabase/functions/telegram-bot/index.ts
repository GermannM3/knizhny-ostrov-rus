import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Bot, Context, webhookCallback } from 'https://deno.land/x/grammy@v1.19.2/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN') || '8071472545:AAEJ8YYW26LfJpJg_pcbXDCs9sJnAFiDYhk'
const WEBAPP_URL = 'https://knizhny-ostrov-rus.lovable.app'

const bot = new Bot(TELEGRAM_BOT_TOKEN)
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// Функция для синхронизации пользователя
async function syncUser(ctx: Context) {
  if (!ctx.from) return
  
  const { data: syncResult, error: syncError } = await supabase.rpc('sync_telegram_data', {
    p_telegram_id: ctx.from.id,
    p_data: {
      first_name: ctx.from.first_name,
      last_name: ctx.from.last_name,
      username: ctx.from.username
    }
  })
  
  if (syncError) {
    console.error('❌ Ошибка синхронизации пользователя:', syncError)
  } else {
    console.log('✅ Пользователь синхронизирован:', syncResult)
  }
}

// Команда /start
bot.command('start', async (ctx) => {
  await syncUser(ctx)
  
  await ctx.reply(
    `🎉 Добро пожаловать в BookCraft, ${ctx.from?.first_name}!\n\nЗдесь вы можете:\n📚 Читать и создавать книги\n🔄 Синхронизировать данные между устройствами\n📖 Публиковать свои произведения\n\nИспользуйте кнопку ниже для запуска приложения:`,
    {
      reply_markup: {
        inline_keyboard: [[
          {
            text: '🚀 Открыть BookCraft',
            web_app: { url: `${WEBAPP_URL}/library` }
          }
        ]]
      }
    }
  )
})

// Команда /mybooks
bot.command('mybooks', async (ctx) => {
  await syncUser(ctx)
  
  if (!ctx.from) return
  
  // Получаем пользователя и его книги
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('telegram_id', ctx.from.id)
    .single()
  
  if (!user) {
    await ctx.reply('❌ Пользователь не найден')
    return
  }
  
  const { data: books } = await supabase
    .from('books')
    .select('id, title, description')
    .eq('author_id', user.id)
    .limit(5)

  if (books && books.length > 0) {
    const buttons = books.map(book => ([{
      text: `📖 ${book.title}`,
      web_app: { url: `${WEBAPP_URL}/read/${book.id}` }
    }]))
    
    buttons.push([{
      text: '✍️ Создать новую книгу',
      web_app: { url: `${WEBAPP_URL}/create` }
    }])

    const responseText = '📚 Ваши книги:\n\n' + 
      books.map(book => `📖 ${book.title}\n${book.description?.substring(0, 100)}...`).join('\n\n')
    
    await ctx.reply(responseText, {
      reply_markup: { inline_keyboard: buttons }
    })
  } else {
    await ctx.reply('📚 У вас пока нет книг.\n\nСоздайте свою первую книгу с помощью кнопки ниже:', {
      reply_markup: {
        inline_keyboard: [[
          {
            text: '✍️ Создать книгу',
            web_app: { url: `${WEBAPP_URL}/create` }
          }
        ]]
      }
    })
  }
})

// Команда /popular
bot.command('popular', async (ctx) => {
  const { data: books } = await supabase
    .from('books')
    .select('id, title, description, stats')
    .eq('is_public', true)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(5)

  if (books && books.length > 0) {
    const buttons = books.map(book => ([{
      text: `📖 ${book.title}`,
      web_app: { url: `${WEBAPP_URL}/read/${book.id}` }
    }]))

    buttons.push([{
      text: '📚 Посмотреть все книги',
      web_app: { url: `${WEBAPP_URL}/library` }
    }])

    const responseText = '🔥 Популярные книги:\n\n' + 
      books.map(book => 
        `📖 ${book.title}\n${book.description?.substring(0, 100)}...\n👁️ ${book.stats?.views || 0} просмотров`
      ).join('\n\n')
    
    await ctx.reply(responseText, {
      reply_markup: { inline_keyboard: buttons }
    })
  } else {
    await ctx.reply('📚 Пока нет опубликованных книг.\n\nСтаньте первым автором!', {
      reply_markup: {
        inline_keyboard: [[
          {
            text: '✍️ Создать книгу',
            web_app: { url: `${WEBAPP_URL}/create` }
          }
        ]]
      }
    })
  }
})

// Команда /read с параметром
bot.hears(/^\/read (.+)/, async (ctx) => {
  const bookId = ctx.match[1]
  if (bookId) {
    await ctx.reply('📖 Открываю книгу для чтения...', {
      reply_markup: {
        inline_keyboard: [[
          {
            text: '📖 Читать книгу',
            web_app: { url: `${WEBAPP_URL}/read/${bookId}` }
          }
        ]]
      }
    })
  } else {
    await ctx.reply('Пожалуйста, укажите ID книги: /read <book_id>')
  }
})

// Команда /setup - настройка webhook для Stars
bot.command('setup', async (ctx) => {
  if (ctx.from?.id !== 389694638) {
    await ctx.reply('❌ Только администратор может выполнить эту команду')
    return
  }

  try {
    const { data, error } = await supabase.functions.invoke('telegram-stars', {
      body: { action: 'setup_webhook' }
    })

    if (error) throw error

    if (data.success) {
      await ctx.reply(`✅ Webhook настроен успешно!\n\nURL: ${data.webhook_url}`)
    } else {
      await ctx.reply(`❌ Ошибка настройки webhook: ${data.description}`)
    }
  } catch (error: any) {
    await ctx.reply(`❌ Ошибка: ${error.message}`)
  }
})

// Команда /library - открыть библиотеку торрентов
bot.command('library', async (ctx) => {
  await ctx.reply('📚 Откройте библиотеку торрентов:', {
    reply_markup: {
      inline_keyboard: [[
        {
          text: '📚 Библиотека торрентов',
          web_app: { url: `${WEBAPP_URL}/torrent-library` }
        }
      ]]
    }
  })
})

// Команда помощи и неизвестные команды
bot.on('message', async (ctx) => {
  if (ctx.message.text?.startsWith('/')) {
    await ctx.reply(
      `🤖 Доступные команды:

/start - Главное меню
/mybooks - Мои книги  
/popular - Популярные книги
/library - Библиотека торрентов (Stars)
/read <book_id> - Читать книгу
/setup - Настроить webhook (только админ)

Или используйте кнопку для запуска приложения:`,
      {
        reply_markup: {
        inline_keyboard: [[
          {
            text: '🚀 Открыть BookCraft',
            web_app: { url: `${WEBAPP_URL}/library` }
          }
        ]]
        }
      }
    )
  }
})

// Создаем webhook handler
const handleUpdate = webhookCallback(bot, 'std/http')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    return await handleUpdate(req)
  } catch (error) {
    console.error('❌ Telegram bot error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})