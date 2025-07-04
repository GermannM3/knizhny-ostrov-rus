
import { supabase } from '@/integrations/supabase/client';
import { Book, Chapter, User, Purchase, ReadingProgress, Favorite } from '@/types';

// Утилиты для работы с пользователями
export const createSupabaseUser = async (userData: Omit<User, 'createdAt'>) => {
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: userData.id,
      email: userData.email,
      name: userData.name,
      password: userData.password,
      telegram_id: userData.telegram_id,
      full_name: userData.name
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    return null;
  }

  return data;
};

export const getSupabaseUserByEmail = async (email: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }

  return data;
};

export const getSupabaseUserByTelegramId = async (telegramId: number) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', telegramId)
    .single();

  if (error) {
    console.error('Error fetching user by telegram ID:', error);
    return null;
  }

  return data;
};

// Функция для преобразования данных Supabase в формат Book
const mapSupabaseBookToBook = (supabaseBook: any): Book => {
  return {
    id: supabaseBook.id,
    title: supabaseBook.title,
    description: supabaseBook.description,
    genre: supabaseBook.genre,
    status: supabaseBook.status,
    coverImage: supabaseBook.cover_image,
    authorId: supabaseBook.author_id,
    createdAt: new Date(supabaseBook.created_at),
    updatedAt: new Date(supabaseBook.updated_at),
    views: supabaseBook.views || 0,
    isFavorite: supabaseBook.is_favorite || false,
    source: supabaseBook.source || 'internal',
    format: supabaseBook.format || 'bookcraft',
    price: supabaseBook.price || 0,
    is_public: supabaseBook.is_public || false
  };
};

// Утилиты для работы с книгами
export const createSupabaseBook = async (book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => {
  const { data, error } = await supabase
    .from('books')
    .insert({
      title: book.title,
      description: book.description,
      genre: book.genre,
      cover_image: book.coverImage,
      author_id: book.authorId,
      status: book.status,
      price: book.price || 0,
      views: book.views || 0,
      is_favorite: book.isFavorite || false,
      source: book.source || 'internal',
      format: book.format || 'bookcraft',
      is_public: book.is_public || false
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating book:', error);
    return null;
  }

  return mapSupabaseBookToBook(data);
};

export const getSupabaseBooks = async (): Promise<Book[]> => {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching books:', error);
    return [];
  }

  return data.map(mapSupabaseBookToBook);
};

export const getUserSupabaseBooks = async (userId: string): Promise<Book[]> => {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('author_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user books:', error);
    return [];
  }

  return data.map(mapSupabaseBookToBook);
};

// Утилиты для работы с главами
export const createSupabaseChapter = async (chapter: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'>) => {
  const { data, error } = await supabase
    .from('chapters')
    .insert({
      book_id: chapter.bookId,
      title: chapter.title,
      content: chapter.content,
      chapter_number: chapter.chapterNumber,
      is_free: true
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating chapter:', error);
    return null;
  }

  return data;
};

export const getBookSupabaseChapters = async (bookId: string) => {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('book_id', bookId)
    .order('chapter_number', { ascending: true });

  if (error) {
    console.error('Error fetching chapters:', error);
    return [];
  }

  return data;
};

// Утилиты для работы с покупками
export const createSupabasePurchase = async (purchase: Omit<Purchase, 'id' | 'purchaseDate'>) => {
  const { data, error } = await supabase
    .from('purchases')
    .insert({
      user_id: purchase.userId,
      book_id: purchase.bookId,
      paid: purchase.paid
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating purchase:', error);
    return null;
  }

  return data;
};

export const getUserSupabasePurchases = async (userId: string) => {
  const { data, error } = await supabase
    .from('purchases')
    .select('*, books(*)')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching purchases:', error);
    return [];
  }

  return data;
};

// Утилиты для работы с прогрессом чтения
export const saveSupabaseReadingProgress = async (progress: Omit<ReadingProgress, 'id' | 'lastReadAt'>) => {
  const { data, error } = await supabase
    .from('reading_progress')
    .upsert({
      user_id: progress.userId,
      book_id: progress.bookId,
      current_position: progress.currentChapter,
      total_chapters: progress.totalChapters
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving reading progress:', error);
    return null;
  }

  return data;
};

// Утилиты для работы с избранным
export const addSupabaseFavorite = async (userId: string, bookId: string) => {
  const { data, error } = await supabase
    .from('favorites')
    .insert({
      user_id: userId,
      book_id: bookId
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding favorite:', error);
    return null;
  }

  return data;
};

export const getUserSupabaseFavorites = async (userId: string) => {
  const { data, error } = await supabase
    .from('favorites')
    .select('*, books(*)')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }

  return data;
};
