import { useEffect } from 'react';

const TelegramInitializer = () => {
  useEffect(() => {
    // Принудительно обновляем версию приложения в Telegram
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-web-app.js?v=' + Date.now();
    script.async = true;
    
    script.onload = () => {
      console.log('🔄 Telegram WebApp script обновлен');
      
      // Принудительно очищаем кеш если это возможно
      if (window.Telegram?.WebApp) {
        const app = window.Telegram.WebApp;
        console.log('📱 Telegram WebApp версия:', app.version);
        console.log('🎨 Тема:', app.colorScheme);
        console.log('👤 Пользователь:', app.initDataUnsafe?.user);
        
        // Уведомляем Telegram о готовности
        app.ready();
        app.expand();
        
        // Добавляем обработчик изменения темы
        if (typeof (app as any).onEvent === 'function') {
          (app as any).onEvent('themeChanged', () => {
            console.log('🎨 Тема изменена на:', app.colorScheme);
            window.location.reload();
          });
        }
      }
    };
    
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null;
};

export default TelegramInitializer;