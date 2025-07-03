
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
