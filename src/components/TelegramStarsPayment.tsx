import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Download, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TorrentBook {
  id: string;
  title: string;
  magnet_link: string;
  size?: string;
  seeds?: number;
  created_at: string;
}

interface TelegramStarsPaymentProps {
  book: TorrentBook;
  userId: number; // Telegram user ID
}

export default function TelegramStarsPayment({ book, userId }: TelegramStarsPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [isOwned, setIsOwned] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkIfOwned();
  }, [book.id, userId]);

  const checkIfOwned = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('telegram-stars', {
        body: {
          action: 'get_user_downloads',
          userId
        }
      });

      if (error) throw error;

      const owned = data.downloads?.some((download: any) => download.book_id === book.id);
      setIsOwned(owned);
    } catch (error) {
      console.error('Failed to check ownership:', error);
    }
  };

  const handlePurchase = async () => {
    if (!window.Telegram?.WebApp) {
      toast({
        title: "Ошибка",
        description: "Это приложение работает только в Telegram",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Создаем инвойс
      const { data, error } = await supabase.functions.invoke('telegram-stars', {
        body: {
          action: 'create_invoice',
          bookId: book.id,
          userId,
          starsAmount: 100
        }
      });

      if (error) throw error;

      // Открываем платежную форму через Telegram Web App
      (window.Telegram.WebApp as any).openInvoice(data.invoice_link, (status: string) => {
        setLoading(false);
        
        if (status === 'paid') {
          toast({
            title: "Оплата успешна!",
            description: "Книга добавлена в ваши скачивания",
          });
          setIsOwned(true);
        } else if (status === 'cancelled') {
          toast({
            title: "Оплата отменена",
            description: "Вы можете попробовать снова",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Ошибка оплаты",
            description: "Попробуйте снова или обратитесь в поддержку",
            variant: "destructive"
          });
        }
      });

    } catch (error: any) {
      setLoading(false);
      console.error('Purchase error:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать платеж",
        variant: "destructive"
      });
    }
  };

  const handleDownload = () => {
    if (book.magnet_link) {
      window.open(book.magnet_link, '_blank');
      toast({
        title: "Скачивание начато",
        description: "Magnet-ссылка открыта в торрент-клиенте",
      });
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>{book.title}</span>
          {isOwned && <Badge variant="secondary">В собственности</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {book.size && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Размер:</span>
              <span>{book.size}</span>
            </div>
          )}
          {book.seeds !== undefined && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Сиды:</span>
              <Badge variant={book.seeds > 10 ? "default" : "secondary"}>
                {book.seeds}
              </Badge>
            </div>
          )}
        </div>

        {isOwned ? (
          <Button 
            onClick={handleDownload}
            className="w-full"
            variant="default"
          >
            <Download className="h-4 w-4 mr-2" />
            Скачать
          </Button>
        ) : (
          <Button 
            onClick={handlePurchase}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Star className="h-4 w-4 mr-2" />
            {loading ? 'Создание платежа...' : 'Купить за 100 ⭐'}
          </Button>
        )}

        <div className="text-xs text-muted-foreground text-center">
          💳 Оплата через Telegram Stars
          <br />
          🔒 Безопасно и мгновенно
        </div>
      </CardContent>
    </Card>
  );
}