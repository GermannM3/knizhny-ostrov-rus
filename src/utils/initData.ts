
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
  
  // Создаем тестовые книги с обложками БЕЗ людей
  const book1 = createBook({
    title: 'Моя первая книга',
    description: 'Это описание моей первой книги, которая была создана в BookCraft.',
    genre: 'Художественная литература',
    status: 'published',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop', // Мистический лес
    authorId: adminUser.id,
    price: 299,
    is_public: true
  });
  
  const book2 = createBook({
    title: 'Технические заметки',
    description: 'Сборник технических статей и заметок о разработке.',
    genre: 'Техническая литература',
    status: 'published',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=400&fit=crop', // Космос
    authorId: adminUser.id,
    price: 199,
    is_public: true
  });
  
  const book3 = createBook({
    title: 'Путешествия и приключения',
    description: 'Захватывающие истории о путешествиях по миру.',
    genre: 'Приключения',
    status: 'published',
    coverImage: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=300&h=400&fit=crop', // Горный пейзаж
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
