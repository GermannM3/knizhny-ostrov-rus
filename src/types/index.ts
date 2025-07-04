
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
}

export interface Book {
  id: string;
  title: string;
  description: string;
  genre: string;
  status: 'draft' | 'published';
  coverImage: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  isFavorite: boolean;
  source?: 'internal' | 'external';
  format?: 'pdf' | 'epub' | 'bookcraft';
  price?: number;
}

export interface Chapter {
  id: string;
  bookId: string;
  title: string;
  content: string;
  chapterNumber: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface Purchase {
  id: string;
  userId: string;
  bookId: string;
  purchaseDate: Date;
  paid: boolean;
}

// Новый тип для прогресса чтения
export interface ReadingProgress {
  id: string;
  userId: string;
  bookId: string;
  currentChapter: number;
  totalChapters: number;
  lastReadAt: Date;
  progress: number; // Процент прочтения (0-100)
}

// Новый тип для избранного
export interface Favorite {
  id: string;
  userId: string;
  bookId: string;
  addedAt: Date;
}
