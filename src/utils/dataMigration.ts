
import { 
  getBooks, 
  getUsers, 
  getChapters, 
  getPurchases, 
  getReadingProgress, 
  getFavorites,
  getCurrentUser 
} from './storage';
import {
  createSupabaseUser,
  createSupabaseBook,
  createSupabaseChapter,
  createSupabasePurchase,
  saveSupabaseReadingProgress,
  addSupabaseFavorite,
  getSupabaseUserByEmail,
  getSupabaseUserByTelegramId
} from './supabaseStorage';

// Функция для миграции всех данных из localStorage в Supabase
export const migrateAllDataToSupabase = async () => {
  try {
    console.log('🚀 Начинаем миграцию данных в Supabase...');
    
    // Получаем все данные из localStorage
    const localBooks = getBooks();
    const localUsers = getUsers();
    const localChapters = getChapters();
    const localPurchases = getPurchases();
    const localReadingProgress = getReadingProgress();
    const localFavorites = getFavorites();

    console.log('📊 Данные для миграции:', {
      books: localBooks.length,
      users: localUsers.length,
      chapters: localChapters.length,
      purchases: localPurchases.length,
      readingProgress: localReadingProgress.length,
      favorites: localFavorites.length
    });

    // Мапа для сопоставления старых ID с новыми
    const userIdMap = new Map<string, string>();
    const bookIdMap = new Map<string, string>();

    // 1. Мигрируем пользователей
    console.log('👥 Мигрируем пользователей...');
    for (const localUser of localUsers) {
      try {
        // Проверяем, есть ли уже пользователь в Supabase
        let existingUser = null;
        if (localUser.telegram_id) {
          existingUser = await getSupabaseUserByTelegramId(localUser.telegram_id);
        }
        if (!existingUser) {
          existingUser = await getSupabaseUserByEmail(localUser.email);
        }

        if (!existingUser) {
          const newUser = await createSupabaseUser({
            email: localUser.email,
            password: localUser.password,
            name: localUser.name,
            telegram_id: localUser.telegram_id
          });
          if (newUser) {
            userIdMap.set(localUser.id, newUser.id);
            console.log(`✅ Пользователь ${localUser.name} мигрирован`);
          }
        } else {
          userIdMap.set(localUser.id, existingUser.id);
          console.log(`🔄 Пользователь ${localUser.name} уже существует`);
        }
      } catch (error) {
        console.error(`❌ Ошибка миграции пользователя ${localUser.name}:`, error);
      }
    }

    // 2. Мигрируем книги
    console.log('📚 Мигрируем книги...');
    for (const localBook of localBooks) {
      try {
        const newAuthorId = userIdMap.get(localBook.authorId);
        if (newAuthorId) {
          const newBook = await createSupabaseBook({
            title: localBook.title,
            description: localBook.description,
            genre: localBook.genre,
            coverImage: localBook.coverImage,
            authorId: newAuthorId,
            status: localBook.status,
            price: localBook.price || 0,
            views: localBook.views || 0,
            isFavorite: localBook.isFavorite || false,
            source: localBook.source || 'internal',
            format: localBook.format || 'bookcraft',
            is_public: localBook.is_public || false
          });
          if (newBook) {
            bookIdMap.set(localBook.id, newBook.id);
            console.log(`✅ Книга "${localBook.title}" мигрирована`);
          }
        } else {
          console.warn(`⚠️ Автор для книги "${localBook.title}" не найден`);
        }
      } catch (error) {
        console.error(`❌ Ошибка миграции книги "${localBook.title}":`, error);
      }
    }

    // 3. Мигрируем главы
    console.log('📖 Мигрируем главы...');
    for (const localChapter of localChapters) {
      try {
        const newBookId = bookIdMap.get(localChapter.bookId);
        if (newBookId) {
          const newChapter = await createSupabaseChapter({
            bookId: newBookId,
            title: localChapter.title,
            content: localChapter.content,
            chapterNumber: localChapter.chapterNumber
          });
          if (newChapter) {
            console.log(`✅ Глава "${localChapter.title}" мигрирована`);
          }
        }
      } catch (error) {
        console.error(`❌ Ошибка миграции главы "${localChapter.title}":`, error);
      }
    }

    // 4. Мигрируем покупки
    console.log('💰 Мигрируем покупки...');
    for (const localPurchase of localPurchases) {
      try {
        const newUserId = userIdMap.get(localPurchase.userId);
        const newBookId = bookIdMap.get(localPurchase.bookId);
        if (newUserId && newBookId) {
          const newPurchase = await createSupabasePurchase({
            userId: newUserId,
            bookId: newBookId,
            paid: localPurchase.paid
          });
          if (newPurchase) {
            console.log(`✅ Покупка мигрирована`);
          }
        }
      } catch (error) {
        console.error(`❌ Ошибка миграции покупки:`, error);
      }
    }

    // 5. Мигрируем прогресс чтения
    console.log('📊 Мигрируем прогресс чтения...');
    for (const localProgress of localReadingProgress) {
      try {
        const newUserId = userIdMap.get(localProgress.userId);
        const newBookId = bookIdMap.get(localProgress.bookId);
        if (newUserId && newBookId) {
          const newProgress = await saveSupabaseReadingProgress({
            userId: newUserId,
            bookId: newBookId,
            currentChapter: localProgress.currentChapter,
            totalChapters: localProgress.totalChapters,
            progress: localProgress.progress
          });
          if (newProgress) {
            console.log(`✅ Прогресс чтения мигрирован`);
          }
        }
      } catch (error) {
        console.error(`❌ Ошибка миграции прогресса чтения:`, error);
      }
    }

    // 6. Мигрируем избранное
    console.log('❤️ Мигрируем избранное...');
    for (const localFavorite of localFavorites) {
      try {
        const newUserId = userIdMap.get(localFavorite.userId);
        const newBookId = bookIdMap.get(localFavorite.bookId);
        if (newUserId && newBookId) {
          const newFavorite = await addSupabaseFavorite(newUserId, newBookId);
          if (newFavorite) {
            console.log(`✅ Избранное мигрировано`);
          }
        }
      } catch (error) {
        console.error(`❌ Ошибка миграции избранного:`, error);
      }
    }

    console.log('🎉 Миграция завершена успешно!');
    return { success: true, userIdMap, bookIdMap };

  } catch (error) {
    console.error('💥 Критическая ошибка миграции:', error);
    return { success: false, error };
  }
};

// Функция для проверки, нужна ли миграция
export const checkMigrationNeeded = () => {
  const localBooks = getBooks();
  const localUsers = getUsers();
  
  // Если есть данные в localStorage, значит нужна миграция
  return localBooks.length > 0 || localUsers.length > 0;
};
