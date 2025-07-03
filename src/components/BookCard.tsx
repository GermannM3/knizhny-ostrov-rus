
import { Book } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Edit, Trash, Eye, BookOpen } from 'lucide-react';
import { updateBook, deleteBook } from '@/utils/storage';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

interface BookCardProps {
  book: Book;
  onUpdate?: () => void;
  showActions?: boolean;
}

const BookCard = ({ book, onUpdate, showActions = true }: BookCardProps) => {
  const { user } = useAuth();
  const isOwner = user?.id === book.authorId;

  const toggleFavorite = () => {
    updateBook(book.id, { isFavorite: !book.isFavorite });
    onUpdate?.();
  };

  const handleDelete = () => {
    if (window.confirm('Вы уверены, что хотите удалить эту книгу?')) {
      deleteBook(book.id);
      onUpdate?.();
    }
  };

  return (
    <Card className="book-card group">
      <div className="relative">
        <img
          src={book.coverImage}
          alt={book.title}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
        <Badge 
          className={`absolute top-2 right-2 ${
            book.status === 'published' 
              ? 'bg-green-500/20 text-green-400 border-green-500/50' 
              : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
          }`}
        >
          {book.status === 'published' ? 'Опубликовано' : 'Черновик'}
        </Badge>
        
        {showActions && user && (
          <Button
            onClick={toggleFavorite}
            variant="ghost"
            size="sm"
            className="absolute top-2 left-2 p-1 bg-black/50 hover:bg-black/70"
          >
            <Heart 
              className={`h-4 w-4 ${
                book.isFavorite ? 'fill-red-500 text-red-500' : 'text-white'
              }`}
            />
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="font-bold text-lg text-gray-800 dark:text-white line-clamp-2">
          {book.title}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {book.description}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{book.genre}</span>
          <div className="flex items-center space-x-1">
            <Eye className="h-3 w-3" />
            <span>{book.views}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <Link to={`/read/${book.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <BookOpen className="h-4 w-4 mr-2" />
              Читать
            </Button>
          </Link>
          
          {showActions && isOwner && (
            <>
              <Link to={`/edit/${book.id}`}>
                <Button variant="outline" size="sm" title="Редактировать">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
              
              <Button 
                onClick={handleDelete}
                variant="outline" 
                size="sm"
                className="text-red-500 hover:text-red-400"
                title="Удалить"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default BookCard;
