
import { initTelegramBot } from './telegramBot';

// Инициализация приложения
export const initializeApp = () => {
  console.log('🚀 BookCraft Russia - инициализация приложения');
  
  // Инициализируем Telegram Bot
  const bot = initTelegramBot();
  
  // Глобальные обработчики для отладки
  window.addEventListener('error', (event) => {
    console.error('💥 Глобальная ошибка:', event.error);
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('💥 Необработанное отклонение промиса:', event.reason);
  });
  
  // Экспортируем в window для отладки
  if (process.env.NODE_ENV === 'development') {
    (window as any).BookCraftDebug = {
      bot,
      version: '1.0.0',
      features: {
        telegramBot: true,
        cloudSync: true,
        publicBooks: true
      }
    };
  }
  
  console.log('✅ BookCraft Russia - приложение инициализировано');
};
