
import { createUser, createBook, createChapter } from './storage';

export const initializeTestData = () => {
  console.log('🔄 Инициализация тестовых данных...');
  
  // Создаем тестового пользователя (администратора)
  const adminUser = createUser({
    email: 'germannm@vk.com',
    password: 'Germ@nnM3',
    name: 'Hermann M',
    telegram_id: undefined
  });
  
  // Создаем дополнительных пользователей
  const user2 = createUser({
    email: 'author@bookcraft.ru',
    password: 'password123',
    name: 'Автор Книг',
    telegram_id: undefined
  });
  
  // Создаем тестовые книги
  const book1 = createBook({
    title: 'Моя первая книга',
    description: 'Это описание моей первой книги, которая была создана в BookCraft.',
    genre: 'Художественная литература',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
    authorId: adminUser.id,
    price: 299,
    is_public: true
  });
  
  const book2 = createBook({
    title: 'Технические заметки',
    description: 'Сборник технических статей и заметок о разработке.',
    genre: 'Техническая литература',
    coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop',
    authorId: adminUser.id,
    price: 199,
    is_public: true
  });
  
  const book3 = createBook({
    title: 'Путешествия и приключения',
    description: 'Захватывающие истории о путешествиях по миру.',
    genre: 'Приключения',
    coverImage: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=300&h=400&fit=crop',
    authorId: user2.id,
    price: 399,
    is_public: true
  });
  
  // Создаем главы для первой книги
  createChapter({
    bookId: book1.id,
    title: 'Глава 1: Начало',
    content: 'Это первая глава моей книги. Здесь начинается увлекательная история...',
    chapterNumber: 1
  });
  
  createChapter({
    bookId: book1.id,
    title: 'Глава 2: Развитие',
    content: 'Во второй главе события начинают развиваться более динамично...',
    chapterNumber: 2
  });
  
  // Создаем главы для второй книги
  createChapter({
    bookId: book2.id,
    title: 'Введение в разработку',
    content: 'Основы программирования и лучшие практики разработки...',
    chapterNumber: 1
  });
  
  console.log('✅ Тестовые данные созданы успешно');
  console.log(`👤 Админ: ${adminUser.email} / ${adminUser.name}`);
  console.log(`📚 Создано книг: 3`);
  console.log(`📄 Создано глав: 3`);
  
  return {
    adminUser,
    users: [adminUser, user2],
    books: [book1, book2, book3]
  };
};
