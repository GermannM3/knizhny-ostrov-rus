
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  telegram_id?: number;
  createdAt: Date;
}

export interface Book {
  id: string;
  title: string;
  description: string;
  genre: string;
  status: 'draft' | 'published';
  coverImage: string;
  coverUrl?: string; // Для совместимости
  authorId: string;
  author?: {
    name: string;
    telegram_id?: number;
  };
  createdAt: Date;
  updatedAt: Date;
  views: number;
  isFavorite: boolean;
  source?: 'internal' | 'external';
  format?: 'pdf' | 'epub' | 'bookcraft';
  price?: number;
  is_public: boolean;
  chapters?: Chapter[];
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
  telegram_id?: number;
  purchaseDate: Date;
  paid: boolean;
}

export interface ReadingProgress {
  id: string;
  userId: string;
  bookId: string;
  telegram_id?: number;
  currentChapter: number;
  totalChapters: number;
  lastReadAt: Date;
  progress: number;
}

export interface Favorite {
  id: string;
  userId: string;
  bookId: string;
  telegram_id?: number;
  addedAt: Date;
}
