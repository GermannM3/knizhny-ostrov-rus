import { User, Book, Chapter } from '@/types';

const STORAGE_KEYS = {
  USERS: 'bookplatform_users',
  BOOKS: 'bookplatform_books',
  CHAPTERS: 'bookplatform_chapters',
  CURRENT_USER: 'bookplatform_current_user'
};

// Исправленное стабильное хеширование пароля
const hashPassword = (password: string): string => {
  const salt = 'bookcraft_salt_2024';
  const combined = password + salt;
  let hash = 0;
  
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    // Приводим к 32-битному целому числу
    hash |= 0;
  }
  
  // Всегда возвращаем положительное число в виде строки
  return Math.abs(hash).toString();
};

const verifyPassword = (password: string, hash: string): boolean => {
  const computedHash = hashPassword(password);
  console.log('Проверка пароля:', { computedHash, storedHash: hash, match: computedHash === hash });
  return computedHash === hash;
};

// Создание или обновление тестового пользователя
const ensureTestUser = () => {
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
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
  
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  console.log('Тестовый пользователь сохранен с хешем пароля:', correctHash);
  return testUser;
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
  // Всегда обеспечиваем наличие тестового пользователя
  ensureTestUser();
  
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

// Книги
export const saveBook = (book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): Book => {
  const books = getBooks();
  const newBook: Book = {
    ...book,
    id: Date.now().toString(),
    views: 0,
    isFavorite: false,
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
  return getBooks().filter(book => book.authorId === userId);
};

export const getPublishedBooks = (): Book[] => {
  return getBooks().filter(book => book.status === 'published');
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
