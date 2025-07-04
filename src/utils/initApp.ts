
// Telegram bot initialization removed

// App initialization
export const initializeApp = () => {
  console.log('🚀 BookCraft Russia - инициализация приложения');
  
  console.log('✅ Приложение инициализировано');
  
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
      version: '1.0.0',
      features: {
        telegramBot: true,
        webApp: true,
        publicBooks: true
      }
    };
  }
};
