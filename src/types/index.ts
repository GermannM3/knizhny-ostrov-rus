
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
  source?: 'internal' | 'external'; // Добавляем источник книги
  format?: 'pdf' | 'epub' | 'bookcraft'; // Добавляем формат
  price?: number; // Цена для внешних книг
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

// Новый тип для покупок
export interface Purchase {
  id: string;
  userId: string;
  bookId: string;
  purchaseDate: Date;
  paid: boolean;
}
