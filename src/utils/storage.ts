import { Book, User, Chapter, Purchase, ReadingProgress, Favorite } from '@/types';

// Генерация уникального ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Ключи для localStorage
const STORAGE_KEYS = {
  BOOKS: 'bookcraft_books',
  USERS: 'bookcraft_users',
  CHAPTERS: 'bookcraft_chapters',
  PURCHASES: 'bookcraft_purchases',
  READING_PROGRESS: 'bookcraft_reading_progress',
  FAVORITES: 'bookcraft_favorites',
  CURRENT_USER: 'bookcraft_current_user'
};

// Утилиты для работы с localStorage
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Ошибка чтения из localStorage (${key}):`, error);
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Ошибка записи в localStorage (${key}):`, error);
  }
};

// Функции для работы с книгами
export const getBooks = (): Book[] => {
  return getFromStorage(STORAGE_KEYS.BOOKS, []);
};

export const saveBooks = (books: Book[]): void => {
  saveToStorage(STORAGE_KEYS.BOOKS, books);
};

export const createBook = (book: Omit<Book, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'isFavorite'>): Book => {
  const newBook: Book = {
    id: generateId(),
    ...book,
    status: 'published',
    views: 0,
    isFavorite: false,
    source: 'internal',
    format: 'bookcraft',
    is_public: book.is_public ?? false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const books = getBooks();
  books.push(newBook);
  saveBooks(books);
  return newBook;
};

export const updateBook = (id: string, updates: Partial<Book>): Book | null => {
  const books = getBooks();
  const index = books.findIndex(book => book.id === id);
  
  if (index === -1) return null;
  
  books[index] = { ...books[index], ...updates, updatedAt: new Date() };
  saveBooks(books);
  return books[index];
};

export const deleteBook = (id: string): boolean => {
  const books = getBooks();
  const filteredBooks = books.filter(book => book.id !== id);
  
  if (filteredBooks.length === books.length) return false;
  
  saveBooks(filteredBooks);
  
  // Также удаляем связанные главы
  const chapters = getChapters();
  const filteredChapters = chapters.filter(chapter => chapter.bookId !== id);
  saveChapters(filteredChapters);
  
  return true;
};

export const getBookById = (id: string): Book | null => {
  const books = getBooks();
  return books.find(book => book.id === id) || null;
};

export const getUserBooks = (userId: string): Book[] => {
  const books = getBooks();
  return books.filter(book => book.authorId === userId);
};

export const getPublishedBooks = (): Book[] => {
  const books = getBooks();
  return books.filter(book => book.status === 'published');
};

export const getPublicBooks = (): Book[] => {
  const books = getBooks();
  return books.filter(book => book.status === 'published' && book.is_public);
};

export const getOtherAuthorsBooks = (currentUserId: string): Book[] => {
  const books = getBooks();
  return books.filter(book => 
    book.status === 'published' && 
    book.is_public && 
    book.authorId !== currentUserId
  );
};

export const saveBook = createBook; // Alias for backward compatibility

// Функции для работы с пользователями
export const getUsers = (): User[] => {
  return getFromStorage(STORAGE_KEYS.USERS, []);
};

export const saveUsers = (users: User[]): void => {
  saveToStorage(STORAGE_KEYS.USERS, users);
};

export const createUser = (userData: Omit<User, 'id' | 'createdAt'>): User => {
  const newUser: User = {
    id: generateId(),
    ...userData,
    createdAt: new Date(),
  };

  const users = getUsers();
  users.push(newUser);
  saveUsers(users);
  return newUser;
};

export const getUserByEmail = (email: string): User | null => {
  const users = getUsers();
  return users.find(user => user.email === email) || null;
};

export const getUserById = (id: string): User | null => {
  const users = getUsers();
  return users.find(user => user.id === id) || null;
};

export const getUserByTelegramId = (telegramId: number): User | null => {
  const users = getUsers();
  return users.find(user => user.telegram_id === telegramId) || null;
};

export const createOrGetUserByTelegramId = (telegramId: number, telegramUser: any): User => {
  let user = getUserByTelegramId(telegramId);
  
  if (!user) {
    // Создаем нового пользователя на основе данных Telegram
    user = createUser({
      email: `telegram_${telegramId}@bookcraft.ru`,
      password: '', // Пароль не нужен для Telegram пользователей
      name: telegramUser.first_name + (telegramUser.last_name ? ` ${telegramUser.last_name}` : ''),
      telegram_id: telegramId
    });
    console.log('✅ Создан новый пользователь Telegram:', user.name, user.telegram_id);
  } else {
    console.log('👤 Найден существующий пользователь Telegram:', user.name, user.telegram_id);
  }
  
  return user;
};

export const saveUser = createUser; // Alias for backward compatibility

export const updateUser = (id: string, updates: Partial<User>): User | null => {
  const users = getUsers();
  const index = users.findIndex(user => user.id === id);
  
  if (index === -1) return null;
  
  users[index] = { ...users[index], ...updates };
  saveUsers(users);
  return users[index];
};

export const loginUser = (email: string, password: string): User | null => {
  const users = getUsers();
  console.log('🔍 Все пользователи в localStorage:', users);
  console.log('🔐 Попытка входа с:', { email, password });
  
  // Специальная проверка для админа
  if (email === 'admin@bookcraft.ru' && password === 'admin123') {
    console.log('🔑 Админский вход - создаем/обновляем пользователя');
    
    let adminUser = users.find(u => u.email === email);
    if (!adminUser) {
      // Создаем админского пользователя
      adminUser = createUser({
        email: 'admin@bookcraft.ru',
        password: 'admin123',
        name: 'Герман - Админ',
        telegram_id: 389694638
      });
      console.log('✅ Создан новый админский пользователь:', adminUser);
    } else {
      console.log('✅ Найден существующий админский пользователь:', adminUser);
    }
    
    setCurrentUser(adminUser);
    return adminUser;
  }
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    setCurrentUser(user);
    return user;
  }
  
  return null;
};

export const logoutUser = (): void => {
  setCurrentUser(null);
};

// Функции для работы с главами
export const getChapters = (): Chapter[] => {
  return getFromStorage(STORAGE_KEYS.CHAPTERS, []);
};

export const saveChapters = (chapters: Chapter[]): void => {
  saveToStorage(STORAGE_KEYS.CHAPTERS, chapters);
};

export const createChapter = (chapter: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'>): Chapter => {
  const newChapter: Chapter = {
    id: generateId(),
    ...chapter,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const chapters = getChapters();
  chapters.push(newChapter);
  saveChapters(chapters);
  return newChapter;
};

export const updateChapter = (id: string, updates: Partial<Chapter>): Chapter | null => {
  const chapters = getChapters();
  const index = chapters.findIndex(chapter => chapter.id === id);
  
  if (index === -1) return null;
  
  chapters[index] = { ...chapters[index], ...updates, updatedAt: new Date() };
  saveChapters(chapters);
  return chapters[index];
};

export const deleteChapter = (id: string): boolean => {
  const chapters = getChapters();
  const filteredChapters = chapters.filter(chapter => chapter.id !== id);
  
  if (filteredChapters.length === chapters.length) return false;
  
  saveChapters(filteredChapters);
  return true;
};

export const getBookChapters = (bookId: string): Chapter[] => {
  const chapters = getChapters();
  return chapters
    .filter(chapter => chapter.bookId === bookId)
    .sort((a, b) => a.chapterNumber - b.chapterNumber);
};

export const getChapterById = (id: string): Chapter | null => {
  const chapters = getChapters();
  return chapters.find(chapter => chapter.id === id) || null;
};

export const saveChapter = createChapter; // Alias for backward compatibility

// Функции для работы с покупками
export const getPurchases = (): Purchase[] => {
  return getFromStorage(STORAGE_KEYS.PURCHASES, []);
};

export const savePurchases = (purchases: Purchase[]): void => {
  saveToStorage(STORAGE_KEYS.PURCHASES, purchases);
};

export const purchaseBook = (userId: string, bookId: string): Purchase => {
  const newPurchase: Purchase = {
    id: generateId(),
    userId,
    bookId,
    purchaseDate: new Date(),
    paid: true
  };

  const purchases = getPurchases();
  purchases.push(newPurchase);
  savePurchases(purchases);
  return newPurchase;
};

export const isPurchased = (userId: string, bookId: string): boolean => {
  const purchases = getPurchases();
  return purchases.some(purchase => 
    purchase.userId === userId && 
    purchase.bookId === bookId && 
    purchase.paid
  );
};

export const getUserPurchases = (userId: string): Purchase[] => {
  const purchases = getPurchases();
  return purchases.filter(purchase => purchase.userId === userId && purchase.paid);
};

export const getPurchasedBooks = (userId: string): Book[] => {
  const purchases = getUserPurchases(userId);
  const books = getBooks();
  
  return purchases
    .map(purchase => books.find(book => book.id === purchase.bookId))
    .filter((book): book is Book => book !== undefined);
};

// Функции для работы с прогрессом чтения
export const getReadingProgress = (): ReadingProgress[] => {
  return getFromStorage(STORAGE_KEYS.READING_PROGRESS, []);
};

export const saveReadingProgress = (progress: Omit<ReadingProgress, 'id'>): void => {
  const allProgress = getReadingProgress();
  const existingIndex = allProgress.findIndex(p => 
    p.userId === progress.userId && p.bookId === progress.bookId
  );

  const newProgress: ReadingProgress = {
    id: existingIndex >= 0 ? allProgress[existingIndex].id : generateId(),
    ...progress,
    lastReadAt: new Date()
  };

  if (existingIndex >= 0) {
    allProgress[existingIndex] = newProgress;
  } else {
    allProgress.push(newProgress);
  }

  saveToStorage(STORAGE_KEYS.READING_PROGRESS, allProgress);
};

export const getUserReadingProgress = (userId: string, bookId: string): ReadingProgress | null => {
  const allProgress = getReadingProgress();
  return allProgress.find(p => p.userId === userId && p.bookId === bookId) || null;
};

// Функции для работы с избранным
export const getFavorites = (): Favorite[] => {
  return getFromStorage(STORAGE_KEYS.FAVORITES, []);
};

export const saveFavorites = (favorites: Favorite[]): void => {
  saveToStorage(STORAGE_KEYS.FAVORITES, favorites);
};

export const addToFavorites = (userId: string, bookId: string): void => {
  const favorites = getFavorites();
  const exists = favorites.some(fav => fav.userId === userId && fav.bookId === bookId);
  
  if (!exists) {
    const newFavorite: Favorite = {
      id: generateId(),
      userId,
      bookId,
      addedAt: new Date()
    };
    favorites.push(newFavorite);
    saveFavorites(favorites);
  }
};

export const removeFromFavorites = (userId: string, bookId: string): void => {
  const favorites = getFavorites();
  const filteredFavorites = favorites.filter(fav => 
    !(fav.userId === userId && fav.bookId === bookId)
  );
  saveFavorites(filteredFavorites);
};

export const isFavorite = (userId: string, bookId: string): boolean => {
  const favorites = getFavorites();
  return favorites.some(fav => fav.userId === userId && fav.bookId === bookId);
};

export const getUserFavorites = (userId: string): Favorite[] => {
  const favorites = getFavorites();
  return favorites.filter(fav => fav.userId === userId);
};

// Функции для работы с текущим пользователем
export const getCurrentUser = (): User | null => {
  return getFromStorage(STORAGE_KEYS.CURRENT_USER, null);
};

export const setCurrentUser = (user: User | null): void => {
  saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
};

// Отладочные функции
export const debugLogAllBooks = (): void => {
  const books = getBooks();
  console.log('📚 Все книги в хранилище:', books.length);
  books.forEach(book => {
    console.log(`  - ${book.title} (${book.id}) - ${book.status} - public: ${book.is_public} - author: ${book.authorId}`);
  });
};

export const clearAllData = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  console.log('🗑️ Все данные очищены');
};
