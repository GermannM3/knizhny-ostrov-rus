import { User, Book, Chapter } from '@/types';

const STORAGE_KEYS = {
  USERS: 'bookplatform_users',
  BOOKS: 'bookplatform_books',
  CHAPTERS: 'bookplatform_chapters',
  CURRENT_USER: 'bookplatform_current_user'
};

// Улучшенное шифрование пароля
const hashPassword = (password: string): string => {
  // Используем простое, но стабильное хеширование
  let hash = 0;
  const salt = 'bookcraft_salt_2024';
  const combined = password + salt;
  
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Конвертируем в 32-битное число
  }
  
  return Math.abs(hash).toString(36);
};

const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};

// Создание тестового пользователя с правильным хешированием
const createTestUser = () => {
  const users = getUsers();
  const testEmail = 'germannm@vk.com';
  
  // Проверяем, что тестовый пользователь не существует
  const existingUser = users.find(u => u.email === testEmail);
  if (existingUser) {
    console.log('Тестовый пользователь уже существует:', existingUser);
    // Обновляем пароль на случай изменения логики хеширования
    existingUser.password = hashPassword('Germ@nnM3');
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return existingUser;
  }
  
  const testUser: User = {
    id: 'test-user-hermann',
    email: testEmail,
    name: 'Герман Кенг',
    password: hashPassword('Germ@nnM3'),
    createdAt: new Date()
  };
  
  users.push(testUser);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  console.log('Создан тестовый пользователь:', { ...testUser, password: '[HIDDEN]' });
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
  const users = localStorage.getItem(STORAGE_KEYS.USERS);
  const parsedUsers = users ? JSON.parse(users) : [];
  
  // Создаем тестового пользователя, если список пуст
  if (parsedUsers.length === 0) {
    createTestUser();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  }
  
  return parsedUsers;
};

export const loginUser = (email: string, password: string): User | null => {
  const users = getUsers();
  console.log('Попытка входа для:', email);
  console.log('Всего пользователей в базе:', users.length);
  
  const user = users.find(u => u.email === email);
  if (user) {
    console.log('Пользователь найден:', user.email);
    console.log('Проверяем пароль...');
    
    const passwordMatch = verifyPassword(password, user.password);
    console.log('Пароль подходит:', passwordMatch);
    
    if (passwordMatch) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      console.log('Пользователь успешно авторизован');
      return user;
    } else {
      console.log('Неверный пароль');
    }
  } else {
    console.log('Пользователь с email', email, 'не найден');
    console.log('Доступные пользователи:', users.map(u => u.email));
  }
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
