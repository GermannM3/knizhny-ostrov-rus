import { User, Book, Chapter, Purchase, ReadingProgress, Favorite } from '@/types';

const STORAGE_KEYS = {
  USERS: 'bookplatform_users',
  BOOKS: 'bookplatform_books',
  CHAPTERS: 'bookplatform_chapters',
  CURRENT_USER: 'bookplatform_current_user',
  PURCHASES: 'bookplatform_purchases',
  READING_PROGRESS: 'bookplatform_reading_progress',
  FAVORITES: 'bookplatform_favorites'
};

// Исправленное стабильное хеширование пароля
const hashPassword = (password: string): string => {
  const salt = 'bookcraft_salt_2024';
  const combined = password + salt;
  let hash = 0;
  
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Приводим к 32-битному целому
  }
  
  return Math.abs(hash).toString();
};

const verifyPassword = (password: string, hash: string): boolean => {
  const computedHash = hashPassword(password);
  console.log('Проверка пароля:', { computedHash, storedHash: hash, match: computedHash === hash });
  return computedHash === hash;
};

// Создание или обновление тестового пользователя и его книг
const ensureTestUserAndBooks = () => {
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  const books = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKS) || '[]');
  const testEmail = 'germannm@vk.com';
  const testPassword = 'Germ@nnM3';
  
  let testUser = users.find((u: User) => u.email === testEmail);
  const correctHash = hashPassword(testPassword);
  
  if (!testUser) {
    // Создаем нового тестового пользователя
    testUser = {
      id: 'test-user-hermann',
      email: testEmail,
      name: 'Герман Кенг',
      password: correctHash,
      createdAt: new Date()
    };
    users.push(testUser);
    console.log('Создан новый тестовый пользователь');
  } else {
    // Обновляем пароль существующего пользователя
    testUser.password = correctHash;
    console.log('Обновлен пароль тестового пользователя');
  }
  
  // Исправляем authorId для всех книг автора "Герман Кенг"
  let booksUpdated = false;
  books.forEach((book: Book) => {
    // Проверяем книги по имени автора или содержанию названия
    const shouldBelongToTestUser = 
      (book.title && book.title.includes('Герман')) ||
      (book.title && book.title.includes('жизнь')) ||
      (book.description && book.description.includes('Герман'));
    
    if (shouldBelongToTestUser && book.authorId !== testUser.id) {
      console.log('Обновляем authorId для книги:', book.title, 'с', book.authorId, 'на', testUser.id);
      book.authorId = testUser.id;
      booksUpdated = true;
    }
  });
  
  // Проверяем, есть ли у пользователя тестовая книга
  const userBooks = books.filter((book: Book) => book.authorId === testUser.id);
  console.log('Найдено книг пользователя после обновления:', userBooks.length);
  
  if (userBooks.length === 0) {
    // Создаем тестовую книгу для пользователя
    const testBook: Book = {
      id: 'test-book-hermann-' + Date.now(),
      title: 'Тестовая книга Германа',
      description: 'Это тестовая книга для проверки функциональности системы',
      genre: 'Фантастика',
      coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
      authorId: testUser.id,
      status: 'published',
      views: 5,
      isFavorite: false,
      source: 'internal',
      format: 'bookcraft',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    books.push(testBook);
    console.log('Создана тестовая книга для пользователя');
    booksUpdated = true;
  }
  
  if (booksUpdated) {
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
    console.log('Обновлены связи книг с пользователем');
  }
  
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  console.log('Тестовый пользователь сохранен с хешем пароля:', correctHash);
  return testUser;
};

// Обновленная функция для создания или получения пользователя по telegram_id
export const createOrGetUserByTelegramId = (telegramId: number, telegramUser: any): User => {
  const users = getUsers();
  
  // Ищем существующего пользователя по telegram_id
  let existingUser = users.find(u => u.telegram_id === telegramId);
  
  if (existingUser) {
    console.log('👤 Найден существующий пользователь по Telegram ID:', existingUser.email);
    return existingUser;
  }
  
  // Создаем нового пользователя на основе Telegram профиля
  const newUser: User = {
    id: `telegram_${telegramId}_${Date.now()}`,
    email: `telegram_${telegramId}@bookcraft.ru`,
    name: telegramUser.first_name + (telegramUser.last_name ? ` ${telegramUser.last_name}` : ''),
    password: hashPassword(`telegram_${telegramId}_${Date.now()}`), // Случайный пароль
    telegram_id: telegramId,
    createdAt: new Date()
  };
  
  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  
  // Автоматически авторизуем пользователя
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
  
  console.log('✅ Создан новый пользователь из Telegram:', newUser.name, newUser.telegram_id);
  return newUser;
};

// Обновление пользователя
export const updateUser = (userId: string, updates: Partial<User>): User | null => {
  const users = getUsers();
  const index = users.findIndex(user => user.id === userId);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return users[index];
  }
  return null;
};

// Пользователи
export const saveUser = (user: Omit<User, 'id' | 'createdAt'>): User => {
  const users = getUsers();
  
  // Проверяем, что пользователь с таким email не существует
  const existingUser = users.find(u => u.email === user.email);
  if (existingUser) {
    throw new Error('Пользователь с таким email уже существует');
  }
  
  const newUser: User = {
    ...user,
    id: Date.now().toString(),
    password: hashPassword(user.password),
    createdAt: new Date()
  };
  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  
  // Автоматически авторизуем пользователя после регистрации
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
  
  return newUser;
};

export const getUsers = (): User[] => {
  // Всегда обеспечиваем наличие тестового пользователя и его книг
  ensureTestUserAndBooks();
  
  const users = localStorage.getItem(STORAGE_KEYS.USERS);
  return users ? JSON.parse(users) : [];
};

export const loginUser = (email: string, password: string): User | null => {
  console.log('=== НАЧАЛО ПРОЦЕССА ВХОДА ===');
  console.log('Email:', email);
  console.log('Пароль для проверки:', password);
  
  const users = getUsers();
  console.log('Всего пользователей в базе:', users.length);
  console.log('Пользователи:', users.map(u => ({ email: u.email, id: u.id })));
  
  const user = users.find(u => u.email === email);
  if (user) {
    console.log('Пользователь найден:', { email: user.email, id: user.id });
    console.log('Сохраненный хеш пароля:', user.password);
    
    const inputHash = hashPassword(password);
    console.log('Хеш введенного пароля:', inputHash);
    
    const passwordMatch = verifyPassword(password, user.password);
    console.log('Результат проверки пароля:', passwordMatch);
    
    if (passwordMatch) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      console.log('✅ УСПЕШНЫЙ ВХОД');
      return user;
    } else {
      console.log('❌ НЕВЕРНЫЙ ПАРОЛЬ');
    }
  } else {
    console.log('❌ ПОЛЬЗОВАТЕЛЬ НЕ НАЙДЕН');
  }
  
  console.log('=== КОНЕЦ ПРОЦЕССА ВХОДА ===');
  return null;
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : null;
};

export const logoutUser = (): void => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

export const getUserByEmail = (email: string): User | null => {
  const users = getUsers();
  return users.find(user => user.email === email) || null;
};

// Обновленная функция сохранения книги с поддержкой is_public
export const saveBook = (book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): Book => {
  const books = getBooks();
  const newBook: Book = {
    ...book,
    id: Date.now().toString(),
    views: 0,
    isFavorite: false,
    source: book.source || 'internal',
    format: book.format || 'bookcraft',
    is_public: book.is_public ?? false, // По умолчанию приватная
    createdAt: new Date(),
    updatedAt: new Date()
  };
  books.push(newBook);
  localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
  return newBook;
};

export const getBooks = (): Book[] => {
  const books = localStorage.getItem(STORAGE_KEYS.BOOKS);
  return books ? JSON.parse(books) : [];
};

export const getBookById = (bookId: string): Book | null => {
  const books = getBooks();
  return books.find(book => book.id === bookId) || null;
};

export const incrementBookViews = (bookId: string): void => {
  const books = getBooks();
  const bookIndex = books.findIndex(book => book.id === bookId);
  if (bookIndex !== -1) {
    books[bookIndex].views = (books[bookIndex].views || 0) + 1;
    books[bookIndex].updatedAt = new Date();
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
  }
};

export const getUserBooks = (userId: string): Book[] => {
  const books = getBooks();
  const userBooks = books.filter(book => book.authorId === userId);
  console.log(`Поиск книг для пользователя ${userId}:`, userBooks.length);
  console.log('Все книги в базе:', books.map(b => ({ title: b.title, authorId: b.authorId })));
  return userBooks;
};

export const getPublishedBooks = (): Book[] => {
  return getBooks().filter(book => book.status === 'published' && book.source !== 'external');
};

// Получение всех публичных книг
export const getPublicBooks = (): Book[] => {
  const books = getBooks();
  const users = getUsers();
  
  return books
    .filter(book => book.is_public && book.source !== 'external')
    .map(book => {
      const author = users.find(u => u.id === book.authorId);
      return {
        ...book,
        author: author ? {
          name: author.name,
          telegram_id: author.telegram_id
        } : undefined
      };
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

// Получение книг других авторов (исключая текущего пользователя)
export const getOtherAuthorsBooks = (currentUserId: string): Book[] => {
  const books = getBooks();
  const users = getUsers();
  
  return books
    .filter(book => book.is_public && book.authorId !== currentUserId && book.source !== 'external')
    .map(book => {
      const author = users.find(u => u.id === book.authorId);
      return {
        ...book,
        author: author ? {
          name: author.name,
          telegram_id: author.telegram_id
        } : undefined
      };
    })
    .sort((a, b) => (b.views || 0) - (a.views || 0));
};

export const updateBook = (bookId: string, updates: Partial<Book>): Book | null => {
  const books = getBooks();
  const index = books.findIndex(book => book.id === bookId);
  if (index !== -1) {
    books[index] = { ...books[index], ...updates, updatedAt: new Date() };
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
    return books[index];
  }
  return null;
};

export const deleteBook = (bookId: string): boolean => {
  const books = getBooks();
  const filteredBooks = books.filter(book => book.id !== bookId);
  if (filteredBooks.length !== books.length) {
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(filteredBooks));
    // Удаляем также все главы этой книги
    const chapters = getChapters();
    const filteredChapters = chapters.filter(chapter => chapter.bookId !== bookId);
    localStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(filteredChapters));
    return true;
  }
  return false;
};

// Главы
export const saveChapter = (chapter: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'>): Chapter => {
  const chapters = getChapters();
  const newChapter: Chapter = {
    ...chapter,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  chapters.push(newChapter);
  localStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(chapters));
  return newChapter;
};

export const getChapters = (): Chapter[] => {
  const chapters = localStorage.getItem(STORAGE_KEYS.CHAPTERS);
  return chapters ? JSON.parse(chapters) : [];
};

export const getBookChapters = (bookId: string): Chapter[] => {
  return getChapters()
    .filter(chapter => chapter.bookId === bookId)
    .sort((a, b) => a.chapterNumber - b.chapterNumber);
};

export const updateChapter = (chapterId: string, updates: Partial<Chapter>): Chapter | null => {
  const chapters = getChapters();
  const index = chapters.findIndex(chapter => chapter.id === chapterId);
  if (index !== -1) {
    chapters[index] = { ...chapters[index], ...updates, updatedAt: new Date() };
    localStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(chapters));
    return chapters[index];
  }
  return null;
};

export const deleteChapter = (chapterId: string): boolean => {
  const chapters = getChapters();
  const filteredChapters = chapters.filter(chapter => chapter.id !== chapterId);
  if (filteredChapters.length !== chapters.length) {
    localStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(filteredChapters));
    return true;
  }
  return false;
};

// Обновленные функции с поддержкой telegram_id
export const saveReadingProgress = (progress: Omit<ReadingProgress, 'id' | 'lastReadAt'>): ReadingProgress => {
  const progressList = getReadingProgress();
  const currentUser = getCurrentUser();
  
  const existingIndex = progressList.findIndex(p => p.userId === progress.userId && p.bookId === progress.bookId);
  
  if (existingIndex !== -1) {
    progressList[existingIndex] = {
      ...progressList[existingIndex],
      ...progress,
      telegram_id: currentUser?.telegram_id,
      lastReadAt: new Date()
    };
    localStorage.setItem(STORAGE_KEYS.READING_PROGRESS, JSON.stringify(progressList));
    
    // Логгер активности чтения
    console.log(`📖 Пользователь ${currentUser?.name} (TG: ${currentUser?.telegram_id}) читает книгу ID: ${progress.bookId}`);
    
    return progressList[existingIndex];
  } else {
    const newProgress: ReadingProgress = {
      ...progress,
      id: Date.now().toString(),
      telegram_id: currentUser?.telegram_id,
      lastReadAt: new Date()
    };
    progressList.push(newProgress);
    localStorage.setItem(STORAGE_KEYS.READING_PROGRESS, JSON.stringify(progressList));
    
    console.log(`📖 Пользователь ${currentUser?.name} (TG: ${currentUser?.telegram_id}) начал читать книгу ID: ${progress.bookId}`);
    
    return newProgress;
  }
};

export const getReadingProgress = (): ReadingProgress[] => {
  const progress = localStorage.getItem(STORAGE_KEYS.READING_PROGRESS);
  return progress ? JSON.parse(progress) : [];
};

export const getUserReadingProgress = (userId: string, bookId: string): ReadingProgress | null => {
  const progressList = getReadingProgress();
  return progressList.find(p => p.userId === userId && p.bookId === bookId) || null;
};

export const addToFavorites = (userId: string, bookId: string): Favorite => {
  const favorites = getFavorites();
  const currentUser = getCurrentUser();
  
  const existing = favorites.find(f => f.userId === userId && f.bookId === bookId);
  if (existing) {
    throw new Error('Книга уже в избранном');
  }
  
  const newFavorite: Favorite = {
    id: Date.now().toString(),
    userId,
    bookId,
    telegram_id: currentUser?.telegram_id,
    addedAt: new Date()
  };
  
  favorites.push(newFavorite);
  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  return newFavorite;
};

export const removeFromFavorites = (userId: string, bookId: string): boolean => {
  const favorites = getFavorites();
  const filteredFavorites = favorites.filter(f => !(f.userId === userId && f.bookId === bookId));
  
  if (filteredFavorites.length !== favorites.length) {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(filteredFavorites));
    return true;
  }
  return false;
};

export const getFavorites = (): Favorite[] => {
  const favorites = localStorage.getItem(STORAGE_KEYS.FAVORITES);
  return favorites ? JSON.parse(favorites) : [];
};

export const isFavorite = (userId: string, bookId: string): boolean => {
  const favorites = getFavorites();
  return favorites.some(f => f.userId === userId && f.bookId === bookId);
};

export const getUserFavorites = (userId: string): Book[] => {
  const favorites = getFavorites().filter(f => f.userId === userId);
  const books = getBooks();
  
  // Добавляем внешние книги
  const externalBooks: Book[] = [
    {
      id: 'ext-1',
      title: 'Война и мир',
      description: 'Классический роман Льва Толстого о войне 1812 года и судьбах русского дворянства.',
      genre: 'Классическая литература',
      status: 'published',
      coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
      authorId: 'tolstoy',
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 15420,
      isFavorite: false,
      source: 'external',
      format: 'pdf',
      price: 299,
      is_public: true
    },
    {
      id: 'ext-2',
      title: 'Преступление и наказание',
      description: 'Психологический роман Достоевского о моральном конфликте молодого студента.',
      genre: 'Классическая литература',
      status: 'published',
      coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop',
      authorId: 'dostoevsky',
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 12350,
      isFavorite: false,
      source: 'external',
      format: 'epub',
      price: 249,
      is_public: true
    },
    {
      id: 'ext-3',
      title: 'Мастер и Маргарита',
      description: 'Мистический роман Булгакова, переплетающий современность и библейские мотивы.',
      genre: 'Мистика',
      status: 'published',
      coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
      authorId: 'bulgakov',
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 18900,
      isFavorite: false,
      source: 'external',
      format: 'pdf',
      price: 399,
      is_public: true
    },
    {
      id: 'ext-4',
      title: 'Анна Каренина',
      description: 'Роман о любви, страсти и трагических последствиях нарушения общественных норм.',
      genre: 'Классическая литература',
      status: 'published',
      coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop',
      authorId: 'tolstoy',
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 9870,
      isFavorite: false,
      source: 'external',
      format: 'epub',
      price: 279,
      is_public: true
    }
  ];
  
  const allBooks = [...books, ...externalBooks];
  const favoriteBookIds = favorites.map(f => f.bookId);
  
  return allBooks.filter(book => favoriteBookIds.includes(book.id));
};

export const savePurchase = (purchase: Omit<Purchase, 'id' | 'purchaseDate'>): Purchase => {
  const purchases = getPurchases();
  const currentUser = getCurrentUser();
  
  const newPurchase: Purchase = {
    ...purchase,
    id: Date.now().toString(),
    telegram_id: currentUser?.telegram_id,
    purchaseDate: new Date()
  };
  purchases.push(newPurchase);
  localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));
  return newPurchase;
};

export const getPurchases = (): Purchase[] => {
  const purchases = localStorage.getItem(STORAGE_KEYS.PURCHASES);
  return purchases ? JSON.parse(purchases) : [];
};

export const purchaseBook = (userId: string, bookId: string): Purchase => {
  // Проверяем, не куплена ли уже книга
  const existingPurchase = getPurchases().find(p => p.userId === userId && p.bookId === bookId);
  if (existingPurchase) {
    throw new Error('Книга уже куплена');
  }
  
  return savePurchase({
    userId,
    bookId,
    paid: true
  });
};

export const isPurchased = (userId: string, bookId: string): boolean => {
  const purchases = getPurchases();
  return purchases.some(p => p.userId === userId && p.bookId === bookId && p.paid);
};

export const getPurchasedBooks = (userId: string): Book[] => {
  const purchases = getPurchases().filter(p => p.userId === userId && p.paid);
  const books = getBooks();
  
  // Эмулируем внешние книги (те же, что в FindBooksPage)
  const externalBooks: Book[] = [
    {
      id: 'ext-1',
      title: 'Война и мир',
      description: 'Классический роман Льва Толстого о войне 1812 года и судьбах русского дворянства.',
      genre: 'Классическая литература',
      status: 'published',
      coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
      authorId: 'tolstoy',
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 15420,
      isFavorite: false,
      source: 'external',
      format: 'pdf',
      price: 299,
      is_public: true
    },
    {
      id: 'ext-2',
      title: 'Преступление и наказание',
      description: 'Психологический роман Достоевского о моральном конфликте молодого студента.',
      genre: 'Классическая литература',
      status: 'published',
      coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop',
      authorId: 'dostoevsky',
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 12350,
      isFavorite: false,
      source: 'external',
      format: 'epub',
      price: 249,
      is_public: true
    },
    {
      id: 'ext-3',
      title: 'Мастер и Маргарита',
      description: 'Мистический роман Булгакова, переплетающий современность и библейские мотивы.',
      genre: 'Мистика',
      status: 'published',
      coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
      authorId: 'bulgakov',
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 18900,
      isFavorite: false,
      source: 'external',
      format: 'pdf',
      price: 399,
      is_public: true
    },
    {
      id: 'ext-4',
      title: 'Анна Каренина',
      description: 'Роман о любви, страсти и трагических последствиях нарушения общественных норм.',
      genre: 'Классическая литература',
      status: 'published',
      coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop',
      authorId: 'tolstoy',
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 9870,
      isFavorite: false,
      source: 'external',
      format: 'epub',
      price: 279,
      is_public: true
    }
  ];
  
  const allBooks = [...books, ...externalBooks];
  const purchasedBookIds = purchases.map(p => p.bookId);
  
  return allBooks.filter(book => purchasedBookIds.includes(book.id));
};

// Функция для отладки - вывод всех книг
export const debugLogAllBooks = () => {
  const books = getBooks();
  const users = getUsers();
  
  const booksWithAuthors = books.map(book => {
    const author = users.find(u => u.id === book.authorId);
    return {
      id: book.id,
      title: book.title,
      author: author?.name || 'Неизвестный',
      telegram_id: author?.telegram_id || 'Нет',
      is_public: book.is_public,
      views: book.views,
      status: book.status
    };
  });
  
  console.table(booksWithAuthors);
  console.log(`📊 Всего книг: ${books.length}, Публичных: ${books.filter(b => b.is_public).length}`);
};

// Получение статистики для профиля
export const getUserStats = (userId: string) => {
  const userBooks = getUserBooks(userId);
  const progressList = getReadingProgress();
  
  const myBooksReaders = progressList.filter(p => {
    const book = getBookById(p.bookId);
    return book?.authorId === userId;
  });
  
  const uniqueReaders = new Set(myBooksReaders.map(p => p.telegram_id || p.userId)).size;
  
  return {
    totalBooks: userBooks.length,
    publicBooks: userBooks.filter(b => b.is_public).length,
    totalViews: userBooks.reduce((sum, book) => sum + (book.views || 0), 0),
    readersCount: uniqueReaders
  };
};
