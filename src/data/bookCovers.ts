
export const bookCovers = [
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=600&fit=crop'
];

export const getRandomCover = (): string => {
  return bookCovers[Math.floor(Math.random() * bookCovers.length)];
};

export const genres = [
  'Художественная литература',
  'Фантастика',
  'Детектив',
  'Романтика',
  'Фэнтези',
  'Ужасы',
  'Научная фантастика',
  'Биография',
  'История',
  'Поэзия',
  'Драма',
  'Приключения'
];
