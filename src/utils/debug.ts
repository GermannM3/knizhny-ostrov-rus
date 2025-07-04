
// Утилиты для отладки и диагностики данных
export const debugStorage = () => {
  console.log('=== ДИАГНОСТИКА ХРАНИЛИЩА ===');
  
  // Проверяем все ключи localStorage
  const allKeys = Object.keys(localStorage);
  console.log('Все ключи в localStorage:', allKeys);
  
  // Проверяем ключи BookCraft
  const bookCraftKeys = allKeys.filter(key => 
    key.includes('bookcraft') || key.includes('bookplatform')
  );
  console.log('Ключи BookCraft:', bookCraftKeys);
  
  // Проверяем данные по каждому ключу
  bookCraftKeys.forEach(key => {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        console.log(`${key}:`, Array.isArray(parsed) ? `массив из ${parsed.length} элементов` : typeof parsed, parsed);
      } else {
        console.log(`${key}: пустое значение`);
      }
    } catch (error) {
      console.error(`Ошибка при чтении ${key}:`, error);
    }
  });
  
  // Проверяем размер данных
  const storageSize = JSON.stringify(localStorage).length;
  console.log(`Общий размер localStorage: ${Math.round(storageSize / 1024)} KB`);
  
  console.log('=== КОНЕЦ ДИАГНОСТИКИ ===');
};

export const backupAllData = () => {
  const backup = {};
  const allKeys = Object.keys(localStorage);
  
  allKeys.forEach(key => {
    if (key.includes('bookcraft') || key.includes('bookplatform')) {
      backup[key] = localStorage.getItem(key);
    }
  });
  
  console.log('Резервная копия данных:', backup);
  return backup;
};

export const restoreFromBackup = (backup: Record<string, string>) => {
  Object.entries(backup).forEach(([key, value]) => {
    if (value) {
      localStorage.setItem(key, value);
    }
  });
  console.log('Данные восстановлены из резервной копии');
};
