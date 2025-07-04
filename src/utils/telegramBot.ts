
const BOT_TOKEN = '8071472545:AAEJ8YYW26LfJpJg_pcbXDCs9sJnAFiDYhk';
const BOT_API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;
const WEBAPP_URL = 'https://t.me/BookCraft_Russ_bot/BookCraftRussia';

interface TelegramMessage {
  message_id: number;
  from: {
    id: number;
    first_name: string;
    username?: string;
  };
  chat: {
    id: number;
    type: string;
  };
  text: string;
}

export class TelegramBot {
  static async sendMessage(chatId: number, text: string, replyMarkup?: any) {
    try {
      const response = await fetch(`${BOT_API_URL}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
          reply_markup: replyMarkup,
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }

  static async handleStart(chatId: number, firstName: string) {
    const text = `
🎉 <b>Добро пожаловать в BookCraft Russia, ${firstName}!</b>

📚 Создавайте, читайте и делитесь книгами с сообществом русскоязычных авторов.

<b>Что умеет бот:</b>
• 📖 /mybooks - Ваши книги
• 🔥 /popular - Популярные книги
• 📚 /read - Читать книгу по ID
    `;

    const keyboard = {
      inline_keyboard: [
        [
          {
            text: '🌐 Открыть BookCraft',
            web_app: { url: WEBAPP_URL }
          }
        ],
        [
          { text: '📖 Мои книги', callback_data: 'my_books' },
          { text: '🔥 Популярные', callback_data: 'popular_books' }
        ]
      ]
    };

    return this.sendMessage(chatId, text, keyboard);
  }

  static async handleMyBooks(chatId: number, telegramId: number) {
    const books = this.getUserBooks(telegramId);
    
    if (books.length === 0) {
      const text = `
📝 <b>У вас пока нет созданных книг</b>

Откройте BookCraft WebApp, чтобы создать свою первую книгу!
      `;
      
      const keyboard = {
        inline_keyboard: [
          [
            {
              text: '✍️ Создать книгу',
              web_app: { url: `${WEBAPP_URL}?page=create` }
            }
          ]
        ]
      };
      
      return this.sendMessage(chatId, text, keyboard);
    }

    let text = `📚 <b>Ваши книги (${books.length}):</b>\n\n`;
    const keyboard = { inline_keyboard: [] as any[] };

    books.slice(0, 5).forEach((book, index) => {
      text += `${index + 1}. <b>${book.title}</b>\n`;
      text += `   ${book.is_public ? '🌐 Публичная' : '🔒 Черновик'} • 👁 ${book.views} просмотров\n\n`;
      
      keyboard.inline_keyboard.push([
        {
          text: `📖 ${book.title}`,
          web_app: { url: `${WEBAPP_URL}?book=${book.id}` }
        }
      ]);
    });

    keyboard.inline_keyboard.push([
      {
        text: '🌐 Открыть все книги',
        web_app: { url: `${WEBAPP_URL}?page=dashboard` }
      }
    ]);

    return this.sendMessage(chatId, text, keyboard);
  }

  static async handlePopular(chatId: number) {
    const books = this.getPopularBooks();
    
    if (books.length === 0) {
      return this.sendMessage(chatId, '📚 <b>Пока нет опубликованных книг</b>');
    }

    let text = `🔥 <b>Популярные книги:</b>\n\n`;
    const keyboard = { inline_keyboard: [] as any[] };

    books.slice(0, 5).forEach((book, index) => {
      text += `${index + 1}. <b>${book.title}</b>\n`;
      text += `   ✍️ ${book.author?.name || 'Неизвестный автор'} • 👁 ${book.views} просмотров\n\n`;
      
      keyboard.inline_keyboard.push([
        {
          text: `📖 ${book.title}`,
          web_app: { url: `${WEBAPP_URL}?book=${book.id}` }
        }
      ]);
    });

    keyboard.inline_keyboard.push([
      {
        text: '🌐 Открыть библиотеку',
        web_app: { url: WEBAPP_URL }
      }
    ]);

    return this.sendMessage(chatId, text, keyboard);
  }

  static async handleRead(chatId: number, bookId: string) {
    const book = this.getBookById(bookId);
    
    if (!book) {
      return this.sendMessage(chatId, '❌ <b>Книга не найдена</b>');
    }

    if (!book.is_public) {
      return this.sendMessage(chatId, '🔒 <b>Книга недоступна для чтения</b>');
    }

    const text = `
📖 <b>${book.title}</b>

${book.description}

✍️ <b>Автор:</b> ${book.author?.name || 'Неизвестный автор'}
📅 <b>Жанр:</b> ${book.genre}
👁 <b>Просмотры:</b> ${book.views}
    `;

    const keyboard = {
      inline_keyboard: [
        [
          {
            text: '📖 Читать книгу',
            web_app: { url: `${WEBAPP_URL}?read=${book.id}` }
          }
        ]
      ]
    };

    return this.sendMessage(chatId, text, keyboard);
  }

  // Вспомогательные методы для работы с данными
  static getUserBooks(telegramId: number) {
    try {
      const books = JSON.parse(localStorage.getItem('bookplatform_books') || '[]');
      const users = JSON.parse(localStorage.getItem('bookplatform_users') || '[]');
      
      const user = users.find((u: any) => u.telegram_id === telegramId);
      if (!user) return [];
      
      return books.filter((book: any) => book.authorId === user.id);
    } catch {
      return [];
    }
  }

  static getPopularBooks() {
    try {
      const books = JSON.parse(localStorage.getItem('bookplatform_books') || '[]');
      const users = JSON.parse(localStorage.getItem('bookplatform_users') || '[]');
      
      return books
        .filter((book: any) => book.is_public)
        .map((book: any) => {
          const author = users.find((u: any) => u.id === book.authorId);
          return { ...book, author };
        })
        .sort((a: any, b: any) => (b.views || 0) - (a.views || 0));
    } catch {
      return [];
    }
  }

  static getBookById(bookId: string) {
    try {
      const books = JSON.parse(localStorage.getItem('bookplatform_books') || '[]');
      const users = JSON.parse(localStorage.getItem('bookplatform_users') || '[]');
      
      const book = books.find((b: any) => b.id === bookId);
      if (!book) return null;
      
      const author = users.find((u: any) => u.id === book.authorId);
      return { ...book, author };
    } catch {
      return null;
    }
  }

  // Основной обработчик сообщений
  static async processMessage(message: TelegramMessage) {
    const { from, chat, text } = message;
    const chatId = chat.id;
    const telegramId = from.id;
    const firstName = from.first_name;

    console.log(`📱 Telegram Bot: получено сообщение от ${firstName} (${telegramId}): ${text}`);

    if (text.startsWith('/start')) {
      return this.handleStart(chatId, firstName);
    }
    
    if (text === '/mybooks') {
      return this.handleMyBooks(chatId, telegramId);
    }
    
    if (text === '/popular') {
      return this.handlePopular(chatId);
    }
    
    if (text.startsWith('/read ')) {
      const bookId = text.replace('/read ', '').trim();
      return this.handleRead(chatId, bookId);
    }

    // Команда не распознана
    return this.sendMessage(chatId, '❓ Команда не распознана. Используйте /start для помощи.');
  }
}

// Экспорт для использования в других файлах
export const initTelegramBot = () => {
  console.log('🤖 Telegram Bot инициализирован с токеном:', BOT_TOKEN.substring(0, 10) + '...');
  
  // Здесь можно добавить webhook setup если нужно
  return {
    processMessage: TelegramBot.processMessage,
    sendMessage: TelegramBot.sendMessage
  };
};
